<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Database\Factories\UsuarioFactoryManager;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    protected UsuarioRepository $usuarioRepository;

    public function __construct(UsuarioRepository $usuarioRepository)
    {
        $this->usuarioRepository = $usuarioRepository;
    }

    /**
     * Restablece la contraseña de un usuario
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        // Validar los datos del formulario
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
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

            // Actualizar directamente la contraseña en la BD usando el repositorio
            Log::info('Intentando restablecer contraseña', [
                'usuario_id' => $usuarioBD->Id,
                'correo' => $request->email
            ]);

            $resultado = $this->usuarioRepository->actualizar($usuarioBD->Id, [
                'contrasena' => $request->newPassword
            ]);

            if ($resultado) {
                Log::info('Contraseña restablecida exitosamente', [
                    'usuario_id' => $usuarioBD->Id
                ]);
                return response()->json([
                    'message' => 'Contraseña restablecida correctamente'
                ], 200);
            } else {
                Log::warning('No se pudo actualizar la contraseña', [
                    'usuario_id' => $usuarioBD->Id,
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

