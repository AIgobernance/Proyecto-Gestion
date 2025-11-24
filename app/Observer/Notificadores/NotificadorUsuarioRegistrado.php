<?php

namespace App\Observer\Notificadores;

use App\Observer\NotificadorBase;
use Illuminate\Support\Facades\Log;

/**
 * Notificador Concreto: Usuario Registrado
 *
 * RF 1: El Sistema deberá permitir registrar nuevos usuarios.
 * Notifica cuando un nuevo usuario se registra en la plataforma.
 */
class NotificadorUsuarioRegistrado extends NotificadorBase
{
    /**
     * Dispara la notificación de usuario registrado.
     *
     * @param int $userId ID del usuario registrado.
     * @param array $datosUsuario Datos adicionales del usuario (nombre, correo, rol, etc.).
     * @return void
     */
    public function registrarUsuario(int $userId, array $datosUsuario = []): void
    {
        Log::info('NotificadorUsuarioRegistrado: Disparando evento de usuario registrado', [
            'user_id' => $userId,
            'datos' => $datosUsuario
        ]);
        $this->notificar([
            'user_id' => $userId,
            'datos_usuario' => $datosUsuario
        ]);
    }
}

