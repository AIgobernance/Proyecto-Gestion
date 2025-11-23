# 📄 Conversión de HTML a PDF

## ✅ Implementación Completada

He implementado la conversión automática de HTML a PDF cuando N8N envía los resultados.

---

## 🔧 Cambios Realizados

### 1. Instalación de DomPDF

Se instaló la biblioteca `barryvdh/laravel-dompdf` para convertir HTML a PDF:

```bash
composer require barryvdh/laravel-dompdf
```

### 2. Modificación del Controlador

El método `receiveN8NResults` ahora:

1. **Recibe el HTML** de N8N
2. **Convierte HTML a PDF** usando DomPDF
3. **Guarda el PDF** en `storage/app/public/evaluations/pdf/`
4. **Guarda la ruta del PDF** en la base de datos (columna `PDF_Path`)
5. **Maneja errores**: Si falla la conversión, guarda el HTML como fallback

---

## 📁 Estructura de Archivos

### PDF Generado

```
storage/app/public/evaluations/pdf/{id_evaluacion}_{timestamp}.pdf
```

Ejemplo: `evaluations/pdf/57_1703456789.pdf`

### HTML (Fallback)

Si falla la conversión, se guarda en:
```
storage/app/public/evaluations/html/{id_evaluacion}_{timestamp}.html
```

---

## 🔄 Flujo de Conversión

```
N8N envía HTML
    ↓
Laravel recibe HTML
    ↓
DomPDF convierte HTML → PDF
    ↓
PDF guardado en storage/app/public/evaluations/pdf/
    ↓
Ruta del PDF guardada en BD (columna PDF_Path)
    ↓
Respuesta exitosa a N8N
```

---

## ⚙️ Configuración del PDF

El PDF se genera con las siguientes opciones:

- **Formato**: A4
- **Orientación**: Portrait (vertical)
- **Acceso local**: Habilitado (para CSS e imágenes locales)
- **HTML5**: Habilitado
- **Recursos remotos**: Habilitados (CDNs, imágenes externas)

---

## 🛡️ Manejo de Errores

### Si falla la conversión a PDF:

1. **Se intenta guardar el HTML** como fallback
2. **Se guarda la ruta del HTML** en la base de datos
3. **Se registra un warning** en los logs
4. **La respuesta continúa normalmente** (con HTML en lugar de PDF)

### Logs

Los logs incluyen información detallada:
- Inicio de conversión
- Éxito de conversión con tamaño del archivo
- Errores con stack trace
- Fallback a HTML

---

## 📊 Base de Datos

### Columna `PDF_Path`

Se guarda la ruta relativa del PDF:
```
evaluations/pdf/57_1703456789.pdf
```

### Fallback a HTML

Si no se puede generar PDF, se guarda en:
- Columna `HTML` (si existe) o
- Columna `Recomendaciones` (como fallback)

---

## 🧪 Pruebas

### Para probar:

1. **Ejecuta el workflow de N8N** que envía el HTML
2. **Verifica los logs** de Laravel:
   ```bash
   tail -f storage/logs/laravel.log | grep -i pdf
   ```
3. **Verifica que el PDF se haya creado**:
   ```bash
   ls -lh storage/app/public/evaluations/pdf/
   ```
4. **Verifica en la base de datos**:
   ```sql
   SELECT Id_Evaluacion, PDF_Path, Puntuacion 
   FROM Resultados 
   WHERE Id_Evaluacion = 57;
   ```

---

## 📝 Notas Importantes

### Tamaño del HTML

- DomPDF puede manejar HTML grande, pero puede tardar unos segundos
- El tiempo de ejecución se aumentó a **120 segundos** (2 minutos)

### Gráficas Chart.js

- **Chart.js NO se renderiza en PDF** (es JavaScript del lado del cliente)
- Las gráficas aparecerán **vacías** en el PDF
- Si necesitas gráficas en el PDF, considera usar imágenes estáticas o bibliotecas del lado del servidor

### CSS

- Los estilos CSS se incluyen correctamente
- Los `@page` rules para impresión se respetan

---

## 🔄 Opcional: Guardar También HTML

Si quieres guardar **tanto PDF como HTML**, descomenta estas líneas en `receiveN8NResults`:

```php
// Opcional: Guardar HTML como backup
$htmlPath = 'evaluations/html/' . $idEvaluacion . '_' . $timestamp . '.html';
$fullHtmlPath = storage_path('app/public/' . $htmlPath);

$htmlDirectory = dirname($fullHtmlPath);
if (!file_exists($htmlDirectory)) {
    mkdir($htmlDirectory, 0755, true);
}

file_put_contents($fullHtmlPath, $html);
```

---

## ✅ Resumen

1. ✅ DomPDF instalado
2. ✅ Conversión HTML → PDF implementada
3. ✅ PDF guardado en storage
4. ✅ Ruta del PDF guardada en BD
5. ✅ Manejo de errores con fallback a HTML
6. ✅ Logs detallados
7. ✅ Respuesta actualizada con información del PDF

¡Listo para usar! 🎉

