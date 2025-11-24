# Flujo de Evaluación con IA

1. El usuario completa la evaluación de gobernanza desde React.
2. Laravel recibe las respuestas y las envía a n8n mediante un webhook.
3. n8n procesa las respuestas y las envía a una IA analítica.
4. La IA calcula el puntaje, identifica debilidades y fortalezas, y genera la hoja de ruta personalizada.
5. n8n devuelve los resultados a Laravel (puntaje + URL del PDF).
6. Laravel guarda la información y la envía al frontend.
7. El usuario visualiza los resultados y puede descargar la hoja de ruta en PDF con un botón.
