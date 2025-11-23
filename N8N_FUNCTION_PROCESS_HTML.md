# Código Corregido para Nodo Function - Procesar HTML de OpenAI

Este es el código limpio y corregido para el nodo Function en N8N que procesa la respuesta de OpenAI y extrae el HTML.

## ⚙️ Configuración del Nodo en N8N

1. **Tipo de nodo**: Code (Function)
2. **Mode**: **"Run Once for Each Item"** (IMPORTANTE: esto asegura que retorne un objeto, no un array)
3. **Language**: JavaScript

## 📋 Código Completo

Copia y pega este código en el nodo Function de N8N:

```javascript
// ===== PROCESAR RESPUESTA DE OPENAI Y EXTRAER HTML =====

// Obtener datos del input (respuesta de OpenAI)
// Usar $input.item.json para "Run Once for Each Item"
const inputData = $input.item.json;

// Extraer respuesta de OpenAI (puede venir en diferentes formatos según el modelo)
let aiResponse = '';

// Intentar diferentes formatos de respuesta de OpenAI
if (inputData.candidates && inputData.candidates[0] && inputData.candidates[0].content && inputData.candidates[0].content.parts) {
  // Formato Gemini/Google AI
  aiResponse = inputData.candidates[0].content.parts[0].text || '';
} else if (inputData.choices && inputData.choices[0] && inputData.choices[0].message) {
  // Formato OpenAI estándar
  aiResponse = inputData.choices[0].message.content || '';
} else if (inputData.text) {
  // Formato alternativo
  aiResponse = inputData.text || '';
} else if (typeof inputData === 'string') {
  // Si viene directamente como string
  aiResponse = inputData;
} else {
  // Último recurso: convertir todo el objeto a string
  aiResponse = JSON.stringify(inputData);
}

// Limpiar prefijos comunes (como "json\n", markdown, etc.)
aiResponse = aiResponse.trim();

// Eliminar prefijos comunes de markdown/JSON
if (aiResponse.startsWith('json\n')) {
  aiResponse = aiResponse.substring(5).trim();
}

if (aiResponse.startsWith('```json')) {
  aiResponse = aiResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
}

if (aiResponse.startsWith('```')) {
  aiResponse = aiResponse.replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
}

// Intentar parsear como JSON
let jsonParsed = null;
try {
  jsonParsed = JSON.parse(aiResponse);
} catch (e) {
  // Si falla, intentar extraer JSON del string
  const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      jsonParsed = JSON.parse(jsonMatch[0]);
    } catch (e2) {
      console.warn('No se pudo parsear como JSON, intentando extraer HTML directo');
    }
  }
}

// Extraer HTML del campo 'analisis' si existe
let html = '';
if (jsonParsed && jsonParsed.analisis) {
  html = jsonParsed.analisis;
} else if (jsonParsed && jsonParsed.html) {
  html = jsonParsed.html;
} else if (!jsonParsed && (aiResponse.includes('<!DOCTYPE') || aiResponse.includes('<html'))) {
  // Si no es JSON pero parece HTML directo
  html = aiResponse;
} else {
  // Último recurso: usar toda la respuesta
  html = aiResponse;
}

