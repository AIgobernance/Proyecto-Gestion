# Configuración Exacta del Nodo HTTP Request en N8N

## ❌ Error Actual

"JSON parameter needs to be valid JSON"

**Causa**: El campo JSON Body no está configurado correctamente o tiene una expresión inválida.

---

## ✅ Configuración Paso a Paso

### Paso 1: Verificar que el Nodo Anterior tenga Todos los Campos

El nodo **Code (JavaScript)** anterior debe retornar:

```javascript
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion,  // ← DEBE estar aquí
    timestamp: new Date().toISOString(),
    puntuacion: puntuacion,
    score: puntuacion,
    recomendaciones: jsonParsed?.recomendaciones || null
  }
};
```

**⚠️ IMPORTANTE**: El nodo anterior debe pasar `id_evaluacion`, no solo `html`.

---

### Paso 2: Configurar el Nodo HTTP Request

1. **Method**: `POST` ✅

2. **URL**: `http://localhost:8000/api/evaluation/n8n-results` ✅

3. **Authentication**: `None` ✅

4. **Send Body**: `Yes` ✅

5. **Body Content Type**: `JSON` ✅

6. **Specify Body**: `Using JSON` ✅

7. **JSON Body** (⚠️ AQUÍ ESTÁ EL PROBLEMA):

   **Opción A: Usar el editor visual de N8N (Recomendado)**
   
   En el campo JSON Body, **NO pongas una expresión**, sino usa el **editor visual**:
   
   - Haz clic en "Add field" o usa el editor visual
   - Agrega estos campos uno por uno:
   
   ```
   id_evaluacion: {{ $json.id_evaluacion }}
   html: {{ $json.html }}
   puntuacion: {{ $json.puntuacion || $json.score }}
   score: {{ $json.puntuacion || $json.score }}
   recomendaciones: {{ $json.recomendaciones }}
   ```
   
   **Opción B: Usar expresión JSON.stringify (Si no tienes editor visual)**
   
   Si N8N solo te permite poner una expresión, usa esto:
   
   ```javascript
   ={{ JSON.stringify({ id_evaluacion: $json.id_evaluacion, html: $json.html, puntuacion: $json.puntuacion || $json.score || null, score: $json.puntuacion || $json.score || null, recomendaciones: $json.recomendaciones || null }) }}
   ```
   
   **⚠️ IMPORTANTE**: 
   - Esta expresión debe estar en **UNA SOLA LÍNEA**
   - NO debe tener saltos de línea
   - NO debe tener `null` sin clave

---

## 🔍 Verificar que Funciona

### 1. Verifica el INPUT del Nodo HTTP Request

El INPUT debe mostrar algo como:

```json
{
  "html": "<!DOCTYPE html>...",
  "id_evaluacion": 57,
  "puntuacion": 0,
  "score": 0,
  "recomendaciones": null
}
```

**Si solo ves `html`**, el problema está en el nodo anterior.

### 2. Verifica el Preview del JSON Body

Después de configurar el JSON Body, haz clic fuera del campo para que se genere el preview.

El preview debe mostrar:

```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html>...",
  "puntuacion": 0,
  "score": 0,
  "recomendaciones": null
}
```

**Si el preview muestra un error o no se genera**, la expresión está mal.

### 3. Ejecuta el Nodo

1. Haz clic en "Execute step"
2. Si todo está bien, deberías ver en el OUTPUT:
   ```json
   {
     "success": true,
     "message": "Resultados recibidos y guardados exitosamente",
     ...
   }
   ```

---

## 🐛 Solución de Problemas

### Problema: "JSON parameter needs to be valid JSON"

**Solución 1**: Usa el editor visual en lugar de una expresión:
- Haz clic en el campo JSON Body
- Usa el botón "Add field" o el editor visual
- Agrega cada campo manualmente

**Solución 2**: Si debes usar expresión, asegúrate de que:
- Esté en UNA SOLA LÍNEA
- Use `JSON.stringify()`
- Todos los campos estén entre llaves `{}`

**Solución 3**: Verifica que el nodo anterior tenga todos los campos:
- Abre el nodo Code anterior
- Verifica que retorne `id_evaluacion`, `html`, `puntuacion`, etc.
- Ejecuta ese nodo y revisa el OUTPUT

### Problema: El INPUT solo tiene `html`

**Causa**: El nodo Code anterior no está pasando `id_evaluacion`.

**Solución**: 
1. Abre el nodo Code anterior
2. Asegúrate de que el código incluya:
   ```javascript
   return {
     json: {
       html: html,
       id_evaluacion: idEvaluacion,  // ← Asegúrate de incluir esto
       // ... otros campos
     }
   };
   ```
3. Verifica que `idEvaluacion` esté definido en el código

---

## ✅ Checklist Final

- [ ] El nodo Code anterior retorna `id_evaluacion` y `html`
- [ ] El INPUT del HTTP Request muestra todos los campos necesarios
- [ ] El JSON Body está configurado (editor visual o expresión válida)
- [ ] El preview del JSON Body se genera correctamente
- [ ] Laravel está corriendo (`php artisan serve`)
- [ ] La URL es correcta: `http://localhost:8000/api/evaluation/n8n-results`
- [ ] El método es `POST`
- [ ] Send Body está activado

