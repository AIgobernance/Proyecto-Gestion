<?php

return [
    /*
    |--------------------------------------------------------------------------
    | JWT Configuration
    |--------------------------------------------------------------------------
    |
    | Configuración para la generación y validación de tokens JWT
    | para activación de cuentas de usuario.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Secret Key
    |--------------------------------------------------------------------------
    |
    | Clave secreta para firmar los tokens JWT. Debe ser una cadena segura
    | y aleatoria. Se recomienda usar APP_KEY de Laravel o generar una nueva.
    |
    */

    'secret' => env('JWT_SECRET', env('APP_KEY', 'default-secret-key-change-in-production')),

    /*
    |--------------------------------------------------------------------------
    | Algorithm
    |--------------------------------------------------------------------------
    |
    | Algoritmo de encriptación para firmar los tokens.
    | Opciones: HS256, HS384, HS512, RS256, RS384, RS512
    |
    */

    'algorithm' => env('JWT_ALGORITHM', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | Token Expiration
    |--------------------------------------------------------------------------
    |
    | Tiempo de expiración del token en horas.
    | Por defecto: 24 horas
    |
    */

    'expiration_hours' => env('JWT_EXPIRATION_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Activation URL
    |--------------------------------------------------------------------------
    |
    | URL base para la activación de cuentas.
    | El token se agregará como parámetro query.
    |
    */

    'activation_url' => env('JWT_ACTIVATION_URL', env('APP_URL', 'http://localhost') . '/verify-email'),
];

