<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Twilio\Rest\Client;
use Twilio\Exceptions\TwilioException;
use Twilio\Http\CurlClient;

class SmsService
{
    protected $twilioClient;
    protected $twilioPhoneNumber;

    /**
     * Verifica si Twilio está configurado correctamente
     *
     * @return bool True si está configurado, false en caso contrario
     */
    public function isConfigured(): bool
    {
        return $this->twilioClient !== null;
    }

    public function __construct()
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $this->twilioPhoneNumber = config('services.twilio.phone_number');

        if ($accountSid && $authToken && $this->twilioPhoneNumber) {
            try {
                // Configurar el cliente HTTP con verificación SSL deshabilitada para desarrollo local (Windows)
                // En producción, usar certificados SSL válidos
                $httpClient = new CurlClient([
                    CURLOPT_SSL_VERIFYPEER => false, // Deshabilitar verificación SSL para desarrollo
                    CURLOPT_SSL_VERIFYHOST => false, // Deshabilitar verificación del host SSL
                    CURLOPT_TIMEOUT => 30,
                    CURLOPT_CONNECTTIMEOUT => 10,
                ]);
                
                $this->twilioClient = new Client($accountSid, $authToken, null, null, $httpClient);
                
                Log::info('Cliente Twilio inicializado correctamente', [
                    'phone_number' => $this->twilioPhoneNumber
                ]);
            } catch (\Exception $e) {
                Log::error('Error al inicializar cliente Twilio', [
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                    'trace' => $e->getTraceAsString()
                ]);
                $this->twilioClient = null;
            }
        } else {
            $this->twilioClient = null;
            $missing = [];
            if (!$accountSid) $missing[] = 'TWILIO_ACCOUNT_SID';
            if (!$authToken) $missing[] = 'TWILIO_AUTH_TOKEN';
            if (!$this->twilioPhoneNumber) $missing[] = 'TWILIO_PHONE_NUMBER';
            Log::warning('Credenciales de Twilio no configuradas', [
                'missing' => $missing
            ]);
        }
    }

    /**
     * Genera un código de verificación de 6 dígitos
     *
     * @return string Código de 6 dígitos
     */
    public function generateVerificationCode(): string
    {
        return str_pad((string) rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Envía un código de verificación SMS usando Twilio
     *
     * @param string $phoneNumber Número de teléfono destinatario (formato E.164: +1234567890)
     * @param string $code Código de verificación de 6 dígitos
     * @return array Resultado de la operación ['success' => bool, 'message' => string, 'message_sid' => string|null]
     */
    public function sendVerificationCode(string $phoneNumber, string $code): array
    {
        if (!$this->twilioClient) {
            Log::warning('Intento de enviar SMS sin cliente Twilio configurado');
            return [
                'success' => false,
                'message' => 'Servicio SMS no disponible',
                'message_sid' => null
            ];
        }

        try {
            // Formatear el número de teléfono si no está en formato E.164
            $formattedPhone = $this->formatPhoneNumber($phoneNumber);

            // Mensaje a enviar
            $message = "Tu código de verificación es: {$code}. Válido por 10 minutos.";

            // Enviar SMS usando Twilio
            $twilioMessage = $this->twilioClient->messages->create(
                $formattedPhone, // Número destino
                [
                    'from' => $this->twilioPhoneNumber, // Número de Twilio
                    'body' => $message
                ]
            );

            Log::info('SMS enviado exitosamente via Twilio', [
                'phone_number' => $formattedPhone,
                'message_sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status
            ]);

            return [
                'success' => true,
                'message' => 'Código enviado exitosamente',
                'message_sid' => $twilioMessage->sid,
                'status' => $twilioMessage->status
            ];

        } catch (TwilioException $e) {
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();
            
            // Manejo especial para números no verificados en cuentas de prueba
            if ($errorCode == 21608 || str_contains($errorMessage, 'unverified')) {
                $userMessage = 'Tu número de teléfono no está verificado en Twilio. Las cuentas de prueba solo pueden enviar SMS a números verificados. Por favor, usa el método de email para recibir el código.';
            } else {
                $userMessage = 'Error al enviar SMS. Por favor, intenta usar el método de email.';
            }
            
            Log::error('Error de Twilio al enviar SMS', [
                'error' => $errorMessage,
                'code' => $errorCode,
                'phone_number' => $phoneNumber ?? 'N/A'
            ]);

            return [
                'success' => false,
                'message' => $userMessage,
                'message_sid' => null,
                'error_code' => $errorCode
            ];

        } catch (\Exception $e) {
            Log::error('Error inesperado al enviar SMS', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => 'Error inesperado al enviar SMS',
                'message_sid' => null
            ];
        }
    }

    /**
     * Formatea el número de teléfono al formato E.164 de Twilio
     * Ejemplo: +573001234567 o +1234567890
     * 
     * Twilio requiere formato E.164: +[código país][número sin 0 inicial]
     *
     * @param string $phoneNumber Número de teléfono en cualquier formato
     * @return string Número formateado en E.164
     */
    protected function formatPhoneNumber(string $phoneNumber): string
    {
        // Eliminar todos los caracteres que no sean dígitos o +
        $phoneNumber = preg_replace('/[^0-9+]/', '', trim($phoneNumber));

        // Si ya está en formato E.164 (empieza con +), devolverlo tal cual
        if (str_starts_with($phoneNumber, '+')) {
            return $phoneNumber;
        }

        // Si no tiene +, formatear según diferentes casos
        // Caso 1: Ya tiene código de país (empieza con 57 para Colombia, 1 para USA, etc.)
        if (str_starts_with($phoneNumber, '57')) {
            // Número colombiano con código de país
            return '+' . $phoneNumber;
        } elseif (preg_match('/^1\d{10}$/', $phoneNumber)) {
            // Número de USA/Canadá (código 1 seguido de 10 dígitos)
            return '+' . $phoneNumber;
        } elseif (str_starts_with($phoneNumber, '0')) {
            // Si empieza con 0, asumir número colombiano y reemplazar 0 con +57
            return '+57' . substr($phoneNumber, 1);
        } else {
            // Por defecto, asumir número colombiano y agregar +57
            // Esto funciona para números como: 3001234567, 3054295316, etc.
            return '+57' . $phoneNumber;
        }
    }
}

