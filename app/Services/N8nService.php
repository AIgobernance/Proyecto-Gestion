<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class N8nService
{
    /**
     * URL del webhook de N8N
     * Se puede configurar en .env como N8N_WEBHOOK_URL
     */
    protected string $webhookUrl;

    /**
     * Timeout para las peticiones HTTP (en segundos)
     */
    protected int $timeout = 120; // 2 minutos para procesamiento de IA

    public function __construct()
    {
        $this->webhookUrl = config('services.n8n.webhook_url', env('N8N_WEBHOOK_URL', ''));
        
        if (empty($this->webhookUrl)) {
            Log::warning('N8N webhook URL no configurada. Usa N8N_WEBHOOK_URL en .env');
        }
    }

    /**
     * Envía una evaluación a N8N para procesamiento con IA
     *
     * @param array $datos Datos de la evaluación en formato JSON
     * @return array Respuesta de N8N
     * @throws \Exception
     */
    public function enviarEvaluacion(array $datos): array
    {
        if (empty($this->webhookUrl)) {
            throw new \Exception('URL de webhook de N8N no configurada');
        }

        try {
            Log::info('Enviando evaluación a N8N', [
                'webhook_url' => $this->webhookUrl,
                'datos_keys' => array_keys($datos)
            ]);

            $response = Http::timeout($this->timeout)
                ->post($this->webhookUrl, $datos);

            if ($response->successful()) {
                $responseData = $response->json();
                
                Log::info('Respuesta exitosa de N8N', [
                    'status' => $response->status(),
                    'response_keys' => is_array($responseData) ? array_keys($responseData) : 'no-array'
                ]);

                return [
                    'success' => true,
                    'data' => $responseData,
                    'status' => $response->status()
                ];
            } else {
                $errorMessage = $response->body();
                
                Log::error('Error en respuesta de N8N', [
                    'status' => $response->status(),
                    'error' => $errorMessage
                ]);

                throw new \Exception("Error al procesar evaluación en N8N: {$errorMessage}", $response->status());
            }

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('Error de conexión con N8N', [
                'error' => $e->getMessage()
            ]);
            throw new \Exception('No se pudo conectar con el servicio N8N. Verifica la URL del webhook.', 0, $e);
        } catch (\Exception $e) {
            Log::error('Error al enviar evaluación a N8N', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Formatea los datos de la evaluación para enviar a N8N
     *
     * @param array $respuestas Respuestas del usuario (pregunta1: "respuesta", pregunta2: "respuesta", ...)
     * @param array $metadatos Metadatos del usuario (nombre, empresa, correo, prompt)
     * @return array Datos formateados para N8N
     */
    public function formatearDatosEvaluacion(array $respuestas, array $metadatos): array
    {
        return [
            // Metadatos
            'metadatos' => [
                'nombre_usuario' => $metadatos['nombre'] ?? 'N/A',
                'empresa' => $metadatos['empresa'] ?? 'N/A',
                'correo' => $metadatos['correo'] ?? 'N/A',
                'prompt_ia' => $metadatos['prompt'] ?? '',
            ],
            
            // Respuestas en formato {pregunta1: "respuesta", pregunta2: "respuesta", ...}
            'respuestas' => $respuestas,
            
            // Información adicional
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0'
        ];
    }
}

