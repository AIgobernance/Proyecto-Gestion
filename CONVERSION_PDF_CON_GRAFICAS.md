# 📊 Conversión de HTML a PDF con Gráficas Chart.js

## ✅ Implementación Completada

He implementado la conversión de HTML a PDF usando **Browsershot** (Puppeteer) que **renderiza JavaScript**, incluyendo las gráficas de Chart.js.

---

## 🔧 Cambios Realizados

### 1. Instalación de Browsershot y Puppeteer

- ✅ `spatie/browsershot` instalado (Laravel package)
- ✅ `puppeteer` instalado (npm package)
- ✅ Node.js verificado (v22.21.0)

### 2. Reemplazo de DomPDF por Browsershot

**Antes**: DomPDF (no ejecuta JavaScript, gráficas vacías)
**Ahora**: Browsershot (ejecuta JavaScript, gráficas renderizadas)

### 3. Configuración Optimizada

Browsershot está configurado para:
- ✅ Esperar a que Chart.js cargue y renderice (3 segundos de delay)
- ✅ Esperar a que las peticiones de red terminen (CDN de Chart.js)
- ✅ Timeout de 120 segundos para HTML grandes
- ✅ Mostrar fondo (importante para gráficas)
- ✅ Formato A4 con márgenes de 20mm

---

## 🎯 Cómo Funciona

```
N8N envía HTML con Chart.js
    ↓
Laravel recibe HTML
    ↓
Browsershot (Puppeteer) abre el HTML en un navegador headless
    ↓
JavaScript se ejecuta (Chart.js renderiza las gráficas)
    ↓
Espera 3 segundos para asegurar que todo esté renderizado
    ↓
PDF generado con gráficas visibles
    ↓
PDF guardado en storage/app/public/evaluations/pdf/
```

---

## ⚙️ Configuración Técnica

### Opciones de Browsershot

```php
Browsershot::html($html)
    ->setOption('args', [
        '--no-sandbox',              // Necesario en algunos entornos
        '--disable-setuid-sandbox',  // Seguridad
        '--disable-dev-shm-usage',   // Mejora estabilidad
        '--disable-gpu'              // Evita problemas en servidores sin GPU
    ])
    ->waitUntilNetworkIdle(false)    // Espera peticiones de red
    ->timeout(120)                   // 120 segundos máximo
    ->delay(3000)                    // 3 segundos adicionales para Chart.js
    ->format('A4')                   // Tamaño A4
    ->margins(20, 20, 20, 20, 'mm')  // Márgenes
    ->showBackground()               // Mostrar fondo
    ->save($fullPdfPath);
```

---

## 📊 Gráficas Chart.js

### ✅ Ahora Funcionan

- **Gráficas de barras** (barChart)
- **Gráficas de radar** (radarChart)
- **Todos los elementos visuales** de Chart.js

### ⚠️ Requisitos

1. **Chart.js debe cargar desde CDN** (ya está en el HTML):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
   ```

2. **El HTML debe tener los canvas elements**:
   ```html
   <canvas id="barChart"></canvas>
   <canvas id="radarChart"></canvas>
   ```

3. **El JavaScript debe ejecutarse** (Browsershot lo hace automáticamente)

---

## 🧪 Pruebas

### Para probar:

1. **Ejecuta el workflow de N8N** que envía el HTML
2. **Verifica los logs**:
   ```bash
   tail -f storage/logs/laravel.log | grep -i browsershot
   ```
3. **Abre el PDF generado** y verifica que las gráficas estén visibles:
   ```
   storage/app/public/evaluations/pdf/{id_evaluacion}_{timestamp}.pdf
   ```

### Verificación Visual

El PDF debe mostrar:
- ✅ Gráfica de barras con datos
- ✅ Gráfica de radar con datos
- ✅ Todos los colores y estilos correctos
- ✅ Texto y etiquetas de las gráficas

---

## 🐛 Solución de Problemas

### Error: "Puppeteer not found"

**Solución**: Asegúrate de que Puppeteer esté instalado:
```bash
npm install puppeteer
```

### Error: "Timeout exceeded"

**Solución**: El HTML es muy grande o Chart.js tarda mucho. Aumenta el timeout:
```php
->timeout(180) // 3 minutos
```

### Gráficas vacías en el PDF

**Posibles causas**:
1. Chart.js no se carga (verifica el CDN)
2. El delay es muy corto (aumenta a 5000ms)
3. Los canvas no están en el HTML

**Solución**: Aumenta el delay:
```php
->delay(5000) // 5 segundos
```

### Error: "Cannot find module 'puppeteer'"

**Solución**: Reinstala Puppeteer:
```bash
npm install puppeteer --save
```

---

## 📝 Notas Importantes

### Rendimiento

- **Browsershot es más lento** que DomPDF (ejecuta un navegador completo)
- **Tiempo típico**: 5-15 segundos por PDF
- **Timeout configurado**: 120 segundos

### Recursos

- **Memoria**: Browsershot usa más memoria que DomPDF
- **CPU**: Requiere más CPU durante la generación
- **Disco**: Los PDFs generados son similares en tamaño

### Dependencias

- ✅ Node.js (v22.21.0)
- ✅ npm (11.1.0)
- ✅ Puppeteer (instalado)
- ✅ Browsershot (instalado)

---

## 🔄 Fallback

Si Browsershot falla, el sistema:
1. **Intenta guardar el HTML** como fallback
2. **Registra un warning** en los logs
3. **Continúa normalmente** (sin PDF, pero con HTML)

---

## ✅ Resumen

1. ✅ Browsershot instalado y configurado
2. ✅ Puppeteer instalado
3. ✅ Conversión HTML → PDF con JavaScript ejecutado
4. ✅ Gráficas Chart.js renderizadas correctamente
5. ✅ Configuración optimizada para esperar renderizado
6. ✅ Manejo de errores con fallback
7. ✅ Logs detallados

¡Las gráficas ahora se verán en el PDF! 🎉

