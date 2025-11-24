<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use App\Services\JwtService;
use Illuminate\Support\Facades\Log;

class EmailVerificationController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Verifica el token JWT y activa la cuenta del usuario
     */
    public function verify(Request $request)
    {
        // Log inicial para verificar que el método se está llamando
        Log::info('=== EmailVerificationController::verify llamado ===', [
            'method' => $request->method(),
            'full_url' => $request->fullUrl(),
            'wants_json' => $request->wantsJson(),
            'is_ajax' => $request->ajax(),
            'accept_header' => $request->header('Accept'),
            'query_params' => $request->query->all()
        ]);

        $token = $request->query('token');

        Log::info('Token extraído de query', [
            'token_provided' => !empty($token),
            'token_length' => $token ? strlen($token) : 0,
            'token_preview' => $token ? substr($token, 0, 30) . '...' : 'no token'
        ]);

        if (!$token) {
            return response()->json([
                'message' => 'Token de activación no proporcionado',
                'error' => 'Token requerido'
            ], 400);
        }

        try {
            // Validar y decodificar el token JWT
            $payload = JwtService::validateToken($token);
            
            Log::info('Resultado de validación de token', [
                'payload_valid' => !empty($payload),
                'payload_keys' => $payload ? array_keys($payload) : []
            ]);

            if (!$payload) {
                return response()->json([
                    'message' => 'Token inválido o expirado',
                    'error' => 'Token inválido'
                ], 400);
            }

            // Verificar que el token sea de tipo activación
            if (!isset($payload['user_id']) || !isset($payload['email'])) {
                Log::warning('Token JWT sin user_id o email', [
                    'payload' => $payload
                ]);
                return response()->json([
                    'message' => 'Token inválido',
                    'error' => 'Token malformado'
                ], 400);
            }

            $userId = $payload['user_id'];
            $email = $payload['email'];

            // Verificar que el usuario existe
            $usuario = $this->usuarioRepository->obtenerPorId($userId);

            if (!$usuario) {
                Log::warning('Usuario no encontrado para activación', [
                    'user_id' => $userId,
                    'email' => $email
                ]);
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'error' => 'Usuario inválido'
                ], 404);
            }

            // Verificar que el email coincida
            $usuarioEmail = $usuario->Correo ?? $usuario->correo ?? null;
            if ($usuarioEmail !== $email) {
                Log::warning('Email no coincide con el token', [
                    'user_id' => $userId,
                    'token_email' => $email,
                    'usuario_email' => $usuarioEmail
                ]);
                return response()->json([
                    'message' => 'Token inválido',
                    'error' => 'Email no coincide'
                ], 400);
            }

            // Verificar si ya está activo
            $activateValue = $usuario->Activate ?? 1;
            $isActive = false;
            if (is_string($activateValue)) {
                $isActive = (strtolower(trim($activateValue)) === 'true' || $activateValue === '1');
            } elseif (is_bool($activateValue)) {
                $isActive = $activateValue;
            } elseif (is_numeric($activateValue)) {
                $isActive = ((int)$activateValue == 1);
            }

            if ($isActive) {
                if ($request->wantsJson() || $request->ajax()) {
                    return response()->json([
                        'message' => 'Tu cuenta ya está activada',
                        'already_activated' => true
                    ], 200);
                }
                // Para peticiones normales, devolver la vista
                return view('app');
            }

            // Activar la cuenta
            $this->usuarioRepository->actualizar($userId, [
                'Activate' => 1
            ]);

            Log::info('Cuenta activada exitosamente', [
                'user_id' => $userId,
                'email' => $email
            ]);

            // Si es una petición AJAX/JSON, devolver JSON
            // Si es una petición normal del navegador, devolver la vista para que React Router la maneje
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Cuenta activada exitosamente',
                    'success' => true
                ], 200);
            }
            
            // Para peticiones normales del navegador, devolver la vista de React
            // React Router manejará la navegación y mostrará el modal
            return view('app');

        } catch (\Exception $e) {
            Log::error('Error al verificar token de activación', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'token_preview' => $token ? substr($token, 0, 20) . '...' : 'no token',
                'trace' => $e->getTraceAsString()
            ]);

            // Determinar el tipo de error para dar un mensaje más específico
            $errorMessage = 'Error al activar la cuenta';
            if (str_contains($e->getMessage(), 'Signature') || str_contains($e->getMessage(), 'signature')) {
                $errorMessage = 'Token inválido. El enlace puede haber sido modificado.';
            } elseif (str_contains($e->getMessage(), 'Expired') || str_contains($e->getMessage(), 'expired')) {
                $errorMessage = 'El enlace ha expirado. Por favor, solicita un nuevo enlace de activación.';
            }

            return response()->json([
                'message' => $errorMessage,
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}
