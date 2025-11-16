<?php

namespace App\Observer;

use App\Observer\Notificadores\NotificadorCierreSesion;
use App\Observer\Notificadores\NotificadorEvaluacionCompletada;
use App\Observer\Notificadores\NotificadorResultadosGenerados;
use App\Observer\Notificadores\NotificadorHojaRuta;
use App\Observer\Suscriptores\SuscriptorInvalidarCache;
use App\Observer\Suscriptores\SuscriptorNotificarCompletado;
use App\Observer\Suscriptores\SuscriptorActualizarDashboard;
use App\Observer\Suscriptores\SuscriptorGenerarPDF;

/**
 * Gestor de Observers
 * 
 * El cliente debe crear todos los suscriptores necesarios y registrarlos
 * con los notificadores adecuados.
 * 
 * Esta clase centraliza la configuración de las relaciones Observer.
 */
class ObserverManager
{
    /**
     * Instancias de notificadores (singleton)
     *
     * @var array
     */
    private static array $notificadores = [];

    /**
     * Instancias de suscriptores (singleton)
     *
     * @var array
     */
    private static array $suscriptores = [];

    /**
     * Inicializa y configura todos los observadores
     * 
     * @return void
     */
    public static function inicializar(): void
    {
        // Crear suscriptores (una sola instancia de cada uno)
        self::$suscriptores['invalidar_cache'] = new SuscriptorInvalidarCache();
        self::$suscriptores['notificar_completado'] = new SuscriptorNotificarCompletado();
        self::$suscriptores['actualizar_dashboard'] = new SuscriptorActualizarDashboard();
        self::$suscriptores['generar_pdf'] = new SuscriptorGenerarPDF();

        // Crear notificadores
        self::$notificadores['cierre_sesion'] = new NotificadorCierreSesion();
        self::$notificadores['evaluacion_completada'] = new NotificadorEvaluacionCompletada();
        self::$notificadores['resultados_generados'] = new NotificadorResultadosGenerados();
        self::$notificadores['hoja_ruta'] = new NotificadorHojaRuta();

        // RF 4: Cierre de sesión
        self::$notificadores['cierre_sesion']->suscribir(self::$suscriptores['invalidar_cache']);

        // RF 9: Evaluación completada
        self::$notificadores['evaluacion_completada']->suscribir(self::$suscriptores['invalidar_cache']);
        self::$notificadores['evaluacion_completada']->suscribir(self::$suscriptores['notificar_completado']);

        // RF 10: Resultados generados
        self::$notificadores['resultados_generados']->suscribir(self::$suscriptores['invalidar_cache']);
        self::$notificadores['resultados_generados']->suscribir(self::$suscriptores['actualizar_dashboard']);

        // RF 11: Hoja de ruta
        self::$notificadores['hoja_ruta']->suscribir(self::$suscriptores['generar_pdf']);
    }

    /**
     * Obtiene un notificador por su clave
     *
     * @param string $clave Clave del notificador (cierre_sesion, evaluacion_completada, etc.)
     * @return INotificador|null
     */
    public static function obtenerNotificador(string $clave): ?INotificador
    {
        // Asegurar que esté inicializado
        if (empty(self::$notificadores)) {
            self::inicializar();
        }

        return self::$notificadores[$clave] ?? null;
    }

    /**
     * Obtiene todos los notificadores
     *
     * @return array
     */
    public static function obtenerNotificadores(): array
    {
        // Asegurar que esté inicializado
        if (empty(self::$notificadores)) {
            self::inicializar();
        }

        return self::$notificadores;
    }
}

