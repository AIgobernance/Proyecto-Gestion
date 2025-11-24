<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\AccountActivationMail;
use App\Mail\TwoFactorCodeMail;
use App\Services\JwtService;

class EmailService
{
    /**
     * Transforma los datos del frontend al formato necesario para el email
     *
     * @param array $frontendData Datos recibidos del frontend
     * @return array Datos transformados para el email
     */
    public static function transformRegistrationData(array $frontendData): array
    {
        return [
            'username' => $frontendData['usuario'] ?? $frontendData['username'] ?? '',
            'email' => $frontendData['correo'] ?? $frontendData['email'] ?? '',
            'registration_date' => now()->format('d/m/Y'),
            'registration_time' => now()->format('H:i:s'),
            'registration_datetime' => now()->format('d/m/Y H:i:s'),
            'company' => $frontendData['empresa'] ?? $frontendData['company'] ?? '',
        ];
    }

    /**
     * Envía el email de activación de cuenta
     *
     * @param string $email Email del destinatario
     * @param array $userData Datos del usuario (ya transformados)
     * @param string $activationToken Token JWT para activación
     * @return bool True si se envió correctamente, false en caso contrario
     */
    public static function sendActivationEmail(string $email, array $userData, string $activationToken): bool
    {
        try {
            $activationUrl = JwtService::generateActivationUrl($activationToken);

            // Logging detallado antes de enviar
            Log::info('Intentando enviar email de activación', [
                'email' => $email,
                'username' => $userData['username'] ?? 'N/A',
                'activation_url' => $activationUrl,
                'mail_driver' => config('mail.default'),
                'mail_host' => config('mail.mailers.smtp.host'),
                'mail_from' => config('mail.from.address'),
                'app_url' => config('app.url'),
                'request_host' => request() ? request()->getHost() : 'N/A',
                'request_scheme' => request() ? request()->getScheme() : 'N/A',
                'is_console' => app()->runningInConsole()
            ]);

            // Validar que la URL no sea localhost antes de enviar
            if (str_contains($activationUrl, 'localhost') || str_contains($activationUrl, '127.0.0.1')) {
                Log::warning('URL de activación contiene localhost - podría ser rechazada por servidores SMTP', [
                    'activation_url' => $activationUrl,
                    'app_url' => config('app.url')
                ]);
            }

            Mail::to($email)->send(new AccountActivationMail(
                $userData,
                $activationUrl
            ));

            Log::info('Email de activación enviado exitosamente', [
                'email' => $email,
                'username' => $userData['username'] ?? 'N/A',
                'activation_url' => $activationUrl
            ]);

            return true;
        } catch (\Illuminate\Mail\MailException $e) {
            Log::error('Error de Mail al enviar email de activación', [
                'email' => $email,
                'error' => $e->getMessage(),
                'previous_error' => $e->getPrevious() ? $e->getPrevious()->getMessage() : null,
                'previous_code' => $e->getPrevious() ? $e->getPrevious()->getCode() : null,
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        } catch (\Exception $e) {
            Log::error('Error al enviar email de activación', [
                'email' => $email,
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }

    /**
     * Envía el código 2FA por email
     *
     * @param string $email Email del destinatario
     * @param string $code Código de 6 dígitos
     * @param string $username Nombre de usuario (opcional)
     * @return bool True si se envió correctamente, false en caso contrario
     */
    public static function sendTwoFactorCode(string $email, string $code, string $username = 'Usuario'): bool
    {
        try {
            Mail::to($email)->send(new TwoFactorCodeMail($code, $username));

            Log::info('Código 2FA enviado por email', [
                'email' => $email,
                'username' => $username
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error al enviar código 2FA por email', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }
}

