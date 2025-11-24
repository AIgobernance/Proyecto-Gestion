# ¿Cómo Funciona el Patrón Observer?

## 📋 Flujo General

### 1. Inicialización (Al arrancar la aplicación)

Cuando Laravel inicia, se ejecuta `AppServiceProvider::boot()`:

```php
// app/Providers/AppServiceProvider.php
public function boot(): void
{
    ObserverManager::inicializar();
}
```

Esto crea y registra todos los notificadores y suscriptores:

```
ObserverManager::inicializar()
    ↓
1. Crea 4 suscriptores:
   - SuscriptorInvalidarCache
   - SuscriptorNotificarCompletado
   - SuscriptorActualizarDashboard
   - SuscriptorGenerarPDF
    ↓
2. Crea 4 notificadores:
   - NotificadorCierreSesion
   - NotificadorEvaluacionCompletada
   - NotificadorResultadosGenerados
   - NotificadorHojaRuta
    ↓
3. Suscribe cada suscriptor a sus notificadores:
   - CierreSesion → InvalidarCache
   - EvaluacionCompletada → InvalidarCache + NotificarCompletado
   - ResultadosGenerados → InvalidarCache + ActualizarDashboard
   - HojaRuta → GenerarPDF
```

---

## 🔄 Casos de Uso Específicos

### Caso 1: Usuario Cierra Sesión (RF 4)

**Flujo completo:**

```
1. Usuario hace clic en "Cerrar Sesión"
   ↓
2. Frontend llama a: POST /logout
   ↓
3. LoginController::logout() se ejecuta
   ↓
4. Se obtiene el notificador:
   $notificador = ObserverManager::obtenerNotificador('cierre_sesion');
   ↓
5. Se dispara la notificación:
   $notificador->cerrarSesion($userData);
   ↓
6. NotificadorCierreSesion::cerrarSesion() ejecuta:
   - Guarda $userData internamente
   - Llama a $this->notificar($userData)
   ↓
7. NotificadorBase::notificar() itera sobre suscriptores:
   foreach ($this->suscriptores as $suscriptor) {
       $suscriptor->actualizar($this, $userData);
   }
   ↓
8. SuscriptorInvalidarCache::actualizar() se ejecuta:
   - Extrae $userId de $datos
   - Ejecuta Cache::forget("dashboard_stats_user_{$userId}")
   - Registra en logs
```

**Resultado:** El caché del dashboard se limpia automáticamente cuando el usuario cierra sesión.

---

### Caso 2: Evaluación Completada (RF 9)

**Flujo completo:**

```
1. Usuario completa las 50 preguntas de la evaluación
   ↓
2. Frontend envía: POST /api/evaluation/submit
   ↓
3. EvaluationController::submitEvaluation() se ejecuta
   ↓
4. Se verifica que todas las respuestas estén completas
   ↓
5. Se marca la evaluación como "Completada" en BD
   ↓
6. Se obtiene el notificador:
   $notificador = ObserverManager::obtenerNotificador('evaluacion_completada');
   ↓
7. Se dispara la notificación:
   $notificador->completarEvaluacion($idEvaluacion, $userId, $datos);
   ↓
8. NotificadorEvaluacionCompletada::completarEvaluacion() ejecuta:
   - Guarda datos internamente
   - Llama a $this->notificar($datos)
   ↓
9. NotificadorBase::notificar() notifica a 2 suscriptores:
   
   a) SuscriptorInvalidarCache::actualizar()
      → Limpia caché del dashboard
   
   b) SuscriptorNotificarCompletado::actualizar()
      → Registra en logs que la evaluación se completó
      → (Puede enviar email, notificación push, etc.)
```

**Resultado:** 
- El caché se limpia automáticamente
- Se registra la notificación de completado
- El dashboard mostrará datos actualizados

---

### Caso 3: Resultados Generados por N8N (RF 10)

**Flujo completo:**

```
1. N8N procesa la evaluación y retorna resultados
   ↓
2. EvaluationController::submitEvaluation() recibe respuesta de N8N
   ↓
3. Se guardan resultados en BD (tabla Resultados)
   ↓
4. Se actualiza la evaluación con puntuación y PDF
   ↓
5. Se obtiene el notificador:
   $notificador = ObserverManager::obtenerNotificador('resultados_generados');
   ↓
6. Se dispara la notificación:
   $notificador->generarResultados($idEvaluacion, $userId, $resultados, $pdfPath, $score);
   ↓
7. NotificadorResultadosGenerados::generarResultados() ejecuta:
   - Guarda datos internamente
   - Llama a $this->notificar($datos)
   ↓
8. NotificadorBase::notificar() notifica a 2 suscriptores:
   
   a) SuscriptorInvalidarCache::actualizar()
      → Limpia caché del dashboard
   
   b) SuscriptorActualizarDashboard::actualizar()
      → Limpia caché del dashboard (redundante pero seguro)
      → Registra en logs que hay nuevos resultados
      → (Puede actualizar estadísticas en tiempo real)
```

**Resultado:**
- El caché se limpia automáticamente
- El dashboard se actualiza con los nuevos resultados
- Las estadísticas reflejan la nueva puntuación

