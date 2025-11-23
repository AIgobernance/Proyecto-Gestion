# Guía para Construir el Workflow de N8N

## 📋 Estructura de Datos que Recibe N8N

El sistema Laravel envía un JSON con la siguiente estructura. **⚠️ IMPORTANTE**: Dependiendo de la configuración del webhook de N8N, los datos pueden venir directamente o dentro de un campo `body`.

### Estructura Directa (Recomendada):

```json
{
  "metadatos": {
    "nombre_usuario": "Juan Pérez",
    "empresa": "Mi Empresa S.A.",
    "correo": "juan@empresa.com",
    "sector": "Industrial",
    "ponderaciones": {
      "ISO_27090_27091": 0.30,
      "ISO_23894": 0.12,
      "NIS2_AI_Act": 0.28,
      "ISO_42001_42005": 0.25,
      "CONPES_4144": 0.05
    },
    "prompt_ia": "Prompt personalizado para la IA (opcional)"
  },
  "respuestas": {
    "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?": 0.5,
    "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?": 1.0,
    "¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?": 0.25
  },
  "documentos": [
    {
      "nombre": "documento1.pdf",
      "indice": 1,
      "mime_type": "application/pdf",
      "contenido_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoK...",
      "ruta": "/storage/app/public/documentos/...",
      "url": "http://..."
    }
  ],
  "id_evaluacion": 123,
  "timestamp": "2025-11-16T23:00:00.000000Z",
  "version": "1.0"
}
```

### Estructura con Body (Alternativa):

Algunos webhooks de N8N pueden envolver los datos en un campo `body`:

```json
{
  "body": {
    "metadatos": {
      "nombre_usuario": "Juan Pérez",
      "empresa": "Mi Empresa S.A.",
      "correo": "juan@empresa.com",
      "sector": "Industrial",
      "ponderaciones": {
        "ISO_27090_27091": 0.30,
        "ISO_23894": 0.12,
        "NIS2_AI_Act": 0.28,
        "ISO_42001_42005": 0.25,
        "CONPES_4144": 0.05
      },
      "prompt_ia": "Prompt personalizado para la IA (opcional)"
    },
    "respuestas": {
      "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?": 0.5,
      "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?": 1.0,
      "¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?": 0.25
    },
    "documentos": [
      {
        "nombre": "documento1.pdf",
        "indice": 1,
        "mime_type": "application/pdf",
        "contenido_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoK...",
        "ruta": "/storage/app/public/documentos/...",
        "url": "http://..."
      }
    ],
    "id_evaluacion": 123,
    "timestamp": "2025-11-16T23:00:00.000000Z",
    "version": "1.0"
  }
}
```

**Nota**:

- Las respuestas vienen con el texto literal de la pregunta como clave y un valor numérico (0, 0.25, 0.5, o 1) como valor
- Los valores representan: 0 = 0% (peor opción), 0.25 = 0.25%, 0.5 = 0.5%, 1 = 1% (mejor opción)
- Puede haber hasta 30 preguntas en el objeto respuestas
- Puede haber hasta 3 documentos en el array
- El workflow de N8N debe manejar ambos casos automáticamente usando el código proporcionado en el **Nodo 2**

## 📤 Estructura de Datos que N8N Debe Retornar

N8N debe retornar un JSON con la siguiente estructura:

```json
{
  "puntuacion": 85.5,
  "score": 85.5,
  "pdf_path": "/ruta/al/archivo.pdf",
  "PDF_Path": "/ruta/al/archivo.pdf",
  "analisis": "...",
  "recomendaciones": []
}
```

**Nota**: Se aceptan tanto `puntuacion` como `score`, y tanto `pdf_path` como `PDF_Path` para compatibilidad.

---

## 🔧 Configuración del Workflow en N8N

### Paso 1: Crear Webhook Trigger

1. **Nodo: Webhook**
   - **Método**: POST
   - **Path**: `/evaluacion` (o el que prefieras)
   - **Response Mode**: "Respond When Last Node Finishes"
   - **Response Data**: "Last Node Output"

### Paso 2: Extraer Datos del Body

2. **Nodo: Set** (opcional, para organizar)

   **⚠️ IMPORTANTE**: N8N puede recibir los datos directamente o dentro de un campo `body`. Este nodo maneja ambos casos:

   - Extrae los campos principales del body o directamente del JSON:
     - Si los datos vienen en `body`: `$json.body.metadatos`, `$json.body.respuestas`, etc.
     - Si los datos vienen directamente: `$json.metadatos`, `$json.respuestas`, etc.

   **Valores a establecer** (maneja ambos casos automáticamente):

   ```
   metadatos = {{ $json.body?.metadatos || $json.metadatos }}
   respuestas = {{ $json.body?.respuestas || $json.respuestas }}
   documentos = {{ $json.body?.documentos || $json.documentos }}
   id_evaluacion = {{ $json.body?.id_evaluacion || $json.id_evaluacion }}
   timestamp = {{ $json.body?.timestamp || $json.timestamp }}
   version = {{ $json.body?.version || $json.version }}
   ```

   **Alternativa usando Function Node** (más robusto):

   ```javascript
   // Extraer datos del body si existe, sino usar directamente
   const data = $input.item.json.body || $input.item.json;

   return {
     json: {
       metadatos: data.metadatos || {},
       respuestas: data.respuestas || {},
       documentos: data.documentos || [],
       id_evaluacion: data.id_evaluacion || null,
       timestamp: data.timestamp || new Date().toISOString(),
       version: data.version || '1.0'
     }
   };
   ```

### Paso 3: Procesar Documentos (si existen)

3. **Nodo: IF** - Verificar si hay documentos

   - **Condition**: `{{ $json.documentos && $json.documentos.length > 0 }}`
   - **True Path**: Procesar documentos
   - **False Path**: Saltar al procesamiento de respuestas
4. **Nodo: Split In Batches** (si hay múltiples documentos)

   - Divide el array de documentos para procesarlos uno por uno
5. **Nodo: Function** - Decodificar Base64 a Buffer

   ```javascript
   // Decodificar contenido base64 a buffer para procesamiento
   const base64Content = $input.item.json.contenido_base64;
   const buffer = Buffer.from(base64Content, 'base64');

   return {
     json: {
       ...$input.item.json,
       documento_buffer: buffer,
       documento_nombre: $input.item.json.nombre
     }
   };
   ```
6. **Nodo: Extract from File** (opcional)

   - Si necesitas extraer texto de los PDFs
   - **File Property**: `documento_buffer`
   - **Options**: Extract text, metadata, etc.

### Paso 4: Preparar Datos para IA

7. **Nodo: Set** - Preparar prompt para IA

   - Combina:
     - Metadatos del usuario
     - Respuestas formateadas
     - Texto extraído de documentos (si aplica)
     - Prompt personalizado

   **Ejemplo de estructura**:

   ```json
   {
     "system_prompt": "Eres un experto en gobernanza de IA...",
     "user_prompt": "{{ $json.metadatos.prompt_ia }}",
     "context": {
       "usuario": "{{ $json.metadatos.nombre_usuario }}",
       "empresa": "{{ $json.metadatos.empresa }}",
       "respuestas": "{{ JSON.stringify($json.respuestas) }}",
       "documentos_texto": "{{ documentos_texto_extraido }}"
     }
   }
   ```

