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

            // Verificar si la respuesta ya existe
            $existe = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->where('Id_Pregunta', $idPregunta)
                ->exists();

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
            $hasFechaActualizacion = in_array('Fecha_Actualizacion', $columnasDisponibles);

            if ($existe) {
                // Actualizar respuesta existente
                $datosUpdate = [
                    'Respuesta_Usuario' => $respuesta,
                ];

                if ($hasFechaActualizacion) {
                    $datosUpdate['Fecha_Actualizacion'] = DB::raw('GETDATE()');
                }

                DB::table($this->table)
                    ->where('Id_Evaluacion', $idEvaluacion)
                    ->where('Id_Pregunta', $idPregunta)
                    ->update($datosUpdate);
            } else {
                // Insertar nueva respuesta
                $datosInsert = [
                    'Id_Evaluacion' => $idEvaluacion,
                    'Id_Pregunta' => $idPregunta,
                    'Respuesta_Usuario' => $respuesta,
                ];

                if ($hasFechaCreacion) {
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

