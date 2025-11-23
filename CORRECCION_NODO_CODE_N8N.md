# Corrección del Nodo Code Anterior al HTTP Request

## ❌ Problema Actual

El nodo **Code (JavaScript)** anterior al HTTP Request solo está retornando:

```javascript
{
  "html": "<!DOCTYPE html>..."
}
```

Pero falta:
- `id_evaluacion` ⚠️
- `puntuacion` / `score`
- `recomendaciones`

Esto causa que el nodo HTTP Request intente acceder a campos que no existen (`$json.id_evaluacion`, etc.), generando JSON inválido.

---

## ✅ Solución: Corregir el Nodo Code Anterior

### Paso 1: Abrir el Nodo Code (JavaScript)

Abre el nodo **Code** que está ANTES del nodo HTTP Request.

### Paso 2: Verificar que el Código Retorne Todos los Campos

El código debe retornar **TODOS** estos campos:

```javascript
// Obtener id_evaluacion desde el nodo anterior
// Si viene del webhook inicial, busca en el path correcto
const idEvaluacion = $json.body?.id_evaluacion || 
                     $json.id_evaluacion || 
                     $('Set').first().json.body?.id_evaluacion ||
                     $('Set').first().json.id_evaluacion ||
                     null;

// Obtener HTML (ya lo tienes)
const html = $json.html || '';

// Obtener puntuacion si existe
const puntuacion = $json.puntuacion || 
                   $json.score || 
                   $('Set').first().json.puntuacion ||
                   $('Set').first().json.score ||
                   null;

// Obtener recomendaciones si existen
const recomendaciones = $json.recomendaciones || null;

// Retornar TODOS los campos necesarios
return {
  json: {
    html: html,
    id_evaluacion: parseInt(idEvaluacion) || null,  // ← IMPORTANTE: convertir a número
    puntuacion: puntuacion ? parseFloat(puntuacion) : null,
    score: puntuacion ? parseFloat(puntuacion) : null,
    recomendaciones: recomendaciones || null,
    timestamp: new Date().toISOString()
  }
};
```

### Paso 3: Si NO Tienes `id_evaluacion` en el Nodo Anterior

Si el nodo Code anterior no tiene acceso a `id_evaluacion`, necesitas obtenerlo del **webhook inicial**.

**Opción A: Pasar `id_evaluacion` a través de todos los nodos**

En cada nodo del workflow, asegúrate de pasar `id_evaluacion`:

```javascript
// En el nodo Code que procesa HTML
const inputData = $input.first().json;
const bodyData = inputData.body || inputData;

// Obtener id_evaluacion del inicio del workflow
const idEvaluacion = bodyData.id_evaluacion || 
                     inputData.id_evaluacion ||
                     // O acceder al nodo Set inicial
                     $('Set').first().json.body?.id_evaluacion ||
                     $('Set').first().json.id_evaluacion ||
                     null;

// ... resto del código ...

return {
  json: {
    ...inputData,  // Mantener todos los datos anteriores
    html: html,
    id_evaluacion: parseInt(idEvaluacion) || null,
    puntuacion: puntuacion,
    score: puntuacion
  }
};
```

**Opción B: Usar un nodo Set antes del Code**

Agrega un nodo **Set** ANTES del nodo Code que procesa HTML:

1. **Nodo Set** (antes del Code que procesa HTML):
   - **Keep Only Set Fields**: `No`
   - **Values to Set**:
     ```
     id_evaluacion: {{ $json.body.id_evaluacion || $json.id_evaluacion || $('Set').first().json.body.id_evaluacion }}
     puntuacion: {{ $json.puntuacion || $json.score }}
     score: {{ $json.puntuacion || $json.score }}
     ```

2. Luego el nodo Code simplemente pasa todo:
   ```javascript
   return {
     json: {
       ...$json,  // Pasa todo lo que vino del nodo anterior
       html: html  // Agrega el HTML procesado
     }
   };
   ```

---

## 🔍 Verificar que Funciona

### Paso 1: Ejecutar el Nodo Code

1. Haz clic en "Execute step" en el nodo Code
2. Revisa el **OUTPUT**

### Paso 2: Verificar el OUTPUT del Nodo Code

El OUTPUT debe mostrar:

```json
{
  "html": "<!DOCTYPE html>...",
  "id_evaluacion": 57,  // ← DEBE estar aquí
  "puntuacion": 85.5,
  "score": 85.5,
  "recomendaciones": null,
  "timestamp": "2025-01-23T10:30:00.000Z"
}
```

**⚠️ Si solo ves `html`**, el código está mal y necesitas corregirlo usando las instrucciones arriba.

### Paso 3: Verificar el INPUT del HTTP Request

Después de corregir el nodo Code, el **INPUT** del nodo HTTP Request debe mostrar:

```json
{
  "html": "<!DOCTYPE html>...",
  "id_evaluacion": 57,  // ← DEBE estar aquí
  "puntuacion": 85.5,
  "score": 85.5,
  ...
}
```

### Paso 4: Ejecutar el HTTP Request

Ahora el nodo HTTP Request debería funcionar correctamente.

---

## 📝 Ejemplo Completo del Nodo Code

Aquí tienes un ejemplo completo del nodo Code que procesa el HTML y retorna todos los campos:

```javascript
// Extraer HTML de la respuesta de OpenAI
let html = '';
const inputData = $input.first().json;

// [Aquí va tu código para extraer HTML de OpenAI]
// ... código de extracción de HTML ...

// Obtener id_evaluacion desde el principio del workflow
// Intenta diferentes paths según cómo esté estructurado tu workflow
let idEvaluacion = null;

// Intentar obtener del body (si viene del webhook)
if (inputData.body && inputData.body.id_evaluacion) {
  idEvaluacion = inputData.body.id_evaluacion;
}
// Intentar obtener directamente
else if (inputData.id_evaluacion) {
  idEvaluacion = inputData.id_evaluacion;
}
// Intentar obtener del nodo Set inicial
else {
  try {
    const setNode = $('Set').first();
    if (setNode && setNode.json) {
      idEvaluacion = setNode.json.body?.id_evaluacion || setNode.json.id_evaluacion;
    }
  } catch (e) {
    console.warn('No se pudo obtener id_evaluacion del nodo Set');
  }
}

// Obtener puntuacion si existe
const puntuacion = inputData.puntuacion || 
                   inputData.score || 
                   null;

// Obtener recomendaciones
const recomendaciones = inputData.recomendaciones || null;

// Retornar TODOS los campos necesarios
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion ? parseInt(idEvaluacion) : null,
    puntuacion: puntuacion ? parseFloat(puntuacion) : null,
    score: puntuacion ? parseFloat(puntuacion) : null,
    recomendaciones: recomendaciones || null,
    timestamp: new Date().toISOString()
  }
};
```

---

## ✅ Checklist

- [ ] El nodo Code retorna `id_evaluacion` (no solo `html`)
- [ ] El nodo Code retorna `puntuacion` / `score`
- [ ] El OUTPUT del nodo Code muestra todos los campos
- [ ] El INPUT del HTTP Request muestra todos los campos
- [ ] El JSON Body del HTTP Request se genera correctamente
- [ ] El nodo HTTP Request se ejecuta sin errores

