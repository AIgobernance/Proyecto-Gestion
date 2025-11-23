# Campos Completos para HTTP Request en N8N

## ✅ Configuración Actual (Correcta)

Ya tienes:
- ✅ `id_evaluacion`: `{{ $json.id_evaluacion }}` → muestra "57"
- ✅ `html`: `{{ $json.html }}` → muestra el HTML

## ⚠️ Campos Faltantes

Necesitas agregar estos campos en "Body Parameters":

### Campo 3: `puntuacion`

1. Haz clic en "Add parameter" o el botón "+"
2. **Name**: `puntuacion`
3. **Value**: `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}`
4. **Type**: Expression (debe tener el icono `fx`)

### Campo 4: `score`

1. Haz clic en "Add parameter" o el botón "+"
2. **Name**: `score`
3. **Value**: `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}`
4. **Type**: Expression (debe tener el icono `fx`)

### Campo 5: `recomendaciones` (Opcional)

1. Haz clic en "Add parameter" o el botón "+"
2. **Name**: `recomendaciones`
3. **Value**: `{{ $json.recomendaciones || null }}`
4. **Type**: Expression (debe tener el icono `fx`)

---

## 📋 Lista Completa de Campos

Tu "Body Parameters" debe tener exactamente estos 5 campos:

| Name | Value | Type |
|------|-------|------|
| `id_evaluacion` | `{{ $json.id_evaluacion }}` | Expression |
| `html` | `{{ $json.html }}` | Expression |
| `puntuacion` | `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}` | Expression |
| `score` | `{{ parseFloat($json.puntuacion) || parseFloat($json.score) || null }}` | Expression |
| `recomendaciones` | `{{ $json.recomendaciones || null }}` | Expression |

---

## 🔍 Verificar

Después de agregar todos los campos, el preview debe mostrar algo como:

```json
{
  "id_evaluacion": "57",
  "html": "<!DOCTYPE html>...",
  "puntuacion": 0,
  "score": 0,
  "recomendaciones": null
}
```

---

## ✅ Verificar que Laravel Está Corriendo

Laravel está corriendo en el puerto 8000. Verifica que puedas acceder:

```
http://localhost:8000
```

Si puedes acceder, entonces el problema puede ser:
- La URL en N8N está mal escrita
- Hay un problema de CORS
- El endpoint no existe

---

## 🐛 Si Sigue el Error de Conexión

1. **Verifica la URL en N8N**:
   ```
   http://localhost:8000/api/evaluation/n8n-results
   ```

2. **Prueba el endpoint desde Postman o curl**:
   ```bash
   curl -X POST http://localhost:8000/api/evaluation/n8n-results \
     -H "Content-Type: application/json" \
     -d '{"id_evaluacion": 57, "html": "<html>test</html>", "puntuacion": 0}'
   ```

3. **Revisa los logs de Laravel**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

