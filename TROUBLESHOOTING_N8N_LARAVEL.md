# Troubleshooting: Errores al Enviar HTML desde N8N a Laravel

## 🔍 Ver Logs de Laravel

Para ver los logs en tiempo real:

```bash
tail -f storage/logs/laravel.log
```

O en Windows PowerShell:
```powershell
Get-Content storage/logs/laravel.log -Wait -Tail 50
```

## ❌ Errores Comunes

### Error 1: "Datos inválidos" (422)

**Causa**: La validación de Laravel está fallando.

**Solución**:

1. **Verifica que el JSON enviado desde N8N tenga esta estructura**:
```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html>...",
  "puntuacion": 85.5
}
```

2. **Verifica los logs de Laravel** para ver exactamente qué está llegando:
```
[timestamp] local.INFO: Recibiendo petición de N8N {"all_input":{...}}
```

3. **Problemas comunes**:
   - `id_evaluacion` no es un número entero → Asegúrate de convertirlo: `parseInt($json.id_evaluacion)`
   - `html` está vacío o es `null` → Verifica que `$json.html` tenga contenido
   - `html` no es un string → Convierte a string: `String($json.html)`

### Error 2: "Evaluación no encontrada" (404)

**Causa**: El `id_evaluacion` no existe en la base de datos.

**Solución**:
1. Verifica que el `id_evaluacion` sea correcto
2. Verifica que la evaluación exista en la base de datos
3. Asegúrate de que N8N esté enviando el `id_evaluacion` correcto desde el webhook inicial

### Error 3: "Se requiere al menos HTML o puntuación" (422)

**Causa**: N8N está enviando datos sin HTML ni puntuación.

**Solución**:
1. Verifica que el nodo anterior a HTTP Request esté generando el HTML
2. Verifica que `$json.html` no esté vacío en N8N
3. Revisa el OUTPUT del nodo anterior para ver qué datos tiene

### Error 4: Timeout

**Causa**: El proceso está tardando más de lo configurado.

**Solución**:
1. Aumenta el timeout en el nodo HTTP Request de N8N (60-120 segundos)
2. Verifica que Laravel esté respondiendo rápidamente
3. Considera hacer el proceso asíncrono

## 🔧 Verificar Configuración en N8N

### Verificar JSON Body del HTTP Request

El JSON Body debe ser exactamente así:

```javascript
={{
  JSON.stringify({
    id_evaluacion: parseInt($json.id_evaluacion) || null,
    html: String($json.html || ''),
    puntuacion: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
    score: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
    recomendaciones: String($json.recomendaciones || '')
  })
}}
```

### Verificar OUTPUT del Nodo Anterior

Antes del nodo HTTP Request, agrega un nodo temporal para ver qué datos tienes:

1. **Nodo: Code** (temporal, para debugging)
```javascript
// Ver qué datos tenemos
console.log('Datos disponibles:', JSON.stringify($json, null, 2));

return {
  json: {
    id_evaluacion: $json.id_evaluacion,
    tiene_html: !!$json.html,
    longitud_html: ($json.html || '').length,
    puntuacion: $json.puntuacion,
    tipo_id_evaluacion: typeof $json.id_evaluacion,
    tipo_html: typeof $json.html
  }
};
```

2. **Ejecuta el workflow** y revisa el OUTPUT de este nodo

### Verificar URL del Endpoint

La URL debe ser:
```
http://localhost:8000/api/evaluation/n8n-results
```

O si usas variable de entorno:
```
={{ $env.LARAVEL_API_URL }}/api/evaluation/n8n-results
```

**Asegúrate de**:
- ✅ Que Laravel esté corriendo
- ✅ Que la URL sea correcta (sin espacios, sin errores de tipeo)
- ✅ Que el método sea `POST`

## 📝 Probar el Endpoint Directamente

Puedes probar el endpoint desde Postman o curl:

```bash
curl -X POST http://localhost:8000/api/evaluation/n8n-results \
  -H "Content-Type: application/json" \
  -d '{
    "id_evaluacion": 57,
    "html": "<!DOCTYPE html><html><body>Test</body></html>",
    "puntuacion": 85.5
  }'
```

O desde Postman:
- **Method**: POST
- **URL**: `http://localhost:8000/api/evaluation/n8n-results`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html><html><body>Test</body></html>",
  "puntuacion": 85.5
}
```

## 🔍 Verificar en la Base de Datos

Después de recibir la respuesta exitosa, verifica:

1. **Tabla `Resultados`**:
```sql
SELECT Id_Evaluacion, HTML, Puntuacion 
FROM Resultados 
WHERE Id_Evaluacion = 57;
```

2. **Tabla `Evaluacion`**:
```sql
SELECT Id_Evaluacion, Puntuacion 
FROM Evaluacion 
WHERE Id_Evaluacion = 57;
```

3. **Archivo HTML**:
```
storage/app/public/evaluations/html/57_*.html
```

## ✅ Checklist de Verificación

- [ ] Logs de Laravel muestran que recibe la petición
- [ ] El JSON enviado desde N8N tiene la estructura correcta
- [ ] `id_evaluacion` es un número entero
- [ ] `html` es un string (aunque esté vacío inicialmente)
- [ ] La URL del endpoint es correcta
- [ ] Laravel está corriendo y accesible
- [ ] No hay errores de CORS
- [ ] El timeout es suficiente (30+ segundos)
- [ ] La evaluación existe en la base de datos

## 📞 Información para Reportar Error

Si el problema persiste, proporciona:

1. **Logs de Laravel** (últimas 50 líneas relevantes)
2. **OUTPUT del nodo HTTP Request en N8N** (qué está enviando)
3. **OUTPUT del nodo anterior en N8N** (qué datos tiene antes de enviar)
4. **Respuesta de Laravel** (status code y body)
5. **Configuración del nodo HTTP Request** (método, URL, body)

