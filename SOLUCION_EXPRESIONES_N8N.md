# 🔧 Solución: Corrección de Expresiones N8N con .item

## ❌ Expresiones Problemáticas

```javascript
// ❌ NO FUNCIONA - Usa .item directamente
={{ $('Webhook').item.json.body.metadatos.nombre_usuario }}

={{ $('Obtener datos').item.json.body.respuestas }}
```

## ✅ Expresiones Corregidas

### Expresión 1: Metadatos del Usuario

**Antes:**
```javascript
={{ 
  "Usuario: " + $('Webhook').item.json.body.metadatos.nombre_usuario +
  "\nEmpresa: " + $('Webhook').item.json.body.metadatos.empresa +
  "\nCorreo: " + $('Webhook').item.json.body.metadatos.correo +
  "\nSector: " + ($('Webhook').item.json.body.metadatos.sector || "N/A")
}}
```

**Después (Solución 1 - Recomendada):**
```javascript
={{ 
  "Usuario: " + $('Webhook').first().json.body.metadatos.nombre_usuario +
  "\nEmpresa: " + $('Webhook').first().json.body.metadatos.empresa +
  "\nCorreo: " + $('Webhook').first().json.body.metadatos.correo +
  "\nSector: " + ($('Webhook').first().json.body.metadatos.sector || "N/A")
}}
```

**O si el nodo Webhook devuelve múltiples items:**
```javascript
={{ 
  "Usuario: " + $('Webhook').all()[0].json.body.metadatos.nombre_usuario +
  "\nEmpresa: " + $('Webhook').all()[0].json.body.metadatos.empresa +
  "\nCorreo: " + $('Webhook').all()[0].json.body.metadatos.correo +
  "\nSector: " + ($('Webhook').all()[0].json.body.metadatos.sector || "N/A")
}}
```

### Expresión 2: Respuestas

**Antes:**
```javascript
={{ JSON.stringify($('Obtener datos').item.json.body.respuestas || {}, null, 2) }}
```

**Después:**
```javascript
={{ JSON.stringify($('Obtener datos').first().json.body.respuestas || {}, null, 2) }}
```

**O:**
```javascript
={{ JSON.stringify($('Obtener datos').all()[0].json.body.respuestas || {}, null, 2) }}
```

### Expresión 3: Ponderaciones

**Antes:**
```javascript
={{ JSON.stringify($('Obtener datos').item.json.body.metadatos.ponderaciones, null, 2) }}
```

**Después:**
```javascript
={{ JSON.stringify($('Obtener datos').first().json.body.metadatos.ponderaciones, null, 2) }}
```

**O:**
```javascript
={{ JSON.stringify($('Obtener datos').all()[0].json.body.metadatos.ponderaciones, null, 2) }}
```

---

## 📋 Expresiones Completas Corregidas (Listas para Copiar)

### Versión con .first() (Recomendada)

```javascript
// Expresión 1: Metadatos del Usuario
={{ 
  "Usuario: " + $('Webhook').first().json.body.metadatos.nombre_usuario +
  "\nEmpresa: " + $('Webhook').first().json.body.metadatos.empresa +
  "\nCorreo: " + $('Webhook').first().json.body.metadatos.correo +
  "\nSector: " + ($('Webhook').first().json.body.metadatos.sector || "N/A")
}}

// Expresión 2: Respuestas
={{ JSON.stringify($('Obtener datos').first().json.body.respuestas || {}, null, 2) }}

// Expresión 3: Ponderaciones
={{ JSON.stringify($('Obtener datos').first().json.body.metadatos.ponderaciones, null, 2) }}
```

### Versión con .all()[0] (Si .first() no funciona)

```javascript
// Expresión 1: Metadatos del Usuario
={{ 
  "Usuario: " + $('Webhook').all()[0].json.body.metadatos.nombre_usuario +
  "\nEmpresa: " + $('Webhook').all()[0].json.body.metadatos.empresa +
  "\nCorreo: " + $('Webhook').all()[0].json.body.metadatos.correo +
  "\nSector: " + ($('Webhook').all()[0].json.body.metadatos.sector || "N/A")
}}

// Expresión 2: Respuestas
={{ JSON.stringify($('Obtener datos').all()[0].json.body.respuestas || {}, null, 2) }}

// Expresión 3: Ponderaciones
={{ JSON.stringify($('Obtener datos').all()[0].json.body.metadatos.ponderaciones, null, 2) }}
```

---

## 🔍 Cuándo Usar Cada Método

### `.first()` - Usa cuando:
- Solo necesitas el primer item
- Es la opción más simple y legible
- El nodo siempre devuelve al menos un item

### `.last()` - Usa cuando:
- Necesitas el último item
- Estás procesando múltiples items y quieres el resultado final

### `.all()[index]` - Usa cuando:
- Necesitas un item específico por índice (0, 1, 2, etc.)
- `.first()` no funciona por alguna razón
- Sabes exactamente qué posición necesitas

---

## 💡 Recomendación Final

**Usa `.first()`** en todas tus expresiones, es la forma más simple y funciona en la mayoría de casos:

```javascript
// Cambiar TODOS los .item por .first()
$('NombreNodo').first().json.campo
```

En lugar de:
```javascript
$('NombreNodo').item.json.campo
```

---

## ✅ Resumen de Cambios

**Cambios necesarios:**
1. `$('Webhook').item` → `$('Webhook').first()`
2. `$('Obtener datos').item` → `$('Obtener datos').first()`
3. Todas las demás referencias `.item` → `.first()`

¡Con estos cambios deberían funcionar correctamente! 🎉

