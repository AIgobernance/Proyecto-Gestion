<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Log;

class JwtService
{
    /**
     * Obtiene la clave secreta para JWT desde APP_KEY
     * 
     * @return string Clave secreta decodificada (bytes raw)
     */
    private static function getSecretKey(): string
    {
        $appKey = config('app.key');
        
        Log::info('Obteniendo clave secreta JWT', [
            'app_key_exists' => !empty($appKey),
            'app_key_length' => $appKey ? strlen($appKey) : 0,
            'has_base64_prefix' => $appKey ? str_starts_with($appKey, 'base64:') : false
        ]);
        
        if (empty($appKey)) {
            Log::error('APP_KEY está vacío');
            throw new \Exception('APP_KEY no está configurado');
        }

        // Laravel almacena APP_KEY como "base64:..." donde ... es la clave codificada
        // Para JWT, necesitamos decodificar el base64 para obtener los bytes raw
        if (str_starts_with($appKey, 'base64:')) {
            $decoded = base64_decode(substr($appKey, 7), true);
            if ($decoded === false) {
                Log::error('Error al decodificar APP_KEY desde base64');
                throw new \Exception('Error al decodificar APP_KEY desde base64');
            }
            
            Log::info('APP_KEY decodificado exitosamente', [
                'decoded_length' => strlen($decoded)
            ]);
            
            return $decoded;
        }

        // Si no tiene prefijo base64:, usar directamente
        Log::info('APP_KEY usado directamente (sin prefijo base64:)');
        return $appKey;
    }

    /**
     * Genera un token JWT para activación de cuenta
     *
     * @param int $userId ID del usuario
     * @param string $email Email del usuario
     * @return string Token JWT generado
     */
    public static function generateActivationToken(int $userId, string $email): string
    {
        $secret = self::getSecretKey();
        $algorithm = 'HS256';
        $expirationHours = 24;

        $payload = [
            'user_id' => $userId,
            'email' => $email,
            'type' => 'account_activation',
            'iat' => time(),
            'exp' => time() + ($expirationHours * 3600),
        ];

        try {
            $token = JWT::encode($payload, $secret, $algorithm);
            
            Log::info('Token JWT generado', [
                'user_id' => $userId,
                'email' => $email,
                'expires_at' => date('Y-m-d H:i:s', $payload['exp'])
            ]);

            return $token;
        } catch (\Exception $e) {
            Log::error('Error al generar token JWT', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Valida y decodifica un token JWT
     *
     * @param string $token Token JWT a validar
     * @return array|null Payload decodificado o null si es inválido
     */
    public static function validateToken(string $token): ?array
    {
        Log::info('=== JwtService::validateToken iniciado ===', [
            'token_length' => strlen($token),
            'token_preview' => substr($token, 0, 50) . '...'
        ]);

        try {
            $secret = self::getSecretKey();
            $algorithm = 'HS256';

            Log::info('Clave secreta obtenida para validación', [
                'secret_length' => strlen($secret),
                'algorithm' => $algorithm
            ]);

            $decoded = JWT::decode($token, new Key($secret, $algorithm));
            $payload = (array) $decoded;

            Log::info('Token decodificado exitosamente', [
                'payload_keys' => array_keys($payload),
                'user_id' => $payload['user_id'] ?? 'N/A',
                'email' => $payload['email'] ?? 'N/A',
                'type' => $payload['type'] ?? 'N/A'
            ]);

            // Verificar que sea un token de activación
            if (!isset($payload['type']) || $payload['type'] !== 'account_activation') {
                Log::warning('Token JWT no es de tipo activación', [
                    'token_type' => $payload['type'] ?? 'unknown'
                ]);
                return null;
            }

            return $payload;
        } catch (\Firebase\JWT\ExpiredException $e) {
            Log::warning('Token JWT expirado', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            Log::error('Token JWT con firma inválida', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        } catch (\Exception $e) {
            Log::error('Error al validar token JWT', [
                'error' => $e->getMessage(),
                'class' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
            return null;
        }
    }

    /**
     * Genera la URL de activación con el token
     *
     * @param string $token Token JWT
     * @return string URL completa de activación
     */
    public static function generateActivationUrl(string $token): string
    {
        $baseUrl = config('app.url', 'http://localhost:8000');
        return rtrim($baseUrl, '/') . '/verify-email?token=' . urlencode($token);
    }
}

