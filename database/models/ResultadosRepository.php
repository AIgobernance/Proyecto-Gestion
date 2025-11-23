<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ResultadosRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'Resultados';

    /**
     * Guarda los resultados de una evaluación procesada por N8N
     *
     * @param int $idEvaluacion
     * @param array $resultados Datos del resultado (Resultado, Recomendaciones, PDF_Path, etc.)
     * @return bool
     */
    public function guardarResultado(int $idEvaluacion, array $resultados): bool
    {
        try {
            // Verificar si la tabla existe
            $tablaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            ", [$this->table]);

            if (!$tablaExiste || $tablaExiste->existe == 0) {
                Log::warning('La tabla Resultados no existe en la base de datos');
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

            // Preparar datos para inserción
            $datosInsert = [
                'Id_Evaluacion' => $idEvaluacion,
            ];

            // Agregar campos opcionales si existen
            if (in_array('Resultado', $columnasDisponibles) && isset($resultados['Resultado'])) {
                $datosInsert['Resultado'] = is_string($resultados['Resultado']) 
                    ? $resultados['Resultado'] 
                    : json_encode($resultados['Resultado']);
            }

            // HTML y Recomendaciones ya no se guardan (solo se genera PDF)
            // Se eliminaron estas columnas de la base de datos

            // Guardar puntuación si existe la columna
            $puntuacion = $resultados['puntuacion'] ?? $resultados['score'] ?? null;
            if ($puntuacion !== null) {
                if (in_array('Puntuacion', $columnasDisponibles)) {
                    $datosInsert['Puntuacion'] = is_numeric($puntuacion) ? (float)$puntuacion : null;
                }
                // También guardar en Resultado si existe y está vacío
                if (in_array('Resultado', $columnasDisponibles) && empty($datosInsert['Resultado'])) {
                    $datosInsert['Resultado'] = is_numeric($puntuacion) ? (string)$puntuacion : null;
                }
            }

            // Guardar PDF_Path si existe la columna
            if (in_array('PDF_Path', $columnasDisponibles) && isset($resultados['PDF_Path'])) {
                $datosInsert['PDF_Path'] = $resultados['PDF_Path'];
                Log::info('PDF_Path agregado a datos para guardar', [
                    'id_evaluacion' => $idEvaluacion,
                    'pdf_path' => $resultados['PDF_Path'],
                    'columna_existe' => true
                ]);
            } else {
                if (isset($resultados['PDF_Path'])) {
                    Log::warning('PDF_Path no se puede guardar - columna no existe', [
                        'id_evaluacion' => $idEvaluacion,
                        'pdf_path_recibido' => $resultados['PDF_Path'],
                        'columna_existe' => in_array('PDF_Path', $columnasDisponibles),
                    ]);
                }
            }

            // Verificar si ya existe un resultado para esta evaluación
            $existe = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->exists();

            if ($existe) {
                // Actualizar resultado existente
                $filasAfectadas = DB::table($this->table)
                    ->where('Id_Evaluacion', $idEvaluacion)
                    ->update($datosInsert);
            } else {
                // Insertar nuevo resultado
                DB::table($this->table)->insert($datosInsert);
                $filasAfectadas = 1;
            }

            Log::info('Resultado guardado exitosamente', [
                'id_evaluacion' => $idEvaluacion,
                'actualizado' => $existe
            ]);

            return $filasAfectadas > 0;

        } catch (\Exception $e) {
            Log::error('Error al guardar resultado', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Obtiene el resultado de una evaluación
     *
     * @param int $idEvaluacion
     * @return array|null
     */
    public function obtenerPorEvaluacion(int $idEvaluacion): ?array
    {
        try {
            $resultado = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->first();

            return $resultado ? (array) $resultado : null;
        } catch (\Exception $e) {
            Log::error('Error al obtener resultado', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}

