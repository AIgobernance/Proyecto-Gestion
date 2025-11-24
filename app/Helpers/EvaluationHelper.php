<?php

namespace App\Helpers;

class EvaluationHelper
{
    /**
     * Array con todas las preguntas de la evaluación
     * Debe coincidir con el array QUESTIONS en EvaluationPage.jsx
     */
    public static function getQuestions(): array
    {
        return [
            [
                'id' => 1,
                'text' => '¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?',
                'options' => [
                    'a) No se realiza',
                    'b) En proceso de definirlo',
                    'c) Se realiza parcialmente',
                    'd) Se tiene un registro actualizado y aprobado',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 2,
                'text' => '¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?',
                'options' => [
                    'a) No existe',
                    'b) En elaboración',
                    'c) Aprobada pero no implementada completamente',
                    'd) Totalmente implementada y revisada anualmente',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 3,
                'text' => '¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?',
                'options' => [
                    'a) No se realiza',
                    'b) En pruebas piloto',
                    'c) En algunos modelos críticos',
                    'd) En todos los sistemas de IA con métricas definidas',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 4,
                'text' => '¿La empresa tiene un protocolo para notificar incidentes relacionados con IA (fallos, ciberataques, errores de decisión)?',
                'options' => [
                    'a) No existe',
                    'b) En desarrollo',
                    'c) Existe pero sin pruebas',
                    'd) Documentado, probado y vigente',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 5,
                'text' => '¿Existen roles definidos para la supervisión ética y legal del uso de IA?',
                'options' => [
                    'a) No definidos',
                    'b) En proceso de asignación',
                    'c) Asignados parcialmente',
                    'd) Formalmente designados y activos',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 6,
                'text' => '¿Se mantiene un inventario actualizado de sistemas, modelos y fuentes de datos utilizados en IA?',
                'options' => [
                    'a) No',
                    'b) Parcialmente',
                    'c) Se actualiza anualmente',
                    'd) Se actualiza trimestralmente o en tiempo real',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 7,
                'text' => '¿Se exige a los proveedores de IA demostrar cumplimiento con requisitos regulatorios y de seguridad?',
                'options' => [
                    'a) No se exige',
                    'b) Solo a algunos proveedores',
                    'c) Mediante cláusulas básicas',
                    'd) Evaluación formal y documentada de cumplimiento',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 8,
                'text' => '¿Existe un plan de ciberseguridad específico que contemple los sistemas de IA?',
                'options' => [
                    'a) No',
                    'b) En diseño',
                    'c) Aplicado parcialmente',
                    'd) Totalmente implementado',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 9,
                'text' => '¿La dirección revisa y aprueba los riesgos regulatorios asociados a IA?',
                'options' => [
                    'a) No',
                    'b) Esporádicamente',
                    'c) Anualmente',
                    'd) Trimestralmente o según cambios normativos',
                ],
                'framework' => 'Marco: NIS2 / AI Act – Regulación y cumplimiento',
            ],
            [
                'id' => 10,
                'text' => '¿Existe un plan de ciberseguridad específico que contemple los sistemas de IA?',
                'options' => [
                    'a) No',
                    'b) En diseño',
                    'c) Aplicado parcialmente',
                    'd) Totalmente implementado',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 11,
                'text' => '¿Se aplican controles de acceso diferenciados a los entornos de entrenamiento y despliegue de IA?',
                'options' => [
                    'a) No',
                    'b) En implementación',
                    'c) En algunos sistemas',
                    'd) En todos los entornos de IA',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 12,
                'text' => '¿Los datos de entrenamiento de IA están protegidos contra alteraciones o fugas de información?',
                'options' => [
                    'a) No',
                    'b) Protección básica',
                    'c) Cifrado y control de acceso',
                    'd) Cifrado, monitoreo y auditoría documentada',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 13,
                'text' => '¿Se realizan auditorías o pruebas de vulnerabilidad a los sistemas de IA?',
                'options' => [
                    'a) No',
                    'b) En planeación',
                    'c) Una vez al año',
                    'd) De forma continua con reportes técnicos',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 14,
                'text' => '¿Existe plan de respaldo y recuperación de modelos ante incidentes o pérdida de datos?',
                'options' => [
                    'a) No',
                    'b) En desarrollo',
                    'c) Manual básico',
                    'd) Documentado y probado',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 15,
                'text' => '¿El personal recibe capacitación en ciberseguridad aplicada a IA?',
                'options' => [
                    'a) No',
                    'b) Ocasional',
                    'c) Periódica',
                    'd) Continua y obligatoria',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 16,
                'text' => '¿Se utilizan herramientas automatizadas para monitorear amenazas en sistemas de IA?',
                'options' => [
                    'a) No',
                    'b) En prueba',
                    'c) En algunas áreas',
                    'd) Implementadas globalmente',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 17,
                'text' => '¿Existen políticas de actualización y parcheo de seguridad para modelos IA?',
                'options' => [
                    'a) No',
                    'b) Parcialmente',
                    'c) Manuales ocasionales',
                    'd) Automáticas y verificadas',
                ],
                'framework' => 'Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA',
            ],
            [
                'id' => 18,
                'text' => '¿Existe una estrategia formal de adopción de IA alineada con los objetivos del negocio?',
                'options' => [
                    'a) No',
                    'b) En formulación',
                    'c) Parcialmente definida',
                    'd) Totalmente implementada',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 19,
                'text' => '¿Se evalúan los riesgos en cada proyecto de IA antes de su despliegue?',
                'options' => [
                    'a) No',
                    'b) En algunos proyectos',
                    'c) Con revisiones periódicas',
                    'd) En todos los proyectos con documentación formal',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 20,
                'text' => '¿Se miden los resultados de IA mediante indicadores de desempeño (KPIs)?',
                'options' => [
                    'a) No',
                    'b) En diseño',
                    'c) En algunos modelos',
                    'd) En todos los sistemas implementados',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 21,
                'text' => '¿Se actualizan los modelos de IA según cambios en los datos o el contexto operativo?',
                'options' => [
                    'a) No',
                    'b) Esporádicamente',
                    'c) Según revisión programada',
                    'd) Actualización continua documentada',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 22,
                'text' => '¿Existe comité o figura formal encargada de la gobernanza de IA?',
                'options' => [
                    'a) No',
                    'b) En creación',
                    'c) Parcialmente activo',
                    'd) Formalmente establecido con funciones definidas',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 23,
                'text' => '¿Los proyectos de IA cuentan con ciclo de vida documentado (planeación, despliegue, monitoreo, retiro)?',
                'options' => [
                    'a) No',
                    'b) Parcialmente',
                    'c) Documentado en algunos casos',
                    'd) Completamente documentado y aplicado',
                ],
                'framework' => 'Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida',
            ],
            [
                'id' => 24,
                'text' => '¿Los resultados de la IA son comprensibles y explicables para usuarios no técnicos?',
                'options' => [
                    'a) No',
                    'b) En algunos sistemas',
                    'c) En la mayoría',
                    'd) En todos los modelos críticos',
                ],
                'framework' => 'Marco: ISO 23894 – IA Explicable',
            ],
            [
                'id' => 25,
                'text' => '¿La empresa informa claramente al usuario cuando interactúa con un sistema de IA?',
                'options' => [
                    'a) No',
                    'b) En algunos canales',
                    'c) En la mayoría',
                    'd) Siempre, de forma visible y comprensible',
                ],
                'framework' => 'Marco: ISO 23894 – IA Explicable',
            ],
            [
                'id' => 26,
                'text' => '¿Se utilizan herramientas o reportes explicativos (SHAP, LIME, etc.) para interpretar decisiones algorítmicas?',
                'options' => [
                    'a) No',
                    'b) En pruebas',
                    'c) En algunos modelos',
                    'd) En todos los modelos críticos',
                ],
                'framework' => 'Marco: ISO 23894 – IA Explicable',
            ],
            [
                'id' => 27,
                'text' => '¿Existen registros auditables de las decisiones automatizadas tomadas por IA?',
                'options' => [
                    'a) No',
                    'b) Parciales',
                    'c) Por modelo',
                    'd) Completo y revisado periódicamente',
                ],
                'framework' => 'Marco: ISO 23894 – IA Explicable',
            ],
            [
                'id' => 28,
                'text' => '¿La empresa aplica los lineamientos del CONPES 4144 en su estrategia de IA?',
                'options' => [
                    'a) No',
                    'b) En evaluación',
                    'c) Parcialmente adoptado',
                    'd) Integrado formalmente',
                ],
                'framework' => 'Marco: CONPES 4144 – Política nacional de IA',
            ],
            [
                'id' => 29,
                'text' => '¿Participa la empresa en programas públicos de formación o adopción ética de IA?',
                'options' => [
                    'a) No',
                    'b) En planeación',
                    'c) En ejecución',
                    'd) Participación activa y continua',
                ],
                'framework' => 'Marco: CONPES 4144 – Política nacional de IA',
            ],
            [
                'id' => 30,
                'text' => '¿Promueve la organización el uso ético, inclusivo y sostenible de la IA?',
                'options' => [
                    'a) No',
                    'b) Esporádicamente',
                    'c) A través de iniciativas internas',
                    'd) Como parte de su cultura corporativa',
                ],
                'framework' => 'Marco: CONPES 4144 – Política nacional de IA',
            ],
        ];
    }

    /**
     * Convierte una respuesta de texto a su valor numérico
     * a) = 0 (0%)
     * b) = 0.25 (0.25%)
     * c) = 0.5 (0.5%)
     * d) = 1 (1%)
     *
     * @param string $respuestaTexto Texto de la respuesta (ej: "a) No se realiza")
     * @return float Valor numérico (0, 0.25, 0.5, o 1)
     */
    public static function respuestaToValor(string $respuestaTexto): float
    {
        // Extraer la letra de la respuesta (a, b, c, o d)
        if (preg_match('/^([a-d])\)/i', trim($respuestaTexto), $matches)) {
            $letra = strtolower($matches[1]);
            
            switch ($letra) {
                case 'a':
                    return 0.0; // 0%
                case 'b':
                    return 0.25; // 0.25%
                case 'c':
                    return 0.5; // 0.5%
                case 'd':
                    return 1.0; // 1%
                default:
                    return 0.0; // Por defecto, valor mínimo
            }
        }
        
        // Si no se puede parsear, retornar 0
        return 0.0;
    }

    /**
     * Obtiene el texto de una pregunta por su índice (0-based)
     *
     * @param int $index Índice de la pregunta (0-29)
     * @return string|null Texto de la pregunta o null si no existe
     */
    public static function getQuestionText(int $index): ?string
    {
        $questions = self::getQuestions();
        
        if (isset($questions[$index]) && isset($questions[$index]['text'])) {
            return $questions[$index]['text'];
        }
        
        return null;
    }

    /**
     * Obtiene las ponderaciones por sector según el documento de recomendaciones
     * 
     * @param string $sector Sector de la empresa (Industrial, Servicios, Comercial)
     * @return array Array con las ponderaciones por marco normativo
     */
    public static function getPonderacionesPorSector(string $sector): array
    {
        // Normalizar el sector a mayúsculas para comparación
        $sectorNormalizado = ucfirst(trim($sector));
        
        switch ($sectorNormalizado) {
            case 'Industrial':
                return [
                    'ISO_27090_27091' => 0.30,  // ISO 27090/27091 (Ciberseguridad): 30%
                    'ISO_23894' => 0.12,        // ISO 23894 (IA Explicable): 12%
                    'NIS2_AI_Act' => 0.28,     // NIS2/AI Act (Regulación UE): 28%
                    'ISO_42001_42005' => 0.25,  // ISO 42001-42005 (Gestión IA): 25%
                    'CONPES_4144' => 0.05,     // CONPES 4144 (Marco Nacional): 5%
                ];
                
            case 'Servicios':
                return [
                    'ISO_27090_27091' => 0.20,  // ISO 27090/27091 (Ciberseguridad): 20%
                    'ISO_23894' => 0.25,        // ISO 23894 (IA Explicable): 25%
                    'NIS2_AI_Act' => 0.35,     // NIS2/AI Act (Regulación UE): 35%
                    'ISO_42001_42005' => 0.15,  // ISO 42001-42005 (Gestión IA): 15%
                    'CONPES_4144' => 0.05,     // CONPES 4144 (Marco Nacional): 5%
                ];
                
            case 'Comercial':
                return [
                    'ISO_27090_27091' => 0.22,  // ISO 27090/27091 (Ciberseguridad): 22%
                    'ISO_23894' => 0.18,        // ISO 23894 (IA Explicable): 18%
                    'NIS2_AI_Act' => 0.32,      // NIS2/AI Act (Regulación UE): 32%
                    'ISO_42001_42005' => 0.18,  // ISO 42001-42005 (Gestión IA): 18%
                    'CONPES_4144' => 0.10,     // CONPES 4144 (Marco Nacional): 10%
                ];
                
            default:
                // Si el sector no es reconocido, usar ponderaciones iguales (20% cada uno)
                return [
                    'ISO_27090_27091' => 0.20,
                    'ISO_23894' => 0.20,
                    'NIS2_AI_Act' => 0.20,
                    'ISO_42001_42005' => 0.20,
                    'CONPES_4144' => 0.20,
                ];
        }
    }

    /**
     * Formatea las respuestas para N8N con texto literal de pregunta y valor numérico
     *
     * @param array $respuestas Array de respuestas [0 => "a) No se realiza", 1 => "b) En proceso", ...]
     * @return array Array formateado [texto_pregunta => valor_numérico]
     */
    public static function formatearRespuestasParaN8N(array $respuestas): array
    {
        $respuestasFormateadas = [];
        
        foreach ($respuestas as $index => $respuestaTexto) {
            // Obtener el texto de la pregunta
            $textoPregunta = self::getQuestionText($index);
            
            if ($textoPregunta && !empty($respuestaTexto)) {
                // Convertir respuesta a valor numérico
                $valor = self::respuestaToValor($respuestaTexto);
                
                // Usar el texto literal de la pregunta como clave
                $respuestasFormateadas[$textoPregunta] = $valor;
            }
        }
        
        return $respuestasFormateadas;
    }

    /**
     * Calcula la puntuación global de una evaluación basándose en las respuestas
     * La puntuación es el promedio de todos los valores * 100
     *
     * @param array $respuestas Array de respuestas [texto_pregunta => valor_numérico]
     * @return float Puntuación de 0 a 100
     */
    public static function calcularPuntuacionGlobal(array $respuestas): float
    {
        if (empty($respuestas)) {
            return 0.0;
        }

        // Obtener todos los valores numéricos
        $valores = array_values($respuestas);
        
        // Calcular promedio
        $suma = array_sum($valores);
        $total = count($valores);
        $promedio = $total > 0 ? $suma / $total : 0.0;
        
        // Convertir a porcentaje (0-100)
        $puntuacion = $promedio * 100;
        
        // Redondear a 2 decimales
        return round($puntuacion, 2);
    }

    /**
     * Obtiene el mapeo de preguntas a categorías
     * 
     * @return array Array con [categoria => [indices_preguntas]]
     */
    public static function getPreguntasPorCategoria(): array
    {
        // Mapeo basado en los frameworks de las preguntas
        // Índices son 0-based (pregunta 1 = índice 0)
        return [
            'NIS2_AI_Act' => [0, 1, 2, 3, 4, 5, 6, 8], // Regulación UE (preguntas 1-7, 9)
            'ISO_27090_27091' => [7, 9, 10, 11, 12, 13, 14, 15, 16], // Ciberseguridad (preguntas 8, 10-17)
            'ISO_42001_42005' => [17, 18, 19, 20, 21, 22], // Gestión IA (preguntas 18-23)
            'ISO_23894' => [23, 24, 25, 26], // IA Explicable (preguntas 24-27)
            'CONPES_4144' => [27, 28, 29], // Marco Nacional (preguntas 28-30)
        ];
    }

    /**
     * Calcula las puntuaciones por categoría basándose en las respuestas
     *
     * @param array $respuestas Array de respuestas indexadas [0 => "a) No se realiza", ...]
     * @param string $sector Sector de la empresa para obtener ponderaciones
     * @return array Array con datos para gráficas
     */
    public static function calcularDatosParaGraficas(array $respuestas, string $sector = 'Industrial'): array
    {
        $preguntasPorCategoria = self::getPreguntasPorCategoria();
        $ponderaciones = self::getPonderacionesPorSector($sector);
        
        $categorias = [
            'ISO_27090_27091' => 'Ciberseguridad (ISO 27090/27091)',
            'ISO_23894' => 'IA Explicable (ISO 23894)',
            'NIS2_AI_Act' => 'Regulación UE (NIS2/AI Act)',
            'ISO_42001_42005' => 'Gestión IA (ISO 42001-42005)',
            'CONPES_4144' => 'Marco Nacional (CONPES 4144)',
        ];
        
        $puntuacionesPorCategoria = [];
        $scores = [];
        $weights = [];
        $labels = [];
        
        foreach ($categorias as $key => $label) {
            $indicesPreguntas = $preguntasPorCategoria[$key] ?? [];
            $valoresCategoria = [];
            
            // Obtener valores de las respuestas para esta categoría
            foreach ($indicesPreguntas as $indice) {
                if (isset($respuestas[$indice]) && !empty($respuestas[$indice])) {
                    $valor = self::respuestaToValor($respuestas[$indice]);
                    $valoresCategoria[] = $valor;
                }
            }
            
            // Calcular promedio de la categoría (0-1) y convertir a porcentaje (0-100)
            $promedio = !empty($valoresCategoria) ? array_sum($valoresCategoria) / count($valoresCategoria) : 0;
            $puntuacionPorcentaje = round($promedio * 100, 2);
            
            $puntuacionesPorCategoria[$key] = $puntuacionPorcentaje;
            $scores[] = $puntuacionPorcentaje;
            $weights[] = round(($ponderaciones[$key] ?? 0.20) * 100, 2); // Convertir a porcentaje
            $labels[] = $label;
        }
        
        return [
            'categories' => $labels,
            'scores' => $scores,
            'weights' => $weights,
            'puntuaciones_por_categoria' => $puntuacionesPorCategoria,
        ];
    }

    /**
     * Obtiene el nivel de madurez en gobernanza de IA basado en el porcentaje de implementación
     * Según los niveles definidos en el documento de análisis de resultados
     * 
     * @param float $porcentaje Porcentaje de implementación (0-100)
     * @return array Array con 'nivel' (nombre), 'descripcion' (descripción completa), 'rango' (rango de porcentajes)
     */
    public static function obtenerNivelMadurez(float $porcentaje): array
    {
        // Asegurar que el porcentaje esté en el rango 0-100
        $porcentaje = max(0, min(100, $porcentaje));
        
        if ($porcentaje >= 0 && $porcentaje <= 20) {
            return [
                'nivel' => 'Inicial',
                'descripcion' => 'No hay procesos definidos, gobernanza ad-hoc o inexistente',
                'rango' => '0-20%',
                'emoji' => '🌱',
                'mensaje' => 'Nivel inicial — comienza tu camino en gobernanza de IA'
            ];
        } elseif ($porcentaje >= 21 && $porcentaje <= 40) {
            return [
                'nivel' => 'Básico',
                'descripcion' => 'Se reconocen necesidades, se inician algunas políticas y roles',
                'rango' => '21-40%',
                'emoji' => '📋',
                'mensaje' => 'Nivel básico — estás sentando las bases'
            ];
        } elseif ($porcentaje >= 41 && $porcentaje <= 60) {
            return [
                'nivel' => 'Intermedio',
                'descripcion' => 'Procesos definidos, controles básicos, monitoreo parcial',
                'rango' => '41-60%',
                'emoji' => '📊',
                'mensaje' => 'Nivel intermedio — ¡sigue mejorando!'
            ];
        } elseif ($porcentaje >= 61 && $porcentaje <= 80) {
            return [
                'nivel' => 'Avanzado',
                'descripcion' => 'Procesos maduros, controles robustos, monitoreo proactivo',
                'rango' => '61-80%',
                'emoji' => '⭐',
                'mensaje' => 'Nivel avanzado — excelente trabajo'
            ];
        } else { // 81-100
            return [
                'nivel' => 'Óptimo',
                'descripcion' => 'Gobernanza integrada, proactiva, innovadora',
                'rango' => '81-100%',
                'emoji' => '🏆',
                'mensaje' => 'Nivel óptimo — ¡felicidades por la excelencia!'
            ];
        }
    }
}