---

### Caso 4: Solicitud de Hoja de Ruta (RF 11) - Futuro

**Flujo completo (cuando se implemente):**

```
1. Usuario hace clic en "Descargar Hoja de Ruta"
   ↓
2. Frontend llama a: POST /api/evaluation/{id}/roadmap
   ↓
3. EvaluationController::downloadRoadmap() se ejecuta
   ↓
4. Se obtiene el notificador:
   $notificador = ObserverManager::obtenerNotificador('hoja_ruta');
   ↓
5. Se dispara la notificación:
   $notificador->solicitarHojaRuta($idEvaluacion, $userId, $datos);
   ↓
6. NotificadorHojaRuta::solicitarHojaRuta() ejecuta:
   - Guarda datos internamente
   - Llama a $this->notificar($datos)
   ↓
7. SuscriptorGenerarPDF::actualizar() se ejecuta:
   - Obtiene resultados de la evaluación
   - Genera recomendaciones
   - Crea PDF con librería (DomPDF, TCPDF, etc.)
   - Guarda PDF en storage
   - Retorna ruta del PDF
```

**Resultado:** Se genera automáticamente el PDF de la hoja de ruta personalizada.

---

## 🎯 Ventajas de esta Implementación

### 1. **Desacoplamiento Total**
Los controladores no conocen qué suscriptores existen. Solo disparan notificaciones:

```php
// En LoginController - NO sabe qué suscriptores hay
$notificador->cerrarSesion($userData);
// El notificador se encarga de notificar a todos sus suscriptores
```

### 2. **Extensibilidad Fácil**
Para agregar un nuevo comportamiento, solo creas un suscriptor y lo registras:

```php
// 1. Crear nuevo suscriptor
class SuscriptorEnviarEmail implements ISuscriptor {
    public function actualizar(INotificador $notificador, $datos = null): void {
        // Enviar email
    }
}

// 2. Registrarlo en ObserverManager::inicializar()
self::$suscriptores['enviar_email'] = new SuscriptorEnviarEmail();
self::$notificadores['evaluacion_completada']->suscribir(
    self::$suscriptores['enviar_email']
);
```

**¡Sin modificar ningún controlador!**

### 3. **Reutilización**
Un suscriptor puede suscribirse a múltiples notificadores:

```php
// SuscriptorInvalidarCache se suscribe a 3 notificadores diferentes
self::$notificadores['cierre_sesion']->suscribir($suscriptorCache);
self::$notificadores['evaluacion_completada']->suscribir($suscriptorCache);
self::$notificadores['resultados_generados']->suscribir($suscriptorCache);
```

### 4. **Testabilidad**
Cada componente se puede testear independientemente:

```php
// Test del notificador
$notificador = new NotificadorCierreSesion();
$suscriptor = new SuscriptorInvalidarCache();
$notificador->suscribir($suscriptor);
$notificador->cerrarSesion(['id' => 1]);
// Verificar que el caché se limpió
```

---

## 📊 Diagrama de Relaciones

```
┌─────────────────────────────────────────────────────────┐
│              ObserverManager (Cliente)                  │
│  - Crea notificadores                                   │
│  - Crea suscriptores                                    │
│  - Registra suscripciones                               │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Notificador  │ │ Notificador  │ │ Notificador  │
│CierreSesion  │ │Evaluacion    │ │Resultados    │
│              │ │Completada    │ │Generados     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │                │                │
       │         ┌──────┴──────┐         │
       │         │             │         │
       ▼         ▼             ▼         ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Suscriptor   │ │Suscriptor    │ │Suscriptor    │
│InvalidarCache│ │Notificar     │ │Actualizar    │
│              │ │Completado    │ │Dashboard     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## 🔍 Ejemplo Práctico: Qué Pasa Cuando un Usuario Completa una Evaluación

```
PASO 1: Usuario completa evaluación
   ↓
PASO 2: EvaluationController::submitEvaluation()
   - Guarda respuestas en BD
   - Marca evaluación como "Completada"
   ↓
PASO 3: Dispara notificación
   $notificador->completarEvaluacion(...)
   ↓
PASO 4: Notificador notifica a suscriptores
   ├─ SuscriptorInvalidarCache
   │  └─ Limpia: Cache::forget("dashboard_stats_user_15")
   │
   └─ SuscriptorNotificarCompletado
      └─ Log: "Evaluación completada - Notificación enviada"
   ↓
PASO 5: Usuario ve dashboard actualizado
   - Estadísticas reflejan la nueva evaluación
   - No hay datos en caché obsoletos
```

---

## ✅ Resumen

**El patrón Observer funciona así:**

1. **Al iniciar la app:** Se crean y registran todos los notificadores y suscriptores
2. **Cuando ocurre un evento:** El controlador obtiene el notificador y dispara la acción
3. **El notificador:** Notifica automáticamente a todos sus suscriptores registrados
4. **Los suscriptores:** Reaccionan ejecutando su lógica (limpiar caché, enviar email, etc.)

**Beneficio principal:** Los controladores no necesitan saber qué acciones se ejecutan después. Solo disparan la notificación y el sistema se encarga del resto.

