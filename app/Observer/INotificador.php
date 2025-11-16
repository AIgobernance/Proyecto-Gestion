<?php

namespace App\Observer;

/**
 * Interfaz Notificadora (Subject)
 * Define el contrato para objetos que pueden notificar cambios de estado
 * 
 * Describe métodos para añadir y eliminar de la lista un objeto suscriptor.
 * Los notificadores deben trabajar con suscriptores únicamente a través de la interfaz suscriptora.
 */
interface INotificador
{
    /**
     * Añade un suscriptor a la lista de observadores
     *
     * @param ISuscriptor $suscriptor
     * @return void
     */
    public function suscribir(ISuscriptor $suscriptor): void;

    /**
     * Elimina un suscriptor de la lista de observadores
     *
     * @param ISuscriptor $suscriptor
     * @return void
     */
    public function desuscribir(ISuscriptor $suscriptor): void;

    /**
     * Notifica a todos los suscriptores sobre un cambio de estado
     *
     * @param mixed $datos Datos adicionales del evento (opcional)
     * @return void
     */
    public function notificar($datos = null): void;
}