### Paso 5: Llamar a la IA (OpenAI, Anthropic, etc.)

8. **Nodo: OpenAI** (o el proveedor de IA que uses)
   - **Model**: `gpt-4` o `gpt-3.5-turbo`
   - **Messages**:
     ```json
     [
       {
         "role": "system",
         "content": "{{ $json.system_prompt }}"
       },
       {
         "role": "user",
         "content": "{{ $json.user_prompt }}\n\nContexto:\n{{ JSON.stringify($json.context) }}"
       }
     ]
     ```
   - **Temperature**: 0.7
   - **Max Tokens**: 2000

### Paso 6: Procesar Respuesta de la IA

9. **Nodo: Function** - Parsear respuesta de IA
   ```javascript
   const aiResponse = $input.item.json.choices[0].message.content;

   // Parsear JSON de la respuesta (si la IA retorna JSON)
   let resultados;
   try {
     resultados = JSON.parse(aiResponse);
   } catch (e) {
     // Si no es JSON, crear estructura manualmente
     resultados = {
       analisis: aiResponse,
       puntuacion: null
     };
   }

   // Calcular puntuación si no viene de la IA
   if (!resultados.puntuacion) {
     // Lógica para calcular puntuación basada en respuestas
     const respuestas = $('Set').item.json.respuestas;
     const totalPreguntas = Object.keys(respuestas).length;
     // ... lógica de cálculo
     resultados.puntuacion = 85.5; // ejemplo
   }

   return {
     json: {
       ...resultados,
       id_evaluacion: $('Set').item.json.id_evaluacion
     }
   };
   ```

### Paso 7: Generar PDF (Opcional)

10. **Nodo: HTML to PDF** (si necesitas generar PDF)

    - **HTML**: Template HTML con los resultados
    - **Options**: Configurar tamaño, márgenes, etc.
11. **Nodo: Save to File** (si guardas PDF localmente)

    - **File Name**: `evaluacion_{{ $json.id_evaluacion }}.pdf`
    - **File Path**: `/ruta/donde/guardar/`
12. **Nodo: HTTP Request** (si subes PDF a servidor)

    - **Method**: POST
    - **URL**: `http://tu-servidor-laravel/api/evaluation/upload-pdf`
    - **Body**: Form-data con el archivo PDF

### Paso 8: Formatear Respuesta Final

13. **Nodo: Set** - Preparar respuesta para Laravel
    ```json
    {
      "puntuacion": "{{ $json.puntuacion }}",
      "pdf_path": "{{ $json.pdf_path }}",
      "analisis": "{{ $json.analisis }}",
      "recomendaciones": "{{ JSON.stringify($json.recomendaciones) }}",
      "timestamp": "{{ $now }}"
    }
    ```

### Paso 9: Responder al Webhook

14. **Nodo: Respond to Webhook**
    - **Response Body**: `{{ $json }}`
    - **Response Code**: 200

---

## 🔗 Diagrama del Workflow

```
[1. Webhook] 
    ↓
[2. Set - Extraer Datos]
    ↓
[3. IF - ¿Hay documentos?]
    ├─→ SÍ → [4. Split In Batches]
    │          ↓
    │      [5. Function - Decodificar Base64]
    │          ↓
    │      [6. Extract from File - Extraer Texto PDF]
    │          ↓
    │      [7. Merge - Combinar Textos]
    │          ↓
    └─→ NO → [8. Set - Preparar Prompt para IA]
                ↓
        [9. OpenAI - Procesar con IA]
                ↓
        [10. Function - Parsear Respuesta y Calcular Puntuación]
                ↓
        [11. HTML to PDF - Generar PDF de Resultados]
                ↓
        [12. HTTP Request - Subir PDF a Laravel] (opcional)
                ↓
        [13. Set - Formatear Respuesta Final]
                ↓
        [14. Respond to Webhook]
```

---

## 📋 Configuración Detallada Nodo por Nodo

### Nodo 1: Webhook (Trigger)

**Configuración**:

- **HTTP Method**: POST
- **Path**: `evaluacion` (o el que prefieras, ej: `evaluacion-governanza`)
- **Response Mode**: "Respond When Last Node Finishes"
- **Response Data**: "Last Node Output"
- **Response Code**: 200

**Nota**: Copia la URL del webhook y configúrala en tu `.env` como `N8N_WEBHOOK_URL`

---

### Nodo 2: Set - Extraer y Organizar Datos

**Configuración**:

- **Keep Only Set Fields**: Desactivado
- **Values to Set**:

**⚠️ IMPORTANTE**: Este nodo maneja ambos casos: cuando los datos vienen en `body` y cuando vienen directamente.

```
metadatos = {{ $json.body?.metadatos || $json.metadatos }}
respuestas = {{ $json.body?.respuestas || $json.respuestas }}
documentos = {{ $json.body?.documentos || $json.documentos }}
id_evaluacion = {{ $json.body?.id_evaluacion || $json.id_evaluacion }}
timestamp = {{ $json.body?.timestamp || $json.timestamp }}
version = {{ $json.body?.version || $json.version }}
prompt_personalizado = {{ ($json.body?.metadatos || $json.metadatos)?.prompt_ia || '' }}
```

**Alternativa usando Function Node** (recomendado para mayor robustez):

1. Agrega un nodo **"Code"** o **"Function"** después del Webhook
2. Configura el lenguaje como **JavaScript**
3. Usa este código:

```javascript
// Extraer datos del body si existe, sino usar directamente del JSON
const inputData = $input.item.json;
const data = inputData.body || inputData;

// Validar que tenemos los datos necesarios
if (!data.metadatos || !data.respuestas) {
  throw new Error('Faltan datos requeridos: metadatos o respuestas');
}

// Retornar datos normalizados
return {
  json: {
    metadatos: data.metadatos || {},
    respuestas: data.respuestas || {},
    documentos: Array.isArray(data.documentos) ? data.documentos : [],
    id_evaluacion: data.id_evaluacion || null,
    timestamp: data.timestamp || new Date().toISOString(),
    version: data.version || '1.0',
    prompt_personalizado: data.metadatos?.prompt_ia || ''
  }
};
```

Esta alternativa es más robusta porque:

- ✅ Maneja ambos casos (con y sin `body`)
- ✅ Valida que los datos necesarios estén presentes
- ✅ Normaliza el formato de documentos (siempre array)
- ✅ Proporciona valores por defecto seguros

---

### Nodo 3: IF - Verificar si hay Documentos

**Configuración**:

- **Condition**: Boolean
- **Value 1**: `={{ $json.documentos && $json.documentos.length > 0 }}`
- **Operation**: `true`

**True Output**: Hay documentos → Continúa al nodo 4
**False Output**: No hay documentos → Salta al nodo 8

---

### Nodo 4: Split In Batches / Loop Over Items (Solo si hay documentos)

**Nota**: En versiones más recientes de N8N, este nodo puede llamarse "Loop Over Items". Ambos funcionan de manera similar.

**Configuración Paso a Paso**:

1. **Agregar el nodo**:

   - Busca "Split In Batches" o "Loop Over Items" en el panel de nodos
   - Agrégalo después del nodo IF
2. **Conectar el nodo**:

   - Conecta la salida "True" del nodo IF al nodo Split In Batches
   - El nodo recibirá el array `documentos` desde el nodo anterior
