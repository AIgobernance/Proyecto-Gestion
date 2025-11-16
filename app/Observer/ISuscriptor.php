<?php

namespace App\Observer;

/**
 * Interfaz Suscriptora (Observer)
 * Define el contrato que deben implementar todos los observadores
 * 
 * Como mínimo, deberá declarar un único método actualizar.
 */
interface ISuscriptor
{
    /**
     * Actualiza al suscriptor cuando el notificador cambia de estado
     *
     * @param INotificador $notificador El notificador que disparó la actualización
     * @param mixed $datos Datos adicionales del evento (opcional)
     * @return void
     */
    public function actualizar(INotificador $notificador, $datos = null): void;
}

