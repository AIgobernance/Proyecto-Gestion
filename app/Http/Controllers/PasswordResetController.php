<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
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
     * Restablece la contraseña de un usuario (sin verificación 2FA)
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
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
            $usuarioBD = $this->findUser($request->email);

            if (!$usuarioBD) {
                return response()->json([
                    'message' => 'Usuario no encontrado',
                    'errors' => ['email' => ['No se encontró un usuario con ese correo o nombre de usuario']]
                ], 404);
            }

            $userId = $usuarioBD->Id;

            $resultado = $this->usuarioRepository->actualizar($userId, [
                'contrasena' => $request->newPassword
            ]);

            if ($resultado) {
                Log::info('Contraseña restablecida exitosamente', [
                    'usuario_id' => $userId
                ]);

                return response()->json([
                    'message' => 'Contraseña restablecida correctamente'
                ], 200);
            }

            return response()->json([
                'message' => 'Error al restablecer la contraseña',
                'errors' => ['general' => ['No se pudo actualizar la contraseña. Por favor, intente nuevamente.']]
            ], 500);

        } catch (\Exception $e) {
            Log::error('Error al restablecer contraseña', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Error al restablecer la contraseña',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    private function findUser(string $identifier): ?object
    {
        $usuario = $this->usuarioRepository->obtenerPorCorreo($identifier);
        if ($usuario) {
            return $usuario;
        }

        return $this->usuarioRepository->obtenerPorNombreUsuario($identifier);
    }
}
