# Solución Final: Error "JSON parameter needs to be valid JSON"

## ❌ Problema

El preview muestra: `={"id_evaluacion":"57"...` con un `=` al inicio, lo cual NO es JSON válido.

**Causa**: El campo "Specify Body" está en "Using JSON" pero estás usando una expresión `={{ }}`, lo cual causa conflicto.

---

## ✅ Solución: Cambiar a "Using Expression"

### Paso 1: Cambiar "Specify Body"

En el nodo HTTP Request:

1. **Specify Body**: Cambia de `"Using JSON"` a `"Using Expression"`

### Paso 2: Usar la Expresión Correcta

En el campo que aparece (puede llamarse "Body" o "JSON Body"), pega esta expresión:

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

**⚠️ IMPORTANTE**: 
- Esta expresión maneja tanto array `[{...}]` como objeto `{...}`
- Usa `$json[0]` primero (si es array), luego `$json` (si es objeto)
- Convierte los valores a los tipos correctos (parseInt, parseFloat, String)

### Paso 3: Verificar el Preview

Después de cambiar a "Using Expression", el preview debe mostrar:

```json
{"id_evaluacion":57,"html":"<!DOCTYPE html>...","puntuacion":0,"score":0,"recomendaciones":null}
```

**NO debe tener** `=` al inicio.

---

## 🔄 Alternativa: Usar Editor Visual

Si prefieres no usar expresiones:

1. **Specify Body**: `"Using JSON"`
2. **NO uses expresión**, en su lugar:
   - Haz clic en el campo JSON
   - Usa el editor visual de N8N
   - Agrega cada campo manualmente:
     - `id_evaluacion`: `{{ $json[0].id_evaluacion || $json.id_evaluacion }}`
     - `html`: `{{ $json[0].html || $json.html }}`
     - `puntuacion`: `{{ $json[0].puntuacion || $json[0].score || $json.puntuacion || $json.score }}`
     - `score`: `{{ $json[0].puntuacion || $json[0].score || $json.puntuacion || $json.score }}`
     - `recomendaciones`: `{{ $json[0].recomendaciones || $json.recomendaciones }}`

---

## ✅ Verificación Final

1. **Specify Body**: `"Using Expression"` ✅
2. **Expresión**: La que proporcioné arriba ✅
3. **Preview**: Debe mostrar JSON válido sin `=` al inicio ✅
4. **Ejecutar**: Debe funcionar sin errores ✅

---

## 🐛 Si Sigue Fallando

### Verificar que Laravel esté corriendo:

```bash
php artisan serve
```

### Verificar la URL:

```
http://localhost:8000/api/evaluation/n8n-results
```

### Verificar el INPUT:

El INPUT debe tener los campos necesarios. Si solo tiene `html`, el problema está en el nodo anterior.