// Limpiar caracteres de escape y caracteres raros
html = html.replace(/\\n/g, '\n');
html = html.replace(/\\t/g, '\t');
html = html.replace(/\\r/g, '\r');
html = html.replace(/\\"/g, '"');
html = html.replace(/\\'/g, "'");
html = html.replace(/\\\\/g, '\\');

// Remover caracteres de control no deseados (excepto saltos de línea y tabs)
html = html.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

// Limpiar espacios en blanco al inicio y final
html = html.trim();

// Validar que es HTML válido
if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
  console.warn('Advertencia: El HTML no tiene la estructura válida esperada');
  // Intentar encontrar el HTML dentro del string
  const htmlMatch = html.match(/<!DOCTYPE[\s\S]*<\/html>/i);
  if (htmlMatch) {
    html = htmlMatch[0];
  } else {
    throw new Error('Errores de validación del HTML: El HTML no tiene la estructura válida (debe empezar con <!DOCTYPE o <html)');
  }
}

// Obtener id_evaluacion del flujo (buscar en items anteriores)
let idEvaluacion = null;
try {
  // Obtener todos los items del flujo hasta este punto
  const allItems = $input.all();
  
  // Buscar id_evaluacion en los items anteriores
  for (let item of allItems) {
    // Buscar en body.id_evaluacion
    if (item.json.body && item.json.body.id_evaluacion) {
      idEvaluacion = item.json.body.id_evaluacion;
      break;
    }
    // Buscar en root id_evaluacion
    if (item.json.id_evaluacion) {
      idEvaluacion = item.json.id_evaluacion;
      break;
    }
    // Buscar en metadatos
    if (item.json.metadatos && item.json.metadatos.id_evaluacion) {
      idEvaluacion = item.json.metadatos.id_evaluacion;
      break;
    }
  }
} catch (e) {
  console.warn('No se pudo obtener id_evaluacion automáticamente:', e.message);
}

// Calcular puntuación
let puntuacion = null;

// Primero intentar obtener de la respuesta de la IA
if (jsonParsed && jsonParsed.puntuacion !== undefined && jsonParsed.puntuacion !== null) {
  puntuacion = parseFloat(jsonParsed.puntuacion);
  if (isNaN(puntuacion)) {
    puntuacion = null;
  }
}

// Si no viene de la IA, calcular basándose en las respuestas del webhook inicial
if (puntuacion === null) {
  try {
    const allItems = $input.all();
    let respuestas = null;
    let ponderaciones = null;
    
    // Estrategia 1: Buscar en items anteriores del flujo actual
    for (let item of allItems) {
      // Buscar en body.respuestas (estructura con body)
      if (item.json.body) {
        if (item.json.body.respuestas && !respuestas) {
          respuestas = item.json.body.respuestas;
        }
        if (item.json.body.metadatos && item.json.body.metadatos.ponderaciones && !ponderaciones) {
          ponderaciones = item.json.body.metadatos.ponderaciones;
        }
        // También buscar respuestas directamente en body
        if (item.json.body.body && item.json.body.body.respuestas && !respuestas) {
          respuestas = item.json.body.body.respuestas;
        }
      }
      
      // Buscar en root respuestas (estructura sin body)
      if (item.json.respuestas && !respuestas) {
        respuestas = item.json.respuestas;
      }
      if (item.json.metadatos && item.json.metadatos.ponderaciones && !ponderaciones) {
        ponderaciones = item.json.metadatos.ponderaciones;
      }
      
      // Buscar en nodos Set que pueden contener respuestas preservadas
      if (item.json.data && item.json.data.respuestas && !respuestas) {
        respuestas = item.json.data.respuestas;
      }
      
      // Buscar en campos de contexto que puedan mantener las respuestas
      if (item.json.context && item.json.context.respuestas && !respuestas) {
        respuestas = item.json.context.respuestas;
      }
    }
    
    // Estrategia 2: Intentar obtener de nodos anteriores usando $node
    // (solo funciona si los nodos anteriores preservaron las respuestas)
    if (!respuestas) {
      try {
        // Intentar obtener del nodo Set (si existe) que preserva datos
        const setData = $('Set').item.json;
        if (setData && setData.respuestas) {
          respuestas = setData.respuestas;
        }
        if (setData && setData.metadatos && setData.metadatos.ponderaciones && !ponderaciones) {
          ponderaciones = setData.metadatos.ponderaciones;
        }
      } catch (e) {
        // Nodo Set no existe o no tiene datos, continuar
      }
    }
    
    // Estrategia 3: Buscar en el nodo Webhook original
    if (!respuestas) {
      try {
        const webhookData = $('Webhook').item.json;
        if (webhookData && webhookData.body) {
          if (webhookData.body.respuestas && !respuestas) {
            respuestas = webhookData.body.respuestas;
          }
          if (webhookData.body.metadatos && webhookData.body.metadatos.ponderaciones && !ponderaciones) {
            ponderaciones = webhookData.body.metadatos.ponderaciones;
          }
        } else if (webhookData && webhookData.respuestas) {
          respuestas = webhookData.respuestas;
        }
      } catch (e) {
        // Nodo Webhook no existe o no tiene datos, continuar
      }
    }
    
    // Calcular puntuación si encontramos respuestas
    if (respuestas && typeof respuestas === 'object') {
      const valores = Object.values(respuestas);
      const valoresNumericos = valores.map(v => parseFloat(v)).filter(v => !isNaN(v));
      
      if (valoresNumericos.length > 0) {
        // Si tenemos ponderaciones, calcular puntuación ponderada
        if (ponderaciones && typeof ponderaciones === 'object') {
          // Mapear preguntas a categorías (simplificado - puede requerir ajuste según tu estructura)
          // Por ahora, calcular promedio simple si no hay mapeo de categorías específico
          const suma = valoresNumericos.reduce((acc, val) => acc + val, 0);
          puntuacion = (suma / valoresNumericos.length) * 100;
        } else {
          // Calcular promedio simple (las respuestas ya están en escala 0-1)
          const suma = valoresNumericos.reduce((acc, val) => acc + val, 0);
          puntuacion = (suma / valoresNumericos.length) * 100;
        }
        puntuacion = Math.round(puntuacion * 100) / 100; // Redondear a 2 decimales
        
        console.log('Puntuación calculada desde respuestas:', {
          totalRespuestas: valoresNumericos.length,
          promedio: suma / valoresNumericos.length,
          puntuacionFinal: puntuacion
        });
      } else {
        console.warn('No se encontraron valores numéricos válidos en las respuestas');
      }
    } else {
      console.warn('No se encontraron respuestas en el flujo. Verifica que el nodo Set preserve las respuestas cuando hay documentos.');
    }
  } catch (e) {
    console.error('Error al calcular la puntuación automáticamente:', e.message, e.stack);
  }
}

// Retornar resultado (IMPORTANTE: retornar objeto simple para "Run Once for Each Item")
return {
  html: html,
  id_evaluacion: idEvaluacion,
  timestamp: new Date().toISOString(),
  puntuacion: puntuacion,
  score: puntuacion, // Alias para compatibilidad
  recomendaciones: jsonParsed?.recomendaciones || null
};
```

## 🔧 Características del Código Corregido

1. ✅ **Usa `$input.item.json`** en lugar de `$input.first().json` (correcto para "Run Once for Each Item")
2. ✅ **Busca `id_evaluacion`** en todos los items anteriores del flujo
3. ✅ **Calcula puntuación** automáticamente si no viene de la IA
4. ✅ **Limpia caracteres raros** y escape sequences
5. ✅ **Valida estructura HTML** antes de retornar
6. ✅ **Retorna objeto simple** (no envuelto en `{json: {...}}`)
7. ✅ **Manejo de errores** robusto

## ⚠️ Notas Importantes

- **Mode del nodo**: Debe estar en **"Run Once for Each Item"** para que retorne un objeto, no un array
- **Acceso a datos**: Usa `$input.item.json` para acceder al item actual
- **Acceso a items anteriores**: Usa `$input.all()` para acceder a todos los items del flujo
- **Return**: Retorna un objeto simple, N8N lo envolverá automáticamente en el formato correcto

## 🔧 IMPORTANTE: Preservar Respuestas cuando hay Documentos

Cuando hay documentos, el flujo pasa por varios nodos (Split In Batches, Extract from File, Merge) y los datos originales pueden perderse. **DEBES asegurarte de que el nodo Set preserve las respuestas y metadatos**.

### Configuración del Nodo Set (antes de procesar documentos)

En el nodo Set que organiza los datos (Nodo 2), **asegúrate de incluir**:

```javascript
// En el nodo Set, incluir TODOS los campos necesarios:
{
  metadatos: {{ $json.body?.metadatos || $json.metadatos }},
  respuestas: {{ $json.body?.respuestas || $json.respuestas }},  // ⚠️ CRÍTICO: Preservar respuestas
  documentos: {{ $json.body?.documentos || $json.documentos }},
  id_evaluacion: {{ $json.body?.id_evaluacion || $json.id_evaluacion }},
  timestamp: {{ $json.body?.timestamp || $json.timestamp }},
  version: {{ $json.body?.version || $json.version }}
}
```

**O usando nodo Function antes del Set**:

```javascript
// Nodo Function antes del Set - Preservar TODOS los datos
const data = $input.item.json.body || $input.item.json;

return {
  json: {
    metadatos: data.metadatos || {},
    respuestas: data.respuestas || {},  // ⚠️ CRÍTICO: Preservar
    documentos: Array.isArray(data.documentos) ? data.documentos : [],
    id_evaluacion: data.id_evaluacion || null,
    timestamp: data.timestamp || new Date().toISOString(),
    version: data.version || '1.0'
  }
};
```

### Nodo Merge - Preservar Respuestas al Combinar Documentos

Cuando uses el nodo **Merge** para combinar textos de documentos, **asegúrate de incluir también las respuestas**:

**Configuración del Nodo Merge**:

```javascript
// Nodo Function ANTES del Merge - Preservar respuestas y metadatos
// Este nodo debe recibir el output del nodo Extract from File

const currentItem = $input.item.json;
const allItems = $input.all();

// Buscar respuestas y metadatos del nodo Set original
let respuestas = null;
let metadatos = null;
let idEvaluacion = null;

for (let item of allItems) {
  if (item.json.respuestas && !respuestas) {
    respuestas = item.json.respuestas;
  }
  if (item.json.metadatos && !metadatos) {
    metadatos = item.json.metadatos;
  }
  if (item.json.id_evaluacion && !idEvaluacion) {
    idEvaluacion = item.json.id_evaluacion;
  }
}

// Combinar textos de documentos
const textosDocumentos = allItems
  .filter(item => item.json.text || item.json.texto)
  .map(item => item.json.text || item.json.texto)
  .join('\n\n--- Documento siguiente ---\n\n');

return {
  json: {
    documentos_texto_combinado: textosDocumentos || "No se proporcionaron documentos",
    respuestas: respuestas || {},  // ⚠️ Preservar respuestas
    metadatos: metadatos || {},    // ⚠️ Preservar metadatos
    id_evaluacion: idEvaluacion,
    // ... otros campos necesarios
  }
};
```

O mejor aún, **usa el nodo Merge con todas las propiedades**:

**Nodo Merge - Mode: "Merge By Position"**:
- **Mode**: "Merge By Position"
- **Fields to Merge**: `["text", "texto", "respuestas", "metadatos", "id_evaluacion"]`

**Luego, un nodo Function después del Merge**:

```javascript
// Nodo Function DESPUÉS del Merge - Combinar textos y preservar respuestas
const allItems = $input.all();

// Combinar textos de documentos
const textosDocumentos = allItems
  .filter(item => item.json.text || item.json.texto)
  .map(item => item.json.text || item.json.texto)
  .join('\n\n--- Documento siguiente ---\n\n');

// Obtener respuestas y metadatos del primer item (que viene del Set)
const primerItem = allItems.find(item => item.json.respuestas) || allItems[0];

return {
  json: {
    documentos_texto_combinado: textosDocumentos || "No se proporcionaron documentos",
    respuestas: primerItem.json.respuestas || {},
    metadatos: primerItem.json.metadatos || {},
    id_evaluacion: primerItem.json.id_evaluacion || null,
    timestamp: primerItem.json.timestamp || new Date().toISOString(),
    version: primerItem.json.version || '1.0'
  }
};
```

## 🐛 Solución de Problemas

### Problema: La puntuación sale en `null` cuando hay documentos
**Causa**: Las respuestas no se están preservando a través del flujo cuando hay documentos.

**Solución**:
1. **Verifica el nodo Set**: Asegúrate de que preserve las `respuestas` y `metadatos`
2. **Verifica el nodo Merge**: Después de combinar textos de documentos, incluye también las respuestas
3. **Agrega un nodo Function después del Merge**: Que preserve respuestas, metadatos y combine textos
4. **Usa el código actualizado** del nodo Function que busca respuestas de múltiples maneras

**Código de depuración** (añádelo temporalmente en el nodo Function):

```javascript
// Al inicio del cálculo de puntuación, añadir:
console.log('=== DEBUG: Buscando respuestas ===');
console.log('Total items en flujo:', $input.all().length);
$input.all().forEach((item, index) => {
  console.log(`Item ${index}:`, {
    tieneBody: !!item.json.body,
    tieneRespuestas: !!item.json.respuestas,
    tieneBodyRespuestas: !!(item.json.body && item.json.body.respuestas),
    keys: Object.keys(item.json)
  });
});
```

### Problema: El nodo retorna un array `[{...}]` en lugar de un objeto `{...}`
**Solución**: Cambia el Mode del nodo a **"Run Once for Each Item"**

### Problema: No encuentra `id_evaluacion`
**Solución**: Verifica que en el nodo Webhook o Set anterior, el `id_evaluacion` esté en `body.id_evaluacion` o en el root del JSON

### Problema: El HTML tiene caracteres raros
**Solución**: El código ya limpia caracteres de escape, pero si persiste, verifica el formato de respuesta de OpenAI
