<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Helpers\SessionHelper;
use App\Helpers\EvaluationHelper;
use Database\Models\EvaluacionRepository;
use Database\Models\RespuestasRepository;
use Database\Models\ResultadosRepository;
use Database\Models\DocumentosAdjuntosRepository;
use App\Services\N8nService;
use App\Observer\ObserverManager;
use Spatie\Browsershot\Browsershot;

class EvaluationController extends Controller
{
    protected EvaluacionRepository $evaluacionRepository;
    protected RespuestasRepository $respuestasRepository;
    protected ResultadosRepository $resultadosRepository;
    protected DocumentosAdjuntosRepository $documentosRepository;
    protected N8nService $n8nService;

    public function __construct(
        EvaluacionRepository $evaluacionRepository,
        RespuestasRepository $respuestasRepository,
        ResultadosRepository $resultadosRepository,
        DocumentosAdjuntosRepository $documentosRepository,
        N8nService $n8nService
    ) {
        $this->evaluacionRepository = $evaluacionRepository;
        $this->respuestasRepository = $respuestasRepository;
        $this->resultadosRepository = $resultadosRepository;
        $this->documentosRepository = $documentosRepository;
        $this->n8nService = $n8nService;
    }

    /**
     * Procesa y guarda una evaluación completada
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function submitEvaluation(Request $request)
    {
        // Aumentar tiempo de ejecución para procesar documentos grandes
        set_time_limit(180); // 3 minutos
        
        try {
            // Validar datos de entrada
            $request->validate([
                'respuestas' => 'required|array',
                'tiempo' => 'nullable|numeric|min:0', // tiempo en minutos
                'prompt' => 'nullable|string|max:1000', // prompt personalizado para IA
                'id_evaluacion' => 'nullable|integer', // ID de evaluación existente (opcional)
            ]);

            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener datos completos del usuario para metadatos (incluyendo Sector)
            $usuarioCompleto = DB::table('usuario')
                ->select('Nombre_Usuario', 'Empresa', 'Correo', 'Sector')
                ->where('Id', $userId)
                ->first();

            if (!$usuarioCompleto) {
                return response()->json([
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            // Formatear respuestas usando el helper: texto literal de pregunta => valor numérico
            // Formato: ["¿Pregunta 1?" => 0.5, "¿Pregunta 2?" => 1.0, ...]
            $respuestasFormateadas = EvaluationHelper::formatearRespuestasParaN8N($request->respuestas);

            // Verificar si se proporciona un ID de evaluación existente
            $idEvaluacion = $request->input('id_evaluacion');
            
            if ($idEvaluacion) {
                // Verificar que la evaluación pertenece al usuario
                $evaluacionExistente = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
                
                if (!$evaluacionExistente || $evaluacionExistente['Id_Usuario'] != $userId) {
                    return response()->json([
                        'error' => 'Evaluación no encontrada o no autorizada'
                    ], 404);
                }
                
                // Actualizar el tiempo si se proporciona
                if ($request->tiempo !== null) {
                    $this->evaluacionRepository->actualizar($idEvaluacion, [
                        'Tiempo' => $request->tiempo,
                    ]);
                }
            } else {
                // Siempre crear una nueva evaluación
                $datosEvaluacion = [
                    'Id_Usuario' => $userId,
                    'Tiempo' => $request->tiempo ?? null,
                    'Estado' => 'En proceso',
                ];

                $idEvaluacion = $this->evaluacionRepository->crear($datosEvaluacion);
            }

            Log::info('Evaluación creada', [
                'id_evaluacion' => $idEvaluacion,
                'id_usuario' => $userId
            ]);

            // Guardar respuestas en la tabla Respuestas (solo las que tienen contenido)
            // Convertir array de respuestas a formato [id_pregunta => respuesta]
            // donde id_pregunta es el número de pregunta (1, 2, 3...) no el índice (0, 1, 2...)
            $respuestasParaBD = [];
            foreach ($request->respuestas as $index => $respuesta) {
                // Solo guardar respuestas no vacías
                if (!empty($respuesta) && trim($respuesta) !== '') {
                    $idPregunta = $index + 1; // Convertir índice 0-based a pregunta 1-based
                    $respuestasParaBD[$idPregunta] = $respuesta;
                }
            }
            
            // Solo guardar si hay respuestas válidas
            if (!empty($respuestasParaBD)) {
                $respuestasGuardadas = $this->respuestasRepository->guardarRespuestas(
                    $idEvaluacion,
                    $respuestasParaBD // Formato [1 => "respuesta1", 2 => "respuesta2", ...]
                );

                if (!$respuestasGuardadas) {
                    Log::warning('No se pudieron guardar todas las respuestas', [
                        'id_evaluacion' => $idEvaluacion
                    ]);
                }
            }

            // Verificar si se completaron todas las respuestas (50 preguntas)
            $totalRespuestas = count(array_filter($request->respuestas, function($r) { return !empty($r); }));
            $evaluacionCompletada = ($totalRespuestas >= 50);
            
            // Si la evaluación está completa, marcarla como "Completada" inmediatamente
            // (antes de enviar a N8N, para que no aparezca como incompleta)
            if ($evaluacionCompletada) {
                $this->evaluacionRepository->actualizar($idEvaluacion, [
                    'Estado' => 'Completada',
                ]);
                
                Log::info('Evaluación marcada como completada', [
                    'id_evaluacion' => $idEvaluacion,
                    'total_respuestas' => $totalRespuestas
                ]);

                // Disparar notificación de evaluación completada (Patrón Observer - RF 9)
                $notificador = ObserverManager::obtenerNotificador('evaluacion_completada');
                if ($notificador instanceof \App\Observer\Notificadores\NotificadorEvaluacionCompletada) {
                    $notificador->completarEvaluacion(
                        $idEvaluacion,
                        $userId,
                        [
                            'total_respuestas' => $totalRespuestas,
                            'tiempo' => $request->tiempo ?? null,
                        ]
                    );
                }
            }

            // Obtener sector del usuario
            $sector = $usuarioCompleto->Sector ?? 'N/A';
            
            // Obtener ponderaciones por sector
            $ponderaciones = EvaluationHelper::getPonderacionesPorSector($sector);
            
            // Preparar metadatos para N8N
            $metadatos = [
                'nombre' => $usuarioCompleto->Nombre_Usuario ?? 'N/A',
                'empresa' => $usuarioCompleto->Empresa ?? 'N/A',
                'correo' => $usuarioCompleto->Correo ?? 'N/A',
                'sector' => $sector,
                'ponderaciones' => $ponderaciones,
                'prompt' => $request->prompt ?? '',
            ];

            // Procesar documentos si existen - incluir contenido en base64 para N8N
            $documentosData = [];
            if ($request->has('documentos') && is_array($request->documentos)) {
                foreach ($request->documentos as $doc) {
                    if (isset($doc['ruta']) || isset($doc['url'])) {
                        $rutaArchivo = $doc['ruta'] ?? null;
                        $contenidoBase64 = null;
                        
                        // Leer el contenido del archivo y convertirlo a base64
                        if ($rutaArchivo) {
                            try {
                                $rutaCompleta = storage_path('app/public/' . $rutaArchivo);
                                if (file_exists($rutaCompleta)) {
                                    $contenidoArchivo = file_get_contents($rutaCompleta);
                                    $contenidoBase64 = base64_encode($contenidoArchivo);
                                    
                                    Log::info('Documento leído para N8N', [
                                        'ruta' => $rutaArchivo,
                                        'tamaño_bytes' => strlen($contenidoArchivo),
                                        'tamaño_base64' => strlen($contenidoBase64)
                                    ]);
                                } else {
                                    Log::warning('Archivo de documento no encontrado', [
                                        'ruta' => $rutaCompleta
                                    ]);
                                }
                            } catch (\Exception $e) {
                                Log::error('Error al leer documento para N8N', [
                                    'ruta' => $rutaArchivo,
                                    'error' => $e->getMessage()
                                ]);
                            }
                        }
                        
                        $documentosData[] = [
                            'nombre' => $doc['nombre'] ?? 'documento.pdf',
                            'indice' => $doc['indice'] ?? null,
                            'ruta' => $rutaArchivo,
                            'url' => $doc['url'] ?? null,
                            'contenido_base64' => $contenidoBase64, // Contenido del PDF en base64 para N8N
                            'mime_type' => 'application/pdf',
                        ];
                    }
                }
            }

            // Formatear datos para N8N
            $datosN8N = $this->n8nService->formatearDatosEvaluacion(
                $respuestasFormateadas,
                $metadatos,
                $documentosData
            );

            // Agregar ID de evaluación a los datos
            $datosN8N['id_evaluacion'] = $idEvaluacion;

            // Enviar a N8N de forma asíncrona (sin esperar respuesta)
            // N8N procesará en segundo plano y enviará resultados a /api/evaluation/n8n-results
            // Este método no lanza excepciones, así que siempre continuamos
            $this->n8nService->enviarEvaluacionAsync($datosN8N);

            Log::info('Evaluación enviada a N8N para procesamiento asíncrono', [
                'id_evaluacion' => $idEvaluacion,
                'mensaje' => 'N8N procesará en segundo plano y enviará resultados cuando termine'
            ]);

            // Responder inmediatamente al frontend (sin esperar a N8N)
            // El método enviarEvaluacionAsync no lanza excepciones, así que siempre respondemos éxito
            return response()->json([
                'success' => true,
                'message' => 'Evaluación enviada exitosamente. El procesamiento con IA puede tardar unos minutos.',
                'data' => [
                    'id_evaluacion' => $idEvaluacion,
                    'procesada' => false, // Se procesará en segundo plano
                    'mensaje' => 'Los resultados se generarán automáticamente y estarán disponibles en breve'
                ]
            ], 200); // 200 OK - proceso iniciado exitosamente

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al procesar evaluación', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al procesar la evaluación',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }


    /**
     * Crea una nueva evaluación vacía (solo la evaluación, sin respuestas)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createEvaluation(Request $request)
    {
        try {
            // Validar datos de entrada
            $request->validate([
                'tiempo' => 'nullable|numeric|min:0',
            ]);

            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Crear evaluación vacía (rápido, sin procesar respuestas)
            $datosEvaluacion = [
                'Id_Usuario' => $userId,
                'Tiempo' => $request->tiempo ?? 0,
                'Estado' => 'En proceso',
            ];

            $idEvaluacion = $this->evaluacionRepository->crear($datosEvaluacion);

            return response()->json([
                'success' => true,
                'message' => 'Evaluación creada exitosamente',
                'data' => [
                    'id_evaluacion' => $idEvaluacion
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error al crear evaluación', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al crear la evaluación',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Guarda el progreso de una evaluación (respuestas individuales)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveProgress(Request $request)
    {
        try {
            // Validar datos de entrada
            $request->validate([
                'id_evaluacion' => 'required|integer',
                'pregunta_index' => 'required|integer|min:0|max:49', // 0-based
                'respuesta' => 'required|string',
            ]);

            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $idEvaluacion = $request->input('id_evaluacion');
            $preguntaIndex = $request->input('pregunta_index'); // 0-based
            $respuesta = $request->input('respuesta');

            // Optimización: Verificar pertenencia de evaluación en una sola query con EXISTS (más rápido)
            $evaluacionValida = DB::table('Evaluacion')
                ->where('Id_Evaluacion', $idEvaluacion)
                ->where('Id_Usuario', $userId)
                ->exists();
            
            if (!$evaluacionValida) {
                return response()->json([
                    'error' => 'Evaluación no encontrada o no autorizada'
                ], 404);
            }

            // Convertir índice 0-based a 1-based para la BD
            $idPregunta = $preguntaIndex + 1;

            // Guardar la respuesta (optimizado: sin verificar tabla/columnas cada vez)
            $guardado = $this->respuestasRepository->guardarRespuesta($idEvaluacion, $idPregunta, $respuesta);

            if ($guardado) {
                return response()->json([
                    'success' => true,
                    'message' => 'Respuesta guardada exitosamente'
                ], 200);
            }

            return response()->json([
                'error' => 'Error al guardar la respuesta'
            ], 500);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al guardar progreso', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al guardar el progreso',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Carga una evaluación existente con sus respuestas
     *
     * @param Request $request
     * @param int $idEvaluacion
     * @return \Illuminate\Http\JsonResponse
     */
    public function loadEvaluation(Request $request, int $idEvaluacion)
    {
        try {
            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que la evaluación pertenece al usuario
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            
            if (!$evaluacion) {
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            if ($evaluacion['Id_Usuario'] != $userId) {
                return response()->json([
                    'error' => 'No tienes permiso para acceder a esta evaluación'
                ], 403);
            }

            // Obtener las respuestas guardadas
            $respuestas = $this->respuestasRepository->obtenerPorEvaluacion($idEvaluacion);
            
            // Formatear respuestas para el frontend
            $respuestasFormateadas = [];
            foreach ($respuestas as $respuesta) {
                $idPregunta = (int) $respuesta['Id_Pregunta'];
                $respuestasFormateadas[$idPregunta - 1] = $respuesta['Respuesta_Usuario']; // Convertir a 0-based
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_evaluacion' => $idEvaluacion,
                    'respuestas' => $respuestasFormateadas,
                    'total_respuestas' => count($respuestas),
                    'fecha' => $evaluacion['Fecha'] ?? null,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al cargar evaluación', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al cargar la evaluación',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Verifica si el PDF está listo para una evaluación
     *
     * @param Request $request
     * @param int $idEvaluacion
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkPdfStatus(Request $request, int $idEvaluacion)
    {
        try {
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que la evaluación pertenece al usuario
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            
            if (!$evaluacion) {
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            if ($evaluacion['Id_Usuario'] != $userId) {
                return response()->json([
                    'error' => 'No tienes permiso para acceder a esta evaluación'
                ], 403);
            }

            // Obtener resultados de la evaluación
            $resultados = $this->resultadosRepository->obtenerPorEvaluacion($idEvaluacion);
            
            $pdfPath = $resultados['PDF_Path'] ?? null;
            
            // Obtener puntuación de múltiples posibles fuentes con diferentes nombres de columna
            $puntuacion = null;
            if ($resultados) {
                // Intentar diferentes nombres de columna (case-insensitive)
                $puntuacion = $resultados['Puntuacion'] ?? 
                             $resultados['puntuacion'] ?? 
                             $resultados['PUNTUACION'] ?? null;
            }
            
            // Si no hay en Resultados, intentar desde Evaluacion
            if ($puntuacion === null && $evaluacion) {
                $puntuacion = $evaluacion['Puntuacion'] ?? 
                             $evaluacion['puntuacion'] ?? 
                             $evaluacion['PUNTUACION'] ?? null;
            }
            
            // Asegurar que sea numérico
            if ($puntuacion !== null) {
                $puntuacion = is_numeric($puntuacion) ? (float) $puntuacion : null;
            }
            
            // Log para debugging
            Log::info('Puntuación obtenida en checkPdfStatus', [
                'id_evaluacion' => $idEvaluacion,
                'puntuacion_resultados' => $resultados['Puntuacion'] ?? 'N/A',
                'puntuacion_evaluacion' => $evaluacion['Puntuacion'] ?? 'N/A',
                'puntuacion_final' => $puntuacion,
                'resultados_keys' => $resultados ? array_keys($resultados) : null,
                'evaluacion_keys' => array_keys($evaluacion ?? [])
            ]);
            
            // Verificar si el archivo PDF existe físicamente
            $pdfExists = false;
            $pdfUrl = null;
            
            if ($pdfPath) {
                $fullPath = storage_path('app/public/' . $pdfPath);
                $pdfExists = file_exists($fullPath);
                
                if ($pdfExists) {
                    // Generar URL pública del PDF
                    $pdfUrl = asset('storage/' . $pdfPath);
                }
            }

            // Obtener tiempo de la evaluación (en minutos)
            $tiempo = $evaluacion['Tiempo'] ?? null;
            
            // Obtener fecha de completación (usar Fecha_Completado si existe, sino Fecha)
            $fechaCompletado = null;
            $fechaParaUsar = $evaluacion['Fecha_Completado'] ?? $evaluacion['Fecha'] ?? null;
            
            if ($fechaParaUsar) {
                try {
                    // SQL Server puede devolver la fecha como string o como objeto DateTime
                    if (is_string($fechaParaUsar)) {
                        $fechaObj = new \DateTime($fechaParaUsar);
                    } elseif ($fechaParaUsar instanceof \DateTime) {
                        $fechaObj = $fechaParaUsar;
                    } else {
                        // Intentar convertir desde formato SQL Server
                        $fechaObj = \DateTime::createFromFormat('Y-m-d H:i:s', $fechaParaUsar);
                        if (!$fechaObj) {
                            $fechaObj = new \DateTime($fechaParaUsar);
                        }
                    }
                    
                    if ($fechaObj instanceof \DateTime) {
                        $fechaCompletado = $fechaObj->format('Y-m-d\TH:i:s');
                    }
                } catch (\Exception $e) {
                    // Mantener null si hay error
                    Log::warning('Error al formatear fecha de evaluación', [
                        'id_evaluacion' => $idEvaluacion,
                        'fecha_raw' => $fechaParaUsar,
                        'tipo_fecha' => gettype($fechaParaUsar),
                        'error' => $e->getMessage()
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id_evaluacion' => $idEvaluacion,
                    'pdf_ready' => $pdfExists,
                    'pdf_path' => $pdfPath,
                    'pdf_url' => $pdfUrl,
                    'puntuacion' => $puntuacion,
                    'estado' => $evaluacion['Estado'] ?? 'En proceso',
                    'tiempo' => $tiempo, // Tiempo en minutos
                    'fecha_completado' => $fechaCompletado,
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al verificar estado del PDF', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al verificar estado del PDF',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Descarga el PDF de una evaluación
     *
     * @param Request $request
     * @param int $idEvaluacion
     * @return \Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     */
    public function downloadPdf(Request $request, int $idEvaluacion)
    {
        try {
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que la evaluación pertenece al usuario
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            
            if (!$evaluacion) {
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            if ($evaluacion['Id_Usuario'] != $userId) {
                return response()->json([
                    'error' => 'No tienes permiso para acceder a esta evaluación'
                ], 403);
            }

            // Obtener resultados de la evaluación
            $resultados = $this->resultadosRepository->obtenerPorEvaluacion($idEvaluacion);
            
            $pdfPath = $resultados['PDF_Path'] ?? null;
            
            if (!$pdfPath) {
                return response()->json([
                    'error' => 'PDF no encontrado para esta evaluación'
                ], 404);
            }

            // Construir ruta completa del archivo
            $fullPath = storage_path('app/public/' . $pdfPath);
            
            // Verificar que el archivo existe
            if (!file_exists($fullPath)) {
                Log::warning('PDF no encontrado físicamente', [
                    'id_evaluacion' => $idEvaluacion,
                    'pdf_path' => $pdfPath,
                    'full_path' => $fullPath
                ]);
                
                return response()->json([
                    'error' => 'El archivo PDF no se encuentra en el servidor'
                ], 404);
            }

            // Verificar que es un archivo válido
            if (!is_file($fullPath)) {
                return response()->json([
                    'error' => 'La ruta especificada no es un archivo válido'
                ], 400);
            }

            // Obtener el nombre del archivo para la descarga
            $filename = 'evaluacion-' . $idEvaluacion . '.pdf';
            
            // Descargar el archivo con headers correctos
            return response()->download($fullPath, $filename, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            ]);

        } catch (\Exception $e) {
            Log::error('Error al descargar PDF', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al descargar el PDF',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtiene los datos necesarios para generar las gráficas de la evaluación
     *
     * @param Request $request
     * @param int $idEvaluacion
     * @return \Illuminate\Http\JsonResponse
     */
    public function getChartData(Request $request, int $idEvaluacion)
    {
        try {
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que la evaluación pertenece al usuario
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            
            if (!$evaluacion) {
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            if ($evaluacion['Id_Usuario'] != $userId) {
                return response()->json([
                    'error' => 'No tienes permiso para acceder a esta evaluación'
                ], 403);
            }

            // Obtener las respuestas
            $respuestas = $this->respuestasRepository->obtenerPorEvaluacion($idEvaluacion);
            
            if (empty($respuestas)) {
                return response()->json([
                    'error' => 'No se encontraron respuestas para esta evaluación'
                ], 404);
            }

            // Formatear respuestas como array indexado [0 => "a) ...", 1 => "b) ..."]
            $respuestasArray = [];
            foreach ($respuestas as $respuesta) {
                $idPregunta = (int) $respuesta['Id_Pregunta'];
                $indice = $idPregunta - 1; // Convertir a 0-based
                $respuestasArray[$indice] = $respuesta['Respuesta_Usuario'];
            }

            // Obtener sector de la evaluación (si existe)
            $sector = $evaluacion['Sector'] ?? 'Industrial';

            // Calcular datos para las gráficas
            $chartData = \App\Helpers\EvaluationHelper::calcularDatosParaGraficas($respuestasArray, $sector);

            return response()->json([
                'success' => true,
                'data' => $chartData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al obtener datos de gráficas', [
                'id_evaluacion' => $idEvaluacion,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al obtener datos de gráficas',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Sube un documento PDF para una evaluación en curso
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadDocument(Request $request)
    {
        try {
            // Validar que hay un archivo
            $request->validate([
                'documento' => 'required|file|mimes:pdf|max:2048', // 2MB máximo
                'indice' => 'required|integer|min:0|max:2', // Índice del documento (0, 1, 2)
                'id_evaluacion' => 'nullable|integer', // ID de evaluación (opcional)
            ]);

            // Obtener userId de forma optimizada
            $userId = SessionHelper::getUserId($request);
            
            if (!$userId) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $file = $request->file('documento');
            $indice = $request->input('indice');
            $idEvaluacion = $request->input('id_evaluacion');

            // Si no se proporciona id_evaluacion, crear una nueva evaluación
            if (!$idEvaluacion) {
                $idEvaluacion = $this->evaluacionRepository->crear([
                    'Id_Usuario' => $userId,
                    'Estado' => 'En proceso',
                ]);
            } else {
                // Verificar que la evaluación pertenece al usuario
                $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
                if (!$evaluacion || $evaluacion['Id_Usuario'] != $userId) {
                    return response()->json([
                        'error' => 'Evaluación no encontrada o no autorizada'
                    ], 404);
                }
            }

            // Generar nombre único para el archivo
            $nombreOriginal = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $nombreArchivo = 'doc_' . time() . '_' . $indice . '_' . uniqid() . '.' . $extension;

            // Guardar el archivo en storage/app/public/evaluations/documents
            $rutaArchivo = $file->storeAs('evaluations/documents', $nombreArchivo, 'public');

            // Guardar en la base de datos (tabla Documentos_Adjuntos)
            try {
                $idDocumento = $this->documentosRepository->guardar(
                    $idEvaluacion,
                    $nombreArchivo,
                    'pdf' // Tipo siempre "pdf"
                );

                Log::info('Documento guardado en BD', [
                    'id_documento' => $idDocumento,
                    'id_evaluacion' => $idEvaluacion,
                    'nombre_archivo' => $nombreArchivo
                ]);
            } catch (\Exception $e) {
                Log::warning('No se pudo guardar documento en BD, pero el archivo se subió', [
                    'error' => $e->getMessage(),
                    'ruta' => $rutaArchivo
                ]);
                // Continuar aunque falle el guardado en BD
            }

            // Obtener la URL pública del archivo
            $urlArchivo = asset('storage/' . $rutaArchivo);

            Log::info('Documento subido exitosamente', [
                'nombre_original' => $nombreOriginal,
                'nombre_archivo' => $nombreArchivo,
                'ruta' => $rutaArchivo,
                'indice' => $indice,
                'id_evaluacion' => $idEvaluacion
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Documento subido exitosamente',
                'data' => [
                    'nombre' => $nombreOriginal,
                    'ruta' => $rutaArchivo,
                    'url' => $urlArchivo,
                    'indice' => $indice,
                    'tamaño' => $file->getSize(),
                    'id_evaluacion' => $idEvaluacion,
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Datos inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al subir documento', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al subir el documento',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Recibe el HTML y resultados generados por N8N
     * Este endpoint es llamado por N8N después de procesar la evaluación
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function receiveN8NResults(Request $request)
    {
        // Aumentar tiempo de ejecución para procesar HTML grande
        set_time_limit(120); // 2 minutos
        
        try {
            // Log de lo que llega (para debugging)
            Log::info('Recibiendo petición de N8N', [
                'all_input' => $request->all(),
                'headers' => $request->headers->all(),
                'content_type' => $request->header('Content-Type'),
            ]);

            // Extraer datos (pueden venir directamente o envueltos en 'body')
            $body = $request->input('body');
            if ($body && is_array($body)) {
                // Si vienen envueltos en 'body', usar esos datos
                $idEvaluacion = $body['id_evaluacion'] ?? null;
                $html = $body['html'] ?? null;
                $puntuacion = $body['puntuacion'] ?? null;
            } else {
                // Si vienen directamente
                $idEvaluacion = $request->input('id_evaluacion');
                $html = $request->input('html');
                $puntuacion = $request->input('puntuacion');
            }

            // Validar datos extraídos
            $validator = \Validator::make([
                'id_evaluacion' => $idEvaluacion,
                'html' => $html,
                'puntuacion' => $puntuacion,
            ], [
                'id_evaluacion' => 'required|integer',
                'html' => 'required|string',
                'puntuacion' => 'nullable|numeric|min:0|max:100',
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación en datos de N8N', [
                    'errors' => $validator->errors(),
                    'datos_recibidos' => $request->all()
                ]);
                return response()->json([
                    'error' => 'Datos inválidos',
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Convertir tipos
            $idEvaluacion = (int) $idEvaluacion;
            $puntuacion = $puntuacion !== null ? (float) $puntuacion : null;

            Log::info('Recibiendo resultados de N8N', [
                'id_evaluacion' => $idEvaluacion,
                'tiene_html' => !empty($html),
                'longitud_html' => strlen($html ?? ''),
                'puntuacion' => $puntuacion,
                'tipo_html' => gettype($html),
                'primeros_100_caracteres_html' => substr($html ?? '', 0, 100)
            ]);

            // Validar que al menos tengamos HTML o puntuacion
            if (empty($html) && $puntuacion === null) {
                Log::warning('N8N envió datos sin HTML ni puntuación', [
                    'id_evaluacion' => $idEvaluacion,
                    'datos_recibidos' => $request->all()
                ]);
                return response()->json([
                    'error' => 'Se requiere al menos HTML o puntuación',
                    'datos_recibidos' => $request->all()
                ], 422);
            }

            // Verificar que la evaluación existe
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            if (!$evaluacion) {
                Log::error('Evaluación no encontrada al recibir resultados de N8N', [
                    'id_evaluacion' => $idEvaluacion
                ]);
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            // Convertir HTML a PDF con Browsershot (renderiza JavaScript/Chart.js)
            $pdfPath = null;
            $htmlPath = null; // Mantener HTML como backup opcional
            
            if ($html) {
                try {
                    Log::info('Iniciando conversión de HTML a PDF con Browsershot', [
                        'id_evaluacion' => $idEvaluacion,
                        'tamaño_html' => strlen($html)
                    ]);

                    // Generar nombre único para el PDF
                    $timestamp = time();
                    $pdfPath = 'evaluations/pdf/' . $idEvaluacion . '_' . $timestamp . '.pdf';
                    $fullPdfPath = storage_path('app/public/' . $pdfPath);
                    
                    // Crear directorio si no existe
                    $pdfDirectory = dirname($fullPdfPath);
                    if (!file_exists($pdfDirectory)) {
                        mkdir($pdfDirectory, 0755, true);
                    }

                    // Usar Browsershot para renderizar HTML con JavaScript ejecutado
                    // Esto permite que Chart.js renderice las gráficas antes de convertir a PDF
                    Browsershot::html($html)
                        ->setOption('args', [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-gpu'
                        ])
                        ->waitUntilNetworkIdle(false) // Esperar a que todas las peticiones de red terminen (false = no esperar indefinidamente)
                        ->timeout(120) // Timeout de 120 segundos
                        ->delay(3000) // Esperar 3 segundos adicionales para que Chart.js renderice completamente
                        ->format('A4')
                        ->margins(20, 20, 20, 20, 'mm')
                        ->showBackground() // Mostrar fondo (importante para gráficas)
                        ->save($fullPdfPath);
                    
                    Log::info('PDF generado exitosamente con gráficas renderizadas', [
                        'id_evaluacion' => $idEvaluacion,
                        'pdf_path' => $pdfPath,
                        'tamaño_archivo' => filesize($fullPdfPath) . ' bytes'
                    ]);

                    // Opcional: Guardar HTML como backup (comentado por defecto)
                    // Descomentar si quieres mantener también el HTML
                    /*
                    $htmlPath = 'evaluations/html/' . $idEvaluacion . '_' . $timestamp . '.html';
                    $fullHtmlPath = storage_path('app/public/' . $htmlPath);
                    
                    $htmlDirectory = dirname($fullHtmlPath);
                    if (!file_exists($htmlDirectory)) {
                        mkdir($htmlDirectory, 0755, true);
                    }
                    
                    file_put_contents($fullHtmlPath, $html);
                    Log::info('HTML guardado como backup', [
                        'id_evaluacion' => $idEvaluacion,
                        'html_path' => $htmlPath
                    ]);
                    */

                } catch (\Exception $e) {
                    Log::error('Error al convertir HTML a PDF', [
                        'id_evaluacion' => $idEvaluacion,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    // Si falla la conversión a PDF, guardar HTML como fallback
                    try {
                        $htmlPath = 'evaluations/html/' . $idEvaluacion . '_' . time() . '.html';
                        $fullHtmlPath = storage_path('app/public/' . $htmlPath);
                        
                        $htmlDirectory = dirname($fullHtmlPath);
                        if (!file_exists($htmlDirectory)) {
                            mkdir($htmlDirectory, 0755, true);
                        }
                        
                        file_put_contents($fullHtmlPath, $html);
                        
                        Log::warning('Fallback: HTML guardado en lugar de PDF debido a error', [
                            'id_evaluacion' => $idEvaluacion,
                            'html_path' => $htmlPath
                        ]);
                    } catch (\Exception $fallbackError) {
                        Log::error('Error crítico: No se pudo guardar ni PDF ni HTML', [
                            'id_evaluacion' => $idEvaluacion,
                            'error_pdf' => $e->getMessage(),
                            'error_html' => $fallbackError->getMessage()
                        ]);
                    }
                }
            }

            // Preparar datos para guardar (solo PDF_Path y puntuación)
            $resultados = [
                'puntuacion' => $puntuacion,
                'score' => $puntuacion,
                'PDF_Path' => $pdfPath, // Guardar ruta del PDF
            ];

            // Nota: HTML y Recomendaciones ya no se guardan en la BD
            // Solo se genera y guarda el PDF

            // Guardar resultados en la tabla Resultados
            $guardado = $this->resultadosRepository->guardarResultado($idEvaluacion, $resultados);

            if (!$guardado) {
                Log::error('Error al guardar resultados en base de datos', [
                    'id_evaluacion' => $idEvaluacion
                ]);
            }

            // Actualizar evaluación con puntuación
            if ($puntuacion !== null) {
                $this->evaluacionRepository->actualizar($idEvaluacion, [
                    'Puntuacion' => $puntuacion,
                ]);
            }

            // Disparar notificación de resultados generados
            $userId = $evaluacion['Id_Usuario'] ?? null;
            if ($userId) {
                $notificador = ObserverManager::obtenerNotificador('resultados_generados');
                if ($notificador instanceof \App\Observer\Notificadores\NotificadorResultadosGenerados) {
                    $notificador->generarResultados(
                        $idEvaluacion,
                        $userId,
                        $resultados,
                        $pdfPath ?? $htmlPath, // Usar PDF si existe, sino HTML como fallback
                        $puntuacion
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Resultados recibidos y guardados exitosamente',
                'data' => [
                    'id_evaluacion' => $idEvaluacion,
                    'html_recibido' => !empty($html),
                    'pdf_generado' => !empty($pdfPath),
                    'html_guardado_fallback' => !empty($htmlPath),
                    'puntuacion' => $puntuacion,
                    'pdf_path' => $pdfPath,
                    'html_path' => $htmlPath ?? null
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación al recibir resultados de N8N', [
                'errors' => $e->errors(),
                'datos_recibidos' => $request->all(),
                'id_evaluacion_recibido' => $request->input('id_evaluacion'),
                'tiene_html' => $request->has('html'),
                'html_vacio' => empty($request->input('html'))
            ]);
            
            return response()->json([
                'error' => 'Datos inválidos',
                'errors' => $e->errors(),
                'datos_recibidos' => [
                    'id_evaluacion' => $request->input('id_evaluacion'),
                    'tiene_html' => $request->has('html'),
                    'html_no_vacio' => !empty($request->input('html')),
                    'longitud_html' => strlen($request->input('html') ?? ''),
                    'puntuacion' => $request->input('puntuacion'),
                    'score' => $request->input('score'),
                ]
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al recibir resultados de N8N', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'datos_recibidos' => $request->all()
            ]);

            return response()->json([
                'error' => 'Error al procesar resultados',
                'message' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
                'file' => config('app.debug') ? $e->getFile() : null,
                'line' => config('app.debug') ? $e->getLine() : null,
            ], 500);
        }
    }
}

