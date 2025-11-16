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
    "prompt_ia": "Prompt personalizado para la IA (opcional)"
  },
  "respuestas": {
    "pregunta1": "a) No se realiza",
    "pregunta2": "d) Totalmente implementada y revisada anualmente",
    "pregunta3": "c) En algunos modelos críticos",
    ...
  },
  "timestamp": "2024-11-16T10:30:00Z",
  "version": "1.0"
}
```

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

