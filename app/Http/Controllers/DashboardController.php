<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            // Obtener el usuario de la sesión (se guarda como 'user' en LoginController)
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                Log::warning('No se encontró usuario en la sesión para las estadísticas del dashboard');
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener el ID del usuario desde userData
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Intentar obtener por correo si no hay ID
                $correo = $userData['correo'] ?? $userData['Correo'] ?? null;
                if ($correo) {
                    $usuario = \Illuminate\Support\Facades\DB::table('usuario')
                        ->select('Id')
                        ->where('Correo', $correo)
                        ->first();
                    
                    if ($usuario) {
                        $userId = $usuario->Id;
                        // Actualizar la sesión con el ID
                        $userData['id'] = $userId;
                        $request->session()->put('user', $userData);
                        $request->session()->save();
                    }
                }
            }

            if (!$userId) {
                Log::warning('No se pudo obtener el ID del usuario para las estadísticas del dashboard', [
                    'userData_keys' => array_keys($userData ?? [])
                ]);
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener estadísticas del repositorio
            $estadisticas = $this->evaluacionRepository->obtenerEstadisticas($userId);

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
            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                Log::warning('No se encontró usuario en la sesión para obtener evaluaciones');
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener el ID del usuario desde userData
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Intentar obtener por correo si no hay ID
                $correo = $userData['correo'] ?? $userData['Correo'] ?? null;
                if ($correo) {
                    $usuario = \Illuminate\Support\Facades\DB::table('usuario')
                        ->select('Id')
                        ->where('Correo', $correo)
                        ->first();
                    
                    if ($usuario) {
                        $userId = $usuario->Id;
                        // Actualizar la sesión con el ID
                        $userData['id'] = $userId;
                        $request->session()->put('user', $userData);
                        $request->session()->save();
                    }
                }
            }

            if (!$userId) {
                Log::warning('No se pudo obtener el ID del usuario para obtener evaluaciones', [
                    'userData_keys' => array_keys($userData ?? [])
                ]);
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener evaluaciones formateadas del repositorio
            $evaluaciones = $this->evaluacionRepository->obtenerFormateadasPorUsuario($userId);

            Log::info('Evaluaciones obtenidas', [
                'user_id' => $userId,
                'total' => count($evaluaciones)
            ]);

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

