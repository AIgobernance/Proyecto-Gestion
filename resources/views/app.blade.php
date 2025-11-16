<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>AI Governance Evaluator</title>
    @viteReactRefresh
    @vite('resources/js/main.jsx')  {{-- ⬅️ antes estaba app.jsx --}}
  </head>
  <body>
    <div id="root"></div> {{-- ⬅️ coincide con main.jsx --}}
  </body>
</html>

