# Solución: Problemas con Generación de PDF desde HTML de N8N

## Cambios Realizados

Se mejoró el código de generación de PDF en `EvaluationController::receiveN8NResults()` con las siguientes mejoras:

### 1. Validaciones Mejoradas
- ✅ Validación de estructura HTML básica (DOCTYPE, etiquetas HTML)
- ✅ Verificación de permisos de escritura en directorios
- ✅ Validación de que el archivo PDF se creó correctamente
- ✅ Verificación de que el archivo no está vacío (0 bytes)
- ✅ Validación de que el archivo es un PDF válido (debe empezar con `%PDF`)

### 2. Manejo de Errores Mejorado
- ✅ Captura específica de excepciones de Browsershot (`CouldNotTakeBrowsershot`)
- ✅ Logs detallados con información de diagnóstico
- ✅ Fallback automático: guarda HTML si falla la generación del PDF
- ✅ Método helper `guardarHtmlFallback()` para reutilizar código

### 3. Logs Mejorados
- ✅ Logs antes de iniciar la conversión (tamaño HTML, estructura)
- ✅ Logs durante la creación del directorio
- ✅ Logs después de generar el PDF (tamaño, existencia, legibilidad)
- ✅ Logs de errores con posibles causas y soluciones

## Requisitos para Browsershot

Browsershot necesita los siguientes componentes instalados:

### 1. Node.js
```bash
# Verificar instalación
node --version
npm --version
```

### 2. Puppeteer (incluye Chromium)
```bash
# Instalar Puppeteer globalmente
npm install -g puppeteer

# O instalar en el proyecto
npm install puppeteer
```

### 3. Dependencias del Sistema (Linux)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2

# CentOS/RHEL
sudo yum install -y \
    nss \
    atk \
    libdrm \
    libxkbcommon \
    libXcomposite \
    libXdamage \
    libXfixes \
    libXrandr \
    mesa-libgbm \
    alsa-lib
```

### 4. Dependencias del Sistema (Windows)
- Chrome/Chromium debe estar instalado
- Node.js debe estar en el PATH
- Puppeteer debe estar instalado

## Diagnóstico de Problemas

### Paso 1: Revisar los Logs

Revisa los logs de Laravel en `storage/logs/laravel.log`:

```bash
# Ver últimos logs relacionados con PDF
tail -f storage/logs/laravel.log | grep -i "pdf\|browsershot"
```

Busca mensajes como:
- `"Iniciando conversión de HTML a PDF con Browsershot"` - Indica que el proceso inició
- `"PDF generado exitosamente"` - Indica éxito
- `"Error de Browsershot"` - Indica error específico de Browsershot
- `"Fallback: HTML guardado"` - Indica que se guardó HTML en lugar de PDF

### Paso 2: Verificar que el HTML Llega Correctamente

En los logs deberías ver:
```
'tamaño_html' => [número],
'inicio_html' => [primeros 50 caracteres],
'fin_html' => [últimos 50 caracteres],
'tiene_doctype' => true/false,
'tiene_html_tag' => true/false
```

Si `tiene_doctype` o `tiene_html_tag` son `false`, el HTML puede tener problemas de formato.

### Paso 3: Verificar Permisos

```bash
# Verificar permisos del directorio
ls -la storage/app/public/evaluations/

# Si no existe, crearlo
mkdir -p storage/app/public/evaluations/pdf
mkdir -p storage/app/public/evaluations/html

# Dar permisos de escritura
chmod -R 755 storage/app/public/evaluations/
```

### Paso 4: Verificar Instalación de Browsershot

```bash
# Verificar que Puppeteer está instalado
npm list puppeteer

# Si no está instalado
npm install puppeteer

# Verificar que Chrome/Chromium está disponible
# En Linux, Puppeteer lo instala automáticamente
# En Windows, verifica que Chrome esté en el PATH
```

### Paso 5: Probar Browsershot Manualmente

Crea un script de prueba (`test-browsershot.php`):

```php
<?php
require __DIR__.'/vendor/autoload.php';

use Spatie\Browsershot\Browsershot;

$html = '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Test PDF</h1></body></html>';

try {
    Browsershot::html($html)
        ->setOption('args', ['--no-sandbox', '--disable-setuid-sandbox'])
        ->save('test.pdf');
    
    echo "PDF generado exitosamente!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
```

Ejecuta:
```bash
php test-browsershot.php
```

## Errores Comunes y Soluciones

### Error: "The command failed"
**Causa**: Chrome/Chromium no está instalado o no está en el PATH
**Solución**: 
- Instalar Puppeteer: `npm install puppeteer`
- O instalar Chrome manualmente y configurar la ruta en Browsershot

### Error: "Timeout"
**Causa**: El HTML es muy grande o tiene muchos recursos externos
**Solución**: 
- Aumentar el timeout en el código (actualmente 120 segundos)
- Verificar que Chart.js se carga desde CDN correctamente
- Reducir el tamaño del HTML si es posible

### Error: "Permission denied"
**Causa**: Permisos insuficientes en el directorio de destino
**Solución**:
```bash
chmod -R 755 storage/app/public/evaluations/
chown -R www-data:www-data storage/app/public/evaluations/
```

### Error: "File not found" después de generar
**Causa**: El archivo se creó pero no se puede leer
**Solución**: Verificar permisos y que el directorio existe

### El PDF se genera pero está vacío (0 bytes)
**Causa**: Browsershot no pudo renderizar el HTML
**Solución**: 
- Verificar que el HTML es válido
- Verificar que Chart.js se carga correctamente
- Aumentar el delay para que las gráficas se rendericen

## Verificación Post-Implementación

Después de implementar estos cambios:

1. **Revisa los logs** cuando N8N envíe HTML:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Verifica que se crea el PDF**:
   ```bash
   ls -lh storage/app/public/evaluations/pdf/
   ```

3. **Verifica el contenido del PDF**:
   - Debe tener tamaño > 0 bytes
   - Debe empezar con `%PDF` (verificar con `head -c 4 archivo.pdf`)

4. **Si falla, verifica el HTML de fallback**:
   ```bash
   ls -lh storage/app/public/evaluations/html/
   ```

## Configuración Adicional (Opcional)

Si necesitas configurar la ruta de Chrome manualmente, puedes hacerlo en el código:

```php
Browsershot::html($html)
    ->setChromePath('/usr/bin/google-chrome') // O la ruta donde esté Chrome
    ->setOption('args', [...])
    ->save($fullPdfPath);
```

O configurarlo en `.env`:
```
BROWSERSHOT_CHROME_PATH=/usr/bin/google-chrome
```

Y usarlo así:
```php
$chromePath = env('BROWSERSHOT_CHROME_PATH');
$browsershot = Browsershot::html($html);
if ($chromePath) {
    $browsershot->setChromePath($chromePath);
}
$browsershot->setOption('args', [...])->save($fullPdfPath);
```

## Próximos Pasos

1. Revisa los logs cuando N8N envíe el próximo HTML
2. Identifica el error específico en los logs
3. Aplica la solución correspondiente según el error
4. Si el problema persiste, comparte los logs para diagnóstico adicional

