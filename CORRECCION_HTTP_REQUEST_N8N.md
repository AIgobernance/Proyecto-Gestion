# Corrección del Nodo HTTP Request en N8N

## ❌ Problemas Detectados

### 1. JSON Inválido en el Body

**Error actual**:
```json
{
  null,  // ← ESTO ES INVÁLIDO
  score: $json.puntuacion || $json.score || null,
  recomendaciones: $json.recomendaciones || null
}
```

**Solución**: El JSON body debe tener TODOS los campos correctamente definidos.

### 2. Error de Conexión

**Error**: "The service refused the connection - perhaps it is offline"

**Causa**: Laravel no está corriendo o la URL es incorrecta.

---

## ✅ Configuración Correcta del Nodo HTTP Request

### Paso 1: Verificar que Laravel esté Corriendo

En tu terminal, ejecuta:
```bash
php artisan serve
```

O si ya está corriendo en otro puerto:
```bash
php artisan serve --port=8000
```

Deberías ver:
```
INFO  Server running on [http://127.0.0.1:8000]
```

### Paso 2: Configurar el Nodo HTTP Request Correctamente

**Parámetros**:

1. **Method**: `POST`

2. **URL**: 
   ```
   http://localhost:8000/api/evaluation/n8n-results
   ```
   O si Laravel está en otro puerto:
   ```
   http://localhost:PUERTO/api/evaluation/n8n-results
   ```

3. **Authentication**: `None`

4. **Send Body**: `Yes` ✅

5. **Body Content Type**: `JSON` ✅

6. **Specify Body**: `Using JSON` ✅

7. **JSON Body** (⚠️ CORRIGE ESTO):

   **❌ INCORRECTO** (lo que tienes ahora):
   ```json
   {
     null,
     score: $json.puntuacion || $json.score || null,
     recomendaciones: $json.recomendaciones || null
   }
   ```

   **✅ CORRECTO** (copia esto):
   ```json
   {
     "id_evaluacion": {{ $json.id_evaluacion || null }},
     "html": {{ JSON.stringify($json.html || '') }},
     "puntuacion": {{ $json.puntuacion || $json.score || null }},
     "score": {{ $json.puntuacion || $json.score || null }},
     "recomendaciones": {{ JSON.stringify($json.recomendaciones || null) }}
   }
   ```

   **O mejor aún, usa la expresión completa** (en el campo "JSON" del editor):
   ```javascript
   ={{
     JSON.stringify({
       id_evaluacion: parseInt($json.id_evaluacion) || null,
       html: String($json.html || ''),
       puntuacion: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
       score: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
       recomendaciones: $json.recomendaciones ? String($json.recomendaciones) : null
     })
   }}
   ```

### Paso 3: Verificar el Preview

Después de configurar el JSON Body, el preview debe mostrar algo como:

```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html>\n<html lang=\"es\">...",
  "puntuacion": 0,
  "score": 0,
  "recomendaciones": null
}
```

**⚠️ NO debe tener** `null` sin clave al inicio.

---

## 🔍 Verificar que Funciona

### 1. Verificar Laravel

Abre en tu navegador:
```
http://localhost:8000
```

Deberías ver la página de Laravel (o tu aplicación).

### 2. Probar el Endpoint Directamente

Desde Postman o curl:

```bash
curl -X POST http://localhost:8000/api/evaluation/n8n-results \
  -H "Content-Type: application/json" \
  -d '{
    "id_evaluacion": 57,
    "html": "<!DOCTYPE html><html><body>Test</body></html>",
    "puntuacion": 85.5
  }'
```

Deberías recibir:
```json
{
  "success": true,
  "message": "Resultados recibidos y guardados exitosamente",
  "data": {
    "id_evaluacion": 57,
    "html_guardado": true,
    "puntuacion": 85.5,
    "html_path": "evaluations/html/57_..."
  }
}
```

### 3. Ejecutar el Nodo en N8N

1. Haz clic en "Execute step" en el nodo HTTP Request
2. Si Laravel está corriendo, deberías ver en el OUTPUT:
   ```json
   {
     "success": true,
     "message": "Resultados recibidos y guardados exitosamente",
     ...
   }
   ```

---

## 🐛 Si Sigue Fallando

### Error: "The service refused the connection"

**Soluciones**:

1. **Verifica que Laravel esté corriendo**:
   ```bash
   php artisan serve
   ```

2. **Verifica el puerto**:
   - Laravel por defecto usa puerto `8000`
   - Si usas otro puerto, actualiza la URL en N8N

3. **Verifica la URL**:
   - Debe ser exactamente: `http://localhost:8000/api/evaluation/n8n-results`
   - Sin espacios, sin errores de tipeo

4. **Verifica que no haya firewall bloqueando**:
   - Windows Firewall puede estar bloqueando conexiones locales

### Error: "422 Unprocessable Entity"

**Causa**: Validación fallando en Laravel.

**Solución**: 
1. Revisa los logs de Laravel: `storage/logs/laravel.log`
2. Verifica que el JSON tenga todos los campos requeridos
3. Verifica que `id_evaluacion` sea un número entero

---

## ✅ Checklist Final

- [ ] Laravel está corriendo (`php artisan serve`)
- [ ] URL correcta en HTTP Request: `http://localhost:8000/api/evaluation/n8n-results`
- [ ] JSON Body tiene TODOS los campos (sin `null` sin clave)
- [ ] Method es `POST`
- [ ] Send Body está activado
- [ ] Body Content Type es `JSON`
- [ ] El preview del JSON se ve correcto

