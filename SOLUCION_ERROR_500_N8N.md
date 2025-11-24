# Solución: Error 500 al recibir datos de N8N

## Problema

Cuando N8N intenta enviar el HTML y resultados de la evaluación al endpoint `/api/evaluation/n8n-results`, se produce un error **500** con el mensaje:

```
The service was not able to process your request
500 - ""
```

## Causas Identificadas

1. **Problema de memoria al loguear datos grandes**: El código intentaba loguear `$request->all()` que incluye todo el HTML completo (muy grande, con Chart.js embebido). Esto puede causar:
   - Agotamiento de memoria
   - Errores al serializar datos para logs
   - Timeouts

2. **Límites de memoria insuficientes**: El procesamiento del HTML grande (con JavaScript para Chart.js) y la conversión a PDF con Browsershot requiere más memoria.

3. **Límites de tiempo de ejecución**: La conversión a PDF puede tardar más de lo permitido por defecto.

4. **Errores no capturados en la conversión PDF**: Si Browsershot falla, el error podría no estar siendo manejado correctamente.

## Soluciones Implementadas

### 1. Optimización de Logs

**Antes:**
```php
Log::info('Recibiendo petición de N8N', [
    'all_input' => $request->all(),  // ❌ Incluye HTML completo
    'headers' => $request->headers->all(),
]);
```

**Después:**
```php
Log::info('Recibiendo petición de N8N', [
    'has_body' => $request->has('body'),
    'has_html' => $request->has('html'),
    'has_id_evaluacion' => $request->has('id_evaluacion'),
    'content_length' => $request->header('Content-Length'),  // ✅ Solo metadatos
]);
```

### 2. Aumento de Límites de Memoria y Tiempo

Se añadió al inicio del método `receiveN8NResults()`:

```php
// Aumentar límites de memoria para procesar HTML grande
ini_set('memory_limit', '512M');
ini_set('max_execution_time', '300'); // 5 minutos
set_time_limit(120); // 2 minutos
```

### 3. Mejora del Manejo de Errores

- Los logs ahora solo incluyen metadatos del HTML (tamaño, primeros/últimos caracteres), no el contenido completo.
- Se añadieron validaciones adicionales antes de procesar el HTML.
- Los errores ahora incluyen información útil sin saturar los logs.

### 4. Validación Mejorada del HTML

```php
// Validar que el HTML no esté vacío después de trim
$html = trim($html);
if (empty($html)) {
    throw new \Exception('El HTML recibido está vacío después de trim');
}
```

## Configuración Requerida

### PHP.ini (si tienes acceso)

Si usas PHP directamente (no Laravel Sail), asegúrate de que en tu `php.ini`:

```ini
memory_limit = 512M
post_max_size = 100M
upload_max_filesize = 100M
max_execution_time = 300
```

### Laravel Sail

Laravel Sail ya tiene configurado `post_max_size = 100M` y `upload_max_filesize = 100M` en los archivos `php.ini` del runtime.

## Verificación

Para verificar que el problema está resuelto:

1. **Revisa los logs de Laravel** (`storage/logs/laravel.log`):
   - Busca mensajes como "Recibiendo petición de N8N"
   - Verifica que no haya errores de memoria o serialización

2. **Revisa los logs de N8N**:
   - El workflow debería completarse sin error 500
   - Deberías ver una respuesta 200 con el mensaje de éxito

3. **Verifica que se generó el PDF**:
   - El archivo debería estar en `storage/app/public/evaluations/pdf/`
   - El registro en la base de datos debería tener el campo `PDF_Path` actualizado

## Troubleshooting Adicional

### Si el error persiste:

1. **Verifica los logs de Laravel**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verifica que Browsershot/Puppeteer esté instalado correctamente**:
   ```bash
   npm list puppeteer
   # o
   which node
   ```

3. **Verifica los permisos del directorio**:
   ```bash
   chmod -R 755 storage/app/public/evaluations/
   ```

4. **Verifica el tamaño del HTML recibido**:
   - En los logs deberías ver el tamaño del HTML
   - Si es mayor a 50MB, considera comprimirlo antes de enviarlo

### Si Browsershot falla:

El código ahora tiene un fallback que guarda el HTML como backup si falla la conversión a PDF. Revisa los logs para ver si se activó este fallback.

## Notas

- El HTML que llega de N8N incluye Chart.js embebido y puede ser muy grande (varios MB).
- La conversión a PDF con Browsershot requiere recursos considerables de CPU y memoria.
- El proceso completo puede tardar 30-60 segundos dependiendo del tamaño del HTML y la complejidad de las gráficas.

## Contacto

Si el problema persiste después de estas soluciones, proporciona:
1. El log completo de Laravel del momento del error
2. El tamaño del HTML recibido (visible en los logs)
3. La versión de PHP y Laravel que estás usando

