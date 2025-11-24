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
    
    /**
     * Timeout corto para envío inicial (solo para confirmar que N8N recibió los datos)
     */
    protected int $timeoutAsync = 10; // 10 segundos solo para confirmar recepción

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
     * Envía una evaluación a N8N de forma asíncrona (sin esperar respuesta completa)
     * N8N procesará en segundo plano y enviará resultados a Laravel cuando termine
     * 
     * Este método es "fire and forget" - no espera respuesta ni lanza excepciones
     * para no bloquear la respuesta al frontend
     *
     * @param array $datos Datos de la evaluación en formato JSON
     * @return void
     */
    public function enviarEvaluacionAsync(array $datos): void
    {
        if (empty($this->webhookUrl)) {
            Log::warning('N8N webhook URL no configurada - no se puede enviar evaluación', [
                'id_evaluacion' => $datos['id_evaluacion'] ?? null
            ]);
            return; // No lanzar excepción, solo loguear
        }

        // Ejecutar en background sin bloquear
        // Usar dispatch o ejecutar en un proceso separado
        try {
            Log::info('Iniciando envío asíncrono de evaluación a N8N', [
                'webhook_url' => $this->webhookUrl,
                'datos_keys' => array_keys($datos),
                'id_evaluacion' => $datos['id_evaluacion'] ?? null
            ]);

            // Ejecutar en un proceso separado o usar dispatch
            // Por ahora, ejecutamos con timeout largo pero sin esperar respuesta
            // Usar timeout de 60 segundos solo para la conexión inicial, no para procesar
            Http::timeout(60) // Timeout más largo para envío de datos grandes
                ->withoutVerifying() // No verificar SSL si es necesario
                ->post($this->webhookUrl, $datos)
                ->throw(); // Solo lanzar error si falla completamente (no por timeout)

            Log::info('Evaluación enviada a N8N exitosamente (procesamiento asíncrono)', [
                'id_evaluacion' => $datos['id_evaluacion'] ?? null,
                'mensaje' => 'N8N procesará en segundo plano'
            ]);

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            // Error de conexión - puede ser temporal, no bloquear
            Log::warning('Error de conexión con N8N (asíncrono) - puede ser temporal', [
                'error' => $e->getMessage(),
                'id_evaluacion' => $datos['id_evaluacion'] ?? null,
                'mensaje' => 'La evaluación se reintentará automáticamente o el usuario puede reintentar manualmente'
            ]);
            // No lanzar excepción - permitir que continúe
        } catch (\Illuminate\Http\Client\RequestException $e) {
            // Error en la petición - puede ser timeout o error del servidor
            // No bloquear si es timeout (puede ser normal si los datos son grandes)
            if (str_contains($e->getMessage(), 'timeout') || str_contains($e->getMessage(), 'Connection timed out')) {
                Log::info('Timeout al enviar a N8N (normal con datos grandes) - N8N puede estar procesando', [
                    'id_evaluacion' => $datos['id_evaluacion'] ?? null,
                    'mensaje' => 'N8N puede haber recibido los datos aunque hubo timeout'
                ]);
            } else {
                Log::warning('Error al enviar evaluación a N8N (asíncrono)', [
                    'error' => $e->getMessage(),
                    'id_evaluacion' => $datos['id_evaluacion'] ?? null,
                    'status' => $e->response?->status()
                ]);
            }
            // No lanzar excepción - permitir que continúe
        } catch (\Exception $e) {
            // Cualquier otro error - loguear pero no bloquear
            Log::error('Error inesperado al enviar evaluación a N8N (asíncrono)', [
                'error' => $e->getMessage(),
                'id_evaluacion' => $datos['id_evaluacion'] ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            // No lanzar excepción - permitir que continúe
        }
    }

    /**
     * Formatea los datos de la evaluación para enviar a N8N
     *
     * @param array $respuestas Respuestas del usuario (pregunta1: "respuesta", pregunta2: "respuesta", ...)
     * @param array $metadatos Metadatos del usuario (nombre, empresa, correo, prompt)
     * @param array $documentos Array de documentos subidos (opcional)
     * @return array Datos formateados para N8N
     */
    public function formatearDatosEvaluacion(array $respuestas, array $metadatos, array $documentos = []): array
    {
        return [
            // Metadatos
            'metadatos' => [
                'nombre_usuario' => $metadatos['nombre'] ?? 'N/A',
                'empresa' => $metadatos['empresa'] ?? 'N/A',
                'correo' => $metadatos['correo'] ?? 'N/A',
                'sector' => $metadatos['sector'] ?? 'N/A',
                'ponderaciones' => $metadatos['ponderaciones'] ?? [],
                'prompt_ia' => $metadatos['prompt'] ?? '',
            ],
            
            // Respuestas en formato {pregunta1: "respuesta", pregunta2: "respuesta", ...}
            'respuestas' => $respuestas,
            
            // Documentos subidos (si existen) - incluyen contenido en base64 para procesamiento
            'documentos' => array_map(function($doc) {
                return [
                    'nombre' => $doc['nombre'] ?? 'documento.pdf',
                    'indice' => $doc['indice'] ?? null,
                    'mime_type' => $doc['mime_type'] ?? 'application/pdf',
                    'contenido_base64' => $doc['contenido_base64'] ?? null, // Contenido del PDF en base64
                    'ruta' => $doc['ruta'] ?? null, // Ruta en el servidor (referencia)
                    'url' => $doc['url'] ?? null, // URL pública (referencia)
                ];
            }, $documentos),
            
            // Información adicional
            'timestamp' => now()->toIso8601String(),
            'version' => '1.0'
        ];
    }
}

