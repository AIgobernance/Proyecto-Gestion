<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Database\Models\EvaluacionRepository;
use Database\Models\RespuestasRepository;
use Database\Models\ResultadosRepository;
use App\Services\N8nService;

class EvaluationController extends Controller
{
    protected EvaluacionRepository $evaluacionRepository;
    protected RespuestasRepository $respuestasRepository;
    protected ResultadosRepository $resultadosRepository;
    protected N8nService $n8nService;

    public function __construct(
        EvaluacionRepository $evaluacionRepository,
        RespuestasRepository $respuestasRepository,
        ResultadosRepository $resultadosRepository,
        N8nService $n8nService
    ) {
        $this->evaluacionRepository = $evaluacionRepository;
        $this->respuestasRepository = $respuestasRepository;
        $this->resultadosRepository = $resultadosRepository;
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
        try {
            // Validar datos de entrada
            $request->validate([
                'respuestas' => 'required|array',
                'tiempo' => 'nullable|numeric|min:0', // tiempo en minutos
                'prompt' => 'nullable|string|max:1000', // prompt personalizado para IA
                'id_evaluacion' => 'nullable|integer', // ID de evaluación existente (opcional)
            ]);

            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener el ID del usuario
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                // Intentar obtener por correo
                $correo = $userData['correo'] ?? $userData['Correo'] ?? null;
                if ($correo) {
                    $usuario = DB::table('usuario')
                        ->select('Id')
                        ->where('Correo', $correo)
                        ->first();
                    
                    if ($usuario) {
                        $userId = $usuario->Id;
                        $userData['id'] = $userId;
                        $request->session()->put('user', $userData);
                        $request->session()->save();
                    }
                }
            }

            if (!$userId) {
                return response()->json([
                    'error' => 'No se pudo identificar al usuario'
                ], 400);
            }

            // Obtener datos completos del usuario para metadatos
            $usuarioCompleto = DB::table('usuario')
                ->select('Nombre_Usuario', 'Empresa', 'Correo')
                ->where('Id', $userId)
                ->first();

            if (!$usuarioCompleto) {
                return response()->json([
                    'error' => 'Usuario no encontrado'
                ], 404);
            }

            // Formatear respuestas en formato {pregunta1: "respuesta", pregunta2: "respuesta", ...}
            $respuestasFormateadas = [];
            foreach ($request->respuestas as $index => $respuesta) {
                // Convertir índice (0-based) a pregunta (1-based)
                $preguntaKey = 'pregunta' . ($index + 1);
                // La respuesta ya viene como texto de la opción seleccionada
                $respuestasFormateadas[$preguntaKey] = $respuesta;
            }

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
                // Verificar si hay una evaluación en proceso (incompleta) para este usuario
                $evaluacionIncompleta = $this->evaluacionRepository->obtenerIncompletaPorUsuario($userId, 50);
                
                if ($evaluacionIncompleta) {
                    // Usar la evaluación existente
                    $idEvaluacion = $evaluacionIncompleta['Id_Evaluacion'];
                    
                    // Actualizar el tiempo si se proporciona
                    if ($request->tiempo !== null) {
                        $this->evaluacionRepository->actualizar($idEvaluacion, [
                            'Tiempo' => $request->tiempo,
                        ]);
                    }
                } else {
                    // Crear nueva evaluación en la base de datos
                    $datosEvaluacion = [
                        'Id_Usuario' => $userId,
                        'Tiempo' => $request->tiempo ?? null,
                        'Estado' => 'En proceso',
                    ];

                    $idEvaluacion = $this->evaluacionRepository->crear($datosEvaluacion);
                }
            }

            Log::info('Evaluación creada', [
                'id_evaluacion' => $idEvaluacion,
                'id_usuario' => $userId
            ]);

            // Guardar respuestas en la tabla Respuestas
            // Convertir array de respuestas a formato [id_pregunta => respuesta]
            // donde id_pregunta es el número de pregunta (1, 2, 3...) no el índice (0, 1, 2...)
            $respuestasParaBD = [];
            foreach ($request->respuestas as $index => $respuesta) {
                $idPregunta = $index + 1; // Convertir índice 0-based a pregunta 1-based
                $respuestasParaBD[$idPregunta] = $respuesta;
            }
            
            $respuestasGuardadas = $this->respuestasRepository->guardarRespuestas(
                $idEvaluacion,
                $respuestasParaBD // Formato [1 => "respuesta1", 2 => "respuesta2", ...]
            );

            if (!$respuestasGuardadas) {
                Log::warning('No se pudieron guardar todas las respuestas', [
                    'id_evaluacion' => $idEvaluacion
                ]);
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
            }

