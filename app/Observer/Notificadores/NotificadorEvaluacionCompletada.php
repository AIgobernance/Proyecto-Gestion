<?php

namespace App\Observer\Notificadores;

use App\Observer\NotificadorBase;

/**
 * Notificador Concreto: Evaluación Completada
 * 
 * RF 9: El Sistema deberá permitir completar la evaluación.
 * Notificar la generación de resultados automáticos.
 * 
 * Cada vez que suceda algo importante dentro de esta notificadora,
 * deberá notificar a todos sus suscriptores.
 */
class NotificadorEvaluacionCompletada extends NotificadorBase
{
    /**
     * ID de la evaluación completada
     *
     * @var int
     */
    private int $evaluacionId;

    /**
     * ID del usuario que completó la evaluación
     *
     * @var int
     */
    private int $userId;

    /**
     * Datos adicionales de la evaluación
     *
     * @var array
     */
    private array $datosEvaluacion;

    /**
     * Registra la evaluación completada y notifica a los suscriptores
     *
     * @param int $evaluacionId ID de la evaluación
     * @param int $userId ID del usuario
     * @param array $datosEvaluacion Datos adicionales (tiempo, respuestas, etc.)
     * @return void
     */
    public function completarEvaluacion(int $evaluacionId, int $userId, array $datosEvaluacion = []): void
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

