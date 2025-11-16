<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\AdminRegisterController;
use App\Http\Controllers\LoginController;

/*
|---------------------------------------------------------------------------
| Rutas para SPA (React)
|---------------------------------------------------------------------------
| Todas estas rutas devuelven la misma vista 'app', para que el router de
| React (en resources/js/app.jsx) maneje la navegación del lado del cliente.
*/

Route::view('/', 'app');                      // Home

// Rutas API (deben ir antes de las rutas de vista)
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/admin/register', [AdminRegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/auth/check', [LoginController::class, 'check']);

// Públicas
Route::view('/login', 'app');
Route::view('/register', 'app');
Route::view('/admin/login', 'app');
Route::view('/admin/register', 'app');

// Usuario autenticado (user/admin)
Route::view('/dashboard', 'app');
Route::view('/evaluations', 'app');
Route::view('/evaluation/start', 'app');
Route::view('/evaluation/completed', 'app');
Route::get('/evaluation/{id}/completed', fn () => view('app'))->whereNumber('id');
Route::view('/profile', 'app');

// Admin autenticado (solo admin)
Route::view('/admin/dashboard', 'app');
Route::view('/admin/analytics', 'app');
Route::view('/admin/users', 'app');

/*
|---------------------------------------------------------------------------
| Catch-all para refrescos profundos / enlaces directos
|---------------------------------------------------------------------------
| Enviar todo lo que no sea /api/* a la vista 'app' (evita 404 al refrescar).
*/
Route::get('/{any}', fn () => view('app'))
    ->where('any', '^(?!api).*$');