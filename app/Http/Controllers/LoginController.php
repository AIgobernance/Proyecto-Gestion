<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Database\Factories\UsuarioFactoryManager;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use App\Observer\ObserverManager;

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
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'errors' => ['username' => ['Usuario o contraseña incorrectos']]
                ], 401);
            }

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

            // Guardar el usuario en la sesión
            $request->session()->put('user', $userData);
            $request->session()->save();
            
            Log::info('Usuario guardado en sesión', [
                'user_id' => $userData['id'] ?? 'NO_ID',
                'correo' => $userData['correo'] ?? 'NO_CORREO',
                'userData_keys' => array_keys($userData)
            ]);

            // Retornar respuesta exitosa
            return response()->json([
                'message' => 'Login exitoso',
                'user' => $userData
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
}

