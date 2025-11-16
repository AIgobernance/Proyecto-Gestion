<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluacionRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'Evaluacion';

    /**
     * Obtiene todas las evaluaciones de un usuario
     *
     * @param int $idUsuario
     * @return array
     */
    public function obtenerPorUsuario(int $idUsuario): array
    {
        try {
            $evaluaciones = DB::table($this->table)
                ->where('Id_Usuario', $idUsuario)
                ->orderBy('Fecha', 'desc')
                ->get()
                ->toArray();

            return array_map(function ($evaluacion) {
                return (array) $evaluacion;
            }, $evaluaciones);
        } catch (\Exception $e) {
            Log::error('Error al obtener evaluaciones del usuario', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Obtiene el conteo total de evaluaciones de un usuario
     *
     * @param int $idUsuario
     * @return int
     */
    public function contarPorUsuario(int $idUsuario): int
    {
        try {
            return DB::table($this->table)
                ->where('Id_Usuario', $idUsuario)
                ->count();
        } catch (\Exception $e) {
            Log::error('Error al contar evaluaciones del usuario', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Obtiene la última evaluación de un usuario
     *
     * @param int $idUsuario
     * @return array|null
     */
    public function obtenerUltimaPorUsuario(int $idUsuario): ?array
    {
        try {
            $evaluacion = DB::table($this->table)
                ->where('Id_Usuario', $idUsuario)
                ->orderBy('Fecha', 'desc')
                ->first();

            return $evaluacion ? (array) $evaluacion : null;
        } catch (\Exception $e) {
            Log::error('Error al obtener última evaluación del usuario', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Calcula el promedio de puntuación de las evaluaciones de un usuario
     * Nota: Ajusta el nombre de la columna según tu esquema (puede ser 'Puntuacion', 'Score', etc.)
     *
     * @param int $idUsuario
     * @param string $columnaPuntuacion Nombre de la columna que contiene la puntuación
     * @return float|null
     */
    public function calcularPromedioPuntuacion(int $idUsuario, string $columnaPuntuacion = 'Puntuacion'): ?float
    {
        try {
            // Verificar si la columna existe
            $columnaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
            ", [$this->table, $columnaPuntuacion]);

            if (!$columnaExiste || $columnaExiste->existe == 0) {
                Log::warning('Columna de puntuación no encontrada', [
                    'columna' => $columnaPuntuacion,
                    'tabla' => $this->table
                ]);
                return null;
            }

            $resultado = DB::table($this->table)
                ->where('Id_Usuario', $idUsuario)
                ->whereNotNull($columnaPuntuacion)
                ->avg($columnaPuntuacion);

            return $resultado !== null ? (float) round($resultado, 2) : null;
        } catch (\Exception $e) {
            Log::error('Error al calcular promedio de puntuación', [
                'id_usuario' => $idUsuario,
                'columna' => $columnaPuntuacion,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Calcula el porcentaje de completitud (evaluaciones completadas vs total)
     * Nota: Ajusta según tu lógica de negocio
     *
     * @param int $idUsuario
     * @param string $columnaEstado Nombre de la columna que indica el estado (puede ser 'Estado', 'Completada', etc.)
     * @param string $valorCompletado Valor que indica que está completada (puede ser 'Completada', 1, 'true', etc.)
     * @return float|null
     */
    public function calcularCompletitud(int $idUsuario, string $columnaEstado = 'Estado', string $valorCompletado = 'Completada'): ?float
    {
        try {
            // Verificar si la columna existe
            $columnaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = ? AND COLUMN_NAME = ?
            ", [$this->table, $columnaEstado]);

            if (!$columnaExiste || $columnaExiste->existe == 0) {
                // Si no existe columna de estado, asumir que todas están completadas
                return 100.0;
            }

            $total = $this->contarPorUsuario($idUsuario);
            if ($total == 0) {
                return 0.0;
            }

            $completadas = DB::table($this->table)
                ->where('Id_Usuario', $idUsuario)
                ->where($columnaEstado, $valorCompletado)
                ->count();

            return round(($completadas / $total) * 100, 2);
        } catch (\Exception $e) {
            Log::error('Error al calcular completitud', [
                'id_usuario' => $idUsuario,
                'columna' => $columnaEstado,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Obtiene estadísticas resumidas de un usuario
     *
     * @param int $idUsuario
     * @return array
     */
    public function obtenerEstadisticas(int $idUsuario): array
    {
        try {
            // Verificar si la tabla existe
            $tablaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            ", [$this->table]);

            if (!$tablaExiste || $tablaExiste->existe == 0) {
                Log::warning('La tabla Evaluacion no existe en la base de datos');
                return [
                    'totalEvaluaciones' => 0,
                    'ultimaEvaluacion' => 'N/A',
                    'promedioPuntuacion' => 0,
                    'completitud' => 0,
                ];
            }

            $totalEvaluaciones = $this->contarPorUsuario($idUsuario);
            $ultimaEvaluacion = $this->obtenerUltimaPorUsuario($idUsuario);
            
            // Intentar obtener promedio de puntuación (puede fallar si no existe la columna)
            $promedioPuntuacion = $this->calcularPromedioPuntuacion($idUsuario);
            
            // Intentar calcular completitud (puede fallar si no existe la columna)
            $completitud = $this->calcularCompletitud($idUsuario);

            // Formatear fecha de última evaluación
            $fechaUltima = null;
            if ($ultimaEvaluacion && isset($ultimaEvaluacion['Fecha'])) {
                try {
                    $fecha = is_string($ultimaEvaluacion['Fecha']) 
                        ? new \DateTime($ultimaEvaluacion['Fecha']) 
                        : $ultimaEvaluacion['Fecha'];
                    
                    if ($fecha instanceof \DateTime) {
                        $fechaUltima = $fecha->format('d M Y');
                    }
                } catch (\Exception $e) {
                    Log::warning('Error al formatear fecha de última evaluación', [
                        'fecha' => $ultimaEvaluacion['Fecha'] ?? null,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return [
                'totalEvaluaciones' => $totalEvaluaciones,
                'ultimaEvaluacion' => $fechaUltima ?? 'N/A',
                'promedioPuntuacion' => $promedioPuntuacion ?? 0,
                'completitud' => $completitud ?? ($totalEvaluaciones > 0 ? 0 : 100.0),
            ];
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de evaluaciones', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Retornar valores por defecto en caso de error
            return [
                'totalEvaluaciones' => 0,
                'ultimaEvaluacion' => 'N/A',
                'promedioPuntuacion' => 0,
                'completitud' => 0,
            ];
        }
    }
}

