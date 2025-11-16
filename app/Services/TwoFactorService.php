<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class TwoFactorService
{
    /**
     * Genera un código aleatorio de 6 dígitos
     *
     * @return string Código de 6 dígitos
     */
    public static function generateCode(): string
    {
        // Generar código de 6 dígitos (000000 a 999999)
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        Log::info('Código 2FA generado', [
            'code_length' => strlen($code)
        ]);
        
        return $code;
    }

    /**
     * Guarda el código 2FA en caché asociado al usuario
     *
     * @param int $userId ID del usuario
     * @param string $code Código generado
     * @param int $expirationMinutes Tiempo de expiración en minutos (default: 10)
     * @return void
     */
    public static function storeCode(int $userId, string $code, int $expirationMinutes = 10): void
    {
        $cacheKey = "2fa_code_{$userId}";
        
        Cache::put($cacheKey, $code, now()->addMinutes($expirationMinutes));
        
        Log::info('Código 2FA guardado en caché', [
            'user_id' => $userId,
            'expires_in_minutes' => $expirationMinutes
        ]);
    }

    /**
     * Verifica si el código ingresado es correcto
     *
     * @param int $userId ID del usuario
     * @param string $inputCode Código ingresado por el usuario
     * @return bool True si el código es válido, false en caso contrario
     */
    public static function verifyCode(int $userId, string $inputCode): bool
    {
        $cacheKey = "2fa_code_{$userId}";
        $storedCode = Cache::get($cacheKey);
        
        if (!$storedCode) {
            Log::warning('Código 2FA no encontrado o expirado', [
                'user_id' => $userId
            ]);
            return false;
        }
        
        // Comparar códigos (case-insensitive y sin espacios)
        $isValid = trim(strtolower($inputCode)) === trim(strtolower($storedCode));
        
        if ($isValid) {
            // Eliminar el código después de verificación exitosa
            Cache::forget($cacheKey);
            Log::info('Código 2FA verificado exitosamente', [
                'user_id' => $userId
            ]);
        } else {
            Log::warning('Código 2FA incorrecto', [
                'user_id' => $userId,
                'input_code_length' => strlen($inputCode)
            ]);
        }
        
        return $isValid;
    }

    /**
     * Elimina el código 2FA del caché (útil para limpiar después de uso)
     *
     * @param int $userId ID del usuario
     * @return void
     */
    public static function clearCode(int $userId): void
    {
        $cacheKey = "2fa_code_{$userId}";
        Cache::forget($cacheKey);
        
        Log::info('Código 2FA eliminado del caché', [
            'user_id' => $userId
        ]);
    }

    /**
     * Verifica si existe un código pendiente para el usuario
     *
     * @param int $userId ID del usuario
     * @return bool True si hay un código pendiente, false en caso contrario
     */
    public static function hasPendingCode(int $userId): bool
    {
        $cacheKey = "2fa_code_{$userId}";
        return Cache::has($cacheKey);
    }
}

