<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SessionHelper
{
    /**
     * Obtiene el ID del usuario desde la sesión de forma optimizada
     * Si no está disponible, intenta obtenerlo por correo y actualiza la sesión
     *
     * @param Request $request
     * @return int|null
     */
    public static function getUserId(Request $request): ?int
    {
        $userData = $request->session()->get('user');
        
        if (!$userData) {
            return null;
        }

        // Intentar obtener el ID directamente
        $userId = $userData['id'] ?? $userData['Id'] ?? null;

        if ($userId) {
            return (int) $userId;
        }

        // Si no hay ID, intentar obtener por correo (solo una vez)
        $correo = $userData['correo'] ?? $userData['Correo'] ?? null;
        if ($correo) {
            try {
                $usuario = DB::table('usuario')
                    ->select('Id')
                    ->where('Correo', $correo)
                    ->first();
                
                if ($usuario && $usuario->Id) {
                    $userId = (int) $usuario->Id;
                    // Actualizar la sesión con el ID para evitar futuras queries
                    $userData['id'] = $userId;
                    $request->session()->put('user', $userData);
                    $request->session()->save();
                    
                    return $userId;
                }
            } catch (\Exception $e) {
                Log::warning('Error al obtener userId por correo', [
                    'correo' => $correo,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return null;
    }
}

