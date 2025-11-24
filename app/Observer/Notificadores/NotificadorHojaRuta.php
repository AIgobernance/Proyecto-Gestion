<?php

namespace App\Observer\Notificadores;

use App\Observer\NotificadorBase;

/**
 * Notificador Concreto: Solicitud de Hoja de Ruta
 * 
 * RF 11: El Sistema deberá permitir Descargar la hoja de ruta personalizada.
 * Dispara el evento para iniciar su generación automática.
 * 
 * Cada vez que suceda algo importante dentro de esta notificadora,
 * deberá notificar a todos sus suscriptores.
 */
class NotificadorHojaRuta extends NotificadorBase
{
    /**
     * ID de la evaluación
     *
     * @var int
     */
    private int $evaluacionId;

    /**
     * ID del usuario
     *
     * @var int
     */
    private int $userId;

    /**
     * Datos de la evaluación para generar la hoja de ruta
     *
     * @var array
     */
    private array $datosEvaluacion;

    /**
     * Solicita la generación de la hoja de ruta y notifica a los suscriptores
     *
     * @param int $evaluacionId ID de la evaluación
     * @param int $userId ID del usuario
     * @param array $datosEvaluacion Datos de la evaluación (resultados, puntuación, etc.)
     * @return void
     */
    public function solicitarHojaRuta(int $evaluacionId, int $userId, array $datosEvaluacion = []): void
    {
        $this->evaluacionId = $evaluacionId;
        $this->userId = $userId;
        $this->datosEvaluacion = $datosEvaluacion;

        // Notificar a todos los suscriptores
        $this->notificar([
            'evaluacion_id' => $this->evaluacionId,
            'user_id' => $this->userId,
            'datos' => $this->datosEvaluacion
        ]);
    }

    /**
     * Obtiene el ID de la evaluación
     *
     * @return int
     */
    public function obtenerEvaluacionId(): int
    {
        return $this->evaluacionId;
    }

    /**
     * Obtiene el ID del usuario
     *
     * @return int
     */
    public function obtenerUserId(): int
    {
        return $this->userId;
    }

    /**
     * Obtiene los datos de la evaluación
     *
     * @return array
     */
    public function obtenerDatosEvaluacion(): array
    {
        return $this->datosEvaluacion;
    }
}

