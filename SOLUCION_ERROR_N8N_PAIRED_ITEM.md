# 🔧 Solución: Error "Paired item data unavailable" en N8N

## ❌ Error

```
Paired item data for item from node 'Combinar textos' is unavailable. 
Ensure 'Combinar textos' is providing the required output.

An expression here won't work because it uses .item and n8n can't figure out 
the matching item. You can either:

Add the missing information to the node 'Combinar textos'
Or use .first(), .last() or .all()[index] instead of .item
```

## 🔍 Causa del Error

Este error ocurre cuando:
1. El nodo **"Combinar textos"** no está pasando correctamente los metadatos (`pairedItem`) al siguiente nodo
2. El nodo **"Set"** está intentando usar `.item` pero N8N no puede rastrear de dónde viene el item
3. Hay un problema con cómo se están combinando o transformando los datos entre nodos

## ✅ Soluciones

### Solución 1: Usar `.first()`, `.last()` o `.all()[index]` (Rápida)

En el nodo **"Set"**, en lugar de usar `.item`, usa uno de estos:

**Opción A: Primer item**
```javascript
{{ $json.first() }}
```

**Opción B: Último item**
```javascript
{{ $json.last() }}
```

**Opción C: Item específico por índice**
```javascript
{{ $json.all()[0] }}
// o
{{ $json.all()[1] }}
```

### Solución 2: Agregar "Keep Only Set Fields" en el nodo "Combinar textos"

1. Abre el nodo **"Combinar textos"**
2. Busca la opción **"Keep Only Set Fields"** o **"Mantener solo campos establecidos"**
3. **Desmárcala** (debe estar desactivada)
4. Esto permite que todos los campos pasen al siguiente nodo

### Solución 3: Verificar la Configuración del Nodo "Combinar textos"

**Configuración correcta:**

1. **Modo de combinación**: Asegúrate de que esté configurado correctamente
   - Si combinas arrays: usa "Merge" o "Append"
   - Si combinas objetos: usa "Merge"

2. **Output**: Verifica que el nodo esté generando output
   - Ejecuta el nodo solo y verifica que devuelva datos
   - Revisa la pestaña "Output" del nodo

### Solución 4: Agregar un Nodo Intermedio

Si el problema persiste, agrega un nodo intermedio:

```
Combinar textos → Code (transformación) → Set
```

**En el nodo Code:**
```javascript
// Asegurar que los datos tengan la estructura correcta
return items.map(item => {
  return {
    json: {
      ...item.json,
      // Agregar cualquier campo necesario
    },
    pairedItem: item.pairedItem || { item: 0 }
  };
});
```

### Solución 5: Usar "Merge" en lugar de "Set"

Si estás combinando datos, considera usar el nodo **"Merge"** en lugar de **"Set"**:

1. Elimina el nodo "Set" problemático
2. Agrega un nodo **"Merge"**
3. Configura el modo de merge según tus necesidades

### Solución 6: Revisar el Workflow Completo

**Checklist:**

1. ✅ ¿El nodo "Combinar textos" tiene datos de entrada?
2. ✅ ¿El nodo "Combinar textos" está generando output?
3. ✅ ¿Hay algún nodo entre "Combinar textos" y "Set" que pueda estar perdiendo datos?
4. ✅ ¿El nodo "Set" está configurado para recibir datos del nodo correcto?

## 📋 Pasos Detallados para Solucionar

### Paso 1: Verificar el Nodo "Combinar textos"

1. Ejecuta el workflow hasta el nodo "Combinar textos"
2. Revisa el **Output** del nodo
3. Verifica que tenga la estructura de datos esperada

### Paso 2: Modificar el Nodo "Set"

**En el campo que está causando el error:**

**Antes (causa error):**
```javascript
{{ $json.campo }}
// o
{{ $item.json.campo }}
```

**Después (solución):**
```javascript
{{ $json.first().campo }}
// o
{{ $json.all()[0].campo }}
```

### Paso 3: Probar el Workflow

1. Ejecuta el workflow completo
2. Verifica que no haya errores
3. Revisa los datos de salida

## 🎯 Solución Rápida (Copia y Pega)

Si estás en el nodo **"Set"** y ves el error:

1. **Encuentra el campo que usa `.item` o referencia directa**
2. **Cámbialo por:**
   ```javascript
   {{ $json.first().nombreDelCampo }}
   ```
3. **O si necesitas un item específico:**
   ```javascript
   {{ $json.all()[0].nombreDelCampo }}
   ```

## 💡 Prevención

Para evitar este error en el futuro:

1. **Usa siempre `.first()`, `.last()` o `.all()[index]`** cuando trabajes con datos combinados
2. **Verifica la salida de cada nodo** antes de conectarlo al siguiente
3. **Usa el nodo "Merge"** cuando necesites combinar datos de múltiples fuentes
4. **Mantén la opción "Keep Only Set Fields" desactivada** en nodos de transformación

## 🔍 Debugging

Si el error persiste:

1. **Ejecuta el workflow paso a paso:**
   - Ejecuta hasta "Combinar textos"
   - Verifica el output
   - Ejecuta el siguiente nodo
   - Identifica dónde se pierden los datos

2. **Revisa los logs de N8N:**
   - Ve a la pestaña "Executions"
   - Revisa la ejecución fallida
   - Examina los datos en cada nodo

3. **Simplifica el workflow:**
   - Elimina nodos intermedios temporalmente
   - Conecta "Combinar textos" directamente a "Set"
   - Si funciona, agrega nodos uno por uno

## ✅ Resumen

**Error**: N8N no puede rastrear el origen del item en el nodo "Set"

**Solución más común**:
```javascript
// Cambiar de:
{{ $json.campo }}

// A:
{{ $json.first().campo }}
```

**O usar**:
```javascript
{{ $json.all()[0].campo }}
```

¡Esto debería resolver el problema! 🎉

