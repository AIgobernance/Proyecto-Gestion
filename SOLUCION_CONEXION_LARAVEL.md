# Solución: "The service refused the connection"

## ❌ Error Actual

"The service refused the connection - perhaps it is offline"

**Causa**: Laravel no está corriendo o no es accesible desde N8N.

---

## ✅ Solución Paso a Paso

### Paso 1: Iniciar Laravel

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
php artisan serve
```

O si quieres especificar el puerto:

```bash
php artisan serve --port=8000
```

Deberías ver:
```
INFO  Server running on [http://127.0.0.1:8000]
```

**⚠️ IMPORTANTE**: Deja esta terminal abierta mientras trabajas con N8N.

---

### Paso 2: Verificar que Laravel Funciona

Abre en tu navegador:
```
http://localhost:8000
```

Deberías ver la página de Laravel o tu aplicación.

---

### Paso 3: Corregir el JSON Body en N8N

Veo que el JSON Body está incompleto. En el nodo HTTP Request:

1. **Specify Body**: Debe estar en `"Using Expression"` (NO "Using JSON")

2. **Body** (campo de expresión): Debe tener esta expresión completa:

```javascript
={{
  JSON.stringify({
    id_evaluacion: parseInt($json[0].id_evaluacion) || parseInt($json.id_evaluacion) || null,
    html: String($json[0].html || $json.html || ''),
    puntuacion: parseFloat($json[0].puntuacion) || parseFloat($json[0].score) || parseFloat($json.puntuacion) || parseFloat($json.score) || null,
    score: parseFloat($json[0].puntuacion) || parseFloat($json[0].score) || parseFloat($json.puntuacion) || parseFloat($json.score) || null,
    recomendaciones: $json[0].recomendaciones || $json.recomendaciones || null
  })
}}
```

**⚠️ NO debe tener**:
- `"n.puntuacion": ||` (esto está mal)
- Campos incompletos

---

### Paso 4: Verificar la URL

La URL debe ser exactamente:
```
http://localhost:8000/api/evaluation/n8n-results
```

**Verifica**:
- ✅ Sin espacios
- ✅ Sin errores de tipeo
- ✅ Puerto correcto (8000)
- ✅ Ruta correcta (`/api/evaluation/n8n-results`)

---

### Paso 5: Probar el Endpoint Directamente

Desde Postman o curl, prueba:

```bash
curl -X POST http://localhost:8000/api/evaluation/n8n-results \
  -H "Content-Type: application/json" \
  -d '{
    "id_evaluacion": 57,
    "html": "<!DOCTYPE html><html><body>Test</body></html>",
    "puntuacion": 0
  }'
```

Si esto funciona, el problema está en N8N. Si no funciona, Laravel tiene un problema.

---

## 🔍 Verificación Final

1. ✅ Laravel está corriendo (`php artisan serve`)
2. ✅ Laravel responde en `http://localhost:8000`
3. ✅ URL en N8N es correcta: `http://localhost:8000/api/evaluation/n8n-results`
4. ✅ JSON Body está completo y correcto
5. ✅ Specify Body está en "Using Expression"
6. ✅ Method es `POST`

---

## 🐛 Si Sigue Fallando

### Verificar Firewall

Windows Firewall puede estar bloqueando conexiones locales. Verifica que no esté bloqueando el puerto 8000.

### Verificar que N8N y Laravel estén en la misma máquina

Si N8N está en otra máquina, usa la IP de la máquina donde está Laravel:
```
http://IP_DE_LA_MAQUINA:8000/api/evaluation/n8n-results
```

### Verificar Logs de Laravel

Revisa los logs para ver si Laravel está recibiendo la petición:

```bash
tail -f storage/logs/laravel.log
```

Si ves logs de "Recibiendo petición de N8N", Laravel está recibiendo pero hay otro problema.

