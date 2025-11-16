<?php

namespace App\Observer;

/**
 * Clase abstracta base para notificadores
 * 
 * Coloca la lista de suscripción y la implementación de métodos de suscripción.
 * Normalmente, este código tiene el mismo aspecto para todos los tipos de notificadores,
 * por lo que el lugar obvio para colocarlo es en una clase abstracta derivada directamente
 * de la interfaz notificadora.
 * 
 * Los notificadores concretos extienden esta clase, heredando el comportamiento de suscripción.
 */
abstract class NotificadorBase implements INotificador
{
    /**
     * Lista de suscriptores (observadores)
     *
     * @var ISuscriptor[]
     */
    protected array $suscriptores = [];

    /**
     * Añade un suscriptor a la lista de observadores
     *
     * @param ISuscriptor $suscriptor
     * @return void
     */
    public function suscribir(ISuscriptor $suscriptor): void
    {
        // Evitar duplicados
        if (!in_array($suscriptor, $this->suscriptores, true)) {
            $this->suscriptores[] = $suscriptor;
        }
    }

    /**
     * Elimina un suscriptor de la lista de observadores
     *
     * @param ISuscriptor $suscriptor
     * @return void
     */
    public function desuscribir(ISuscriptor $suscriptor): void
    {
        $key = array_search($suscriptor, $this->suscriptores, true);
        if ($key !== false) {
            unset($this->suscriptores[$key]);
            $this->suscriptores = array_values($this->suscriptores); // Reindexar array
        }
    }

    /**
     * Notifica a todos los suscriptores sobre un cambio de estado
     *
     * @param mixed $datos Datos adicionales del evento (opcional)
     * @return void
     */
    public function notificar($datos = null): void
    {
        foreach ($this->suscriptores as $suscriptor) {
            $suscriptor->actualizar($this, $datos);
        }
    }

    /**
     * Obtiene el número de suscriptores actuales
     *
     * @return int
     */
    public function obtenerCantidadSuscriptores(): int
    {
        return count($this->suscriptores);
    }
}

