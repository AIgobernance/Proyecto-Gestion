<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observer\ObserverManager;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }
        
        ObserverManager::inicializar();
    }
}
