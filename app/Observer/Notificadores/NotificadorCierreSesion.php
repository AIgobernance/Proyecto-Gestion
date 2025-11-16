<?php

namespace App\Observer\Notificadores;

use App\Observer\NotificadorBase;

/**
 * Notificador Concreto: Cierre de Sesión
 * 
 * RF 4: El Sistema deberá permitir cerrar sesión de forma segura.
 * Notifica cambio de estado en cierre de sesión.
 * 
 * Cada vez que suceda algo importante dentro de esta notificadora,
 * deberá notificar a todos sus suscriptores.
 */
class NotificadorCierreSesion extends NotificadorBase
{
    /**
     * Datos del usuario que cerró sesión
     *
     * @var array
     */
    private array $datosUsuario;

    /**
     * Registra el cierre de sesión y notifica a los suscriptores
     *
     * @param array $datosUsuario Datos del usuario (id, username, email, etc.)
     * @return void
     */
    public function cerrarSesion(array $datosUsuario): void
    {
        $this->datosUsuario = $datosUsuario;
        
        // Notificar a todos los suscriptores
        $this->notificar($this->datosUsuario);
    }

    /**
     * Obtiene los datos del usuario que cerró sesión
     *
     * @return array
     */
    public function obtenerDatosUsuario(): array
    {
        return $this->datosUsuario;
    }
}

