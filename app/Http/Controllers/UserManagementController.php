<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Database\Factories\UsuarioFactoryManager;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UserManagementController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Obtiene la lista de usuarios
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $limit = $request->get('limit', 100);
            $offset = $request->get('offset', 0);

            $usuarios = $this->usuarioRepository->obtenerTodos($limit, $offset);

            // Formatear los usuarios para el frontend
            $usuariosFormateados = array_map(function ($usuario) {
                return [
                    'id' => $usuario->Id ?? $usuario->id ?? null,
                    'usuario' => $usuario->Nombre_Usuario ?? $usuario->nombre_usuario ?? '',
                    'rol' => $usuario->Rol ?? $usuario->rol ?? 'usuario',
                    'estado' => (isset($usuario->Activate) && ($usuario->Activate == 1 || $usuario->Activate === 'True' || $usuario->Activate === true)) ? 'Activo' : 'Inactivo',
                    'activado' => (isset($usuario->Activate) && ($usuario->Activate == 1 || $usuario->Activate === 'True' || $usuario->Activate === true)),
                    'correo' => $usuario->Correo ?? $usuario->correo ?? '',
                    'empresa' => $usuario->Empresa ?? $usuario->empresa ?? '',
                    'fotoPerfil' => $usuario->Foto_Perfil ?? $usuario->foto_perfil ?? null,
                ];
            }, $usuarios);

            return response()->json([
                'users' => $usuariosFormateados,
                'total' => count($usuariosFormateados)
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener usuarios', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Crea un nuevo usuario
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Validar los datos del formulario
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string|max:255',
            'empresa' => 'required|string|max:255',
            'nit' => 'required|string|max:50',
            'tipoDocumento' => 'required|string|in:CC,CE,Pasaporte',
            'numeroDocumento' => 'required|string|max:50',
            'sector' => 'required|string|max:255',
            'pais' => 'required|string|max:255',
            'tamanoOrganizacional' => 'required|string|max:255',
            'correo' => 'required|email|max:255',
            'telefono' => 'required|string|max:20',
            'crearContrasena' => 'required|string|min:8',
            'confirmarContrasena' => 'required|string|min:8|same:crearContrasena',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar si el correo ya existe
        if ($this->usuarioRepository->existeCorreo($request->correo)) {
            return response()->json([
                'message' => 'El correo electrónico ya está registrado',
                'errors' => ['correo' => ['Este correo ya está en uso']]
            ], 422);
        }

        // Verificar si ya existe un usuario con el mismo tipo y número de documento
        if ($this->usuarioRepository->existeDocumento($request->tipoDocumento, $request->numeroDocumento)) {
            return response()->json([
                'message' => 'Ya existe un usuario registrado con este tipo y número de documento',
                'errors' => ['numeroDocumento' => ['Este documento ya está registrado']]
            ], 422);
        }

        try {
            // Preparar los datos para el repositorio
            $datosUsuario = [
                'usuario' => $request->usuario,
                'empresa' => $request->empresa,
                'nit' => $request->nit,
                'tipoDocumento' => $request->tipoDocumento,
                'numeroDocumento' => $request->numeroDocumento,
                'sector' => $request->sector,
                'pais' => $request->pais,
                'tamanoOrganizacional' => $request->tamanoOrganizacional,
                'correo' => $request->correo,
                'telefono' => $request->telefono,
                'contrasena' => $request->crearContrasena,
                'rol' => 'usuario', // Por defecto es usuario
                'activate' => 1,
            ];

            // Crear el usuario usando el repositorio (que usa Factory Method internamente)
            $userId = $this->usuarioRepository->crear($datosUsuario);

            // Obtener el usuario creado para retornarlo
            $usuario = $this->usuarioRepository->obtenerPorId($userId);

            // Ocultar la contraseña en la respuesta
            unset($usuario->Contrasena);

            return response()->json([
                'message' => 'Usuario creado correctamente',
                'user' => $usuario
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear usuario', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Error al crear el usuario',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Activa o desactiva un usuario
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $usuario = $this->usuarioRepository->obtenerPorId($id);

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Obtener el estado actual
            $activateActual = $usuario->Activate ?? 1;
            $nuevoEstado = ($activateActual == 1 || $activateActual === 'True' || $activateActual === true) ? 0 : 1;

            // Actualizar el estado
            $resultado = $this->usuarioRepository->actualizar($id, [
                'Activate' => $nuevoEstado
            ]);

            if ($resultado) {
                return response()->json([
                    'message' => 'Estado del usuario actualizado correctamente',
                    'activate' => $nuevoEstado
                ], 200);
            } else {
                return response()->json([
                    'message' => 'No se pudo actualizar el estado del usuario'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al cambiar estado de usuario', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al cambiar el estado del usuario',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Restablece la contraseña de un usuario (desde admin)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        // Validar los datos del formulario
        $validator = Validator::make($request->all(), [
            'usuario' => 'required|string',
            'nuevaContrasena' => 'required|string|min:8',
            'confirmarContrasena' => 'required|string|min:8|same:nuevaContrasena',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Buscar el usuario por nombre de usuario o correo
            $usuarioBD = $this->usuarioRepository->obtenerPorNombreUsuario($request->usuario);
            
            if (!$usuarioBD) {
                $usuarioBD = $this->usuarioRepository->obtenerPorCorreo($request->usuario);
            }

            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['usuario' => ['No se encontró un usuario con ese nombre o correo']]
                ], 404);
            }

            // Actualizar directamente la contraseña en la BD usando el repositorio
            $resultado = $this->usuarioRepository->actualizar($usuarioBD->Id, [
                'contrasena' => $request->nuevaContrasena
            ]);

            if ($resultado) {
                Log::info('Contraseña restablecida por administrador', [
                    'usuario_id' => $usuarioBD->Id,
                    'admin_id' => $request->session()->get('user')['id'] ?? null
                ]);

                return response()->json([
                    'message' => 'Contraseña restablecida correctamente'
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Error al restablecer la contraseña',
                    'errors' => ['general' => ['No se pudo actualizar la contraseña']]
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Error al restablecer contraseña desde admin', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error al restablecer la contraseña',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Sube una foto de perfil para un usuario
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadProfilePhoto(Request $request, $id)
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
            $usuario = $this->usuarioRepository->obtenerPorId($id);

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Guardar la imagen en storage
            $file = $request->file('foto');
            $filename = 'profile_' . $id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('profiles', $filename, 'public');

            // Guardar la ruta en la base de datos
            // Nota: Necesitarás agregar una columna Foto_Perfil a la tabla usuario si no existe
            $resultado = $this->usuarioRepository->actualizar($id, [
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