            // Preparar metadatos para N8N
            $metadatos = [
                'nombre' => $usuarioCompleto->Nombre_Usuario ?? 'N/A',
                'empresa' => $usuarioCompleto->Empresa ?? 'N/A',
                'correo' => $usuarioCompleto->Correo ?? 'N/A',
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

            // Enviar a N8N de forma asíncrona (en segundo plano)
            // Por ahora lo hacemos síncrono, pero puedes usar queues después
            try {
                $respuestaN8N = $this->n8nService->enviarEvaluacion($datosN8N);

                // Si N8N retorna resultados, guardarlos
                if ($respuestaN8N['success'] && isset($respuestaN8N['data'])) {
                    $resultadosN8N = $respuestaN8N['data'];
                    
                    // Guardar resultados en la tabla Resultados
                    $this->resultadosRepository->guardarResultado($idEvaluacion, $resultadosN8N);

                    // Actualizar estado de la evaluación (ya está marcada como Completada arriba, solo actualizar puntuación y PDF)
                    $this->evaluacionRepository->actualizar($idEvaluacion, [
                        'Puntuacion' => $resultadosN8N['puntuacion'] ?? $resultadosN8N['score'] ?? null,
                        'PDF_Path' => $resultadosN8N['pdf_path'] ?? $resultadosN8N['PDF_Path'] ?? null,
                    ]);
                }

                Log::info('Evaluación procesada exitosamente por N8N', [
                    'id_evaluacion' => $idEvaluacion
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Evaluación enviada exitosamente',
                    'data' => [
                        'id_evaluacion' => $idEvaluacion,
                        'procesada' => true
                    ]
                ], 200);

            } catch (\Exception $e) {
                // Si falla N8N, mantener la evaluación como "En proceso"
                Log::error('Error al enviar evaluación a N8N', [
                    'id_evaluacion' => $idEvaluacion,
                    'error' => $e->getMessage()
                ]);

                // Retornar éxito parcial (evaluación guardada pero no procesada)
                return response()->json([
                    'success' => true,
                    'message' => 'Evaluación guardada. El procesamiento puede tardar unos minutos.',
                    'data' => [
                        'id_evaluacion' => $idEvaluacion,
                        'procesada' => false,
                        'warning' => 'El procesamiento con IA está en curso'
                    ]
                ], 202); // 202 Accepted - procesamiento asíncrono
            }

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
     * Verifica si el usuario tiene una evaluación incompleta
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkIncompleteEvaluation(Request $request)
    {
        try {
            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            // Obtener el ID del usuario
            $userId = $userData['id'] ?? $userData['Id'] ?? null;

            if (!$userId) {
                return response()->json([
                    'error' => 'ID de usuario no encontrado'
                ], 400);
            }

            // Buscar evaluación incompleta
            $evaluacionIncompleta = $this->evaluacionRepository->obtenerIncompletaPorUsuario($userId, 50);

            if ($evaluacionIncompleta) {
                // Obtener las respuestas guardadas
                $respuestas = $this->respuestasRepository->obtenerPorEvaluacion($evaluacionIncompleta['Id_Evaluacion']);
                
                // Formatear respuestas para el frontend
                $respuestasFormateadas = [];
                foreach ($respuestas as $respuesta) {
                    $idPregunta = (int) $respuesta['Id_Pregunta'];
                    $respuestasFormateadas[$idPregunta - 1] = $respuesta['Respuesta_Usuario']; // Convertir a 0-based
                }

                return response()->json([
                    'success' => true,
                    'has_incomplete' => true,
                    'data' => [
                        'id_evaluacion' => $evaluacionIncompleta['Id_Evaluacion'],
                        'total_respuestas' => $evaluacionIncompleta['total_respuestas'] ?? 0,
                        'respuestas' => $respuestasFormateadas,
                        'fecha' => $evaluacionIncompleta['Fecha'] ?? null,
                    ]
                ], 200);
            }

            return response()->json([
                'success' => true,
                'has_incomplete' => false,
                'data' => null
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error al verificar evaluación incompleta', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Error al verificar evaluación incompleta',
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

            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $idEvaluacion = $request->input('id_evaluacion');
            $preguntaIndex = $request->input('pregunta_index'); // 0-based
            $respuesta = $request->input('respuesta');

            // Verificar que la evaluación pertenece al usuario
            $evaluacion = $this->evaluacionRepository->obtenerPorId($idEvaluacion);
            
            if (!$evaluacion) {
                return response()->json([
                    'error' => 'Evaluación no encontrada'
                ], 404);
            }

            $userId = $userData['id'] ?? $userData['Id'] ?? null;
            if ($evaluacion['Id_Usuario'] != $userId) {
                return response()->json([
                    'error' => 'No tienes permiso para modificar esta evaluación'
                ], 403);
            }

            // Convertir índice 0-based a 1-based para la BD
            $idPregunta = $preguntaIndex + 1;

            // Guardar la respuesta
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
            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
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

            $userId = $userData['id'] ?? $userData['Id'] ?? null;
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
            ]);

            // Obtener el usuario de la sesión
            $userData = $request->session()->get('user');
            
            if (!$userData) {
                return response()->json([
                    'error' => 'Usuario no autenticado'
                ], 401);
            }

            $file = $request->file('documento');
            $indice = $request->input('indice');

            // Generar nombre único para el archivo
            $nombreOriginal = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $nombreArchivo = 'doc_' . time() . '_' . $indice . '_' . uniqid() . '.' . $extension;

            // Guardar el archivo en storage/app/public/evaluations/documents
            $rutaArchivo = $file->storeAs('evaluations/documents', $nombreArchivo, 'public');

            // Obtener la URL pública del archivo
            $urlArchivo = asset('storage/' . $rutaArchivo);

            Log::info('Documento subido exitosamente', [
                'nombre_original' => $nombreOriginal,
                'nombre_archivo' => $nombreArchivo,
                'ruta' => $rutaArchivo,
                'indice' => $indice
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
}

