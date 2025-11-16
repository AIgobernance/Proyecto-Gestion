<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    public function register(Request $request)
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
            'contrasena' => 'required|string|min:8',
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
            // Nota: El constraint CK_usuario_Activate_TrueFalse puede requerir valores específicos
            // Usar 1 por defecto (activo) ya que el constraint no acepta 0
            $datosUsuario = [
                'usuario' => $request->usuario,
            'empresa' => $request->empresa,
            'nit' => $request->nit,
                'tipoDocumento' => $request->tipoDocumento,
                'numeroDocumento' => $request->numeroDocumento,
            'sector' => $request->sector,
            'pais' => $request->pais,
                'correo' => $request->correo,
            'telefono' => $request->telefono,
                'contrasena' => $request->contrasena,
                'rol' => 'usuario', // Por defecto es usuario
                'activate' => 1, // Usar 1 ya que el constraint no acepta 0
            ];

            // Crear el usuario usando el repositorio
            $userId = $this->usuarioRepository->crear($datosUsuario);

            // Obtener el usuario creado para retornarlo
            $usuario = $this->usuarioRepository->obtenerPorId($userId);

            // Ocultar la contraseña en la respuesta
            unset($usuario->Contrasena);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
                'user' => $usuario
        ], 201);

        } catch (\Exception $e) {
            // Log del error completo para debugging
            Log::error('Error al registrar usuario', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'message' => 'Error al registrar el usuario',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }
}