3. **Configurar el nodo "Split In Batches"**:

   - **Field To Split Out**: `documentos` o `={{ $json.documentos }}`
   - **Batch Size**: `1` (procesar un documento a la vez)
   - **Options**:
     - **Reset**: `false` (no resetear entre ejecuciones)
     - **Reset On Error**: `false` (opcional)
4. **Configurar el nodo "Loop Over Items"** (si usas esta versión):

   - **Mode**: "Run Once for Each Item"
   - **Items**: `={{ $json.documentos }}` o `documentos`
   - **Options**:
     - **Reset**: `false`

**Explicación**:

- Este nodo toma el array de documentos (`documentos`) que viene del webhook
- Divide el array en batches (lotes) de tamaño 1, procesando un documento a la vez
- Cada documento se enviará individualmente al siguiente nodo
- Después de procesar todos los documentos, enviará una señal de "done" (completado)

**Ejemplo de Input**:

```json
{
  "documentos": [
    {
      "nombre": "documento1.pdf",
      "contenido_base64": "...",
      ...
    },
    {
      "nombre": "documento2.pdf",
      "contenido_base64": "...",
      ...
    }
  ]
}
```

**Ejemplo de Output (por cada iteración)**:

```json
{
  "nombre": "documento1.pdf",
  "contenido_base64": "...",
  ...
}
```

**Salidas del nodo**:

- **"output"** o **"loop"**: Cada documento individual (conectar al Nodo 5: Function)
- **"done"**: Señal cuando todos los documentos han sido procesados (conectar al Nodo 7: Merge)

---

## 📍 Diagrama de Conexión de los Nodos 4, 5 y 6

```
[3. IF - ¿Hay documentos?]
    │
    ├─→ TRUE → [4. Split In Batches / Loop Over Items]
    │              │
    │              ├─→ [output/loop] → [5. Function - Decodificar Base64]
    │              │                      │
    │              │                      ↓
    │              │                  [6. Extract from File]
    │              │                      │
    │              │                      ↓
    │              │                  (vuelve al loop para siguiente documento)
    │              │
    │              └─→ [done] → [7. Merge - Combinar Textos]
    │                              │
    │                              ↓
    └─→ FALSE → [8. Set - Preparar Prompt para IA]
                    │
                    ↓
                [9. OpenAI - Procesar con IA]
```

**Flujo detallado**:

1. **Split In Batches** recibe: `[{doc1}, {doc2}, {doc3}]`
2. **Split In Batches** envía a Function: `{doc1}` (primera iteración)
3. **Function** decodifica base64 → `{doc1 con buffer}`
4. **Extract from File** extrae texto → `{doc1 con text: "..."}`
5. El loop continúa con `{doc2}`, luego `{doc3}`
6. Cuando termina, **Split In Batches** emite señal "done"
7. **Merge** recibe todos los textos extraídos y los combina

---

### Nodo 5: Function - Decodificar Base64 a Buffer

**Ubicación en el workflow**:

- Va **DESPUÉS** del nodo "Split In Batches" / "Loop Over Items"
- Conecta la salida **"output"** o **"loop"** del nodo Split In Batches a este nodo Function
- Este nodo procesa **cada documento individualmente** (uno por iteración)

**Paso 1: Agregar el nodo Function**

1. Agrega un nodo **"Code"** o **"Function"** desde el panel de nodos
2. Conéctalo después del nodo Split In Batches

**Paso 2: Configurar el nodo**

- **Mode**: "Run Once for Each Item" (si está disponible)
- **Language**: JavaScript

**Paso 3: Código JavaScript** (ACTUALIZADO Y CORREGIDO):

**Versión Principal** (Recomendada):

```javascript
// Decodificar contenido base64 a buffer para procesamiento
const documento = $input.item.json;

// Validar que el documento tiene contenido_base64
if (!documento.contenido_base64) {
  throw new Error('No se encontró contenido_base64 en el documento. Nombre: ' + (documento.nombre || 'desconocido'));
}

// Validar que contenido_base64 es una cadena válida
if (typeof documento.contenido_base64 !== 'string') {
  throw new Error('contenido_base64 debe ser una cadena de texto. Tipo recibido: ' + typeof documento.contenido_base64);
}

// Decodificar base64 a buffer
let buffer = null;
try {
  // El contenido ya viene en base64, solo necesitamos convertirlo a Buffer
  buffer = Buffer.from(documento.contenido_base64, 'base64');
  
  // Validar que el buffer se creó correctamente
  if (!buffer || buffer.length === 0) {
    throw new Error('El buffer resultante está vacío');
  }
  
  console.log('Buffer creado exitosamente:', {
    tamaño_bytes: buffer.length,
    nombre_documento: documento.nombre
  });
} catch (e) {
  console.error('Error decodificando base64:', e);
  throw new Error('No se pudo decodificar el contenido base64 del documento: ' + e.message);
}

// En N8N, los datos binarios deben ir en 'binary', no en 'json'
// El formato correcto para N8N es: { data: base64String, mimeType: string, fileName: string }
const result = {
  json: {
    nombre: documento.nombre || 'documento.pdf',
    indice: documento.indice || 0,
    mime_type: documento.mime_type || 'application/pdf',
    documento_nombre: documento.nombre || 'documento.pdf',
    tiene_contenido: true,
    // Mantener otros campos del documento original
    ruta: documento.ruta || null,
    url: documento.url || null
  },
  binary: {
    documento_buffer: {
      data: buffer.toString('base64'), // Convertir buffer a base64 string para N8N
      mimeType: documento.mime_type || 'application/pdf',
      fileName: documento.nombre || 'documento.pdf'
    }
  }
};

return result;
```

**⚠️ IMPORTANTE - Verificación**:

Después de ejecutar este nodo, verifica en el OUTPUT que veas:

- ✅ Un objeto `binary` con la propiedad `documento_buffer`
- ✅ Dentro de `documento_buffer` debe haber: `data`, `mimeType`, `fileName`
- ✅ El campo `data` debe ser una cadena base64 (muy larga)
- ✅ El campo `json` debe contener los metadatos del documento

**Si NO ves el objeto `binary` en el output**, el problema está en el código. Prueba esta versión alternativa simplificada:

```javascript
// Versión alternativa simplificada
const documento = $input.item.json;

if (!documento.contenido_base64) {
  throw new Error('No se encontró contenido_base64 en el documento');
}

// Decodificar base64 directamente
const buffer = Buffer.from(documento.contenido_base64, 'base64');

// Crear el objeto de retorno con binary
const result = {
  json: {
    nombre: documento.nombre,
    indice: documento.indice,
    mime_type: documento.mime_type,
    documento_nombre: documento.nombre,
    tiene_contenido: true
  },
  binary: {}
};

// Agregar el buffer como binary data
result.binary.documento_buffer = {
  data: buffer.toString('base64'),
  mimeType: documento.mime_type || 'application/pdf',
  fileName: documento.nombre || 'documento.pdf'
};

return result;
```

**Explicación del código**:

- `$input.item.json` obtiene el documento individual que viene del Split In Batches
- `documento.contenido_base64` es el contenido del PDF codificado en base64
- `Buffer.from()` convierte el base64 a un buffer binario
- Se agrega `documento_buffer` al objeto para usarlo en el siguiente nodo

**Input esperado** (por cada iteración):

