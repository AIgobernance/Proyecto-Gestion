<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\AdminRegisterController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CsrfController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;

/*
|---------------------------------------------------------------------------
| Rutas para SPA (React)
|---------------------------------------------------------------------------
| Todas estas rutas devuelven la misma vista 'app', para que el router de
| React (en resources/js/app.jsx) maneje la navegación del lado del cliente.
*/

Route::view('/', 'app');                      // Home

// Rutas API (deben ir antes de las rutas de vista)
Route::get('/csrf-token', [CsrfController::class, 'getToken']);
Route::post('/register', [RegisterController::class, 'register']);
Route::post('/admin/register', [AdminRegisterController::class, 'register']);
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/auth/check', [LoginController::class, 'check']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);

// Rutas de perfil de usuario
Route::middleware(['web'])->group(function () {
    Route::get('/profile/data', [ProfileController::class, 'getProfile']);
    Route::put('/profile/update', [ProfileController::class, 'updateProfile']);
    Route::post('/profile/upload-photo', [ProfileController::class, 'uploadProfilePhoto']);
});

// Rutas de dashboard
Route::middleware(['web'])->group(function () {
    Route::get('/api/dashboard/stats', [DashboardController::class, 'getStats']);
});

// Rutas de administración de usuarios (requieren autenticación admin)
Route::middleware(['web'])->group(function () {
    Route::get('/admin/users/list', [UserManagementController::class, 'index']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::put('/admin/users/{id}/toggle-status', [UserManagementController::class, 'toggleStatus']);
    Route::post('/admin/users/reset-password', [UserManagementController::class, 'resetPassword']);
    Route::post('/admin/users/{id}/upload-photo', [UserManagementController::class, 'uploadProfilePhoto']);
});

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