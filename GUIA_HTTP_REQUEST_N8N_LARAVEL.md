# Guía: Enviar HTML desde N8N a Laravel usando HTTP Request Explícito

Esta guía explica cómo configurar el flujo para que N8N envíe el HTML generado a Laravel usando una **petición HTTP explícita** (más confiable que "Respond to Webhook").

## 📋 Resumen del Flujo

```
Laravel → N8N (envía datos de evaluación)
    ↓
N8N procesa con IA → Genera HTML
    ↓
N8N → HTTP Request → Laravel (envía HTML + metadatos)
    ↓
Laravel guarda HTML en archivo y base de datos
    ↓
Laravel responde a N8N (confirmación)
```

## ✅ Ventajas de HTTP Request Explícito

1. **Más confiable**: No depende de mantener conexión HTTP abierta
2. **Mejor control**: Puedes manejar errores y reintentos
3. **Más explícito**: Sabes exactamente a dónde se envía
4. **Asíncrono**: Laravel puede responder inmediatamente a la petición inicial
5. **Mejor debugging**: Logs más claros en ambos lados

---

## 🔧 Paso 1: Configurar Endpoint en Laravel

### Ruta

Ya está creada en `routes/web.php`:

```php
Route::post('/api/evaluation/n8n-results', [EvaluationController::class, 'receiveN8NResults']);
```

### Endpoint URL

```
POST http://tu-dominio.com/api/evaluation/n8n-results
```

O si usas localhost:
```
POST http://localhost:8000/api/evaluation/n8n-results
```

### Estructura de Datos que Espera Laravel

```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html>... (HTML completo)",
  "puntuacion": 85.5,
  "score": 85.5,
  "recomendaciones": "Recomendaciones generadas..."
}
```

---

## 🔧 Paso 2: Configurar Nodo HTTP Request en N8N

### Reemplazar "Respond to Webhook" con "HTTP Request"

1. **Elimina o desconecta** el nodo "Respond to Webhook"
2. **Agrega un nodo "HTTP Request"** al final del workflow
3. **Conecta** el nodo anterior al nuevo nodo HTTP Request

### Configuración del Nodo HTTP Request

**Parámetros**:

- **Method**: `POST`
- **URL**: `http://tu-dominio.com/api/evaluation/n8n-results`
  - Ejemplo: `http://localhost:8000/api/evaluation/n8n-results`
  - O usa variable de entorno: `={{ $env.LARAVEL_API_URL }}/api/evaluation/n8n-results`

- **Authentication**: `None` (o `Generic Credential Type` si necesitas autenticación)

- **Send Body**: `Yes`

- **Body Content Type**: `JSON`

- **JSON Body** (expresión):
```javascript
={{
  JSON.stringify({
    id_evaluacion: $json.id_evaluacion || null,
    html: $json.html || '',
    puntuacion: $json.puntuacion || $json.score || null,
    score: $json.puntuacion || $json.score || null,
    recomendaciones: $json.recomendaciones || null
  })
}}
```

- **Options**:
  - **Timeout**: `30000` (30 segundos, ajusta según necesites)
  - **Redirect**: `Follow`
  - **Response**: `JSON`

### Configuración Visual en N8N

```
┌─────────────────────────────────────┐
│ HTTP Request                        │
├─────────────────────────────────────┤
│ Method: POST                        │
│ URL: http://localhost:8000/...     │
│ Authentication: None                │
│ Send Body: Yes                      │
│ Body Content Type: JSON             │
│ JSON Body: [expresión arriba]       │
│ Timeout: 30000                      │
└─────────────────────────────────────┘
```

---

## 🔧 Paso 3: Configurar Variable de Entorno en N8N (Opcional pero Recomendado)

Para no hardcodear la URL de Laravel:

1. **En N8N**, ve a **Settings** → **Environment Variables**
2. **Agrega**:
   - **Name**: `LARAVEL_API_URL`
   - **Value**: `http://localhost:8000` (o tu URL de producción)

3. **En el nodo HTTP Request**, usa:
   ```
   URL: ={{ $env.LARAVEL_API_URL }}/api/evaluation/n8n-results
   ```

---

## 🔧 Paso 4: Manejar Respuesta de Laravel (Opcional)

Laravel responderá con:

```json
{
  "success": true,
  "message": "Resultados recibidos y guardados exitosamente",
  "data": {
    "id_evaluacion": 57,
    "html_guardado": true,
    "puntuacion": 85.5,
    "html_path": "evaluations/html/57_1234567890.html"
  }
}
```

Puedes agregar un nodo después del HTTP Request para verificar la respuesta:

### Nodo: Function - Verificar Respuesta

```javascript
const response = $json;
const statusCode = $json.statusCode || 200;

if (statusCode >= 200 && statusCode < 300) {
  // Éxito
  return {
    json: {
      success: true,
      message: 'HTML enviado exitosamente a Laravel',
      laravel_response: response.body,
      id_evaluacion: $('HTTP Request').first().json.id_evaluacion
    }
  };
} else {
  // Error
  throw new Error(`Error al enviar HTML a Laravel: ${statusCode} - ${JSON.stringify(response.body)}`);
}
```

