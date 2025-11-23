# Solución: El INPUT es un Array en lugar de un Objeto

## ❌ Problema

El nodo Code está retornando un **array**:
```json
[
  {
    "html": "...",
    "id_evaluacion": 57,
    "puntuacion": 0,
    ...
  }
]
```

Pero el nodo HTTP Request intenta acceder como si fuera un objeto:
```javascript
$json.id_evaluacion  // ← Esto no funciona si $json es un array
```

## ✅ Solución Rápida: Cambiar la Expresión en HTTP Request

En el nodo **HTTP Request**, cambia la expresión del JSON Body a:

```javascript
={{
  JSON.stringify({
    id_evaluacion: $json[0].id_evaluacion || $json.id_evaluacion || null,
    html: $json[0].html || $json.html || '',
    puntuacion: $json[0].puntuacion || $json[0].score || $json.puntuacion || $json.score || null,
    score: $json[0].puntuacion || $json[0].score || $json.puntuacion || $json.score || null,
    recomendaciones: $json[0].recomendaciones || $json.recomendaciones || null
  })
}}
```

Esto maneja tanto si viene como array `[{...}]` como si viene como objeto `{...}`.

---

## ✅ Solución Definitiva: Cambiar el Nodo Code

### Opción A: Cambiar el Modo del Nodo Code

1. Abre el nodo **Code (JavaScript)**
2. Ve a la pestaña **Parameters**
3. Cambia **Mode** de `"Run Once for All Items"` a `"Run Once for Each Item"`

Esto hará que retorne un objeto en lugar de un array.

### Opción B: Cambiar el Return del Nodo Code

Si quieres mantener `"Run Once for All Items"`, cambia el `return` al final del código:

**❌ Actual (retorna array)**:
```javascript
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion,
    // ...
  }
};
```

**✅ Correcto (retorna objeto directamente)**:
```javascript
// Si estás en "Run Once for All Items", retorna directamente el objeto
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion,
    timestamp: new Date().toISOString(),
    puntuacion: puntuacion,
    score: puntuacion,
    recomendaciones: jsonParsed?.recomendaciones || null
  }
};
```

Pero si el modo es "Run Once for All Items", N8N puede envolverlo en un array. Mejor usa la **Opción A** o la **Solución Rápida** arriba.

---

## 🔍 Verificar

Después de hacer el cambio:

1. **Ejecuta el nodo Code** y verifica el OUTPUT
2. **Verifica el INPUT del HTTP Request** - debe mostrar un objeto `{...}` no un array `[{...}]`
3. **Ejecuta el HTTP Request** - debe funcionar sin errores

---

## 📝 Resumen

**Problema**: El INPUT es `[{...}]` (array) pero el HTTP Request accede como `{...}` (objeto)

**Solución más rápida**: Cambiar la expresión en HTTP Request a `$json[0].id_evaluacion`

**Solución definitiva**: Cambiar el modo del nodo Code a `"Run Once for Each Item"`

