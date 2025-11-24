<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RespuestasRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'Respuestas';

    /**
     * Cache estático para verificaciones de tabla y columnas
     */
    protected static ?bool $tablaExisteCache = null;
    protected static ?array $columnasCache = null;
    protected static ?bool $hasFechaCreacionCache = null;
    protected static ?bool $hasFechaActualizacionCache = null;

    /**
     * Guarda las respuestas de una evaluación
     *
     * @param int $idEvaluacion
     * @param array $respuestas Array con formato [id_pregunta => respuesta]
     * @return bool
     */
    public function guardarRespuestas(int $idEvaluacion, array $respuestas): bool
    {
        try {
            // Verificar si la tabla existe
            $tablaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            ", [$this->table]);

            if (!$tablaExiste || $tablaExiste->existe == 0) {
                Log::warning('La tabla Respuestas no existe en la base de datos');
                return false;
            }

            // Verificar columnas disponibles
            $columnas = DB::select("
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = ?
            ", [$this->table]);

            $columnasDisponibles = array_map(function ($col) {
                return $col->COLUMN_NAME;
            }, $columnas);

            $hasFechaCreacion = in_array('Fecha_Creacion', $columnasDisponibles);

            // Insertar cada respuesta
            $insertadas = 0;
            foreach ($respuestas as $idPregunta => $respuesta) {
                $datosInsert = [
                    'Id_Evaluacion' => $idEvaluacion,
                    'Id_Pregunta' => $idPregunta,
                    'Respuesta_Usuario' => is_string($respuesta) ? $respuesta : json_encode($respuesta),
                ];

                // Agregar Fecha_Creacion si existe
                if ($hasFechaCreacion) {
                    // Usar SQL directo para GETDATE() de SQL Server
                    DB::statement("
                        INSERT INTO [{$this->table}] 
                        ([Id_Evaluacion], [Id_Pregunta], [Respuesta_Usuario], [Fecha_Creacion]) 
                        VALUES (?, ?, ?, GETDATE())
                    ", [
                        $datosInsert['Id_Evaluacion'],
                        $datosInsert['Id_Pregunta'],
                        $datosInsert['Respuesta_Usuario']
                    ]);
                } else {
                    DB::table($this->table)->insert($datosInsert);
                }
                
                $insertadas++;
            }

            Log::info('Respuestas guardadas exitosamente', [
                'id_evaluacion' => $idEvaluacion,
                'total_respuestas' => $insertadas
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Error al guardar respuestas', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Obtiene las respuestas de una evaluación
     *
     * @param int $idEvaluacion
     * @return array
     */
    public function obtenerPorEvaluacion(int $idEvaluacion): array
    {
        try {
            $respuestas = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->orderBy('Id_Pregunta')
                ->get()
                ->toArray();

            return array_map(function ($respuesta) {
                return (array) $respuesta;
            }, $respuestas);
        } catch (\Exception $e) {
            Log::error('Error al obtener respuestas', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Guarda o actualiza una respuesta individual (para guardado progresivo)
     *
     * @param int $idEvaluacion
     * @param int $idPregunta (1-based)
     * @param string $respuesta
     * @return bool
     */
    public function guardarRespuesta(int $idEvaluacion, int $idPregunta, string $respuesta): bool
    {
        try {
            // Optimización máxima: Usar MERGE de SQL Server en una sola operación
            // MERGE es más eficiente que EXISTS + INSERT/UPDATE porque hace todo en una transacción atómica
            // Inicializar cache de columnas solo una vez
            if (self::$hasFechaCreacionCache === null) {
                $hasFechaCreacion = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = ? AND COLUMN_NAME = 'Fecha_Creacion'
                ", [$this->table]);
                self::$hasFechaCreacionCache = ($hasFechaCreacion && $hasFechaCreacion->existe > 0);
            }
            
            if (self::$hasFechaActualizacionCache === null) {
                $hasFechaActualizacion = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = ? AND COLUMN_NAME = 'Fecha_Actualizacion'
                ", [$this->table]);
                self::$hasFechaActualizacionCache = ($hasFechaActualizacion && $hasFechaActualizacion->existe > 0);
            }

            $hasFechaCreacion = self::$hasFechaCreacionCache;
            $hasFechaActualizacion = self::$hasFechaActualizacionCache;

            // Construir MERGE optimizado según columnas disponibles
            if ($hasFechaCreacion && $hasFechaActualizacion) {
                // MERGE con ambas columnas de fecha
                DB::statement("
                    MERGE [{$this->table}] AS target
                    USING (SELECT ? AS Id_Evaluacion, ? AS Id_Pregunta, ? AS Respuesta_Usuario) AS source
                    ON target.Id_Evaluacion = source.Id_Evaluacion AND target.Id_Pregunta = source.Id_Pregunta
                    WHEN MATCHED THEN
                        UPDATE SET 
                            Respuesta_Usuario = source.Respuesta_Usuario,
                            Fecha_Actualizacion = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (Id_Evaluacion, Id_Pregunta, Respuesta_Usuario, Fecha_Creacion)
                        VALUES (source.Id_Evaluacion, source.Id_Pregunta, source.Respuesta_Usuario, GETDATE());
                ", [$idEvaluacion, $idPregunta, $respuesta]);
            } elseif ($hasFechaCreacion) {
                // MERGE solo con Fecha_Creacion
                DB::statement("
                    MERGE [{$this->table}] AS target
                    USING (SELECT ? AS Id_Evaluacion, ? AS Id_Pregunta, ? AS Respuesta_Usuario) AS source
                    ON target.Id_Evaluacion = source.Id_Evaluacion AND target.Id_Pregunta = source.Id_Pregunta
                    WHEN MATCHED THEN
                        UPDATE SET Respuesta_Usuario = source.Respuesta_Usuario
                    WHEN NOT MATCHED THEN
                        INSERT (Id_Evaluacion, Id_Pregunta, Respuesta_Usuario, Fecha_Creacion)
                        VALUES (source.Id_Evaluacion, source.Id_Pregunta, source.Respuesta_Usuario, GETDATE());
                ", [$idEvaluacion, $idPregunta, $respuesta]);
            } elseif ($hasFechaActualizacion) {
                // MERGE solo con Fecha_Actualizacion
                DB::statement("
                    MERGE [{$this->table}] AS target
                    USING (SELECT ? AS Id_Evaluacion, ? AS Id_Pregunta, ? AS Respuesta_Usuario) AS source
                    ON target.Id_Evaluacion = source.Id_Evaluacion AND target.Id_Pregunta = source.Id_Pregunta
                    WHEN MATCHED THEN
                        UPDATE SET 
                            Respuesta_Usuario = source.Respuesta_Usuario,
                            Fecha_Actualizacion = GETDATE()
                    WHEN NOT MATCHED THEN
                        INSERT (Id_Evaluacion, Id_Pregunta, Respuesta_Usuario)
                        VALUES (source.Id_Evaluacion, source.Id_Pregunta, source.Respuesta_Usuario);
                ", [$idEvaluacion, $idPregunta, $respuesta]);
            } else {
                // MERGE sin columnas de fecha (más rápido)
                DB::statement("
                    MERGE [{$this->table}] AS target
                    USING (SELECT ? AS Id_Evaluacion, ? AS Id_Pregunta, ? AS Respuesta_Usuario) AS source
                    ON target.Id_Evaluacion = source.Id_Evaluacion AND target.Id_Pregunta = source.Id_Pregunta
                    WHEN MATCHED THEN
                        UPDATE SET Respuesta_Usuario = source.Respuesta_Usuario
                    WHEN NOT MATCHED THEN
                        INSERT (Id_Evaluacion, Id_Pregunta, Respuesta_Usuario)
                        VALUES (source.Id_Evaluacion, source.Id_Pregunta, source.Respuesta_Usuario);
                ", [$idEvaluacion, $idPregunta, $respuesta]);
            }

            return true;

        } catch (\Exception $e) {
            Log::error('Error al guardar respuesta individual', [
                'id_evaluacion' => $idEvaluacion,
                'id_pregunta' => $idPregunta,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtiene el conteo de respuestas de una evaluación
     *
     * @param int $idEvaluacion
     * @return int
     */
    public function contarPorEvaluacion(int $idEvaluacion): int
    {
        try {
            return DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error al contar respuestas', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }
}

