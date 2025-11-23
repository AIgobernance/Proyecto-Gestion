# Configuración de N8N

## Variables de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
N8N_WEBHOOK_URL=https://tu-n8n-instance.com/webhook/evaluacion-ia
```

## Formato de Datos Enviados a N8N

El servicio envía los siguientes datos en formato JSON al webhook de N8N:

```json
{
  "id_evaluacion": 123,
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
    "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?": 0.0,
    "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?": 1.0,
    "¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?": 0.5,
    ...
  },
  "documentos": [
    {
      "nombre": "documento1.pdf",
      "indice": 0,
      "mime_type": "application/pdf",
      "contenido_base64": "JVBERi0xLjQKJeLjz9MKMy...", // Contenido completo del PDF en base64
      "ruta": "evaluations/documents/doc_123_0_abc.pdf",
      "url": "http://localhost:8000/storage/evaluations/documents/doc_123_0_abc.pdf"
    },
    {
      "nombre": "documento2.pdf",
      "indice": 1,
      "mime_type": "application/pdf",
      "contenido_base64": "JVBERi0xLjQKJeLjz9MKMy...",
      "ruta": "evaluations/documents/doc_123_1_def.pdf",
      "url": "http://localhost:8000/storage/evaluations/documents/doc_123_1_def.pdf"
    }
  ],
  "timestamp": "2024-11-16T10:30:00Z",
  "version": "1.0"
}
```

**Nota sobre documentos:**
- Los documentos se envían con su contenido completo en formato base64 para que N8N pueda procesarlos directamente
- Cada documento incluye: nombre, índice (0, 1, 2), contenido en base64, ruta y URL de referencia
- N8N puede decodificar el base64 para obtener el PDF original y procesarlo con IA

## Respuesta Esperada de N8N

N8N debe retornar un JSON con los siguientes campos (opcionales):

```json
{
  "puntuacion": 85,
  "score": 85,
  "resultado": "Texto del resultado del análisis",
  "recomendaciones": "Recomendaciones generadas por la IA",
  "pdf_path": "https://url-del-pdf-generado.pdf"
}
```

## Flujo de Procesamiento

1. El usuario completa la evaluación en `EvaluationPage.jsx`
2. Los datos se envían a `/api/evaluation/submit`
3. El backend guarda la evaluación en la tabla `Evaluacion`
4. Las respuestas se guardan en la tabla `Respuestas`
5. Los datos se formatean y envían a N8N vía webhook
6. N8N procesa con IA y genera el PDF
7. N8N retorna los resultados
8. Los resultados se guardan en la tabla `Resultados`
9. La evaluación se actualiza con el estado "Completada"

