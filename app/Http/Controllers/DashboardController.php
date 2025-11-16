<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Helpers\SessionHelper;
use Database\Models\EvaluacionRepository;

class DashboardController extends Controller
{
    protected EvaluacionRepository $evaluacionRepository;

    public function __construct(EvaluacionRepository $evaluacionRepository)
    {
        $this->evaluacionRepository = $evaluacionRepository;
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

            // Cachear estadísticas por 2 minutos para mejorar rendimiento
            $cacheKey = "dashboard_stats_user_{$userId}";
            $estadisticas = Cache::remember($cacheKey, 120, function () use ($userId) {
                return $this->evaluacionRepository->obtenerEstadisticas($userId);
            });

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
}

