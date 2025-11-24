# Patrón Observer - Implementación Clásica

## Estructura del Patrón

Esta implementación sigue la definición clásica del patrón Observer según Refactoring Guru.

### 1. Interfaz Suscriptora (Observer)
- `ISuscriptor.php` - Define el contrato con método `actualizar()`

### 2. Interfaz Notificadora (Subject)
- `INotificador.php` - Define métodos para suscribir/desuscribir y notificar

### 3. Clase Base Abstracta
- `NotificadorBase.php` - Implementa la lógica común de suscripción

### 4. Notificadores Concretos
- `Notificadores/NotificadorCierreSesion.php` - RF 4
- `Notificadores/NotificadorEvaluacionCompletada.php` - RF 9
- `Notificadores/NotificadorResultadosGenerados.php` - RF 10
- `Notificadores/NotificadorHojaRuta.php` - RF 11

### 5. Suscriptores Concretos
- `Suscriptores/SuscriptorInvalidarCache.php` - Invalida caché del dashboard
- `Suscriptores/SuscriptorNotificarCompletado.php` - Notifica completado
- `Suscriptores/SuscriptorActualizarDashboard.php` - Actualiza dashboard
- `Suscriptores/SuscriptorGenerarPDF.php` - Genera PDF de hoja de ruta

### 6. Gestor de Observers
- `ObserverManager.php` - Crea y registra todos los suscriptores con notificadores

## Flujo de Ejecución

### RF 4: Cierre de Sesión
```php
// En LoginController
$notificador = ObserverManager::obtenerNotificador('cierre_sesion');
$notificador->cerrarSesion($userData);
    ↓
SuscriptorInvalidarCache::actualizar()
    → Limpia caché del dashboard
```

### RF 9: Evaluación Completada
```php
// En EvaluationController
$notificador = ObserverManager::obtenerNotificador('evaluacion_completada');
$notificador->completarEvaluacion($id, $userId, $datos);
    ↓
├─ SuscriptorInvalidarCache::actualizar()
│  → Limpia caché del dashboard
└─ SuscriptorNotificarCompletado::actualizar()
   → Registra notificación de completado
```

### RF 10: Resultados Generados
```php
// En EvaluationController
$notificador = ObserverManager::obtenerNotificador('resultados_generados');
$notificador->generarResultados($id, $userId, $resultados, $pdfPath, $score);
    ↓
├─ SuscriptorInvalidarCache::actualizar()
│  → Limpia caché del dashboard
└─ SuscriptorActualizarDashboard::actualizar()
   → Actualiza estadísticas del dashboard
```

### RF 11: Solicitud de Hoja de Ruta
```php
// En un controlador futuro
$notificador = ObserverManager::obtenerNotificador('hoja_ruta');
$notificador->solicitarHojaRuta($id, $userId, $datos);
    ↓
SuscriptorGenerarPDF::actualizar()
    → Genera PDF de la hoja de ruta
```

## Ventajas de esta Implementación

1. **Separación de Responsabilidades**: Cada notificador y suscriptor tiene una responsabilidad única
2. **Desacoplamiento**: Los controladores no conocen los suscriptores directamente
3. **Extensibilidad**: Fácil agregar nuevos suscriptores sin modificar código existente
4. **Reutilización**: Los suscriptores pueden suscribirse a múltiples notificadores
5. **Testabilidad**: Fácil testear notificadores y suscriptores de forma independiente

## Uso en el Código

### Obtener un Notificador
```php
use App\Observer\ObserverManager;

$notificador = ObserverManager::obtenerNotificador('evaluacion_completada');
```

### Disparar una Notificación
```php
$notificador->completarEvaluacion($idEvaluacion, $userId, $datos);
```

### Agregar un Nuevo Suscriptor
1. Crear el suscriptor en `app/Observer/Suscriptores/`
2. Implementar `ISuscriptor`
3. Registrar en `ObserverManager::inicializar()`

```php
// En ObserverManager::inicializar()
self::$suscriptores['mi_nuevo_suscriptor'] = new MiNuevoSuscriptor();
self::$notificadores['evaluacion_completada']->suscribir(
    self::$suscriptores['mi_nuevo_suscriptor']
);
```

## Notas Técnicas

- Los notificadores se crean como singletons en `ObserverManager`
- Los suscriptores se crean una sola vez y se reutilizan
- El método `actualizar()` recibe el notificador completo, permitiendo acceso a sus métodos
- Los datos adicionales se pasan como segundo parámetro opcional