```json
{
  "nombre": "documento1.pdf",
  "indice": 1,
  "mime_type": "application/pdf",
  "contenido_base64": "JVBERi0xLjQKJeLjz9MK...",
  "ruta": "/storage/...",
  "url": "http://..."
}
```

**Output generado**:

```json
{
  "nombre": "documento1.pdf",
  "indice": 1,
  "mime_type": "application/pdf",
  "contenido_base64": "JVBERi0xLjQKJeLjz9MK...",
  "ruta": "/storage/...",
  "url": "http://...",
  "documento_buffer": <Buffer object>,
  "documento_nombre": "documento1.pdf",
  "tiene_contenido": true
}
```

---

### Nodo 6: Extract from File (Extraer Texto de PDF)

**Ubicación en el workflow**:

- Va **DESPUÉS** del nodo Function (Decodificar Base64)
- Conecta la salida del nodo Function a este nodo Extract from File
- Este nodo extrae el texto de cada PDF procesado

**Paso 1: Agregar el nodo**

1. Busca **"Extract from File"** en el panel de nodos
2. Conéctalo después del nodo Function

**Paso 2: Seleccionar la Acción**
En la pantalla que muestra las acciones disponibles, selecciona:

```
✅ Extract from PDF
```

**No selecciones** las otras opciones como CSV, HTML, JSON, etc. Solo necesitas "Extract from PDF" para este proyecto.

**Paso 3: Configurar el nodo Extract from PDF**

**⚠️ IMPORTANTE - Configuración correcta**:

En N8N, los datos binarios están en `binary`, NO en `json`.

**Opción 1 - Simple (RECOMENDADO - Prueba primero)**:

- **Input Binary Field**:
  ```
  documento_buffer
  ```

  (Solo el nombre, SIN llaves, SIN expresión, SIN `$`)

**Opción 2 - Con expresión**:

- **Input Binary Field**:
  ```
  ={{ $binary.documento_buffer }}
  ```

**Opción 3 - Referencia al nodo anterior**:

- **Input Binary Field**:
  ```
  ={{ $('Code').item.binary.documento_buffer }}
  ```

  (Reemplaza `'Code'` con el nombre exacto de tu nodo Function)

**❌ NO uses**:

- `{{ $json.documento_buffer }}` ❌ (esto causa el error)
- `$json.documento_buffer` ❌ (sin llaves también falla)
- `documento_buffer` dentro de `json` ❌ (debe estar en `binary`)

**Verificación**:

1. Primero ejecuta el nodo Function y verifica que en el OUTPUT aparezca:

   ```
   binary:
     documento_buffer:
       data: "JVBERi0xLjQK..."
       mimeType: "application/pdf"
       fileName: "documento.pdf"
   ```
2. Si ves `binary.documento_buffer`, entonces en Extract from File usa solo: `documento_buffer`

**Options (Opciones)**:

1. **Extract Data From**:

   - Selecciona **"Text"** (o "Texto") para extraer texto del PDF
2. **PDF Options** (Opciones de PDF):

   - ✓ **Extract text**: Marcar esta opción (principal)
   - ✓ **Extract metadata**: Opcional, si necesitas metadatos del PDF (páginas, título, autor, etc.)
   - **Language**: Dejar en blanco o seleccionar el idioma si es necesario
3. **Additional Options** (Opciones adicionales):

   - **Encoding**: UTF-8 (por defecto, mantener así)
   - **Remove Empty Lines**: Opcional (puedes marcarla para limpiar líneas vacías)

**Configuración detallada paso a paso**:

1. **Input Binary Field / Property Name**:

   ```
   documento_buffer
   ```

   **O mejor, usa expresión explícita**:

   ```
   ={{ $binary.documento_buffer }}
   ```

   **O referencia el nodo anterior directamente**:

   ```
   ={{ $('Code').item.binary.documento_buffer }}
   ```

   ⚠️ **NOTA**: Reemplaza `'Code'` con el nombre real de tu nodo Function. Por ejemplo, si tu nodo se llama "Decodificar Base64", usa:

   ```
   ={{ $('Decodificar Base64').item.binary.documento_buffer }}
   ```
2. **Extract Data From**:

   - Selecciona **"Text"** para extraer texto del PDF
3. **Additional Options** (si están disponibles):

   - **Encoding**: UTF-8 (por defecto)
   - **Remove Empty Lines**: Opcional (marcar si quieres limpiar líneas vacías)

**Output esperado**:

```json
{
  "json": {
    "text": "Texto extraído del PDF...\nContenido del documento...",
    "metadata": {
      "pages": 3,
      "title": "Título del PDF",
      "author": "Autor"
    },
    "nombre": "documento1.pdf",
    "documento_nombre": "documento1.pdf",
    "tiene_contenido": true
  },
  "binary": {
    "documento_buffer": {
      "data": "...",
      "mimeType": "application/pdf",
      "fileName": "documento1.pdf"
    }
  }
}
```

**Cómo solucionar el error "Provided parameter is not a string or binary data object"**:

Si ves este error, significa que:

1. ❌ Estás usando `{{ $json.documento_buffer }}` (incorrecto)
2. ✅ Debes usar `documento_buffer` directamente (sin expresión)
3. ✅ O usar `={{ $binary.documento_buffer }}`
4. ✅ O usar `={{ $('NombreNodo').item.binary.documento_buffer }}`

**Prueba en este orden**:

1. Primero intenta solo: `documento_buffer` (sin llaves, sin expresión)
2. Si no funciona, usa: `={{ $binary.documento_buffer }}`
3. Si aún no funciona, usa: `={{ $('Code').item.binary.documento_buffer }}` (reemplaza 'Code' con el nombre de tu nodo)

**Nota importante**:

- Este nodo es **opcional**. Solo úsalo si necesitas extraer el texto de los PDFs para enviarlo a la IA
- Si los PDFs son imágenes escaneadas sin texto seleccionable, este nodo no funcionará correctamente
- En ese caso, podrías necesitar OCR (Reconocimiento Óptico de Caracteres) con un nodo adicional

---

### Nodo 7: Merge - Combinar Textos de Documentos

**Configuración**:

- **Mode**: "Merge Multiple Outputs"
- **Merge By Fields**: `id_evaluacion` (o un campo común)
- **Options**:
  - **Keep Key Matches**: true

**Function Node** (alternativa si Merge no funciona bien):

```javascript
// Combinar todos los textos extraídos
const textos = $input.all().map(item => {
  return item.json.text || '';
}).filter(text => text.length > 0);

return {
  json: {
    documentos_texto_combinado: textos.join('\n\n---\n\n'),
    total_documentos: textos.length
  }
};
```

---

### Nodo 8: Set (Edit Fields1) - Preparar Prompt para IA

**⚠️ IMPORTANTE**: Este nodo debe recibir conexiones desde:

- **Caso CON documentos**: Desde el nodo Function que combina textos (`Code in JavaScript1`)
- **Caso SIN documentos**: Directamente desde la rama FALSE del nodo IF

**Configuración**:

