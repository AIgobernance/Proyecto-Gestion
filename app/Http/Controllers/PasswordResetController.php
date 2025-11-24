<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Database\Factories\UsuarioFactoryManager;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Services\TwoFactorService;
use App\Services\EmailService;
use App\Services\SmsService;
use Illuminate\Support\Facades\Cache;

class PasswordResetController extends Controller
{
    protected UsuarioRepository $usuarioRepository;
    protected SmsService $smsService;

    public function __construct(UsuarioRepository $usuarioRepository, SmsService $smsService)
    {
        $this->usuarioRepository = $usuarioRepository;
        $this->smsService = $smsService;
    }

    /**
     * Inicia el proceso de restablecimiento de contraseña (solo valida el email)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function initiatePasswordReset(Request $request)
    {
        // Validar el email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Buscar el usuario por correo electrónico
            $usuarioBD = $this->usuarioRepository->obtenerPorCorreo($request->email);

            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['email' => ['No se encontró un usuario con ese correo electrónico']]
                ], 404);
            }

            // Guardar información del usuario en caché para el proceso de restablecimiento
            Cache::put("password_reset_user_{$usuarioBD->Id}", [
                'id' => $usuarioBD->Id,
                'email' => $usuarioBD->Correo,
                'telefono' => $usuarioBD->Telefono ?? null
            ], now()->addMinutes(15));

            Log::info('Inicio de restablecimiento de contraseña', [
                'usuario_id' => $usuarioBD->Id,
                'correo' => $usuarioBD->Correo
            ]);

            return response()->json([
                'message' => 'Usuario encontrado',
                'user_id' => $usuarioBD->Id,
                'has_phone' => !empty($usuarioBD->Telefono)
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al iniciar restablecimiento de contraseña', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Error al iniciar el restablecimiento de contraseña',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Envía el código de verificación según el método seleccionado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPasswordResetCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'method' => 'required|in:email,sms',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Buscar el usuario por correo electrónico
            $usuarioBD = $this->usuarioRepository->obtenerPorCorreo($request->email);

            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['email' => ['No se encontró un usuario con ese correo electrónico']]
                ], 404);
            }

            $method = $request->method;
            $userId = $usuarioBD->Id;

            if ($method === 'email') {
                // Generar código 2FA
                $code = TwoFactorService::generateCode();
                $userEmail = $usuarioBD->Correo ?? null;
                $userName = $usuarioBD->Nombre_Usuario ?? 'Usuario';

                if (!$userEmail) {
                    return response()->json([
                        'message' => 'Email no encontrado',
                        'errors' => ['method' => ['No se encontró el email del usuario']]
                    ], 400);
                }

                // Guardar código en caché con clave específica para password reset
                $cacheKey = "password_reset_code_{$userId}";
                Cache::put($cacheKey, $code, now()->addMinutes(10));
                
                // Guardar el método usado
                Cache::put("password_reset_method_{$userId}", 'email', now()->addMinutes(15));
                
                // Enviar código por email
                $emailSent = EmailService::sendTwoFactorCode($userEmail, $code, $userName);
                
                if (!$emailSent) {
                    return response()->json([
                        'message' => 'No se pudo enviar el código',
                        'errors' => ['method' => ['Error al enviar el código. Por favor, intenta nuevamente.']]
                    ], 500);
                }

                Log::info('Código de restablecimiento enviado por email', [
                    'user_id' => $userId,
                    'email' => $userEmail
                ]);

                return response()->json([
                    'message' => 'Código de verificación enviado a tu correo electrónico',
                    'method' => 'email'
                ], 200);
                
            } else if ($method === 'sms') {
                $userPhone = $usuarioBD->Telefono ?? null;

                if (!$userPhone) {
                    return response()->json([
                        'message' => 'Número de teléfono no encontrado',
                        'errors' => ['method' => ['No se encontró el número de teléfono del usuario']]
                    ], 400);
                }

                // Generar código 2FA
                $code = TwoFactorService::generateCode();

                // Guardar código en caché con clave específica para password reset
                $cacheKey = "password_reset_code_{$userId}";
                Cache::put($cacheKey, $code, now()->addMinutes(10));
                
                // Guardar el método usado
                Cache::put("password_reset_method_{$userId}", 'sms', now()->addMinutes(15));

                // Enviar código por SMS
                $smsResult = $this->smsService->sendVerificationCode($userPhone, $code);

                if (!$smsResult['success']) {
                    return response()->json([
                        'message' => $smsResult['message'] ?? 'No se pudo enviar el código',
                        'errors' => ['method' => [$smsResult['message'] ?? 'Error al enviar el código SMS']]
                    ], 500);
                }

                Log::info('Código de restablecimiento enviado por SMS', [
                    'user_id' => $userId,
                    'phone' => $userPhone
                ]);

                return response()->json([
                    'message' => 'Código de verificación enviado a tu número de teléfono',
                    'method' => 'sms'
                ], 200);
            }

        } catch (\Exception $e) {
            Log::error('Error al enviar código de restablecimiento', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al enviar el código',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Restablece la contraseña de un usuario después de verificar el código
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        // Validar los datos del formulario
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'newPassword' => 'required|string|min:8',
            'confirmPassword' => 'required|string|min:8|same:newPassword',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Buscar el usuario solo por correo electrónico
            $usuarioBD = $this->usuarioRepository->obtenerPorCorreo($request->email);

            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['email' => ['No se encontró un usuario con ese correo electrónico']]
                ], 404);
            }

            $userId = $usuarioBD->Id;
            
            // Obtener el código almacenado
            $cacheKey = "password_reset_code_{$userId}";
            $storedCode = Cache::get($cacheKey);

            if (!$storedCode) {
                return response()->json([
                    'message' => 'Código expirado o inválido',
                    'errors' => ['code' => ['El código ha expirado. Por favor, solicita un nuevo código.']]
                ], 400);
            }

            // Verificar que el código coincida
            $codeValid = trim(strtolower($request->code)) === trim(strtolower($storedCode));

            if (!$codeValid) {
                return response()->json([
                    'message' => 'Código incorrecto',
                    'errors' => ['code' => ['El código ingresado es incorrecto']]
                ], 400);
            }

            // Si el código es válido, proceder a cambiar la contraseña
            Log::info('Código verificado correctamente, procediendo a restablecer contraseña', [
                'usuario_id' => $userId,
                'correo' => $request->email
            ]);

            // Actualizar la contraseña en la BD usando el repositorio
            $resultado = $this->usuarioRepository->actualizar($userId, [
                'contrasena' => $request->newPassword
            ]);

            if ($resultado) {
                // Limpiar códigos y datos temporales del caché
                Cache::forget($cacheKey);
                Cache::forget("password_reset_method_{$userId}");
                Cache::forget("password_reset_user_{$userId}");

                Log::info('Contraseña restablecida exitosamente', [
                    'usuario_id' => $userId
                ]);
                
                return response()->json([
                    'message' => 'Contraseña restablecida correctamente'
                ], 200);
            } else {
                Log::warning('No se pudo actualizar la contraseña', [
                    'usuario_id' => $userId,
                    'correo' => $request->email
                ]);
                return response()->json([
                    'message' => 'Error al restablecer la contraseña',
                    'errors' => ['general' => ['No se pudo actualizar la contraseña. Por favor, intente nuevamente.']]
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al restablecer contraseña', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Error al restablecer la contraseña',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}

