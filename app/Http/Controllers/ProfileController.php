<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Obtiene el perfil del usuario autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile(Request $request)
    {
        try {
            $userData = $request->session()->get('user');

            if (!$userData) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // El ID puede estar en diferentes campos dependiendo de cómo se guardó
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Si no hay ID en la sesión, intentar buscar por correo
                if (isset($userData['correo'])) {
                    Log::info('Buscando usuario por correo porque no hay ID en sesión', ['correo' => $userData['correo']]);
                    $usuario = $this->usuarioRepository->obtenerPorCorreo($userData['correo']);
                    if ($usuario) {
                        $userId = $usuario->Id ?? $usuario->id ?? null;
                    }
                }
                
                if (!$userId) {
                    Log::warning('Usuario autenticado pero sin ID en sesión', ['userData' => $userData]);
                    return response()->json([
                        'message' => 'Error: No se pudo identificar al usuario'
                    ], 400);
                }
            }

            // Obtener datos completos del usuario desde la BD
            $usuario = $this->usuarioRepository->obtenerPorId($userId);

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Formatear los datos para el frontend
            $profileData = [
                'id' => $usuario->Id ?? $usuario->id ?? null,
                'username' => $usuario->Nombre_Usuario ?? $usuario->nombre_usuario ?? '',
                'email' => $usuario->Correo ?? $usuario->correo ?? '',
                'phone' => $usuario->Telefono ?? $usuario->telefono ?? '',
                'fotoPerfil' => $usuario->Foto_Perfil ?? $usuario->foto_perfil ?? null,
                'empresa' => $usuario->Empresa ?? $usuario->empresa ?? '',
            ];

            return response()->json([
                'profile' => $profileData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener perfil', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al obtener el perfil',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Actualiza el perfil del usuario autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        try {
            $userData = $request->session()->get('user');

            if (!$userData) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // El ID puede estar en diferentes campos dependiendo de cómo se guardó
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Si no hay ID en la sesión, intentar buscar por correo
                if (isset($userData['correo'])) {
                    Log::info('Buscando usuario por correo para actualizar perfil', ['correo' => $userData['correo']]);
                    $usuario = $this->usuarioRepository->obtenerPorCorreo($userData['correo']);
                    if ($usuario) {
                        $userId = $usuario->Id ?? $usuario->id ?? null;
                        // Actualizar la sesión con el ID encontrado
                        if ($userId) {
                            $userData['id'] = $userId;
                            $request->session()->put('user', $userData);
                            $request->session()->save();
                        }
                    }
                }
                
                if (!$userId) {
                    Log::warning('Usuario autenticado pero sin ID en sesión al actualizar', ['userData' => $userData]);
                    return response()->json([
                        'message' => 'Error: No se pudo identificar al usuario'
                    ], 400);
                }
            }

            // Validar los datos del formulario
            $validator = Validator::make($request->all(), [
                'username' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
            ]);

            if ($validator->fails()) {
                Log::warning('Validación fallida al actualizar perfil', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar si el correo ya está en uso por otro usuario
            $usuarioExistente = $this->usuarioRepository->obtenerPorCorreo($request->email);
            if ($usuarioExistente && ($usuarioExistente->Id != $userId)) {
                return response()->json([
                    'message' => 'El correo electrónico ya está en uso',
                    'errors' => ['email' => ['Este correo ya está registrado']]
                ], 422);
            }

            // Preparar datos para actualizar
            $datosActualizar = [
                'Nombre_Usuario' => $request->username,
                'Correo' => $request->email,
                'Telefono' => $request->phone,
            ];

            // Actualizar en la BD
            $resultado = $this->usuarioRepository->actualizar($userId, $datosActualizar);

            if ($resultado) {
                // Actualizar la sesión con los nuevos datos
                $userData['nombre'] = $request->username;
                $userData['correo'] = $request->email;
                $request->session()->put('user', $userData);
                $request->session()->save();

                // Obtener datos actualizados
                $usuario = $this->usuarioRepository->obtenerPorId($userId);

                $profileData = [
                    'id' => $usuario->Id ?? $usuario->id ?? null,
                    'username' => $usuario->Nombre_Usuario ?? $usuario->nombre_usuario ?? '',
                    'email' => $usuario->Correo ?? $usuario->correo ?? '',
                    'phone' => $usuario->Telefono ?? $usuario->telefono ?? '',
                    'fotoPerfil' => $usuario->Foto_Perfil ?? $usuario->foto_perfil ?? null,
                    'empresa' => $usuario->Empresa ?? $usuario->empresa ?? '',
                ];

                return response()->json([
                    'message' => 'Perfil actualizado correctamente',
                    'profile' => $profileData
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No se pudo actualizar el perfil'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al actualizar el perfil',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Sube una foto de perfil para el usuario autenticado
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadProfilePhoto(Request $request)
    {
        // Validar que se haya enviado un archivo
        $validator = Validator::make($request->all(), [
            'foto' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048', // Máximo 2MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $userData = $request->session()->get('user');

            if (!$userData) {
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // El ID puede estar en diferentes campos dependiendo de cómo se guardó
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Si no hay ID en la sesión, intentar buscar por correo
                if (isset($userData['correo'])) {
                    $usuario = $this->usuarioRepository->obtenerPorCorreo($userData['correo']);
                    if ($usuario) {
                        $userId = $usuario->Id ?? $usuario->id ?? null;
                        if ($userId) {
                            $userData['id'] = $userId;
                            $request->session()->put('user', $userData);
                            $request->session()->save();
                        }
                    }
                }
                
                if (!$userId) {
                    return response()->json([
                        'message' => 'Error: No se pudo identificar al usuario'
                    ], 400);
                }
            }

            // Guardar la imagen en storage
            $file = $request->file('foto');
            $filename = 'profile_' . $userId . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('profiles', $filename, 'public');

            // Guardar la ruta en la base de datos
            $resultado = $this->usuarioRepository->actualizar($userId, [
                'Foto_Perfil' => $path
            ]);

            if ($resultado) {
                return response()->json([
                    'message' => 'Foto de perfil actualizada correctamente',
                    'foto' => Storage::url($path)
                ], 200);
            } else {
                // Si falla, eliminar el archivo subido
                Storage::disk('public')->delete($path);
                return response()->json([
                    'message' => 'No se pudo actualizar la foto de perfil'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al subir foto de perfil', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al subir la foto de perfil',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}

