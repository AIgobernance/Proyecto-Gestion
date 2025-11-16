<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

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
            // Intentar autenticar al usuario
            $usuario = $this->usuarioRepository->autenticar(
                $request->username,
                $request->password
            );

            if (!$usuario) {
                return response()->json([
                    'message' => 'Credenciales inválidas',
                    'errors' => ['username' => ['Usuario o contraseña incorrectos']]
                ], 401);
            }

            // Verificar si el usuario está activo
            if (isset($usuario->Activate) && $usuario->Activate == 0) {
                return response()->json([
                    'message' => 'Cuenta inactiva',
                    'errors' => ['username' => ['Tu cuenta no está activa. Por favor, verifica tu correo electrónico.']]
                ], 403);
            }

            // Preparar datos del usuario
            $userData = [
                'id' => $usuario->Id,
                'nombre' => $usuario->Nombre_Usuario,
                'correo' => $usuario->Correo,
                'rol' => $usuario->Rol ?? 'usuario',
                'empresa' => $usuario->Empresa ?? null,
            ];

            // Guardar el usuario en la sesión
            $request->session()->put('user', $userData);
            $request->session()->save();

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

