<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DocumentosAdjuntosRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'Documentos_Adjuntos';

    /**
     * Guarda un documento adjunto en la base de datos
     *
     * @param int $idEvaluacion
     * @param string $nombreArchivo
     * @param string $tipo Tipo de documento (siempre "pdf")
     * @return int ID del documento guardado
     */
    public function guardar(int $idEvaluacion, string $nombreArchivo, string $tipo = 'pdf'): int
    {
        try {
            // Verificar si la tabla existe
            $tablaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM information_schema.tables 
                WHERE LOWER(table_name) = LOWER(?)
            ", [$this->table]);

            $existeCount = $tablaExiste->existe ?? $tablaExiste->Existe ?? 0;
            if ($existeCount == 0) {
                Log::warning('La tabla Documentos_Adjuntos no existe en la base de datos');
                throw new \Exception('La tabla Documentos_Adjuntos no existe');
            }

            // Verificar columnas disponibles
            $columnas = DB::select("
                SELECT column_name AS \"COLUMN_NAME\" 
                FROM information_schema.columns 
                WHERE LOWER(table_name) = LOWER(?)
            ", [$this->table]);

            $columnasDisponibles = array_map(function ($col) {
                return $col->COLUMN_NAME;
            }, $columnas);

            // Preparar datos para inserción
            $datosInsert = [
                'Id_Evaluacion' => $idEvaluacion,
                'Nombre_Archivo' => $nombreArchivo,
                'Tipo' => $tipo, // Siempre "pdf"
            ];

            // Verificar si hay columna de fecha
            $hasFechaCreacion = in_array('Fecha_Creacion', $columnasDisponibles);
            $isSqlSrv = DB::getDriverName() === 'sqlsrv';

            if ($hasFechaCreacion) {
                if ($isSqlSrv) {
                    // Usar SQL directo para GETDATE() de SQL Server
                    DB::statement("
                        INSERT INTO [{$this->table}] 
                        ([Id_Evaluacion], [Nombre_Archivo], [Tipo], [Fecha_Creacion]) 
                        VALUES (?, ?, ?, GETDATE())
                    ", [
                        $datosInsert['Id_Evaluacion'],
                        $datosInsert['Nombre_Archivo'],
                        $datosInsert['Tipo']
                    ]);

                    // Obtener el ID insertado
                    $resultado = DB::selectOne("
                        SELECT TOP 1 Id_Documento 
                        FROM [{$this->table}] 
                        WHERE Id_Evaluacion = ? AND Nombre_Archivo = ?
                        ORDER BY Id_Documento DESC
                    ", [$idEvaluacion, $nombreArchivo]);

                    $id = $resultado->Id_Documento ?? null;
                } else {
                    // Para PostgreSQL/Neon, usar carbon now() y insertGetId
                    $insertData = $datosInsert;
                    $insertData['Fecha_Creacion'] = now();
                    $id = DB::table($this->table)->insertGetId($insertData, 'Id_Documento');
                }
            } else {
                $id = DB::table($this->table)->insertGetId($datosInsert, 'Id_Documento');
            }

            Log::info('Documento adjunto guardado exitosamente', [
                'id_documento' => $id,
                'id_evaluacion' => $idEvaluacion,
                'nombre_archivo' => $nombreArchivo
            ]);

            return $id;

        } catch (\Exception $e) {
            Log::error('Error al guardar documento adjunto', [
                'id_evaluacion' => $idEvaluacion,
                'nombre_archivo' => $nombreArchivo,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene todos los documentos adjuntos de una evaluación
     *
     * @param int $idEvaluacion
     * @return array
     */
    public function obtenerPorEvaluacion(int $idEvaluacion): array
    {
        try {
            $documentos = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->orderBy('Id_Documento')
                ->get()
                ->toArray();

            return array_map(function ($doc) {
                return (array) $doc;
            }, $documentos);
        } catch (\Exception $e) {
            Log::error('Error al obtener documentos adjuntos', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Elimina un documento adjunto
     *
     * @param int $idDocumento
     * @return bool
     */
    public function eliminar(int $idDocumento): bool
    {
        try {
            $eliminado = DB::table($this->table)
                ->where('Id_Documento', $idDocumento)
                ->delete();

            return $eliminado > 0;
        } catch (\Exception $e) {
            Log::error('Error al eliminar documento adjunto', [
                'id_documento' => $idDocumento,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}

