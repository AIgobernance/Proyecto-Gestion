<?php

namespace App\Observer\Suscriptores;

use App\Observer\ISuscriptor;
use App\Observer\INotificador;
use Illuminate\Support\Facades\Log;

/**
 * Suscriptor Concreto: Generar PDF de Hoja de Ruta
 * 
 * RF 11: El Sistema deberá permitir Descargar la hoja de ruta personalizada.
 * Dispara el evento para iniciar su generación automática.
 * 
 * Implementa los métodos de notificación de actualizaciones.
 */
class SuscriptorGenerarPDF implements ISuscriptor
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
        if (strpos($nombreClase, 'NotificadorHojaRuta') === false) {
            return; // Este suscriptor solo reacciona a solicitudes de hoja de ruta
        }

        $evaluacionId = $datos['evaluacion_id'] ?? null;
        $userId = $datos['user_id'] ?? null;

        Log::info('Generando hoja de ruta personalizada (suscriptor)', [
            'evaluation_id' => $evaluacionId,
            'user_id' => $userId
        ]);

        // Aquí implementarías la lógica para generar el PDF de la hoja de ruta
        // Por ejemplo:
        // 1. Obtener resultados de la evaluación
        // 2. Generar recomendaciones basadas en la puntuación
        // 3. Crear PDF con librería como DomPDF o TCPDF
        // 4. Guardar el PDF en storage
        // 5. Retornar la ruta del PDF

        // Ejemplo de estructura:
        /*
        try {
            $evaluationData = $datos['datos'] ?? [];
            $pdfPath = $this->crearPDFHojaRuta($evaluacionId, $evaluationData);
            
            Log::info('Hoja de ruta generada exitosamente', [
                'evaluation_id' => $evaluacionId,
                'pdf_path' => $pdfPath
            ]);
        } catch (\Exception $e) {
            Log::error('Error al generar hoja de ruta', [
                'evaluation_id' => $evaluacionId,
                'error' => $e->getMessage()
            ]);
        }
        */
    }

    /**
     * Genera el PDF de la hoja de ruta (método de ejemplo)
     *
     * @param int $evaluacionId
     * @param array $evaluationData
     * @return string Ruta del PDF generado
     */
    private function crearPDFHojaRuta(int $evaluacionId, array $evaluationData): string
    {
        // Implementar lógica de generación de PDF aquí
        // Por ahora retornamos un path de ejemplo
        return "roadmaps/evaluation_{$evaluacionId}_roadmap.pdf";
    }
}

