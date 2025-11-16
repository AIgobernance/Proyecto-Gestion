<?php

namespace App\Observer\Suscriptores;

use App\Observer\ISuscriptor;
use App\Observer\INotificador;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Suscriptor Concreto: Invalidar Caché del Dashboard
 * 
 * Implementa los métodos de notificación de actualizaciones.
 * La mayoría de las suscriptoras necesitan cierta información de contexto sobre el evento,
 * que puede pasarse como argumento del método de notificación.
 * 
 * Reacciona a:
 * - NotificadorCierreSesion
 * - NotificadorEvaluacionCompletada
 * - NotificadorResultadosGenerados
 */
class SuscriptorInvalidarCache implements ISuscriptor
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
        $userId = null;

        // Extraer userId según el tipo de notificador
        // El notificador se pasa a sí mismo a través del método de actualización
        $nombreClase = get_class($notificador);

        if (strpos($nombreClase, 'NotificadorCierreSesion') !== false) {
            // Para cierre de sesión, los datos son el array del usuario
            $userId = $datos['id'] ?? null;
        } elseif (strpos($nombreClase, 'NotificadorEvaluacionCompletada') !== false) {
            // Para evaluación completada, los datos contienen user_id
            $userId = $datos['user_id'] ?? null;
        } elseif (strpos($nombreClase, 'NotificadorResultadosGenerados') !== false) {
            // Para resultados generados, los datos contienen user_id
            $userId = $datos['user_id'] ?? null;
        }

        if ($userId) {
            $cacheKey = "dashboard_stats_user_{$userId}";
            Cache::forget($cacheKey);
            
            Log::info('Caché del dashboard invalidado por suscriptor', [
                'user_id' => $userId,
                'notificador' => $nombreClase
            ]);
        }
    }
}

