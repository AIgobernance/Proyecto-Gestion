<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Database\Factories\UsuarioFactoryManager;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Cache;
use App\Observer\ObserverManager;
use App\Services\TwoFactorService;
use App\Services\EmailService;
use App\Services\SmsService;

class LoginController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    public function login(Request $request)
    {
        // Validar los datos del formulario
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Optimización: buscar usuario una sola vez usando OR (evita consultas duplicadas)
            $usuarioBD = \Illuminate\Support\Facades\DB::table('usuario')
                ->select([
                    'Id', 'Nombre_Usuario', 'Correo', 'Contrasena', 'Rol', 'Activate',
                    'Empresa', 'NIT', 'Tipo_Documento', 'Numero_Documento',
                    'Sector', 'Pais', 'Telefono', 'Foto_Perfil'
                ])
                ->where(function($query) use ($request) {
                    $query->where('Correo', $request->username)
                          ->orWhere('Nombre_Usuario', $request->username);
                })
                ->first();
            
            // Determinar el identificador único para rastrear intentos (email o username)
            $identifier = $usuarioBD ? ($usuarioBD->Correo ?? $request->username) : $request->username;
            $cacheKey = 'login_attempts_' . md5($identifier);
            
            // Verificar intentos fallidos previos
            $attempts = Cache::get($cacheKey, 0);
            
            // Si el usuario existe, verificar si está activo
            if ($usuarioBD) {
                $activateValue = $usuarioBD->Activate ?? 1;
                
                // Normalizar el valor para determinar si está activo
                $isActive = false;
                if (is_string($activateValue)) {
                    // Si es string, verificar si es 'True' (case-insensitive)
                    $isActive = (strtolower(trim($activateValue)) === 'true' || $activateValue === '1');
                } elseif (is_bool($activateValue)) {
                    $isActive = $activateValue;
                } elseif (is_numeric($activateValue)) {
                    $isActive = ((int)$activateValue == 1);
                }
                
                if (!$isActive) {
                    return response()->json([
                        'message' => 'Usuario desactivado',
                        'errors' => ['username' => ['Su cuenta ha sido desactivada. Por favor, contacte con soporte para más información.']],
                        'deactivated' => true
                    ], 403); // 403 Forbidden para usuario desactivado
                }
            }
            
            // Intentar autenticar al usuario usando Factory Method
            // Pasar $usuarioBD para evitar consulta duplicada
            $usuario = $this->usuarioRepository->autenticar(
                $request->username,
                $request->password,
                $usuarioBD // Pasar el usuario ya obtenido
            );

            if (!$usuario) {
                // Incrementar contador de intentos fallidos
                $attempts++;
                Cache::put($cacheKey, $attempts, now()->addMinutes(15)); // TTL de 15 minutos
                
                // Determinar mensaje según el número de intentos
                $errorMessage = '';
                $shouldBlock = false;
                
                if ($attempts == 1) {
                    $errorMessage = 'Contraseña incorrecta';
                } elseif ($attempts == 2) {
                    $errorMessage = 'Contraseña incorrecta. Al tercer intento fallido, su cuenta será bloqueada';
                } elseif ($attempts >= 3) {
                    $errorMessage = 'Su cuenta ha sido bloqueada debido a múltiples intentos fallidos. Por favor, contacte con soporte para más información.';
                    $shouldBlock = true;
                    
                    // Bloquear la cuenta si existe el usuario
                    if ($usuarioBD && isset($usuarioBD->Id)) {
                        try {
                            $this->usuarioRepository->actualizar($usuarioBD->Id, [
                                'Activate' => 0 // Bloquear cuenta
                            ]);
                            
                            Log::warning('Cuenta bloqueada por intentos fallidos', [
                                'user_id' => $usuarioBD->Id,
                                'identifier' => $identifier,
                                'attempts' => $attempts
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Error al bloquear cuenta después de intentos fallidos', [
                                'user_id' => $usuarioBD->Id ?? 'NO_ID',
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                }
                
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'errors' => ['username' => [$errorMessage]],
                    'attempts' => $attempts,
                    'blocked' => $shouldBlock
                ], 401);
            }
            
            // Si el login es exitoso, limpiar los intentos fallidos
            Cache::forget($cacheKey);

            // Obtener datos del usuario usando el método toArray() de la interfaz
            $userData = $usuario->toArray();
            
            // Asegurar que el ID esté presente (usar el usuarioBD ya obtenido)
            if (!isset($userData['id']) || $userData['id'] === null) {
                if ($usuarioBD && isset($usuarioBD->Id)) {
                    $userData['id'] = $usuarioBD->Id;
                } elseif (isset($userData['correo'])) {
                    // Solo hacer consulta adicional si realmente es necesario
                    $usuarioBD = $this->usuarioRepository->obtenerPorCorreo($userData['correo']);
                    if ($usuarioBD) {
                        $userData['id'] = $usuarioBD->Id ?? $usuarioBD->id ?? null;
                    }
                }
            }

            // Actualizar la fecha de última conexión
            if (isset($userData['id']) && $userData['id'] !== null) {
                try {
                    $this->usuarioRepository->actualizar($userData['id'], [
                        'Fecha_Ultima_Conexion' => now()
                    ]);
                    Log::info('Fecha de última conexión actualizada', [
                        'user_id' => $userData['id']
                    ]);
                } catch (\Exception $e) {
                    // No fallar el login si no se puede actualizar la fecha
                    Log::warning('No se pudo actualizar la fecha de última conexión', [
                        'user_id' => $userData['id'] ?? 'NO_ID',
                        'error' => $e->getMessage()
                    ]);
                }
            }

            // NO guardar el usuario en sesión todavía - esperar verificación 2FA
            // Guardar temporalmente los datos del usuario en sesión para el proceso 2FA
            $request->session()->put('pending_2fa_user', $userData);
            $request->session()->save();
            
            Log::info('Login exitoso, requiere selección de método 2FA', [
                'user_id' => $userData['id'] ?? 'NO_ID'
            ]);

            // Retornar respuesta indicando que se requiere selección de método 2FA
            return response()->json([
                'message' => 'Selecciona un método de verificación',
                'requires_2fa' => true,
                'user_id' => $userData['id']
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al autenticar usuario', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Error al iniciar sesión',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        // Obtener datos del usuario de la sesión para usar el método cerrarSesion()
        $userData = $request->session()->get('user');
        
        if ($userData) {
            // Usar Factory Method para crear la instancia y llamar a cerrarSesion()
            try {
                $usuario = UsuarioFactoryManager::crearUsuario(
                    $userData,
                    $userData['rol'] ?? 'usuario'
                );
                $usuario->cerrarSesion();
            } catch (\Exception $e) {
                Log::warning('Error al cerrar sesión usando Factory Method', [
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        // Disparar notificación de cierre de sesión (Patrón Observer)
        if ($userData) {
            $notificador = ObserverManager::obtenerNotificador('cierre_sesion');
            if ($notificador instanceof \App\Observer\Notificadores\NotificadorCierreSesion) {
                $notificador->cerrarSesion($userData);
            }
        }
        
        $request->session()->forget('user');
        $request->session()->flush();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ], 200);
    }

    public function check(Request $request)
    {
        $user = $request->session()->get('user');
        
        if ($user) {
            return response()->json([
                'authenticated' => true,
                'user' => $user
            ], 200);
        }

        // Retornar 200 en lugar de 401 para evitar errores en la consola
        // El frontend verificará el campo 'authenticated'
        return response()->json([
            'authenticated' => false
        ], 200);
    }

    /**
     * Verifica el código 2FA y completa el login
     */
    public function verify2FA(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
            'code' => 'required|string|size:6',
            'method' => 'nullable|string|in:email,sms',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->input('user_id');
            $inputCode = $request->input('code');

            // Obtener el método de verificación del request o de la sesión
            $verificationMethod = $request->input('method', $request->session()->get('2fa_method', 'email'));
            
            // Rastrear intentos fallidos de 2FA
            $attemptsCacheKey = "2fa_attempts_{$userId}";
            $attempts = Cache::get($attemptsCacheKey, 0);
            
            // Verificar el código 2FA solo si el método es email
            if ($verificationMethod === 'email') {
                $isValid = TwoFactorService::verifyCode($userId, $inputCode);

                if (!$isValid) {
                    // Incrementar contador de intentos fallidos
                    $attempts++;
                    Cache::put($attemptsCacheKey, $attempts, now()->addMinutes(15)); // TTL de 15 minutos
                    
                    // Determinar mensaje según el número de intentos
                    $errorMessage = '';
                    $shouldBlock = false;
                    
                    if ($attempts == 1) {
                        $errorMessage = 'Código incorrecto. Te quedan 2 intentos.';
                    } elseif ($attempts == 2) {
                        $errorMessage = 'Código incorrecto. Te queda 1 intento. Al tercer intento fallido, tu cuenta será bloqueada.';
                    } elseif ($attempts >= 3) {
                        $errorMessage = 'Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos de verificación. Por favor, contacte con soporte para más información.';
                        $shouldBlock = true;
                        
                        // Bloquear la cuenta
                        try {
                            $this->usuarioRepository->actualizar($userId, [
                                'Activate' => 0 // Bloquear cuenta
                            ]);
                            
                            // Limpiar sesión de 2FA pendiente
                            $request->session()->forget('pending_2fa_user');
                            $request->session()->forget('2fa_method');
                            
                            Log::warning('Cuenta bloqueada por intentos fallidos de 2FA', [
                                'user_id' => $userId,
                                'attempts' => $attempts
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Error al bloquear cuenta después de intentos fallidos de 2FA', [
                                'user_id' => $userId,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    
                    return response()->json([
                        'message' => 'Código de verificación incorrecto',
                        'errors' => ['code' => [$errorMessage]],
                        'attempts' => $attempts,
                        'blocked' => $shouldBlock,
                        'clear_code' => true // Indicar al frontend que debe limpiar el código
                    ], 400);
                }
                
                // Si el código es válido, limpiar los intentos fallidos y el código usado
                Cache::forget($attemptsCacheKey);
                TwoFactorService::clearCode($userId);
            } else if ($verificationMethod === 'sms') {
                // Verificar código SMS usando TwoFactorService
                $isValid = TwoFactorService::verifyCode($userId, $inputCode);

                if (!$isValid) {
                    // Incrementar contador de intentos fallidos
                    $attempts++;
                    Cache::put($attemptsCacheKey, $attempts, now()->addMinutes(15)); // TTL de 15 minutos
                    
                    // Determinar mensaje según el número de intentos
                    $errorMessage = '';
                    $shouldBlock = false;
                    
                    if ($attempts == 1) {
                        $errorMessage = 'Código incorrecto. Te quedan 2 intentos.';
                    } elseif ($attempts == 2) {
                        $errorMessage = 'Código incorrecto. Te queda 1 intento. Al tercer intento fallido, tu cuenta será bloqueada.';
                    } elseif ($attempts >= 3) {
                        $errorMessage = 'Tu cuenta ha sido bloqueada debido a múltiples intentos fallidos de verificación. Por favor, contacte con soporte para más información.';
                        $shouldBlock = true;
                        
                        // Bloquear la cuenta
                        try {
                            $this->usuarioRepository->actualizar($userId, [
                                'Activate' => 0 // Bloquear cuenta
                            ]);
                            
                            // Limpiar sesión de 2FA pendiente
                            $request->session()->forget('pending_2fa_user');
                            $request->session()->forget('2fa_method');
                            
                            Log::warning('Cuenta bloqueada por intentos fallidos de 2FA (SMS)', [
                                'user_id' => $userId,
                                'attempts' => $attempts
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Error al bloquear cuenta después de intentos fallidos de 2FA (SMS)', [
                                'user_id' => $userId,
                                'error' => $e->getMessage()
                            ]);
                        }
                    }
                    
                    return response()->json([
                        'message' => 'Código de verificación incorrecto',
                        'errors' => ['code' => [$errorMessage]],
                        'attempts' => $attempts,
                        'blocked' => $shouldBlock,
                        'clear_code' => true // Indicar al frontend que debe limpiar el código
                    ], 400);
                }
                
                // Si el código es válido, limpiar los intentos fallidos
                Cache::forget($attemptsCacheKey);
                
                Log::info('Código SMS verificado exitosamente', [
                    'user_id' => $userId
                ]);
            }

            // Obtener datos del usuario pendiente de la sesión
            $userData = $request->session()->get('pending_2fa_user');

            if (!$userData || ($userData['id'] ?? null) != $userId) {
                return response()->json([
                    'message' => 'Sesión de verificación no encontrada',
                    'errors' => ['code' => ['La sesión de verificación ha expirado. Por favor, inicia sesión nuevamente.']]
                ], 400);
            }

            // Limpiar datos temporales de 2FA
            $request->session()->forget('pending_2fa_user');

            // Guardar el usuario en la sesión (login completo)
            $request->session()->put('user', $userData);
            $request->session()->save();

            Log::info('Verificación 2FA exitosa, usuario autenticado', [
                'user_id' => $userId
            ]);

            return response()->json([
                'message' => 'Verificación exitosa',
                'user' => $userData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al verificar código 2FA', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al verificar el código',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Reenvía el código 2FA
     */
    public function resend2FA(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->input('user_id');
            
            // Obtener datos del usuario pendiente de la sesión
            $userData = $request->session()->get('pending_2fa_user');

            if (!$userData || ($userData['id'] ?? null) != $userId) {
                return response()->json([
                    'message' => 'Sesión de verificación no encontrada',
                    'errors' => ['user_id' => ['La sesión de verificación ha expirado. Por favor, inicia sesión nuevamente.']]
                ], 400);
            }

            // Obtener email del usuario
            $usuarioBD = $this->usuarioRepository->obtenerPorId($userId);
            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['user_id' => ['Usuario no encontrado']]
                ], 404);
            }

            // Generar nuevo código 2FA
            $twoFactorCode = TwoFactorService::generateCode();
            $userEmail = $usuarioBD->Correo ?? null;
            $userName = $userData['nombre'] ?? $userData['usuario'] ?? $usuarioBD->Nombre_Usuario ?? 'Usuario';

            if ($userEmail) {
                // Guardar código en caché
                TwoFactorService::storeCode($userId, $twoFactorCode, 10);
                
                // Enviar código por email
                $emailSent = EmailService::sendTwoFactorCode($userEmail, $twoFactorCode, $userName);
                
                if (!$emailSent) {
                    return response()->json([
                        'message' => 'No se pudo enviar el código',
                        'errors' => ['code' => ['Error al enviar el código. Por favor, intenta nuevamente.']]
                    ], 500);
                }
            } else {
                return response()->json([
                    'message' => 'Email no encontrado',
                    'errors' => ['user_id' => ['No se encontró el email del usuario']]
                ], 400);
            }

            Log::info('Código 2FA reenviado', [
                'user_id' => $userId
            ]);

            return response()->json([
                'message' => 'Código de verificación reenviado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al reenviar código 2FA', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al reenviar el código',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Envía el código 2FA por email cuando el usuario selecciona el método email
     */
    public function send2FACode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer',
            'method' => 'required|string|in:email,sms',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userId = $request->input('user_id');
            $method = $request->input('method');
            
            // Guardar el método en sesión para la verificación
            $request->session()->put('2fa_method', $method);
            
            // Obtener datos del usuario pendiente de la sesión
            $userData = $request->session()->get('pending_2fa_user');

            if (!$userData || ($userData['id'] ?? null) != $userId) {
                return response()->json([
                    'message' => 'Sesión de verificación no encontrada',
                    'errors' => ['user_id' => ['La sesión de verificación ha expirado. Por favor, inicia sesión nuevamente.']]
                ], 400);
            }

            // Obtener datos del usuario de la BD
            $usuarioBD = $this->usuarioRepository->obtenerPorId($userId);
            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['user_id' => ['Usuario no encontrado']]
                ], 404);
            }

            if ($method === 'email') {
                // Generar código 2FA
                $twoFactorCode = TwoFactorService::generateCode();
                $userEmail = $usuarioBD->Correo ?? null;
                $userName = $userData['nombre'] ?? $userData['usuario'] ?? $usuarioBD->Nombre_Usuario ?? 'Usuario';

                if (!$userEmail) {
                    return response()->json([
                        'message' => 'Email no encontrado',
                        'errors' => ['method' => ['No se encontró el email del usuario']]
                    ], 400);
                }

                // Guardar código en caché (válido por 10 minutos)
                TwoFactorService::storeCode($userId, $twoFactorCode, 10);
                
                // Enviar código por email
                $emailSent = EmailService::sendTwoFactorCode($userEmail, $twoFactorCode, $userName);
                
                if (!$emailSent) {
                    return response()->json([
                        'message' => 'No se pudo enviar el código',
                        'errors' => ['method' => ['Error al enviar el código. Por favor, intenta nuevamente.']]
                    ], 500);
                }

                Log::info('Código 2FA enviado por email', [
                    'user_id' => $userId,
                    'email' => $userEmail
                ]);

                return response()->json([
                    'message' => 'Código de verificación enviado a tu correo electrónico',
                    'method' => 'email'
                ], 200);
            } else if ($method === 'sms') {
                // Obtener número de teléfono del usuario
                $userPhone = $usuarioBD->Telefono ?? $usuarioBD->telefono ?? null;

                if (!$userPhone) {
                    return response()->json([
                        'message' => 'Número de teléfono no encontrado',
                        'errors' => ['method' => ['No se encontró el número de teléfono del usuario']]
                    ], 400);
                }

                // Generar código 2FA de 6 dígitos
                $twoFactorCode = TwoFactorService::generateCode();

                // Guardar código en caché (válido por 10 minutos)
                TwoFactorService::storeCode($userId, $twoFactorCode, 10);

                // Enviar código por SMS usando Twilio
                $smsService = new \App\Services\SmsService();
                $smsResult = $smsService->sendVerificationCode($userPhone, $twoFactorCode);

                if (!$smsResult['success']) {
                    // Limpiar código si no se pudo enviar
                    TwoFactorService::clearCode($userId);
                    
                    Log::error('Error al enviar código SMS', [
                        'user_id' => $userId,
                        'phone' => $userPhone,
                        'error' => $smsResult['message']
                    ]);

                    // Determinar el mensaje de error apropiado
                    $errorMessage = $smsResult['message'] ?? 'Error al enviar el código. Por favor, intenta nuevamente o usa el método de email.';
                    
                    if (str_contains($smsResult['message'], 'no disponible') || str_contains($smsResult['message'], 'no configurado')) {
                        $errorMessage = 'El servicio SMS no está configurado. Por favor, contacta al administrador o usa el método de email.';
                        Log::warning('Servicio SMS no configurado - usuario intentó usar SMS', [
                            'user_id' => $userId,
                            'phone' => $userPhone
                        ]);
                    } elseif (isset($smsResult['error_code']) && $smsResult['error_code'] == 21608) {
                        // Error de número no verificado en cuenta de prueba
                        $errorMessage = 'Tu número de teléfono no está verificado en Twilio. Las cuentas de prueba solo pueden enviar SMS a números verificados. Por favor, usa el método de email.';
                    }

                    return response()->json([
                        'message' => 'Error al seleccionar método SMS',
                        'errors' => ['method' => [$errorMessage]]
                    ], 400); // Cambiar a 400 en lugar de 500 para errores de negocio
                }

                Log::info('Código 2FA enviado por SMS via Twilio', [
                    'user_id' => $userId,
                    'phone' => $userPhone,
                    'message_sid' => $smsResult['message_sid'] ?? 'N/A'
                ]);

                return response()->json([
                    'message' => 'Código de verificación enviado a tu número de teléfono',
                    'method' => 'sms'
                ], 200);
            }

        } catch (\Exception $e) {
            Log::error('Error al enviar código 2FA', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al enviar el código',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}

