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

            // Crear la evaluación en la base de datos
            $datosEvaluacion = [
                'Id_Usuario' => $userId,
                'Tiempo' => $request->tiempo ?? null,
                'Estado' => 'En proceso',
            ];

            $idEvaluacion = $this->evaluacionRepository->crear($datosEvaluacion);

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

            // Preparar metadatos para N8N
            $metadatos = [
                'nombre' => $usuarioCompleto->Nombre_Usuario ?? 'N/A',
                'empresa' => $usuarioCompleto->Empresa ?? 'N/A',
                'correo' => $usuarioCompleto->Correo ?? 'N/A',
                'prompt' => $request->prompt ?? '',
            ];

            // Formatear datos para N8N
            $datosN8N = $this->n8nService->formatearDatosEvaluacion(
                $respuestasFormateadas,
                $metadatos
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

                    // Actualizar estado de la evaluación
                    $this->evaluacionRepository->actualizar($idEvaluacion, [
                        'Estado' => 'Completada',
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
}

