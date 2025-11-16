<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Database\Models\UsuarioRepository;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Observer\ObserverManager;
use App\Services\JwtService;
use App\Services\EmailService;

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
            // Crear usuario INACTIVO (activate = 0) para requerir activación por email
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
                'activate' => 0, // Usuario inactivo hasta que active su cuenta por email
            ];

            // Crear el usuario usando el repositorio
            $userId = $this->usuarioRepository->crear($datosUsuario);

            // Obtener el usuario creado para retornarlo
            $usuario = $this->usuarioRepository->obtenerPorId($userId);

            // Ocultar la contraseña en la respuesta
            unset($usuario->Contrasena);

            // Generar token JWT para activación
            try {
                $activationToken = JwtService::generateActivationToken($userId, $request->correo);
                
                // Transformar datos del frontend al formato necesario para el email
                $emailData = EmailService::transformRegistrationData($request->all());
                
                // Enviar email de activación
                $emailSent = EmailService::sendActivationEmail($request->correo, $emailData, $activationToken);
                
                if (!$emailSent) {
                    Log::warning('No se pudo enviar el email de activación, pero el usuario fue creado', [
                        'user_id' => $userId,
                        'email' => $request->correo
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error al generar token o enviar email de activación', [
                    'user_id' => $userId,
                    'email' => $request->correo,
                    'error' => $e->getMessage()
                ]);
                // No fallar el registro si hay error en el email, pero loguear el error
            }

            // Disparar notificación de usuario registrado (Patrón Observer)
            $notificador = ObserverManager::obtenerNotificador('usuario_registrado');
            if ($notificador instanceof \App\Observer\Notificadores\NotificadorUsuarioRegistrado) {
                $notificador->registrarUsuario($userId, [
                    'nombre' => $request->usuario,
                    'correo' => $request->correo,
                    'rol' => 'usuario'
                ]);
            }

            return response()->json([
                'message' => 'Usuario registrado correctamente. Por favor, revisa tu correo electrónico para activar tu cuenta.',
                'user' => $usuario,
                'requires_activation' => true
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
