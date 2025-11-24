<?php

namespace App\Observer\Suscriptores;

use App\Observer\ISuscriptor;
use App\Observer\INotificador;
use Illuminate\Support\Facades\Log;

/**
 * Suscriptor Concreto: Notificar Completado de Evaluación
 * 
 * RF 9: El Sistema deberá permitir completar la evaluación.
 * Notificar la generación de resultados automáticos.
 * 
 * Implementa los métodos de notificación de actualizaciones.
 */
class SuscriptorNotificarCompletado implements ISuscriptor
{
    /**
     * Actualiza al suscriptor cuando el notificador cambia de estado
     *
     * @param INotificador $notificador El notificador que disparó la actualización
     * @param mixed $datos Datos adicionales del evento
     * @return void
     */
    public function actualizar(INotificador $notificador, $datos = null): void
    {
        // Verificar que el notificador es del tipo correcto
        $nombreClase = get_class($notificador);
        if (strpos($nombreClase, 'NotificadorEvaluacionCompletada') === false) {
            return; // Este suscriptor solo reacciona a evaluaciones completadas
        }

        Log::info('Evaluación completada - Notificación enviada por suscriptor', [
            'evaluacion_id' => $datos['evaluacion_id'] ?? null,
            'user_id' => $datos['user_id'] ?? null,
            'evaluation_data' => $datos['datos'] ?? []
        ]);

        // Aquí puedes agregar lógica adicional como:
        // - Enviar notificación por email
        // - Enviar notificación push
        // - Registrar en sistema de logs externo
        // - Actualizar métricas de analytics
    }
}

