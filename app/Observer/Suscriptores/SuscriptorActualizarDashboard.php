<?php

namespace App\Observer\Suscriptores;

use App\Observer\ISuscriptor;
use App\Observer\INotificador;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Suscriptor Concreto: Actualizar Dashboard con Resultados
 * 
 * RF 10: El Sistema deberá permitir visualizar los resultados de la evaluación.
 * Permite actualizar dashboards cuando se generen nuevos resultados.
 * 
 * Implementa los métodos de notificación de actualizaciones.
 */
class SuscriptorActualizarDashboard implements ISuscriptor
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
        if (strpos($nombreClase, 'NotificadorResultadosGenerados') === false) {
            return; // Este suscriptor solo reacciona a resultados generados
        }

        $userId = $datos['user_id'] ?? null;

        if ($userId) {
            // Invalidar caché del dashboard para forzar actualización
            $cacheKey = "dashboard_stats_user_{$userId}";
            Cache::forget($cacheKey);

            Log::info('Dashboard actualizado por nuevos resultados (suscriptor)', [
                'evaluation_id' => $datos['evaluacion_id'] ?? null,
                'user_id' => $userId,
                'score' => $datos['score'] ?? null,
                'has_pdf' => !empty($datos['pdf_path'])
            ]);

            // Aquí puedes agregar lógica adicional como:
            // - Actualizar estadísticas en tiempo real
            // - Enviar notificación al usuario
            // - Actualizar métricas globales
        }
    }
}

