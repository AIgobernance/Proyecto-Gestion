<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use App\Helpers\SessionHelper;
use Database\Models\EvaluacionRepository;
use Database\Models\DocumentosAdjuntosRepository;

class DashboardController extends Controller
{
    protected EvaluacionRepository $evaluacionRepository;
    protected DocumentosAdjuntosRepository $documentosRepository;

    public function __construct(
        EvaluacionRepository $evaluacionRepository,
        DocumentosAdjuntosRepository $documentosRepository
    ) {
        $this->evaluacionRepository = $evaluacionRepository;
        $this->documentosRepository = $documentosRepository;
    }

    /**
     * Obtiene las estadísticas del dashboard para el usuario autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request)
    {
        try {
            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                Log::warning('No se encontró usuario en la sesión para las estadísticas del dashboard');
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Cachear estadísticas por 30 segundos para mejorar rendimiento
            // Permitir forzar actualización con parámetro ?refresh=true
            $forceRefresh = $request->has('refresh') && $request->input('refresh') === 'true';
            $cacheKey = "dashboard_stats_user_{$userId}";
            
            if ($forceRefresh) {
                // Forzar actualización: limpiar caché y obtener datos frescos
                Cache::forget($cacheKey);
                $estadisticas = $this->evaluacionRepository->obtenerEstadisticas($userId);
            } else {
                // Usar caché con duración reducida (30 segundos en lugar de 2 minutos)
                $estadisticas = Cache::remember($cacheKey, 30, function () use ($userId) {
                    return $this->evaluacionRepository->obtenerEstadisticas($userId);
                });
            }

            Log::info('Estadísticas del dashboard obtenidas', [
                'user_id' => $userId,
                'estadisticas' => $estadisticas
            ]);

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas del dashboard', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener las estadísticas',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene todas las evaluaciones del usuario autenticado formateadas
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEvaluations(Request $request)
    {
        try {
            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                Log::warning('No se encontró usuario en la sesión para obtener evaluaciones');
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // NO cachear evaluaciones para detectar cambios inmediatos (evaluaciones incompletas)
            // El cache causaba que no se detectaran evaluaciones recién guardadas
            $evaluaciones = $this->evaluacionRepository->obtenerFormateadasPorUsuario($userId);

            // Remover logging excesivo en producción
            if (config('app.debug')) {
                Log::info('Evaluaciones obtenidas', [
                    'user_id' => $userId,
                    'total' => count($evaluaciones)
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $evaluaciones
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener evaluaciones', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener las evaluaciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtiene las estadísticas generales del sistema (para dashboard de administrador)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGeneralStats(Request $request)
    {
        try {
            // Cachear estadísticas generales por 1 minuto
            $forceRefresh = $request->has('refresh') && $request->input('refresh') === 'true';
            $cacheKey = "dashboard_general_stats";
            
            if ($forceRefresh) {
                Cache::forget($cacheKey);
            }

            // Temporalmente deshabilitar caché para debugging
            Cache::forget($cacheKey);
            $estadisticas = (function () {
                try {
                    // Total de usuarios
                    $totalUsuarios = DB::table('usuario')->count();
                } catch (\Exception $e) {
                    Log::warning('Error al contar usuarios', ['error' => $e->getMessage()]);
                    $totalUsuarios = 0;
                }
                
                try {
                    // Total de evaluaciones (sin filtrar por Estado ya que la columna no existe)
                    $totalEvaluaciones = DB::table('Evaluacion')->count();
                } catch (\Exception $e) {
                    Log::warning('Error al contar evaluaciones', ['error' => $e->getMessage()]);
                    $totalEvaluaciones = 0;
                }
                
                try {
                    // Total de documentos
                    $totalDocumentos = DB::table('Documentos_Adjuntos')->count();
                } catch (\Exception $e) {
                    Log::warning('Error al contar documentos', ['error' => $e->getMessage()]);
                    $totalDocumentos = 0;
                }

                // Tendencias de usuarios por mes (últimos 6 meses)
                // Verificar si existe la columna FechaCrea (sin guión bajo)
                $tieneFechaCreacion = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'usuario' AND COLUMN_NAME = 'FechaCrea'
                ");
                
                if ($tieneFechaCreacion && $tieneFechaCreacion->existe > 0) {
                    $usuariosPorMes = DB::select("
                        SELECT 
                            DATENAME(MONTH, FechaCrea) as month,
                            MONTH(FechaCrea) as month_num,
                            YEAR(FechaCrea) as year,
                            COUNT(*) as users
                        FROM [usuario]
                        WHERE FechaCrea >= DATEADD(MONTH, -6, GETDATE())
                        GROUP BY DATENAME(MONTH, FechaCrea), MONTH(FechaCrea), YEAR(FechaCrea)
                        ORDER BY YEAR(FechaCrea), MONTH(FechaCrea)
                    ");
                } else {
                    $usuariosPorMes = [];
                }

                // Evaluaciones por mes (últimos 5 meses)
                try {
                    $evaluacionesPorMes = DB::select("
                        SELECT 
                            DATENAME(MONTH, Fecha) as month,
                            MONTH(Fecha) as month_num,
                            YEAR(Fecha) as year,
                            COUNT(*) as evaluations
                        FROM [Evaluacion]
                        WHERE Fecha >= DATEADD(MONTH, -5, GETDATE())
                        GROUP BY DATENAME(MONTH, Fecha), MONTH(Fecha), YEAR(Fecha)
                        ORDER BY YEAR(Fecha), MONTH(Fecha)
                    ");
                } catch (\Exception $e) {
                    Log::warning('Error al obtener evaluaciones por mes', ['error' => $e->getMessage()]);
                    $evaluacionesPorMes = [];
                }

                // Distribución por marco de gobernanza
                try {
                    // Verificar si existe la columna Marco
                    $tieneMarco = DB::selectOne("
                        SELECT COUNT(*) as existe 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = 'Evaluacion' AND COLUMN_NAME = 'Marco'
                    ");
                    
                    if ($tieneMarco && $tieneMarco->existe > 0) {
                        $distribucionPorMarco = DB::select("
                            SELECT 
                                COALESCE(Marco, 'Sin marco') as name,
                                COUNT(*) as value
                            FROM [Evaluacion]
                            GROUP BY Marco
                        ");
                    } else {
                        $distribucionPorMarco = [];
                    }
                } catch (\Exception $e) {
                    Log::warning('Error al obtener distribución por marco', ['error' => $e->getMessage()]);
                    $distribucionPorMarco = [];
                }

                // Documentos por mes (últimos 5 meses)
                // Verificar si existe la columna Fecha_Creacion
                $tieneFechaCreacionDocs = DB::selectOne("
                    SELECT COUNT(*) as existe 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'Documentos_Adjuntos' AND COLUMN_NAME = 'Fecha_Creacion'
                ");
                
                if ($tieneFechaCreacionDocs && $tieneFechaCreacionDocs->existe > 0) {
                    $documentosPorMes = DB::select("
                        SELECT 
                            DATENAME(MONTH, Fecha_Creacion) as month,
                            MONTH(Fecha_Creacion) as month_num,
                            YEAR(Fecha_Creacion) as year,
                            COUNT(*) as documents
                        FROM [Documentos_Adjuntos]
                        WHERE Fecha_Creacion >= DATEADD(MONTH, -5, GETDATE())
                        GROUP BY DATENAME(MONTH, Fecha_Creacion), MONTH(Fecha_Creacion), YEAR(Fecha_Creacion)
                        ORDER BY YEAR(Fecha_Creacion), MONTH(Fecha_Creacion)
                    ");
                } else {
                    $documentosPorMes = [];
                }


                // Calcular porcentajes de cambio (comparar con mes anterior)
                // Solo si existe la columna FechaCrea
                try {
                    if ($tieneFechaCreacion && $tieneFechaCreacion->existe > 0) {
                        $mesAnteriorUsuarios = DB::table('usuario')
                            ->whereBetween('FechaCrea', [
                                DB::raw("DATEADD(MONTH, -2, GETDATE())"),
                                DB::raw("DATEADD(MONTH, -1, GETDATE())")
                            ])
                            ->count();
                        
                        $mesActualUsuarios = DB::table('usuario')
                            ->whereBetween('FechaCrea', [
                                DB::raw("DATEADD(MONTH, -1, GETDATE())"),
                                DB::raw("GETDATE()")
                            ])
                            ->count();
                    } else {
                        $mesAnteriorUsuarios = 0;
                        $mesActualUsuarios = 0;
                    }
                } catch (\Exception $e) {
                    Log::warning('Error al calcular cambio de usuarios', ['error' => $e->getMessage()]);
                    $mesAnteriorUsuarios = 0;
                    $mesActualUsuarios = 0;
                }

                $percentChangeUsuarios = $mesAnteriorUsuarios > 0 
                    ? round((($mesActualUsuarios - $mesAnteriorUsuarios) / $mesAnteriorUsuarios) * 100, 1)
                    : 0;

                try {
                    $mesAnteriorEvaluaciones = DB::table('Evaluacion')
                        ->whereBetween('Fecha', [
                            DB::raw("DATEADD(MONTH, -2, GETDATE())"),
                            DB::raw("DATEADD(MONTH, -1, GETDATE())")
                        ])
                        ->count();
                    
                    $mesActualEvaluaciones = DB::table('Evaluacion')
                        ->whereBetween('Fecha', [
                            DB::raw("DATEADD(MONTH, -1, GETDATE())"),
                            DB::raw("GETDATE()")
                        ])
                        ->count();
                } catch (\Exception $e) {
                    Log::warning('Error al calcular cambio de evaluaciones', ['error' => $e->getMessage()]);
                    $mesAnteriorEvaluaciones = 0;
                    $mesActualEvaluaciones = 0;
                }

                $percentChangeEvaluaciones = $mesAnteriorEvaluaciones > 0 
                    ? round((($mesActualEvaluaciones - $mesAnteriorEvaluaciones) / $mesAnteriorEvaluaciones) * 100, 1)
                    : 0;

                // Solo si existe la columna Fecha_Creacion
                try {
                    if ($tieneFechaCreacionDocs && $tieneFechaCreacionDocs->existe > 0) {
                        $mesAnteriorDocumentos = DB::table('Documentos_Adjuntos')
                            ->whereBetween('Fecha_Creacion', [
                                DB::raw("DATEADD(MONTH, -2, GETDATE())"),
                                DB::raw("DATEADD(MONTH, -1, GETDATE())")
                            ])
                            ->count();
                        
                        $mesActualDocumentos = DB::table('Documentos_Adjuntos')
                            ->whereBetween('Fecha_Creacion', [
                                DB::raw("DATEADD(MONTH, -1, GETDATE())"),
                                DB::raw("GETDATE()")
                            ])
                            ->count();
                    } else {
                        $mesAnteriorDocumentos = 0;
                        $mesActualDocumentos = 0;
                    }
                } catch (\Exception $e) {
                    Log::warning('Error al calcular cambio de documentos', ['error' => $e->getMessage()]);
                    $mesAnteriorDocumentos = 0;
                    $mesActualDocumentos = 0;
                }

                $percentChangeDocumentos = $mesAnteriorDocumentos > 0 
                    ? round((($mesActualDocumentos - $mesAnteriorDocumentos) / $mesAnteriorDocumentos) * 100, 1)
                    : 0;

                // Colores para distribución por marco
                $colores = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
                $distribucionConColores = array_map(function($item, $index) use ($colores) {
                    return [
                        'name' => $item->name,
                        'value' => (int)$item->value,
                        'color' => $colores[$index % count($colores)]
                    ];
                }, $distribucionPorMarco, array_keys($distribucionPorMarco));

                return [
                    'kpis' => [
                        'users' => [
                            'current' => $totalUsuarios,
                            'percentChange' => $percentChangeUsuarios
                        ],
                        'evaluations' => [
                            'current' => $totalEvaluaciones,
                            'percentChange' => $percentChangeEvaluaciones
                        ],
                        'documents' => [
                            'current' => $totalDocumentos,
                            'percentChange' => $percentChangeDocumentos
                        ]
                    ],
                    'userTrend' => array_map(function($item) {
                        // Abreviar nombres de meses a 3 letras
                        $mesAbrev = substr($item->month, 0, 3);
                        return [
                            'month' => $mesAbrev,
                            'users' => (int)$item->users
                        ];
                    }, $usuariosPorMes),
                    'evaluationsPerMonth' => array_map(function($item) {
                        // Abreviar nombres de meses a 3 letras
                        $mesAbrev = substr($item->month, 0, 3);
                        return [
                            'month' => $mesAbrev,
                            'evaluations' => (int)$item->evaluations
                        ];
                    }, $evaluacionesPorMes),
                    'distributionByFramework' => $distribucionConColores,
                    'documentsPerMonth' => array_map(function($item) {
                        // Abreviar nombres de meses a 3 letras
                        $mesAbrev = substr($item->month, 0, 3);
                        return [
                            'month' => $mesAbrev,
                            'documents' => (int)$item->documents
                        ];
                    }, $documentosPorMes)
                ];
            })();

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas generales', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener las estadísticas generales',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}

