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
        //
    })->create();
