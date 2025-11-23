# Solución Final: Error 419 CSRF y "Service refused connection"

## ✅ Cambios Realizados

### 1. Exclusión de CSRF

He configurado la exclusión de CSRF en `bootstrap/app.php`. La ruta `/api/evaluation/n8n-results` ahora está excluida.

### 2. Simplificación de Validación

La validación ahora solo requiere los 3 campos que envías:
- `id_evaluacion` (required|integer)
- `html` (required|string)
- `puntuacion` (nullable|numeric)

---

## 🔄 IMPORTANTE: Reiniciar Laravel

**DEBES reiniciar Laravel** para que los cambios tomen efecto:

1. **Detén Laravel** (Ctrl+C en la terminal donde está corriendo)
2. **Inicia Laravel de nuevo**:
   ```bash
   php artisan serve
   ```

---

## ✅ Configuración Final en N8N

En el nodo HTTP Request:

### Campos en "Body Parameters":

1. **Name**: `id_evaluacion`
   **Value**: `{{ $json.id_evaluacion }}`

2. **Name**: `html`
   **Value**: `{{ $json.html }}`

3. **Name**: `puntuacion`
   **Value**: `{{ parseFloat($json.puntuacion) || null }}`

### Otros Parámetros:

- **Method**: `POST`
- **URL**: `http://localhost:8000/api/evaluation/n8n-results`
- **Body Content Type**: `JSON`
- **Specify Body**: `"keypair"` o `"Using JSON"` (el editor visual)

---

## 🔍 Verificar que Funciona

### Paso 1: Reiniciar Laravel

```bash
php artisan serve
```

### Paso 2: Verificar en Navegador

Abre:
```
http://localhost:8000
```

Debe funcionar.

### Paso 3: Ejecutar Nodo HTTP Request en N8N

1. Asegúrate de tener los 3 campos en "Body Parameters"
2. Haz clic en "Execute step"
3. Debe funcionar sin errores

---

## 🐛 Si Sigue Fallando

### Error: "The service refused the connection"

**Causa**: Laravel no está corriendo o la URL está mal.

**Solución**:
1. Verifica que Laravel esté corriendo: `php artisan serve`
2. Verifica la URL: `http://localhost:8000/api/evaluation/n8n-results`
3. Prueba acceder a `http://localhost:8000` en tu navegador

### Error: "419 CSRF token mismatch"

**Causa**: Laravel no se reinició después de los cambios.

**Solución**:
1. Detén Laravel (Ctrl+C)
2. Reinicia: `php artisan serve`
3. Vuelve a intentar en N8N

---

## ✅ Resumen

1. ✅ Exclusión de CSRF configurada en `bootstrap/app.php`
2. ✅ Validación simplificada (solo 3 campos)
3. ⚠️ **REINICIAR Laravel** (muy importante)
4. ✅ 3 campos en N8N: `id_evaluacion`, `html`, `puntuacion`