```
system_prompt = Eres un experto en gobernanza de IA. Analiza las respuestas de la evaluación y proporciona:
  1. Una puntuación del 0 al 100
  2. Un análisis detallado
  3. Recomendaciones específicas

  Responde en formato JSON con las claves: puntuacion, analisis, recomendaciones.

user_context = {{ 'Usuario: ' + $json.metadatos.nombre_usuario + '\nEmpresa: ' + $json.metadatos.empresa + '\nCorreo: ' + $json.metadatos.correo + '\nSector: ' + ($json.metadatos.sector || 'N/A') }}

respuestas_texto = {{ JSON.stringify($json.respuestas, null, 2) }}

documentos_texto = {{ 
  $json.documentos_texto_combinado || 
  'No se proporcionaron documentos para análisis'
}}

ponderaciones = {{ JSON.stringify($json.metadatos.ponderaciones || {}, null, 2) }}

prompt_personalizado = {{ $json.metadatos.prompt_ia || 'Analiza esta evaluación de gobernanza de IA' }}

full_prompt = {{ $json.user_context + '\n\nSector de la empresa y ponderaciones:\n' + $json.ponderaciones + '\n\nRespuestas de la evaluación:\n' + $json.respuestas_texto + '\n\nDocumentos adjuntos:\n' + $json.documentos_texto + '\n\nPrompt personalizado: ' + $json.prompt_personalizado }}

id_evaluacion = {{ $json.id_evaluacion || $('Set').item.json.id_evaluacion || null }}
```

**Nota**: El campo `documentos_texto` maneja ambos casos:

- **Con documentos**: Obtiene el texto combinado del nodo que procesa documentos
- **Sin documentos**: Retorna "No se proporcionaron documentos para análisis"

---

### Nodo 9: OpenAI - Procesar con IA

**Configuración**:

- **Resource**: Chat
- **Operation**: Create Chat Completion
- **Model**: `gpt-4` o `gpt-3.5-turbo`
- **Messages**:
  ```json
  [
    {
      "role": "system",
      "content": "={{ $json.system_prompt }}"
    },
    {
      "role": "user",
      "content": "={{ $json.full_prompt }}"
    }
  ]
  ```
- **Options**:
  - **Temperature**: 0.7
  - **Max Tokens**: 2000
  - **Response Format**: JSON Object (si el modelo lo soporta)

---

### Nodo 10: Function - Parsear Respuesta y Calcular

**Código JavaScript**:

```javascript
// Obtener respuesta de la IA
const aiResponse = $input.item.json.choices[0].message.content;
let resultados = {};

try {
  // Intentar parsear como JSON
  resultados = JSON.parse(aiResponse);
} catch (e) {
  // Si no es JSON, extraer información manualmente
  console.log('Respuesta no es JSON, parseando manualmente');
  
  // Buscar puntuación en el texto
  const puntuacionMatch = aiResponse.match(/puntuaci[oó]n[:\s]+(\d+(?:\.\d+)?)/i);
  const scoreMatch = aiResponse.match(/score[:\s]+(\d+(?:\.\d+)?)/i);
  
  resultados = {
    analisis: aiResponse,
    puntuacion: puntuacionMatch ? parseFloat(puntuacionMatch[1]) : (scoreMatch ? parseFloat(scoreMatch[1]) : null),
    recomendaciones: []
  };
}

// Si no hay puntuación, calcularla basándose en respuestas
if (!resultados.puntuacion && resultados.puntuacion !== 0) {
  const respuestas = $('Set').item.json.respuestas;
  const totalPreguntas = Object.keys(respuestas).length;
  
  // Lógica de cálculo simple (puedes mejorarla)
  // Asume que cada respuesta correcta vale 100/totalPreguntas
  // Aquí puedes implementar tu propia lógica de scoring
  resultados.puntuacion = 75.0; // Valor por defecto
}

// Asegurar que recomendaciones sea un array
if (!Array.isArray(resultados.recomendaciones)) {
  resultados.recomendaciones = [];
}

// Agregar ID de evaluación
resultados.id_evaluacion = $('Set').item.json.id_evaluacion;

// Agregar timestamp
resultados.timestamp = new Date().toISOString();

return {
  json: resultados
};
```

---

### Nodo 11: HTML to PDF (Opcional - Generar PDF)

**Configuración**:

- **HTML**: Template HTML con los resultados
- **Options**:
  - **Format**: A4
  - **Margin**:
    - Top: 20mm
    - Right: 20mm
    - Bottom: 20mm
    - Left: 20mm

