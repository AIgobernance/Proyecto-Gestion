# Guía: Enviar HTML desde N8N a Laravel

Esta guía explica cómo configurar el flujo completo para que N8N envíe el HTML generado de vuelta a tu aplicación Laravel.

## 📋 Resumen del Flujo

```
Laravel → N8N (envía datos de evaluación)
    ↓
N8N procesa con IA → Genera HTML
    ↓
N8N → Laravel (retorna HTML + metadatos)
    ↓
Laravel guarda HTML en archivo y base de datos
```

---

## 🔧 Paso 1: Configurar Nodo "Respond to Webhook" en N8N

### Configuración del Nodo

1. **Abre tu workflow en N8N**
2. **Localiza el nodo "Respond to Webhook"** (debe ser el último nodo)
3. **Configura los siguientes parámetros**:

**Configuración**:
- **Respond With**: `JSON`
- **Response Code**: `200`
- **Response Body** (usa esta expresión):

```javascript
={{ JSON.stringify({ 
  html: $json.html, 
  id_evaluacion: $json.id_evaluacion || null, 
  puntuacion: $json.puntuacion || null, 
  score: $json.puntuacion || null, 
  recomendaciones: $json.recomendaciones || null 
}) }}
```

### Estructura de Respuesta que N8N Enviará

N8N enviará un JSON con esta estructura:

```json
{
  "html": "<!DOCTYPE html>... (HTML completo generado por la IA)",
  "id_evaluacion": 57,
  "puntuacion": 85.5,
  "score": 85.5,
  "recomendaciones": "Recomendaciones generadas..."
}
```

---

## 🔧 Paso 2: Verificar que Laravel Recibe el HTML

### Código Actualizado

El código de Laravel ya está actualizado para:

1. **Recibir el HTML** de N8N
2. **Guardarlo en un archivo** en `storage/app/public/evaluations/html/`
3. **Guardarlo en la base de datos** (tabla `Resultados`, columna `HTML` si existe)

### Ubicación del Código

- **Controller**: `app/Http/Controllers/EvaluationController.php` (líneas 248-277)
- **Repository**: `database/models/ResultadosRepository.php` (líneas 66-68)

---

## 🔧 Paso 3: Verificar Estructura de Base de Datos

### Opción A: Si ya tienes columna HTML

Si tu tabla `Resultados` ya tiene una columna `HTML` o `html`, el código la usará automáticamente.

### Opción B: Si necesitas crear la columna

Ejecuta esta migración SQL en tu base de datos:

```sql
-- Verificar si la columna existe
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Resultados' 
    AND COLUMN_NAME = 'HTML'
)
BEGIN
    ALTER TABLE Resultados
    ADD HTML NVARCHAR(MAX) NULL;
END
```

---

## 🔧 Paso 4: Probar el Flujo Completo

### 1. Ejecutar una Evaluación

1. Completa una evaluación en tu aplicación
2. Envía los datos a N8N
3. N8N procesa y genera el HTML
4. N8N retorna el HTML a Laravel

### 2. Verificar Logs

Revisa los logs de Laravel para confirmar que el HTML se recibió:

```bash
tail -f storage/logs/laravel.log
```

Busca mensajes como:
- `"HTML guardado exitosamente"`
- `"Evaluación procesada exitosamente por N8N"`

### 3. Verificar Archivo HTML

El HTML se guarda en:
```
storage/app/public/evaluations/html/{id_evaluacion}_{timestamp}.html
```

Puedes acceder a él vía URL:
```
http://tu-dominio.com/storage/evaluations/html/{id_evaluacion}_{timestamp}.html
```

---

## 🔧 Paso 5: Acceder al HTML desde tu Aplicación

### Crear Endpoint para Obtener HTML

Puedes crear un endpoint en Laravel para obtener el HTML:

**En `routes/api.php`**:
```php
Route::get('/evaluation/{id}/html', [EvaluationController::class, 'getHtml']);
```

**En `EvaluationController.php`**:
```php
public function getHtml(int $idEvaluacion)
{
    $userId = auth()->id();
    
    // Verificar que la evaluación pertenece al usuario
    $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
    if (!$evaluacion || $evaluacion['Id_Usuario'] != $userId) {
        return response()->json(['error' => 'No autorizado'], 403);
    }
    
    // Obtener HTML de la base de datos
    $resultado = $this->resultadosRepository->obtenerPorEvaluacion($idEvaluacion);
    
    if ($resultado && isset($resultado['HTML'])) {
        return response($resultado['HTML'], 200)
            ->header('Content-Type', 'text/html');
    }
    
    return response()->json(['error' => 'HTML no encontrado'], 404);
}
```

---

## 🔧 Paso 6: Usar el HTML en el Frontend

### Opción A: Mostrar HTML Directamente

```jsx
// En tu componente React
const [html, setHtml] = useState('');

useEffect(() => {
  fetch(`/api/evaluation/${idEvaluacion}/html`)
    .then(res => res.text())
    .then(html => setHtml(html));
}, [idEvaluacion]);

return (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);
```

### Opción B: Descargar como PDF

Laravel puede convertir el HTML a PDF usando una librería como `dompdf` o `wkhtmltopdf`.

---

## ⚠️ Consideraciones Importantes

### 1. Tamaño del HTML

- El HTML generado puede ser grande (varios MB)
- Asegúrate de que tu servidor pueda manejar archivos grandes
- Considera comprimir el HTML si es necesario

### 2. Timeout

- El procesamiento en N8N puede tardar varios minutos
- Asegúrate de que el timeout en Laravel sea suficiente (actualmente 120 segundos)
- Considera hacer el proceso asíncrono con colas

### 3. Seguridad

- Valida que el HTML recibido sea seguro
- Considera sanitizar el HTML antes de guardarlo
- Verifica que solo el usuario propietario pueda acceder a su HTML

---

## 🐛 Troubleshooting

### Problema: HTML no se recibe en Laravel

**Solución**:
1. Verifica que el nodo "Respond to Webhook" esté configurado correctamente
2. Revisa los logs de N8N para ver qué está enviando
3. Verifica que la URL del webhook sea correcta

### Problema: HTML se recibe pero no se guarda

**Solución**:
1. Verifica que el directorio `storage/app/public/evaluations/html/` exista
2. Verifica permisos de escritura en el directorio
3. Revisa los logs de Laravel para ver errores específicos

### Problema: HTML está vacío o incompleto

**Solución**:
1. Verifica que el nodo Function que procesa el HTML esté funcionando correctamente
2. Revisa que el HTML generado por la IA sea completo
3. Verifica que no haya errores en el procesamiento de Chart.js

---

## ✅ Checklist de Configuración

- [ ] Nodo "Respond to Webhook" configurado en N8N
- [ ] Response Body incluye el campo `html`
- [ ] Código de Laravel actualizado (EvaluationController y ResultadosRepository)
- [ ] Columna `HTML` existe en la tabla `Resultados` (o se creará automáticamente)
- [ ] Directorio `storage/app/public/evaluations/html/` existe y tiene permisos
- [ ] Probar flujo completo con una evaluación
- [ ] Verificar que el HTML se guarda correctamente
- [ ] Crear endpoint para acceder al HTML (opcional)

---

## 📚 Referencias

- [N8N Webhook Documentation](https://docs.n8n.io/workflows/webhooks/)
- [Laravel HTTP Client](https://laravel.com/docs/http-client)
- [Laravel File Storage](https://laravel.com/docs/filesystem)