---

## 🔧 Paso 5: Actualizar Nodo Webhook Inicial (Opcional)

Si quieres que Laravel responda inmediatamente (sin esperar a N8N), puedes cambiar el nodo Webhook:

**Configuración**:
- **Response Mode**: `"Respond Immediately"`
- **Response Data**: `"All Incoming Items"` o un JSON simple:
```json
{
  "success": true,
  "message": "Evaluación recibida, procesando en segundo plano",
  "id_evaluacion": "={{ $json.body.id_evaluacion || $json.id_evaluacion }}"
}
```

Esto permite que Laravel responda inmediatamente y N8N procese en segundo plano.

---

## 🔧 Paso 6: Probar el Flujo Completo

### 1. Ejecutar una Evaluación

1. Completa una evaluación en tu aplicación
2. Envía los datos a N8N
3. N8N procesa y genera el HTML
4. N8N hace HTTP Request a Laravel
5. Laravel guarda el HTML y responde

### 2. Verificar Logs

**Logs de Laravel**:
```bash
tail -f storage/logs/laravel.log
```

Busca mensajes como:
- `"Recibiendo resultados de N8N"`
- `"HTML guardado exitosamente en archivo"`
- `"Resultados recibidos y guardados exitosamente"`

**Logs de N8N**:
- Revisa el OUTPUT del nodo HTTP Request
- Debe mostrar el status code 200 y la respuesta de Laravel

### 3. Verificar Archivo HTML

El HTML se guarda en:
```
storage/app/public/evaluations/html/{id_evaluacion}_{timestamp}.html
```

---

## ⚠️ Consideraciones Importantes

### 1. Timeout

- **N8N HTTP Request**: Configura timeout suficiente (30-60 segundos)
- **Laravel**: El endpoint no tiene timeout especial, pero el servidor web puede tenerlo

### 2. Tamaño del HTML

- El HTML puede ser grande (varios MB)
- Asegúrate de que tu servidor pueda manejar peticiones grandes
- Considera aumentar `upload_max_filesize` y `post_max_size` en PHP

### 3. Errores y Reintentos

N8N puede configurar reintentos automáticos en el nodo HTTP Request:
- **Options** → **Retry** → Configura número de reintentos

### 4. Seguridad (Opcional)

Si quieres agregar autenticación, puedes:

**Opción A: Token en Header**
- En N8N HTTP Request, agrega header:
  - **Name**: `Authorization`
  - **Value**: `Bearer tu-token-secreto`

- En Laravel, valida el token en el método `receiveN8NResults`

**Opción B: API Key**
- Similar a token, pero en header `X-API-Key`

---

## 🐛 Troubleshooting

### Problema: HTTP Request falla con timeout

**Solución**:
1. Aumenta el timeout en el nodo HTTP Request (60-120 segundos)
2. Verifica que Laravel esté accesible desde N8N
3. Revisa logs de Laravel para ver si recibió la petición

### Problema: Laravel responde 422 (Validación fallida)

**Solución**:
1. Verifica que el JSON enviado tenga todos los campos requeridos:
   - `id_evaluacion` (integer)
   - `html` (string, no vacío)
2. Revisa el OUTPUT del nodo anterior en N8N para ver qué datos tiene
3. Verifica que `$json.html` no esté vacío

### Problema: HTML no se guarda en base de datos

**Solución**:
1. Verifica que la columna `HTML` existe en la tabla `Resultados`
2. Revisa logs de Laravel para ver errores específicos
3. Verifica permisos de escritura en la base de datos

### Problema: Laravel no responde

**Solución**:
1. Verifica que la URL sea correcta
2. Verifica que Laravel esté corriendo
3. Revisa logs de Laravel para ver si recibió la petición
4. Verifica CORS si N8N y Laravel están en dominios diferentes

---

## ✅ Checklist de Configuración

- [ ] Endpoint creado en Laravel (`/api/evaluation/n8n-results`)
- [ ] Método `receiveN8NResults` implementado en `EvaluationController`
- [ ] Nodo HTTP Request configurado en N8N
- [ ] URL de Laravel configurada (hardcodeada o variable de entorno)
- [ ] JSON Body configurado correctamente en HTTP Request
- [ ] Timeout configurado (30-60 segundos)
- [ ] Variable de entorno `LARAVEL_API_URL` configurada (opcional)
- [ ] Probar flujo completo con una evaluación
- [ ] Verificar que el HTML se guarda correctamente
- [ ] Verificar logs en ambos lados

---

## 📚 Referencias

- [N8N HTTP Request Node](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/)
- [Laravel HTTP Client](https://laravel.com/docs/http-client)
- [Laravel File Storage](https://laravel.com/docs/filesystem)

