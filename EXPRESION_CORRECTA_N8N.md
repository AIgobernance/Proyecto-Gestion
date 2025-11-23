# Expresión Correcta para JSON Body en N8N

## ❌ Error Actual

`[invalid syntax]` - Tienes dobles llaves `{{ }}` cuando N8N ya las maneja automáticamente.

---

## ✅ Solución: Expresión Correcta

### Si "Specify Body" está en "Using Expression"

**NO pongas** `{{ }}` alrededor. Solo pon el código JavaScript directamente:

```javascript
JSON.stringify({
  id_evaluacion: parseInt($json.id_evaluacion) || null,
  html: String($json.html || ''),
  puntuacion: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
  score: parseFloat($json.puntuacion) || parseFloat($json.score) || null,
  recomendaciones: $json.recomendaciones || null
})
```

**⚠️ IMPORTANTE**: 
- Sin `{{` al inicio
- Sin `}}` al final
- Solo el código JavaScript puro

---

### Si "Specify Body" está en "Using JSON" (Editor Visual)

Entonces usa el editor visual y agrega cada campo:

1. Haz clic en "Add field" o usa el editor
2. Agrega cada campo:
   - **Name**: `id_evaluacion`
   - **Value**: `{{ parseInt($json.id_evaluacion) || null }}`
   
   - **Name**: `html`
   - **Value**: `{{ String($json.html || '') }}`
   
   - **Name**: `puntuacion`
   - **Value**: `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}`
   
   - **Name**: `score`
   - **Value**: `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}`
   
   - **Name**: `recomendaciones`
   - **Value**: `{{ $json.recomendaciones || null }}`

---

## 🔍 Verificar

Después de corregir, el preview debe mostrar:

```json
{"id_evaluacion":57,"html":"<!DOCTYPE html>...","puntuacion":0,"score":0,"recomendaciones":null}
```

**NO debe tener**:
- ❌ `{{` al inicio
- ❌ `}}` al final
- ❌ `[invalid syntax]` error

---

## 📝 Resumen

**Si usas "Using Expression"**:
- Solo pon: `JSON.stringify({ ... })`
- Sin `{{ }}` alrededor

**Si usas "Using JSON" (Editor Visual)**:
- Agrega cada campo manualmente
- Usa `{{ }}` solo en los valores de cada campo

