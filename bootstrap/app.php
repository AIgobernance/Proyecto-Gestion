<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Excluir ruta de N8N de verificación CSRF
        $middleware->validateCsrfTokens(except: [
            '/api/evaluation/n8n-results',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, $request) {
            if (!\App\Helpers\DatabaseSetupHelper::isSqlServerDriverError($e)) {
                return null;
            }

            $payload = \App\Helpers\DatabaseSetupHelper::friendlyApiPayload();

            if ($request->expectsJson() || $request->is('api/*') || $request->ajax() || $request->wantsJson()) {
                return response()->json($payload, 503);
            }

            return response(
                '<html><body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:20px">'
                . '<h1>Configuración de base de datos</h1>'
                . '<p>' . htmlspecialchars($payload['errors']['general'][0]) . '</p>'
                . '<pre style="background:#f1f5f9;padding:16px;border-radius:8px;white-space:pre-wrap">'
                . htmlspecialchars($payload['details'])
                . '</pre>'
                . '<p><a href="' . htmlspecialchars($payload['setup_url']) . '">Descargar ODBC Driver</a></p>'
                . '</body></html>',
                503
            );
        });
    })->create();
