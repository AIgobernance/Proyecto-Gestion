<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\AccountActivationMail;
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

            Mail::to($email)->send(new AccountActivationMail(
                $userData,
                $activationUrl
            ));

            Log::info('Email de activación enviado', [
                'email' => $email,
                'username' => $userData['username'] ?? 'N/A'
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Error al enviar email de activación', [
                'email' => $email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return false;
        }
    }
}

