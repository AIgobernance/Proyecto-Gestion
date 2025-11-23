# 🔧 Solución: Error "ECONNREFUSED ::1:8000" en N8N

## ❌ Problema

El error `connect ECONNREFUSED ::1:8000` significa que N8N está intentando conectarse usando **IPv6** (`::1` es localhost en IPv6), pero Laravel solo está escuchando en **IPv4** (`127.0.0.1`).

---

## ✅ Solución Rápida

### Paso 1: Cambiar la URL en N8N

En el nodo **HTTP Request**, cambia la URL de:
```
http://localhost:8000/api/evaluation/n8n-results
```

A:
```
http://127.0.0.1:8000/api/evaluation/n8n-results
```

**Esto fuerza a usar IPv4** en lugar de IPv6.

---

## 🔧 Configuración Completa del Nodo HTTP Request

### Parámetros:

- **Method**: `POST`
- **URL**: `http://127.0.0.1:8000/api/evaluation/n8n-results` ⚠️ **USAR 127.0.0.1, NO localhost**
- **Authentication**: `None`
- **Send Body**: ✅ **ON** (verde)
- **Body Content Type**: `JSON`
- **Specify Body**: `keypair` (o "Using JSON")

### Body Parameters:

| Name | Value |
|------|-------|
| `id_evaluacion` | `{{ $json.id_evaluacion }}` |
| `html` | `{{ $json.html }}` |
| `puntuacion` | `{{ $json.puntuacion || null }}` |

---

## ✅ Verificar que Funciona

### 1. Verifica que Laravel esté corriendo:

```bash
php artisan serve
```

### 2. Verifica que esté escuchando en IPv4:

```bash
netstat -ano | findstr :8000
```

Debe mostrar algo como:
```
TCP    127.0.0.1:8000         0.0.0.0:0              LISTENING
```

### 3. Prueba en el navegador:

Abre:
```
http://127.0.0.1:8000
```

Debe funcionar.

### 4. Ejecuta el nodo HTTP Request en N8N:

Ahora debe conectarse correctamente.

---

## 📝 Nota sobre el JSON

Si el JSON viene envuelto en un objeto `body`, el controlador ahora lo maneja automáticamente. Pero es mejor que **NO** venga envuelto.

El JSON correcto debe ser:
```json
{
  "id_evaluacion": 57,
  "html": "<!DOCTYPE html>...",
  "puntuacion": 0
}
```

**NO** debe ser:
```json
{
  "body": {
    "id_evaluacion": 57,
    "html": "...",
    "puntuacion": 0
  }
}
```

---

## 🐛 Si Sigue Fallando

### Opción 1: Usar el hostname completo

Si `127.0.0.1` tampoco funciona, intenta:
```
http://127.0.0.1:8000/api/evaluation/n8n-results
```

### Opción 2: Verificar que Laravel esté escuchando en todas las interfaces

Laravel por defecto solo escucha en `127.0.0.1`. Si necesitas escuchar en todas las interfaces (incluyendo IPv6), usa:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Pero esto **NO es necesario** si usas `127.0.0.1` en la URL de N8N.

---

## ✅ Resumen

1. ✅ Cambiar URL en N8N: `localhost` → `127.0.0.1`
2. ✅ Usar 3 campos en Body Parameters: `id_evaluacion`, `html`, `puntuacion`
3. ✅ Verificar que Laravel esté corriendo
4. ✅ Probar de nuevo

