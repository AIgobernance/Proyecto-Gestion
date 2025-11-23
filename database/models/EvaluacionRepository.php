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
     * Cache estático para verificaciones de tabla y columnas
     */
    protected static ?bool $tablaExisteCache = null;
    protected static ?array $columnasCache = null;

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
     * Obtiene todas las evaluaciones de un usuario formateadas para el frontend
     *
     * @param int $idUsuario
     * @return array
     */
    public function obtenerFormateadasPorUsuario(int $idUsuario): array
    {
        try {
            // Verificar si la tabla existe (usar cache)
            if (self::$tablaExisteCache === null) {
                $tablaExiste = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = ?
                ", [$this->table]);
                self::$tablaExisteCache = ($tablaExiste && $tablaExiste->existe > 0);
            }

            if (!self::$tablaExisteCache) {
                Log::warning('La tabla Evaluacion no existe en la base de datos');
                return [];
            }

            // Obtener columnas disponibles (usar cache)
            if (self::$columnasCache === null) {
                $columnas = DB::select("
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = ?
                ", [$this->table]);
                self::$columnasCache = array_map(function ($col) {
                    return $col->COLUMN_NAME;
                }, $columnas);
            }

            $columnasDisponibles = self::$columnasCache;

            // Construir SELECT dinámico
            $selectColumns = ['Id_Evaluacion', 'Id_Usuario', 'Fecha'];
            $hasTiempo = in_array('Tiempo', $columnasDisponibles);
            $hasPuntuacion = in_array('Puntuacion', $columnasDisponibles);
            $hasNombre = in_array('Nombre', $columnasDisponibles);
            $hasMarco = in_array('Marco', $columnasDisponibles);
            $hasFramework = in_array('Framework', $columnasDisponibles);
            $hasEstado = in_array('Estado', $columnasDisponibles);

            if ($hasTiempo) $selectColumns[] = 'Tiempo';
            if ($hasPuntuacion) $selectColumns[] = 'Puntuacion';
            if ($hasNombre) $selectColumns[] = 'Nombre';
            if ($hasMarco) $selectColumns[] = 'Marco';
            if ($hasFramework) $selectColumns[] = 'Framework';
            if ($hasEstado) $selectColumns[] = 'Estado';

            // Hacer LEFT JOIN con la tabla Resultados para obtener la puntuación real
            try {
                // Construir SELECT con prefijo de tabla Evaluacion
                $selectEvaluacion = array_map(function($col) {
                    return "e.[{$col}]";
                }, $selectColumns);
                
                // Agregar puntuación de Resultados si existe la tabla
                $tablaResultadosExiste = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = 'Resultados'
                ");
                
                $tienePuntuacionResultados = false;
                if ($tablaResultadosExiste && $tablaResultadosExiste->existe > 0) {
                    // Verificar si la tabla Resultados tiene la columna Puntuacion
                    $columnaPuntuacionExiste = DB::selectOne("
                        SELECT COUNT(*) as existe 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'Resultados' 
                        AND COLUMN_NAME = 'Puntuacion'
                    ");
                    
                    if ($columnaPuntuacionExiste && $columnaPuntuacionExiste->existe > 0) {
                        $tienePuntuacionResultados = true;
                        $selectEvaluacion[] = 'r.[Puntuacion] as Puntuacion_Resultados';
                    }
                }
                
                $selectSQL = implode(', ', $selectEvaluacion);
                
                // Construir SQL con LEFT JOIN a Resultados
                $sql = "SELECT {$selectSQL} 
                        FROM [{$this->table}] e
                        LEFT JOIN [Resultados] r ON e.[Id_Evaluacion] = r.[Id_Evaluacion]
                        WHERE e.[Id_Usuario] = ? 
                        ORDER BY e.[Fecha] DESC";
                
                $resultados = DB::select($sql, [$idUsuario]);
                
                // Convertir resultados a colección
                $evaluaciones = collect($resultados);
                
            } catch (\Exception $e) {
                // Inicializar variable para el fallback
                $tienePuntuacionResultados = false;
                // Si falla el JOIN, intentar sin JOIN (fallback)
                Log::warning('Query con JOIN falló, intentando sin JOIN', [
                    'error' => $e->getMessage()
                ]);
                
                try {
                    $selectColumnsSQL = implode(', ', array_map(function($col) {
                        return "e.[{$col}]";
                    }, $selectColumns));
                    
                    $sql = "SELECT {$selectColumnsSQL} FROM [{$this->table}] e WHERE e.[Id_Usuario] = ? ORDER BY e.[Fecha] DESC";
                    $resultados = DB::select($sql, [$idUsuario]);
                    $evaluaciones = collect($resultados);
                    $tienePuntuacionResultados = false;
                } catch (\Exception $e2) {
                    Log::error('Error al obtener evaluaciones', [
                        'error' => $e2->getMessage()
                    ]);
                    return [];
                }
            }

            // Asegurar que la variable esté definida antes del array_map
            if (!isset($tienePuntuacionResultados)) {
                $tienePuntuacionResultados = false;
            }
            
            // Verificar también con SQL directo cuántas evaluaciones hay
            $totalDirecto = DB::selectOne("
                SELECT COUNT(*) as total 
                FROM [{$this->table}] 
                WHERE [Id_Usuario] = ?
            ", [$idUsuario]);
            
            $totalEnBD = $totalDirecto ? (int)$totalDirecto->total : 0;
            
            Log::info('Evaluaciones obtenidas de la BD', [
                'id_usuario' => $idUsuario,
                'total_en_bd_directo' => $totalEnBD,
                'total_encontradas_query_builder' => $evaluaciones->count(),
                'tiene_puntuacion_resultados' => $tienePuntuacionResultados,
                'columnas_seleccionadas' => $selectColumns,
                'primera_evaluacion_raw' => $evaluaciones->first() ? json_encode($evaluaciones->first()) : null,
                'todas_las_evaluaciones_raw' => json_encode($evaluaciones->toArray())
            ]);

            if ($evaluaciones->isEmpty()) {
                if ($totalEnBD > 0) {
                    Log::error('PROBLEMA: Hay evaluaciones en BD pero Query Builder no las encuentra', [
                        'id_usuario' => $idUsuario,
                        'total_en_bd' => $totalEnBD,
                        'tabla' => $this->table,
                        'columnas_buscadas' => $selectColumns
                    ]);
                } else {
                    Log::info('No hay evaluaciones en la BD para este usuario', [
                        'id_usuario' => $idUsuario,
                        'tabla' => $this->table
                    ]);
                }
                return [];
            }

            return array_map(function ($evaluacion) use ($hasTiempo, $hasPuntuacion, $hasNombre, $hasMarco, $hasFramework, $hasEstado, $tienePuntuacionResultados) {
                // Convertir objeto a array - manejar diferentes formatos de respuesta
                $eval = [];
                
                if (is_object($evaluacion)) {
                    // Si es un stdClass de SQL Server, acceder directamente a propiedades
                    $eval['Id_Evaluacion'] = $evaluacion->Id_Evaluacion ?? $evaluacion->id_evaluacion ?? null;
                    $eval['Fecha'] = $evaluacion->Fecha ?? $evaluacion->fecha ?? null;
                    $eval['Id_Usuario'] = $evaluacion->Id_Usuario ?? $evaluacion->id_usuario ?? null;
                    
                    if ($hasTiempo) {
                        $eval['Tiempo'] = $evaluacion->Tiempo ?? $evaluacion->tiempo ?? null;
                    }
                    // PRIORIZAR puntuación de Resultados sobre Evaluacion
                    if ($tienePuntuacionResultados) {
                        // Primero intentar desde Resultados (Puntuacion_Resultados)
                        $eval['Puntuacion_Resultados'] = $evaluacion->Puntuacion_Resultados ?? null;
                        // También mantener Puntuacion de Evaluacion por si acaso
                        if ($hasPuntuacion) {
                            $eval['Puntuacion'] = $evaluacion->Puntuacion ?? $evaluacion->puntuacion ?? null;
                        }
                    } else {
                        // Si no hay JOIN, obtener solo de Evaluacion
                        if ($hasPuntuacion) {
                            $eval['Puntuacion'] = $evaluacion->Puntuacion ?? $evaluacion->puntuacion ?? null;
                        }
                    }
                    if ($hasNombre) {
                        $eval['Nombre'] = $evaluacion->Nombre ?? $evaluacion->nombre ?? null;
                    }
                    if ($hasMarco) {
                        $eval['Marco'] = $evaluacion->Marco ?? $evaluacion->marco ?? null;
                    }
                    if ($hasFramework) {
                        $eval['Framework'] = $evaluacion->Framework ?? $evaluacion->framework ?? null;
                    }
                } else {
                    // Si ya es un array
                    $eval = $evaluacion;
                }
                
                // Formatear fecha - manejar diferentes formatos de SQL Server
                $fecha = 'N/A';
                $hora = 'N/A';
                
                if (isset($eval['Fecha']) && $eval['Fecha'] !== null) {
                    try {
                        $fechaRaw = $eval['Fecha'];
                        
                        // Si es un string, intentar parsearlo
                        if (is_string($fechaRaw)) {
                            $fechaObj = new \DateTime($fechaRaw);
                        } 
                        // Si es un Carbon instance (Laravel)
                        elseif (is_object($fechaRaw) && method_exists($fechaRaw, 'format')) {
                            $fechaObj = $fechaRaw;
                        }
                        // Si es un DateTime
                        elseif ($fechaRaw instanceof \DateTime) {
                            $fechaObj = $fechaRaw;
                        }
                        else {
                            throw new \Exception('Formato de fecha no reconocido');
                        }
                        
                        $fecha = $fechaObj->format('d/m/Y');
                        $hora = $fechaObj->format('H:i');
                    } catch (\Exception $e) {
                        Log::warning('Error al formatear fecha de evaluación', [
                            'fecha_raw' => $eval['Fecha'] ?? null,
                            'tipo' => gettype($eval['Fecha'] ?? null),
                            'error' => $e->getMessage()
                        ]);
                        $fecha = 'N/A';
                        $hora = 'N/A';
                    }
                }

                // Formatear tiempo
                $tiempo = null;
                if ($hasTiempo && isset($eval['Tiempo']) && $eval['Tiempo'] !== null) {
                    $minutos = (float) $eval['Tiempo'];
                    if ($minutos < 60) {
                        $tiempo = round($minutos) . ' min';
                    } else {
                        $horas = floor($minutos / 60);
                        $mins = round($minutos % 60);
                        $tiempo = $horas . 'h ' . $mins . ' min';
                    }
                } else {
                    $tiempo = 'N/A';
                }

                // Obtener puntuación - PRIORIZAR de Resultados sobre Evaluacion
                $puntuacion = 0;
                
                // Primero intentar desde Resultados (Puntuacion_Resultados)
                if ($tienePuntuacionResultados && isset($eval['Puntuacion_Resultados']) && $eval['Puntuacion_Resultados'] !== null) {
                    $puntuacionRaw = $eval['Puntuacion_Resultados'];
                    $puntuacion = is_numeric($puntuacionRaw) ? (float) $puntuacionRaw : 0;
                }
                // Si no hay en Resultados, intentar desde Evaluacion
                elseif (isset($eval['Puntuacion']) && $eval['Puntuacion'] !== null) {
                    $puntuacionRaw = $eval['Puntuacion'];
                    $puntuacion = is_numeric($puntuacionRaw) ? (float) $puntuacionRaw : 0;
                }
                
                // Asegurar que esté en rango 0-100
                if ($puntuacion > 0) {
                    $puntuacion = max(0, min(100, $puntuacion));
                }

                // Obtener nombre
                $nombre = $hasNombre && isset($eval['Nombre']) 
                    ? $eval['Nombre'] 
                    : ($hasFramework && isset($eval['Framework']) 
                        ? 'Evaluación ' . $eval['Framework'] 
                        : 'Evaluación #' . ($eval['Id_Evaluacion'] ?? 'N/A'));

                // Obtener marco/framework
                $marco = ($hasMarco && isset($eval['Marco'])) 
                    ? $eval['Marco'] 
                    : ($hasFramework && isset($eval['Framework']) 
                        ? $eval['Framework'] 
                        : 'N/A');

                $resultado = [
                    'id' => (int) ($eval['Id_Evaluacion'] ?? 0),
                    'name' => $nombre,
                    'date' => $fecha,
                    'time' => $hora,
                    'tiempo' => $tiempo,
                    'score' => round($puntuacion, 2), // Mantener 2 decimales si es necesario
                    'framework' => $marco,
                    'status' => ($hasEstado && isset($eval['Estado'])) ? $eval['Estado'] : 'Completada',
                ];
                
                // Logging para depuración (solo primera evaluación)
                static $logged = false;
                if (!$logged && !empty($resultado)) {
                    Log::info('Primera evaluación formateada', [
                        'resultado' => $resultado,
                        'eval_raw' => $eval
                    ]);
                    $logged = true;
                }
                
                return $resultado;
            }, $evaluaciones->toArray());

        } catch (\Exception $e) {
            Log::error('Error al obtener evaluaciones formateadas del usuario', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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
            // Verificar si la tabla existe (usar cache)
            if (self::$tablaExisteCache === null) {
                $tablaExiste = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = ?
                ", [$this->table]);
                self::$tablaExisteCache = ($tablaExiste && $tablaExiste->existe > 0);
            }

            if (!self::$tablaExisteCache) {
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

    /**
     * Crea una nueva evaluación en la base de datos
     *
     * @param array $datos Datos de la evaluación
     * @return int ID de la evaluación creada
     */
    public function crear(array $datos): int
    {
        try {
            // Verificar si la tabla existe
            $tablaExiste = DB::selectOne("
                SELECT COUNT(*) as existe 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            ", [$this->table]);

            if (!$tablaExiste || $tablaExiste->existe == 0) {
                throw new \Exception('La tabla Evaluacion no existe en la base de datos');
            }

            // Obtener columnas disponibles
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
                'Id_Usuario' => $datos['Id_Usuario'] ?? $datos['id_usuario'] ?? null,
            ];

            // Fecha - usar GETDATE() de SQL Server si existe columna Fecha
            $hasFecha = in_array('Fecha', $columnasDisponibles);
            if ($hasFecha) {
                // Usar SQL directo para GETDATE()
                $sql = "INSERT INTO [{$this->table}] ([Id_Usuario], [Fecha]) VALUES (?, GETDATE())";
                $params = [$datosInsert['Id_Usuario']];
            } else {
                $datosInsert['Fecha'] = $datos['Fecha'] ?? $datos['fecha'] ?? now();
                $sql = null;
                $params = null;
            }

            // Agregar columnas opcionales si existen
            if (in_array('Tiempo', $columnasDisponibles) && isset($datos['Tiempo'])) {
                $datosInsert['Tiempo'] = $datos['Tiempo'];
            }
            if (in_array('Puntuacion', $columnasDisponibles) && isset($datos['Puntuacion'])) {
                $datosInsert['Puntuacion'] = $datos['Puntuacion'];
            }
            if (in_array('Nombre', $columnasDisponibles) && isset($datos['Nombre'])) {
                $datosInsert['Nombre'] = $datos['Nombre'];
            }
            if (in_array('Marco', $columnasDisponibles) && isset($datos['Marco'])) {
                $datosInsert['Marco'] = $datos['Marco'];
            }
            if (in_array('Framework', $columnasDisponibles) && isset($datos['Framework'])) {
                $datosInsert['Framework'] = $datos['Framework'];
            }
            if (in_array('Estado', $columnasDisponibles)) {
                $datosInsert['Estado'] = $datos['Estado'] ?? 'En proceso';
            }

            // Insertar en la base de datos
            if ($hasFecha) {
                // Si usamos SQL directo para Fecha, construir la consulta completa
                $columnasSQL = ['[Id_Usuario]', '[Fecha]'];
                $valoresSQL = ['?', 'GETDATE()'];
                $paramsSQL = [$datosInsert['Id_Usuario']];

                foreach ($datosInsert as $campo => $valor) {
                    if ($campo !== 'Id_Usuario' && $campo !== 'Fecha') {
                        $columnasSQL[] = "[{$campo}]";
                        $valoresSQL[] = '?';
                        $paramsSQL[] = $valor;
                    }
                }

                // Usar OUTPUT INSERTED.Id para obtener el ID en SQL Server
                $sql = "INSERT INTO [{$this->table}] (" . implode(', ', $columnasSQL) . ") OUTPUT INSERTED.Id_Evaluacion VALUES (" . implode(', ', $valoresSQL) . ")";
                $result = DB::select($sql, $paramsSQL);
                $id = $result[0]->Id_Evaluacion ?? null;
            } else {
                $id = DB::table($this->table)->insertGetId($datosInsert);
            }

            Log::info('Evaluación creada exitosamente', [
                'id_evaluacion' => $id,
                'id_usuario' => $datosInsert['Id_Usuario'],
            ]);

            return $id;

        } catch (\Exception $e) {
            Log::error('Error al crear evaluación', [
                'datos' => $datos,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Actualiza una evaluación existente
     *
     * @param int $idEvaluacion
     * @param array $datos
     * @return bool
     */
    public function actualizar(int $idEvaluacion, array $datos): bool
    {
        try {
            $camposPermitidos = ['Puntuacion', 'Estado', 'PDF_Path', 'Tiempo', 'Nombre', 'Marco', 'Framework'];
            $datosActualizar = [];

            foreach ($camposPermitidos as $campo) {
                if (isset($datos[$campo])) {
                    $datosActualizar[$campo] = $datos[$campo];
                }
            }

            if (empty($datosActualizar)) {
                return false;
            }

            $filasAfectadas = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->update($datosActualizar);

            return $filasAfectadas > 0;

        } catch (\Exception $e) {
            Log::error('Error al actualizar evaluación', [
                'id_evaluacion' => $idEvaluacion,
                'datos' => $datos,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Obtiene la evaluación incompleta más reciente de un usuario
     * Una evaluación se considera incompleta si tiene menos de 50 respuestas
     *
     * @param int $idUsuario
     * @param int $totalPreguntas Total de preguntas esperadas (por defecto 50)
     * @return array|null
     */
    public function obtenerIncompletaPorUsuario(int $idUsuario, int $totalPreguntas = 50): ?array
    {
        try {
            // Optimización: Obtener evaluaciones con conteo de respuestas en una sola query
            // Usar LEFT JOIN para obtener el conteo de respuestas directamente
            $evaluaciones = DB::select("
                SELECT 
                    e.Id_Evaluacion,
                    e.Id_Usuario,
                    e.Fecha,
                    e.Estado,
                    e.Tiempo,
                    e.Puntuacion,
                    COUNT(r.Id_Respuesta) as total_respuestas
                FROM [{$this->table}] e
                LEFT JOIN [Respuestas] r ON e.Id_Evaluacion = r.Id_Evaluacion
                WHERE e.Id_Usuario = ?
                GROUP BY e.Id_Evaluacion, e.Id_Usuario, e.Fecha, e.Estado, e.Tiempo, e.Puntuacion
                ORDER BY e.Fecha DESC
            ", [$idUsuario]);

            if (empty($evaluaciones)) {
                return null;
            }

            // Buscar la primera evaluación incompleta
            foreach ($evaluaciones as $evaluacion) {
                $idEvaluacion = $evaluacion->Id_Evaluacion;
                $totalRespuestas = (int) $evaluacion->total_respuestas;
                $estado = $evaluacion->Estado ?? null;
                
                // Verificar si el estado es "Completada" - si es así, no es incompleta
                if ($estado === 'Completada' || $estado === 'Completado') {
                    continue; // Saltar evaluaciones completadas
                }
                
                // Si tiene exactamente 50 respuestas, considerarla completada (aunque el estado no lo indique)
                if ($totalRespuestas >= $totalPreguntas) {
                    // Actualizar el estado a "Completada" si no lo está
                    if ($estado !== 'Completada' && $estado !== 'Completado') {
                        DB::table($this->table)
                            ->where('Id_Evaluacion', $idEvaluacion)
                            ->update(['Estado' => 'Completada']);
                    }
                    continue; // Saltar evaluaciones completadas
                }
                
                // Si tiene menos respuestas que el total esperado, está incompleta
                if ($totalRespuestas < $totalPreguntas) {
                    $evalArray = [
                        'Id_Evaluacion' => $idEvaluacion,
                        'Id_Usuario' => $evaluacion->Id_Usuario,
                        'Fecha' => $evaluacion->Fecha,
                        'Estado' => $estado,
                        'Tiempo' => $evaluacion->Tiempo ?? null,
                        'Puntuacion' => $evaluacion->Puntuacion ?? null,
                        'total_respuestas' => $totalRespuestas,
                    ];
                    return $evalArray;
                }
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Error al obtener evaluación incompleta', [
                'id_usuario' => $idUsuario,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Obtiene una evaluación por su ID
     *
     * @param int $idEvaluacion
     * @return array|null
     */
    public function obtenerPorId(int $idEvaluacion): ?array
    {
        try {
            $evaluacion = DB::table($this->table)
                ->where('Id_Evaluacion', $idEvaluacion)
                ->first();

            return $evaluacion ? (array) $evaluacion : null;
        } catch (\Exception $e) {
            Log::error('Error al obtener evaluación por ID', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
}