**Template HTML de Ejemplo**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #4d82bc; }
    .puntuacion { font-size: 48px; font-weight: bold; color: #129c55; }
    .analisis { margin: 20px 0; line-height: 1.6; }
    .recomendaciones { margin-top: 30px; }
    .recomendacion { margin: 10px 0; padding: 10px; background: #f8f9fa; }
  </style>
</head>
<body>
  <h1>Resultados de Evaluación de Gobernanza de IA</h1>
  <div class="puntuacion">Puntuación: {{ $json.puntuacion }}/100</div>
  <div class="analisis">
    <h2>Análisis</h2>
    <p>{{ $json.analisis }}</p>
  </div>
  <div class="recomendaciones">
    <h2>Recomendaciones</h2>
    {{#each $json.recomendaciones}}
    <div class="recomendacion">{{this}}</div>
    {{/each}}
  </div>
</body>
</html>
```

---

### Nodo 12: HTTP Request - Subir PDF a Laravel (Opcional)

**Configuración**:

- **Method**: POST
- **URL**: `http://tu-servidor-laravel/api/evaluation/upload-pdf`
- **Authentication**: Bearer Token (si aplica)
- **Body Content Type**: Form-Data
- **Body Parameters**:
  - `id_evaluacion`: `={{ $json.id_evaluacion }}`
  - `pdf`: (File) `={{ $binary.data }}`

**Nota**: Este nodo es opcional. Si no subes el PDF, puedes retornar solo la ruta donde se guardó localmente.

---

### Nodo 13: Set - Formatear Respuesta Final

**Configuración**:

```
puntuacion = {{ $json.puntuacion }}
score = {{ $json.puntuacion }} (alias para compatibilidad)
analisis = {{ $json.analisis }}
recomendaciones = {{ JSON.stringify($json.recomendaciones) }}
pdf_path = {{ $json.pdf_path || '/ruta/local/evaluacion_' + $json.id_evaluacion + '.pdf' }}
PDF_Path = {{ $json.pdf_path || '/ruta/local/evaluacion_' + $json.id_evaluacion + '.pdf' }} (alias)
```

---

### Nodo 14: Respond to Webhook

**Configuración**:

- **Respond With**: JSON
- **Response Body**: `={{ $json }}`
- **Response Code**: 200
- **Response Headers**:
  - `Content-Type`: `application/json`

---

## 🔄 Manejo de Errores

### Agregar Nodo de Error Handling

Después del nodo 9 (OpenAI), agrega un nodo **Catch**:

**Nodo: Catch**

- Captura errores de cualquier nodo anterior
- **On Error**: Continúa con el workflow

**Nodo: Set - Formato de Error**

```json
{
  "error": "Error al procesar evaluación",
  "message": "={{ $json.error.message }}",
  "id_evaluacion": "={{ $('Set').item.json.id_evaluacion }}"
}
```

**Nodo: Respond to Webhook (Error)**

- **Response Code**: 500
- **Response Body**: `={{ $json }}`

---

## 🧪 Ejemplo de Datos de Prueba

Puedes usar este JSON para probar el workflow:

```json
{
  "metadatos": {
    "nombre_usuario": "Juan Pérez",
    "empresa": "Tech Solutions S.A.",
    "correo": "juan@techsolutions.com",
    "sector": "Servicios",
    "ponderaciones": {
      "ISO_27090_27091": 0.20,
      "ISO_23894": 0.25,
      "NIS2_AI_Act": 0.35,
      "ISO_42001_42005": 0.15,
      "CONPES_4144": 0.05
    },
    "prompt_ia": "Analiza esta evaluación enfocándote en aspectos de seguridad y privacidad"
  },
  "respuestas": {
    "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?": 0.5,
    "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?": 1.0,
    "¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?": 0.75,
    "¿La empresa tiene un protocolo para notificar incidentes relacionados con IA (fallos, ciberataques, errores de decisión)?": 0.5,
    "¿Existen roles definidos para la supervisión ética y legal del uso de IA?": 0.25
  },
  "documentos": [
    {
      "nombre": "politica_gobernanza.pdf",
      "indice": 1,
      "mime_type": "application/pdf",
      "contenido_base64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL1Jlc291cmNlczw8L1Byb2NTZXQgWy9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUldPj4vTWVkaWFCb3hbMCAwIDYxMiA3OTJdL0NvbnRlbnRzIDQgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDU+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggND4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago=",
      "ruta": "/storage/app/public/documentos/politica_gobernanza.pdf",
      "url": null
    }
  ],
  "id_evaluacion": 123,
  "timestamp": "2025-11-16T23:00:00.000000Z",
  "version": "1.0"
}
```

---

## 📊 Flujo Alternativo Simplificado (Sin Documentos)

Si no necesitas procesar documentos, puedes simplificar el workflow:

```
[Webhook] 
    ↓
[Set - Extraer Datos]
    ↓
[Set - Preparar Prompt]
    ↓
[OpenAI]
    ↓
[Function - Parsear]
    ↓
[Set - Formatear]
    ↓
[Respond to Webhook]
```

---

## ✅ Checklist de Configuración

- [ ] Webhook creado y URL copiada
- [ ] URL configurada en `.env` como `N8N_WEBHOOK_URL`
- [ ] OpenAI API Key configurada en N8N
- [ ] Workflow probado con datos de ejemplo
- [ ] Manejo de errores implementado
- [ ] Timeout configurado (Laravel espera 120 segundos)
- [ ] Formato de respuesta verificado (debe incluir `puntuacion` o `score`)

---

## 🚀 Mejoras Futuras

1. **Procesamiento Asíncrono**: Usar colas de Laravel para no bloquear la respuesta
2. **Caché de Resultados**: Guardar resultados similares para evitar reprocesamiento
3. **Múltiples Modelos de IA**: Probar con diferentes modelos y comparar resultados
4. **Validación de Respuestas**: Validar formato JSON antes de retornar
5. **Logging**: Agregar logging detallado en cada nodo para debugging

---

## 📝 Ejemplo de Workflow Completo

### Nodo 1: Webhook

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "evaluacion",
    "responseMode": "lastNode"
  }
}
```

### Nodo 2: Set - Extraer Datos

```json
{
  "values": {
    "string": [
      {
        "name": "metadatos",
        "value": "={{ $json.metadatos }}"
      },
      {
        "name": "respuestas",
        "value": "={{ $json.respuestas }}"
      },
      {
        "name": "documentos",
        "value": "={{ $json.documentos }}"
      },
      {
        "name": "id_evaluacion",
        "value": "={{ $json.id_evaluacion }}"
      }
    ]
  }
}
```

### Nodo 3: IF - Verificar Documentos

```json
{
  "conditions": {
    "options": {
      "caseSensitive": true,
      "leftValue": "",
      "typeValidation": "strict"
    },
    "conditions": [
      {
        "id": "condition1",
        "leftValue": "={{ $json.documentos && $json.documentos.length > 0 }}",
        "rightValue": true,
        "operator": {
          "type": "boolean",
          "operation": "true"
        }
      }
    ],
    "combinator": "and"
  },
  "options": {}
}
```

**⚠️ IMPORTANTE: Conexiones del nodo IF**

**Diagrama de Flujo**:

```
[IF - Verificar Documentos]
    ├─ TRUE (tiene documentos)
    │   └─> [Code in JavaScript2] → [Loop Over Items] → [Extract from File] → [Code in JavaScript1] → [Edit Fields1]
    │
    └─ FALSE (NO hay documentos)
        └─> [Function - Preparar Sin Documentos] (OPCIONAL) → [Edit Fields1]
```

**Pasos**:

1. **TRUE (tiene documentos)**: Conectar a `Code in JavaScript2` (procesar Base64 → Buffer → Binary)
2. **FALSE (NO hay documentos)**:
   - **Opción A (Recomendada)**: Conectar a nodo `Function - Preparar Sin Documentos` y luego a `Edit Fields1`
   - **Opción B (Simple)**: Conectar DIRECTAMENTE al nodo `Edit Fields1` / `Set` que prepara el prompt

### Nodo 3.5 (Opcional): Function - Preparar Sin Documentos

**Este nodo solo se ejecuta cuando NO hay documentos**

```javascript
// Preparar estructura sin documentos para el nodo Set
return {
  json: {
    ...$input.item.json, // Mantener todos los datos originales
    documentos_texto_combinado: 'No se proporcionaron documentos para análisis',
    total_documentos: 0,
    tiene_documentos: false
  }
};
```

**Configuración**:

- **Mode**: Run Once for All Items
- **Conectar a**: Nodo `Edit Fields2` / `Set Sin Documentos` que prepara el prompt

---

## 🔄 Opción: Dos Nodos Set Separados (Con y Sin Documentos)

Si prefieres tener dos nodos Set completamente separados para mayor claridad, aquí está la configuración:

### Nodo Set 1: Edit Fields1 - Preparar Prompt CON Documentos

**Este nodo se ejecuta cuando SÍ hay documentos (después de procesar los documentos)**

**Configuración del nodo**:

- **Mode**: Manual Mapping
- **Include Other Input Fields**: ✅ Activado (para mantener otros campos)

**Campos a configurar**:

1. **`system_prompt`** (String):

```
Eres un experto en gobernanza de IA. Analiza las respuestas de la evaluación y los documentos proporcionados para generar un informe HTML completo. Debes generar ÚNICAMENTE código HTML válido, sin comentarios, sin texto fuera del documento. [CONTENIDO COMPLETO DEL PROMPT#2.TXT]
```

2. **`user_context`** (String):

```javascript
={{ "Usuario: " + $json.body.metadatos.nombre_usuario + "\nEmpresa: " + $json.body.metadatos.empresa + "\nCorreo: " + $json.body.metadatos.correo + "\nSector: " + ($json.body.metadatos.sector || "N/A") }}
```

**⚠️ NOTA**: Usa comillas dobles (`"`) en lugar de comillas simples (`'`) dentro de la expresión para evitar errores de sintaxis.

3. **`respuestas_texto`** (String):

```javascript
={{ JSON.stringify($json.body.respuestas || {}, null, 2) }}
```

4. **`ponderaciones`** (String):

```javascript
={{ JSON.stringify($json.body.metadatos.ponderaciones || {}, null, 2) }}
```

5. **`documentos_texto`** (String):

```javascript
={{ $json.documentos_texto_combinado || "No se proporcionaron documentos" }}
```

6. **`prompt_personalizado`** (String):

```javascript
={{ $json.body.metadatos.prompt_ia || "" }}
```

7. **`full_prompt`** (String):

```javascript
={{ $json.user_context + "\n\nSector y ponderaciones:\n" + $json.ponderaciones + "\n\nRespuestas de la evaluación:\n" + $json.respuestas_texto + "\n\nDocumentos adjuntos:\n" + $json.documentos_texto + "\n\nPrompt personalizado: " + $json.prompt_personalizado }}
```

8. **`id_evaluacion`** (String o Number):

```javascript
={{ $json.body.id_evaluacion || null }}
```

---

### Nodo Set 2: Edit Fields2 / Edit Fields3 - Preparar Prompt SIN Documentos

**Este nodo se ejecuta cuando NO hay documentos (directamente desde la rama FALSE del IF)**

**Configuración del nodo**:

- **Mode**: Manual Mapping
- **Include Other Input Fields**: ✅ Activado (para mantener otros campos)

**Campos a configurar** (igual que el anterior, pero sin documentos):

1. **`system_prompt`** (String):

```
Eres un experto en gobernanza de IA. Analiza las respuestas de la evaluación para generar un informe HTML completo. Debes generar ÚNICAMENTE código HTML válido, sin comentarios, sin texto fuera del documento. [CONTENIDO COMPLETO DEL PROMPT#2.TXT]
```

2. **`user_context`** (String) - **CORREGIDO SIN ERRORES**:

```javascript
={{ "Usuario: " + $json.body.metadatos.nombre_usuario + "\nEmpresa: " + $json.body.metadatos.empresa + "\nCorreo: " + $json.body.metadatos.correo + "\nSector: " + ($json.body.metadatos.sector || "N/A") }}
```

**✅ Solución al Error**: Usa comillas dobles (`"`) en lugar de comillas simples (`'`) y `\n` en lugar de `'\n'`.

3. **`respuestas_texto`** (String):

```javascript
={{ JSON.stringify($json.body.respuestas || {}, null, 2) }}
```

4. **`ponderaciones`** (String):

```javascript
={{ JSON.stringify($json.body.metadatos.ponderaciones || {}, null, 2) }}
```

5. **`documentos_texto`** (String):

```
No se proporcionaron documentos para análisis
```

6. **`prompt_personalizado`** (String):

```javascript
={{ $json.body.metadatos.prompt_ia || "" }}
```

7. **`full_prompt`** (String):

```javascript
={{ $json.user_context + "\n\nSector y ponderaciones:\n" + $json.ponderaciones + "\n\nRespuestas de la evaluación:\n" + $json.respuestas_texto + "\n\nDocumentos adjuntos:\n" + $json.documentos_texto + "\n\nPrompt personalizado: " + $json.prompt_personalizado }}
```

8. **`id_evaluacion`** (String o Number):

```javascript
={{ $json.body.id_evaluacion || null }}
```

---

**Diagrama de Flujo con Dos Nodos Set**:

```
[IF - Verificar Documentos]
    ├─ TRUE → [Code JS2] → [Loop] → [Extract] → [Code JS1] → [Edit Fields1 - CON Documentos] → [OpenAI]
    │
    └─ FALSE → [Edit Fields2/3 - SIN Documentos] → [OpenAI]
```

### Nodo 4: Function - Decodificar Base64

```javascript
const documentos = $input.item.json.documentos;
const documentosProcesados = documentos.map(doc => {
  if (doc.contenido_base64) {
    const buffer = Buffer.from(doc.contenido_base64, 'base64');
    return {
      ...doc,
      buffer: buffer,
      texto_extraido: null // Se llenará después
    };
  }
  return doc;
});

return {
  json: {
    ...$input.item.json,
    documentos_procesados: documentosProcesados
  }
};
```

### Nodo 5: OpenAI - Procesar con IA

```json
{
  "parameters": {
    "model": "gpt-4",
    "messages": {
      "values": [
        {
          "role": "system",
          "content": "Eres un experto en gobernanza de IA. Analiza las respuestas de la evaluación y proporciona:\n1. Una puntuación del 0 al 100\n2. Un análisis detallado\n3. Recomendaciones específicas\n\nResponde en formato JSON con las claves: puntuacion, analisis, recomendaciones."
        },
        {
          "role": "user",
          "content": "={{ 'Usuario: ' + $json.metadatos.nombre_usuario + '\\n' + 'Empresa: ' + $json.metadatos.empresa + '\\n\\nRespuestas:\\n' + JSON.stringify($json.respuestas, null, 2) + '\\n\\nPrompt personalizado: ' + ($json.metadatos.prompt_ia || 'Ninguno') }}"
        }
      ]
    },
    "options": {
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }
}
```

### Nodo 6: Function - Procesar Respuesta HTML de OpenAI

```javascript
// Extraer respuesta de OpenAI (puede venir en diferentes formatos según el modelo)
let aiResponse = '';
const inputData = $input.first().json;

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

// Limpiar prefijos comunes (como "json\n")
aiResponse = aiResponse.trim();
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
      console.warn('No se pudo parsear como JSON, usando respuesta completa como HTML');
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
// Reemplazar secuencias de escape comunes
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
  }
}

// Obtener id_evaluacion del nodo anterior
let idEvaluacion = null;
try {
  // Intentar obtener del nodo Set anterior
  const setNode = $('Set').first().json;
  idEvaluacion = setNode.id_evaluacion || null;
} catch (e) {
  // Si no se encuentra, intentar del webhook inicial
  try {
    const webhookData = $('Webhook').first().json;
    idEvaluacion = webhookData.body?.id_evaluacion || webhookData.id_evaluacion || null;
  } catch (e2) {
    console.warn('No se pudo obtener id_evaluacion');
  }
}

// Calcular puntuación si no viene en la respuesta de la IA
let puntuacion = null;
if (jsonParsed && jsonParsed.puntuacion !== undefined) {
  puntuacion = parseFloat(jsonParsed.puntuacion);
} else {
  // Calcular puntuación basándose en las respuestas del webhook inicial
  try {
    const respuestas = $('Webhook').first().json.body?.respuestas || 
                       $('Webhook').first().json.respuestas || {};
    const valores = Object.values(respuestas);
    if (valores.length > 0) {
      const suma = valores.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      puntuacion = (suma / valores.length) * 100;
      puntuacion = Math.round(puntuacion * 100) / 100; // Redondear a 2 decimales
    }
  } catch (e) {
    console.warn('No se pudo calcular la puntuación automáticamente');
  }
}

// Retornar HTML limpio + metadatos
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion,
    timestamp: new Date().toISOString(),
    puntuacion: puntuacion,
    score: puntuacion, // Alias para compatibilidad
    recomendaciones: jsonParsed?.recomendaciones || null
  }
};
```

### Nodo 7 (Opcional): Function - Validar HTML

```javascript
// Validar que el HTML esté correcto antes de enviar
const html = $json.html || '';
const idEvaluacion = $json.id_evaluacion || null;

// Validaciones (solo advertencias, no bloquea el flujo)
const advertencias = [];

// 1. Validar que existe HTML
if (!html || html.trim().length === 0) {
  throw new Error('El HTML está vacío');
}

// 2. Validar que es HTML válido (debe empezar con <!DOCTYPE o <html)
if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
  // Intentar encontrar HTML dentro del string
  const htmlMatch = html.match(/<!DOCTYPE[\s\S]*<\/html>/i);
  if (htmlMatch) {
    advertencias.push('El HTML estaba embebido en otro texto, se extrajo correctamente');
  } else {
    advertencias.push('Advertencia: El HTML no tiene la estructura válida esperada (debe empezar con <!DOCTYPE o <html)');
  }
}

// 3. Validar tamaño mínimo
if (html.length < 1000) {
  advertencias.push('Advertencia: El HTML parece muy corto (menos de 1000 caracteres)');
}

// 4. Validar que tiene las secciones obligatorias (solo advertencias)
const tienePortada = html.includes('Portada') || html.includes('portada') || html.includes('PORTADA') || html.includes('cover-page');
const tieneResumen = html.includes('Resumen') || html.includes('resumen') || html.includes('RESUMEN') || html.includes('Resumen Ejecutivo');
const tieneGraficas = html.includes('Chart.js') || html.includes('chart') || html.includes('canvas') || html.includes('getContext');
const tieneRecomendaciones = html.includes('Recomendaciones') || html.includes('recomendaciones') || html.includes('RECOMENDACIONES');

if (!tienePortada) {
  advertencias.push('Advertencia: No se detectó sección de Portada');
}
if (!tieneResumen) {
  advertencias.push('Advertencia: No se detectó sección de Resumen Ejecutivo');
}
if (!tieneGraficas) {
  advertencias.push('Advertencia: No se detectaron gráficas Chart.js');
}
if (!tieneRecomendaciones) {
  advertencias.push('Advertencia: No se detectó sección de Recomendaciones');
}

// Retornar datos validados (con advertencias si las hay)
return {
  json: {
    html: html,
    id_evaluacion: idEvaluacion,
    timestamp: $json.timestamp || new Date().toISOString(),
    puntuacion: $json.puntuacion || null,
    recomendaciones: $json.recomendaciones || null,
    validado: true,
    advertencias: advertencias.length > 0 ? advertencias : null
  }
};
```

### Nodo 8: Set - Formatear Respuesta Final (Opcional)

```json
{
  "values": {
    "string": [
      {
        "name": "puntuacion",
        "value": "={{ $json.puntuacion }}"
      },
      {
        "name": "score",
        "value": "={{ $json.puntuacion }}"
      },
      {
        "name": "analisis",
        "value": "={{ $json.analisis }}"
      },
      {
        "name": "recomendaciones",
        "value": "={{ JSON.stringify($json.recomendaciones) }}"
      }
    ]
  }
}
```

### Nodo 9: Respond to Webhook

```json
{
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ JSON.stringify({ html: $json.html, id_evaluacion: $json.id_evaluacion || null, puntuacion: $json.puntuacion || null, score: $json.puntuacion || $json.score || null }) }}",
    "responseCode": 200,
    "options": {}
  }
}
```

**⚠️ IMPORTANTE**:

- Este nodo retorna el HTML completo generado por la IA en el campo `html`
- También retorna la `puntuacion` calculada (promedio de respuestas * 100)
- Laravel recibirá este HTML y lo guardará en la base de datos (columna `HTML` si existe, o `Recomendaciones` si no existe `HTML`)

**Nota**: Si solo necesitas enviar el HTML, puedes simplificar el `responseBody` a:

```json
"responseBody": "={{ JSON.stringify({ html: $json.html, id_evaluacion: $json.id_evaluacion || null }) }}"
```

---

## 🔄 Alternativa: HTTP Request Explícito (Recomendado) ⭐

**Para mayor confiabilidad**, puedes usar un **HTTP Request explícito** en lugar de "Respond to Webhook". Esto es más confiable porque:

1. ✅ No depende de mantener conexión HTTP abierta
2. ✅ Mejor control de errores y reintentos
3. ✅ Más explícito y fácil de debuggear
4. ✅ Permite procesamiento asíncrono

### Configuración del Nodo HTTP Request

**Reemplaza el nodo "Respond to Webhook" con un nodo "HTTP Request"**:

**Parámetros**:
- **Method**: `POST`
- **URL**: `http://tu-dominio.com/api/evaluation/n8n-results`
  - O usa variable de entorno: `={{ $env.LARAVEL_API_URL }}/api/evaluation/n8n-results`
- **Authentication**: `None`
- **Send Body**: `Yes`
- **Body Content Type**: `JSON`
- **JSON Body**:
```javascript
={{
  JSON.stringify({
    id_evaluacion: $json.id_evaluacion || null,
    html: $json.html || '',
    puntuacion: $json.puntuacion || $json.score || null,
    score: $json.puntuacion || $json.score || null,
    recomendaciones: $json.recomendaciones || null
  })
}}
```
- **Options**:
  - **Timeout**: `30000` (30 segundos)
  - **Redirect**: `Follow`
  - **Response**: `JSON`

### Endpoint en Laravel

El endpoint ya está creado y configurado:
- **Ruta**: `POST /api/evaluation/n8n-results`
- **Controller**: `EvaluationController@receiveN8NResults`
- **Validación**: Requiere `id_evaluacion` (integer) y `html` (string)

**Ver guía completa**: `GUIA_HTTP_REQUEST_N8N_LARAVEL.md`

---

## 🔑 Variables de Entorno en N8N

Asegúrate de configurar estas variables en N8N:

- `OPENAI_API_KEY`: Tu clave de API de OpenAI
- `LARAVEL_API_URL`: URL base de tu API Laravel (opcional, para subir PDFs)

---

## ⚠️ Consideraciones Importantes

1. **Timeout**: Laravel espera respuesta en 120 segundos (2 minutos)
2. **Formato de Respuesta**: N8N debe retornar JSON con `puntuacion` o `score` y `pdf_path` o `PDF_Path`
3. **Manejo de Errores**: Si hay error, N8N debe retornar un JSON con `error` o código de estado HTTP apropiado
4. **Documentos Base64**: Los documentos vienen en base64, necesitas decodificarlos antes de procesarlos
5. **Respuestas**: Las respuestas vienen como objeto donde la clave es el texto literal de la pregunta y el valor es un número (0, 0.25, 0.5, o 1) representando el porcentaje de la respuesta seleccionada

---

## 🧪 Testing del Workflow

1. **Usar N8N Test Mode**: Activa el modo de prueba para ver los datos en cada nodo
2. **Webhook Test**: Usa Postman o curl para enviar datos de prueba:
   ```bash
   curl -X POST http://tu-n8n-url/webhook/evaluacion \
     -H "Content-Type: application/json" \
     -d '{
       "metadatos": {
         "nombre_usuario": "Test",
         "empresa": "Test Corp",
         "correo": "test@test.com",
         "sector": "Comercial",
         "ponderaciones": {
           "ISO_27090_27091": 0.22,
           "ISO_23894": 0.18,
           "NIS2_AI_Act": 0.32,
           "ISO_42001_42005": 0.18,
           "CONPES_4144": 0.10
         },
         "prompt_ia": "Analiza esta evaluación"
       },
      "respuestas": {
        "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?": 0.5,
        "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?": 1.0
      },
       "documentos": [],
       "id_evaluacion": 999,
       "timestamp": "2025-11-16T23:00:00Z",
       "version": "1.0"
     }'
   ```

---

## 📚 Recursos Adicionales

- [Documentación de N8N](https://docs.n8n.io/)
- [Nodos de OpenAI en N8N](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/)
- [Webhooks en N8N](https://docs.n8n.io/workflows/webhooks/)
