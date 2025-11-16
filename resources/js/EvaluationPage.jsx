import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Pause,
  CheckCircle,
  Clock,
  Info,
  BookOpen,
  Target,
  Award,
  Loader2,
} from "lucide-react";
import { DocumentUpload } from "./DocumentUpload";
import imgLogo from "../assets/logo-principal.jpg";

/* ===== Preguntas (puedes ampliar la lista) ===== */
const QUESTIONS = [
  {
    id: 1,
    text: "¿La empresa identifica y clasifica los sistemas de IA de alto riesgo según su impacto en usuarios o procesos críticos?",
    options: [
      "a) No se realiza",
      "b) En proceso de definirlo",
      "c) Se realiza parcialmente",
      "d) Se tiene un registro actualizado y aprobado",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 2,
    text: "¿Existe una política formal de cumplimiento regulatorio y ético en el uso de IA?",
    options: [
      "a) No existe",
      "b) En elaboración",
      "c) Aprobada pero no implementada completamente",
      "d) Totalmente implementada y revisada anualmente",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 3,
    text: "¿Se monitorean los algoritmos de IA para detectar sesgos o errores en las decisiones?",
    options: [
      "a) No se realiza",
      "b) En pruebas piloto",
      "c) En algunos modelos críticos",
      "d) En todos los sistemas de IA con métricas definidas",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 4,
    text: "¿La empresa tiene un protocolo para notificar incidentes relacionados con IA (fallos, ciberataques, errores de decisión)?",
    options: [
      "a) No existe",
      "b) En desarrollo",
      "c) Existe pero sin pruebas",
      "d) Documentado, probado y vigente",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 5,
    text: "¿Existen roles definidos para la supervisión ética y legal del uso de IA?",
    options: [
      "a) No definidos",
      "b) En proceso de asignación",
      "c) Asignados parcialmente",
      "d) Formalmente designados y activos",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 6,
    text: "¿Se mantiene un inventario actualizado de sistemas, modelos y fuentes de datos utilizados en IA?",
    options: [
      "a) No",
      "b) Parcialmente",
      "c) Se actualiza anualmente",
      "d) Se actualiza trimestralmente o en tiempo real",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 7,
    text: "¿Se exige a los proveedores de IA demostrar cumplimiento con requisitos regulatorios y de seguridad?",
    options: [
      "a) No se exige",
      "b) Solo a algunos proveedores",
      "c) Mediante cláusulas básicas",
      "d) Evaluación formal y documentada de cumplimiento",
    ],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
  {
    id: 8,
    text: "¿Existe un plan de ciberseguridad específico que contemple los sistemas de IA?",
    options: [
      "a) No",
      "b) En diseño",
      "c) Aplicado parcialmente",
      "d) Totalmente implementado",
    ],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
  {
    id: 9,
    text: "¿La dirección revisa y aprueba los riesgos regulatorios asociados a IA? ",
    options: ["a) No", 
              "b) Esporádicamente", 
              "c) Anualmente", 
              "d) Trimestralmente o según cambios normativos"],
    framework: "Marco: NIS2 / AI Act – Regulación y cumplimiento",
  },
    {
    id: 10,
    text: " ¿Existe un plan de ciberseguridad específico que contemple los sistemas de IA? ",
    options: ["a) No", 
              "b) En diseño", 
              "c) Aplicado parcialmente", 
              "d) Totalmente implementado"],
    framework: "Marco:ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 11,
    text: "¿Se aplican controles de acceso diferenciados a los entornos de entrenamiento y despliegue de IA? ",
    options: ["a) No", 
              "b) En implementación", 
              "c) En algunos sistemas", 
              "d) En todos los entornos de IA"],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 12,
    text: "¿Los datos de entrenamiento de IA están protegidos contra alteraciones o fugas de información? ",
    options: ["a) No", 
              "b) Protección básica", 
              "c) Cifrado y control de acceso", 
              "d) Cifrado, monitoreo y auditoría documentada"],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 13,
    text: "¿Se realizan auditorías o pruebas de vulnerabilidad a los sistemas de IA?",
    options: ["a) No", 
              "b) En planeación", 
              "c) Una vez al año", 
              "d) De forma continua con reportes técnicos"],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 14,
    text: "¿Existe plan de respaldo y recuperación de modelos ante incidentes o pérdida de datos? ",
    options: ["a) No", 
              "b) En desarrollo", 
              "c) Manual básico", 
              "d) Documentado y probado"],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 15,
    text: " ¿El personal recibe capacitación en ciberseguridad aplicada a IA? ",
    options: ["a) No", 
              "b) Ocasional", 
              "c) Periódica", 
              "d) Continua y obligatoria "],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 16,
    text: "¿Se utilizan herramientas automatizadas para monitorear amenazas en sistemas de IA? ",
    options: ["a) No", 
              "b) En prueba", 
              "c) En algunas áreas", 
              "d) Implementadas globalmente"],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 17,
    text: "¿Existen políticas de actualización y parcheo de seguridad para modelos IA? ",
    options: ["a) No",
              "b) Parcialmente", 
              "c) Manuales ocasionales", 
              "d) Automáticas y verificadas "],
    framework: "Marco: ISO 27090 / 27091 – Ciberseguridad aplicada a IA",
  },
    {
    id: 18,
    text: "¿Existe una estrategia formal de adopción de IA alineada con los objetivos del negocio?",
    options: ["a) No",
              "b) En formulación", 
              "c) Parcialmente definida", 
              "d) Totalmente implementada"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 19,
    text: "¿Se evalúan los riesgos en cada proyecto de IA antes de su despliegue? ",
    options: ["a) No", 
              "b) En algunos proyectos", 
              "c) Con revisiones periódicas", 
              "d) En todos los proyectos con documentación formal"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 20,
    text: "¿Se miden los resultados de IA mediante indicadores de desempeño (KPIs)?",
    options: ["a) No", 
              "b) En diseño", 
              "c) En algunos modelos", 
              "d) En todos los sistemas implementados"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 21,
    text: "¿Se actualizan los modelos de IA según cambios en los datos o el contexto operativo?",
    options: ["a) No", 
              "b) Esporádicamente", 
              "c) Según revisión programada", 
              "d) Actualización continua documentada"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 22,
    text: "¿Existe comité o figura formal encargada de la gobernanza de IA? ",
    options: ["a) No", 
              "b) En creación", 
              "c) Parcialmente activo", 
              "d) Formalmente establecido con funciones definidas"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 23,
    text: "¿Los proyectos de IA cuentan con ciclo de vida documentado (planeación, despliegue, monitoreo, retiro)? ",
    options: ["a) No", 
              "b) Parcialmente", 
              "c) Documentado en algunos casos", 
              "d) Completamente documentado y aplicado"],
    framework: "Marco: ISO 42001 - 42005 – Gestión y gobernanza del ciclo de vida",
  },
    {
    id: 24,
    text: "¿Los resultados de la IA son comprensibles y explicables para usuarios no técnicos?",
    options: ["a) No", 
              "b) En algunos sistemas", 
              "c) En la mayoría",
              "d) En todos los modelos críticos"],
    framework: "Marco: ISO 23894 – IA Explicable",
  },
    {
    id: 25,
    text: "¿La empresa informa claramente al usuario cuando interactúa con un sistema de IA?",
    options: ["a) No",
              "b) En algunos canales", 
              "c) En la mayoría", 
              "d) Siempre, de forma visible y comprensible"],
    framework: "Marco: ISO 23894 – IA Explicable",
  },
    {
    id: 26,
    text: "¿Se utilizan herramientas o reportes explicativos (SHAP, LIME, etc.) para interpretar decisiones algorítmicas? ",
    options: ["a) No", 
              "b) En pruebas", 
              "c) En algunos modelos", 
              "d) En todos los modelos críticos"],
    framework: "Marco: ISO 23894 – IA Explicable",
  },
    {
    id: 27,
    text: "¿Existen registros auditables de las decisiones automatizadas tomadas por IA? ",
    options: ["a) No", 
              "b) Parciales", 
              "c) Por modelo", 
              "d) Completo y revisado periódicamente"],
    framework: "Marco: ISO 23894 – IA Explicable",
  },
    {
    id: 28,
    text: "¿La empresa aplica los lineamientos del CONPES 4144 en su estrategia de IA? ",
    options: ["a) No", 
              "b) En evaluación", 
              "c) Parcialmente adoptado", 
              "d) Integrado formalmente"],
    framework: "Marco: CONPES 4144 – Política nacional de IA ",
  },
    {
    id: 29,
    text: "¿Participa la empresa en programas públicos de formación o adopción ética de IA? ",
    options: ["a) No", 
              "b) En planeación", 
              "c) En ejecución", 
              "d) Participación activa y continua"],
    framework: "Marco: CONPES 4144 – Política nacional de IA ",
  },
    {
    id: 30,
    text: "¿Promueve la organización el uso ético, inclusivo y sostenible de la IA? ",
    options: ["a) No", 
              "b) Esporádicamente", 
              "c) A través de iniciativas internas", 
              "d) Como parte de su cultura corporativa"],
    framework: "Marco: CONPES 4144 – Política nacional de IA ",
  },

];

const TOTAL_QUESTIONS = QUESTIONS.length;

/* ===== Estilos coherentes con el resto del proyecto ===== */
const styles = `
:root{
  --brand:#1f3d93;
  --brand-2:#2c4fb5;
  --ink:#0b1324;
  --bg-grad:linear-gradient(180deg,#213e90 0%,#1a2e74 100%);
  --card-bg:#ffffff;
  --card-soft:#f3f6ff;
  --shadow:0 16px 40px rgba(15,23,42,.18);
}
*{box-sizing:border-box;}

.eval-page{
  min-height:100vh;
  display:flex;
  flex-direction:column;
  background:var(--bg-grad);
}

/* Header */
.eval-header{
  background:#ffffff;
  border-bottom:1px solid #e5e7eb;
  height:72px;
  padding:10px 22px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.eval-header__logo img{
  height:48px;
  width:auto;
  object-fit:contain;
}
.eval-header__right{
  display:flex;
  align-items:center;
  gap:10px;
}
.eval-chip{
  background:#eef2ff;
  border-radius:999px;
  padding:8px 14px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  box-shadow:0 4px 12px rgba(15,23,42,.12);
  color:#1e3a8a;
  font-weight:700;
  font-size:14px;
}
.btn-pill{
  border-radius:999px;
  border:none;
  padding:9px 18px;
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 8px 20px rgba(15,23,42,.18);
  font-size:14px;
}
.btn-secondary{
  background:#ffffff;
  color:#0f172a;
  border:1px solid #d0d7e6;
}
.btn-secondary:hover{background:#f5f7fb;}
.btn-warning{
  background:#f97316;
  color:#ffffff;
}
.btn-warning:hover{filter:brightness(1.05);}

/* Contenido */
.eval-main{
  flex:1;
  padding:22px 16px 32px;
}
.eval-main__inner{
  max-width:1180px;
  margin:0 auto;
  display:grid;
  grid-template-columns:280px minmax(0,1fr);
  gap:18px;
}
@media (max-width:960px){
  .eval-main__inner{
    grid-template-columns:1fr;
  }
}

/* Panel lateral */
.side-card{
  background:var(--card-bg);
  border-radius:18px;
  box-shadow:var(--shadow);
  border:1px solid #dbe2f3;
  padding:16px 16px 18px;
}
.side-card + .side-card{
  margin-top:14px;
}
.side-title{
  display:flex;
  align-items:center;
  gap:8px;
  margin:0 0 6px;
  color:#0b1324;
  font-weight:800;
}
.side-sub{
  margin:0 0 12px;
  color:#64748b;
  font-size:13px;
}
.side-row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-top:6px;
  font-size:13px;
}
.side-label{color:#64748b;}
.side-value{
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-weight:700;
}
.side-value--ok{color:#15803d;}
.side-value--warn{color:#b45309;}
.badge-soft{
  padding:3px 9px;
  border-radius:999px;
  border:1px solid #cbd5e1;
  font-size:12px;
  font-weight:700;
  color:#1e3a8a;
  background:#eef2ff;
}

/* barra progreso */
.progress-wrap{margin-top:8px;}
.progress{
  width:100%;
  height:8px;
  background:#e5e7eb;
  border-radius:999px;
  overflow:hidden;
}
.progress__fill{
  height:100%;
  background:linear-gradient(90deg,#4d82bc,#5a8fc9);
}

/* Card principal */
.eval-body-card{
  background:var(--card-bg);
  border-radius:20px;
  box-shadow:var(--shadow);
  border:1px solid #dbe2f3;
  padding:18px 20px 20px;
}
.eval-header-main{
  margin-bottom:14px;
}
.eval-title{
  margin:0 0 4px;
  color:#f9fafb;
  font-size:20px;
  font-weight:800;
}
.eval-subtitle{
  margin:0;
  color:#e5e7eb;
  font-size:14px;
}

/* Franja azul encima de la card */
.eval-body-card__headband{
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:linear-gradient(90deg,#2542a2,#365bb8);
  border-radius:16px;
  padding:10px 14px;
  margin-bottom:14px;
  color:#e5edff;
}
.eval-body-card__headband h2{
  margin:0;
  font-size:18px;
  font-weight:800;
}
.eval-body-card__headband .framework-pill{
  padding:4px 10px;
  border-radius:999px;
  background:rgba(15,23,42,.14);
  border:1px solid rgba(226,232,240,.6);
  font-size:12px;
  font-weight:700;
}

/* Pregunta */
.question-text{
  margin:0;
  color:#0b1324;
  font-size:17px;
  font-weight:700;
  line-height:1.5;
}

/* Opciones */
.options-list{
  margin-top:16px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.option-item{
  border-radius:16px;
  border:1px solid #dbe2f3;
  background:#f9fbff;
  padding:10px 12px;
  display:flex;
  gap:10px;
  align-items:flex-start;
  cursor:pointer;
  transition:all .18s ease;
}
.option-item:hover{
  box-shadow:0 10px 28px rgba(15,23,42,.16);
  background:#ffffff;
}
.option-item--active{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9);
  border-color:transparent;
  box-shadow:0 16px 36px rgba(15,23,42,.4);
}
.option-dot{
  width:18px;
  height:18px;
  border-radius:50%;
  border:2px solid #9ca3af;
  margin-top:3px;
  flex-shrink:0;
}
.option-dot--active{
  border-color:#ffffff;
  background:#ffffff;
  box-shadow:0 0 0 3px rgba(59,130,246,.65);
}
.option-text{
  font-size:15px;
  color:#0b172a;
}
.option-text--active{
  color:#ffffff;
  font-weight:600;
}
.option-check{
  margin-left:auto;
  color:#ffffff;
}

/* Navegación */
.eval-nav{
  margin-top:18px;
  padding-top:12px;
  border-top:1px solid #e5e7eb;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.eval-nav__center{
  text-align:center;
  font-size:13px;
  color:#0f172a;
}
.eval-nav__center span{
  display:inline-flex;
  align-items:center;
  gap:6px;
}
.eval-nav__center--pending{
  color:#b45309;
}
.eval-nav__center--ok{
  color:#15803d;
}

/* Botones nav principales */
.btn-nav{
  border-radius:999px;
  padding:9px 18px;
  border:none;
  display:inline-flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  cursor:pointer;
  font-size:14px;
  box-shadow:0 8px 20px rgba(15,23,42,.18);
}
.btn-nav--prev{
  background:#ffffff;
  color:#0f172a;
  border:1px solid #d1d5db;
}
.btn-nav--prev[disabled]{
  opacity:.4;
  cursor:not-allowed;
  box-shadow:none;
}
.btn-nav--next{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9);
  color:#ffffff;
}
.btn-nav--next[disabled]{
  opacity:.45;
  cursor:not-allowed;
  box-shadow:none;
}

/* Paginador de puntitos */
.eval-dots{
  margin-top:18px;
  display:flex;
  justify-content:center;
}
.eval-dots__box{
  background:#ffffff;
  border-radius:999px;
  padding:8px 12px;
  box-shadow:0 10px 22px rgba(15,23,42,.3);
  display:flex;
  align-items:center;
  gap:5px;
}
.eval-dot{
  width:8px;
  height:8px;
  border-radius:999px;
  background:#cbd5e1;
  transition:all .18s;
}
.eval-dot--current{
  width:26px;
  background:#4d82bc;
}
.eval-dot--answered{
  background:#16a34a;
}
.eval-dots__more{
  margin-left:8px;
  font-size:11px;
  color:#6b7280;
}
`;

/* ===== Componente principal ===== */
export function EvaluationPage({ onBack, onPause, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [lastAnswers, setLastAnswers] = useState(null); // Guardar respuestas para reintentar
  const [evaluationId, setEvaluationId] = useState(null); // ID de la evaluación actual
  const [loadingEvaluation, setLoadingEvaluation] = useState(true); // Cargando evaluación incompleta
  const [savingProgress, setSavingProgress] = useState(false); // Guardando progreso
  
  // Estado para documentos (máximo 3)
  const [documents, setDocuments] = useState({
    0: null, // Documento después de pregunta 10 (índice 9)
    1: null, // Documento después de pregunta 20 (índice 19)
    2: null, // Documento después de pregunta 30 (índice 29)
  });

  const currentQuestion = QUESTIONS[currentIndex];

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / TOTAL_QUESTIONS) * 100;

  // Verificar si hay una evaluación incompleta al cargar
  useEffect(() => {
    const checkIncompleteEvaluation = async () => {
      try {
        const token = document.head?.querySelector('meta[name="csrf-token"]');
        if (token) {
          axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }

        const axiosClient = window.axios || axios;
        const response = await axiosClient.get('/api/evaluation/check-incomplete');

        if (response.data && response.data.success && response.data.has_incomplete) {
          const data = response.data.data;
          setEvaluationId(data.id_evaluacion);
          
          // Cargar respuestas guardadas
          if (data.respuestas && Object.keys(data.respuestas).length > 0) {
            // Convertir respuestas guardadas (texto) a índices de opciones
            const respuestasCargadas = {};
            Object.keys(data.respuestas).forEach((preguntaIndex) => {
              const index = parseInt(preguntaIndex);
              const respuestaTexto = data.respuestas[preguntaIndex];
              
              // Buscar qué opción coincide con el texto guardado
              const pregunta = QUESTIONS[index];
              if (pregunta) {
                const opcionIndex = pregunta.options.findIndex(opt => opt === respuestaTexto);
                if (opcionIndex !== -1) {
                  respuestasCargadas[index] = opcionIndex;
                }
              }
            });
            
            setAnswers(respuestasCargadas);
            
            // Ir a la primera pregunta sin respuesta
            const primeraSinRespuesta = QUESTIONS.findIndex((_, idx) => !respuestasCargadas[idx]);
            if (primeraSinRespuesta !== -1) {
              setCurrentIndex(primeraSinRespuesta);
            }
          }
        } else {
          // No hay evaluación incompleta, crear una nueva
          await createNewEvaluation();
        }
      } catch (error) {
        console.error('Error al verificar evaluación incompleta:', error);
        // En caso de error, intentar crear una nueva evaluación
        await createNewEvaluation();
      } finally {
        setLoadingEvaluation(false);
      }
    };

    checkIncompleteEvaluation();
  }, []);

  // Crear una nueva evaluación
  const createNewEvaluation = async () => {
    try {
      // Crear evaluación vacía al iniciar (se actualizará cuando se envíe)
      // Por ahora, solo marcamos que no hay evaluación existente
      setEvaluationId(null);
    } catch (error) {
      console.error('Error al crear nueva evaluación:', error);
    }
  };

  // Guardar progreso automáticamente cuando se selecciona una respuesta
  const saveProgress = async (preguntaIndex, respuestaTexto) => {
    if (!evaluationId) {
      // Si no hay evaluación, crear una primero con la primera respuesta
      try {
        const token = document.head?.querySelector('meta[name="csrf-token"]');
        if (token) {
          axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }

        // Crear evaluación con la primera respuesta
        const respuestasArray = new Array(TOTAL_QUESTIONS).fill('');
        respuestasArray[preguntaIndex] = respuestaTexto;

        const axiosClient = window.axios || axios;
        const createResponse = await axiosClient.post('/api/evaluation/submit', {
          respuestas: respuestasArray,
          tiempo: elapsed / 60,
          prompt: '',
          documentos: [],
        });

        if (createResponse.data && createResponse.data.success) {
          const newId = createResponse.data.data?.id_evaluacion;
          if (newId) {
            setEvaluationId(newId);
          }
        }
      } catch (error) {
        console.error('Error al crear evaluación:', error);
      }
      return;
    }

    await saveSingleAnswer(evaluationId, preguntaIndex, respuestaTexto);
  };

  // Guardar una respuesta individual
  const saveSingleAnswer = async (idEval, preguntaIndex, respuestaTexto) => {
    if (savingProgress) return; // Evitar múltiples guardados simultáneos
    
    setSavingProgress(true);
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      await axiosClient.post('/api/evaluation/save-progress', {
        id_evaluacion: idEval,
        pregunta_index: preguntaIndex,
        respuesta: respuestaTexto,
      });
    } catch (error) {
      console.error('Error al guardar progreso:', error);
      // No mostrar error al usuario, solo loguear
    } finally {
      setSavingProgress(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // cuando cambias de pregunta, carga la respuesta previa
    setSelected(
      Object.prototype.hasOwnProperty.call(answers, currentIndex)
        ? answers[currentIndex]
        : null
    );
  }, [currentIndex, answers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelect = (idx) => {
    setSelected(idx);
  };

  const handleNext = async () => {
    if (selected === null) return;
    
    const newAnswers = { ...answers, [currentIndex]: selected };
    setAnswers(newAnswers);

    // Guardar progreso automáticamente
    const pregunta = QUESTIONS[currentIndex];
    const respuestaTexto = pregunta.options[selected];
    await saveProgress(currentIndex, respuestaTexto);

    if (currentIndex === TOTAL_QUESTIONS - 1) {
      // Última pregunta - enviar evaluación
      await handleSubmitEvaluation(newAnswers);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const handleSubmitEvaluation = async (allAnswers, isRetry = false) => {
    // Validar que todas las preguntas estén respondidas
    const preguntasRespondidas = Object.keys(allAnswers).length;
    if (preguntasRespondidas < TOTAL_QUESTIONS) {
      const preguntasPendientes = TOTAL_QUESTIONS - preguntasRespondidas;
      setSubmitError(`Debes responder todas las preguntas antes de finalizar. Te faltan ${preguntasPendientes} pregunta${preguntasPendientes > 1 ? 's' : ''}.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setShowRetry(false);
    
    // Guardar respuestas para poder reintentar
    if (!isRetry) {
      setLastAnswers(allAnswers);
    }

    try {
      // Obtener token CSRF
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      // Convertir respuestas a formato de array [0 => "a", 1 => "b", ...]
      // donde el índice es el número de pregunta (0-based) y el valor es la opción seleccionada
      const respuestasArray = [];
      for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        if (allAnswers[i] !== undefined) {
          // Obtener el texto de la opción seleccionada
          const pregunta = QUESTIONS[i];
          const opcionSeleccionada = pregunta.options[allAnswers[i]];
          respuestasArray.push(opcionSeleccionada);
        } else {
          respuestasArray.push(''); // Pregunta no respondida
        }
      }

      // Calcular tiempo en minutos
      const tiempoMinutos = elapsed / 60;

      // Preparar datos para enviar
      // Si hay una evaluación existente, incluir su ID
      const datosEnvio = {
        respuestas: respuestasArray,
        tiempo: parseFloat(tiempoMinutos.toFixed(2)),
        prompt: '', // El usuario puede agregar un prompt personalizado si lo desea
        documentos: Object.values(documents).filter(doc => doc !== null), // Solo documentos subidos
        id_evaluacion: evaluationId, // Incluir ID si existe
      };

      const axiosClient = window.axios || axios;
      
      // Crear un timeout de 20 segundos
      const timeoutId = setTimeout(() => {
        setIsSubmitting(false);
        setShowRetry(true);
        setSubmitError('El servidor está tardando demasiado en responder. Puedes intentar nuevamente.');
      }, 20000); // 20 segundos

      try {
        const response = await axiosClient.post('/api/evaluation/submit', datosEnvio, {
          timeout: 20000, // Timeout de 20 segundos
        });

        // Limpiar el timeout si la respuesta llega a tiempo
        clearTimeout(timeoutId);

        if (response.data && response.data.success) {
          // Éxito - llamar al callback con el ID de evaluación
          onComplete?.(allAnswers, response.data.data?.id_evaluacion);
        } else {
          throw new Error(response.data?.error || 'Error al enviar la evaluación');
        }
      } catch (requestError) {
        // Limpiar el timeout si hay un error
        clearTimeout(timeoutId);
        
        // Si es un error de timeout, mostrar mensaje de reintentar
        if (requestError.code === 'ECONNABORTED' || requestError.message?.includes('timeout')) {
          setShowRetry(true);
          setSubmitError('La solicitud tardó demasiado. Por favor, intenta nuevamente.');
          setIsSubmitting(false);
          return;
        }
        
        // Para otros errores, lanzar la excepción para que se maneje abajo
        throw requestError;
      }

    } catch (error) {
      console.error('Error al enviar evaluación:', error);
      
      // Si no es un error de timeout, mostrar el error normal
      if (!showRetry) {
        setSubmitError(
          error.response?.data?.error || 
          error.response?.data?.message || 
          'Error al enviar la evaluación. Por favor, intenta nuevamente.'
        );
        setShowRetry(true); // Permitir reintentar en caso de error
      }
      
      setIsSubmitting(false);
      // No llamar a onComplete si hay error
    }
  };

  const handleRetry = () => {
    if (lastAnswers) {
      handleSubmitEvaluation(lastAnswers, true);
    }
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
  };

  // Mostrar loading mientras se verifica la evaluación incompleta
  if (loadingEvaluation) {
    return (
      <div className="eval-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{styles}</style>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: '#173b8f', margin: '0 auto 16px' }} />
          <p style={{ color: '#173b8f', fontSize: 18, fontWeight: 600 }}>Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="eval-page">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="eval-header">
        <div className="eval-header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>

        <div className="eval-header__right">
          {/* Tiempo */}
          <div className="eval-chip">
            <Clock size={16} />
            <span>{formatTime(elapsed)}</span>
          </div>

          {/* Botón volver */}
          <button
            className="btn-pill btn-secondary"
            type="button"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          {/* Botón pausar */}
          <button
            className="btn-pill btn-warning"
            type="button"
            onClick={onPause}
          >
            <Pause size={16} />
            Pausar
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="eval-main">
        <div className="eval-main__inner">
          {/* Sidebar izquierda */}
          <aside>
            <div className="side-card">
              <h3 className="side-title">
                <Target size={18} style={{ color: "#1f3d93" }} />
                Progreso general
              </h3>
              <p className="side-sub">
                Avance de la evaluación en función de las preguntas respondidas.
              </p>

              <div className="progress-wrap">
                <div className="progress">
                  <div
                    className="progress__fill"
                    style={{ width: `${progress || 2}%` }}
                  />
                </div>
                <div className="side-row">
                  <span className="side-label">Completado</span>
                  <span className="side-value">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="side-row">
                <span className="side-label">Pregunta actual</span>
                <span className="side-value">
                  <span className="badge-soft">
                    {currentIndex + 1}/{TOTAL_QUESTIONS}
                  </span>
                </span>
              </div>

              <div className="side-row">
                <span className="side-label">Respondidas</span>
                <span className="side-value side-value--ok">
                  <CheckCircle size={14} />
                  {answeredCount}
                </span>
              </div>

              <div className="side-row">
                <span className="side-label">Pendientes</span>
                <span className="side-value side-value--warn">
                  {TOTAL_QUESTIONS - answeredCount}
                </span>
              </div>
            </div>

            <div className="side-card" style={{ background: "#f3f6ff" }}>
              <h3 className="side-title">
                <Info size={16} style={{ color: "#1f3d93" }} />
                Recomendaciones
              </h3>
              <p className="side-sub">
                Responde con honestidad según la realidad actual de tu organización.
              </p>

              <div className="side-row" style={{ alignItems: "flex-start" }}>
                <span className="side-label" style={{ display: "flex", gap: 6 }}>
                  <BookOpen size={14} />
                  Guía
                </span>
                <span style={{ fontSize: 12, color: "#4b5563", textAlign: "right" }}>
                  No te preocupes por “acertar”, el objetivo es conocer el nivel de
                  madurez en gobernanza de IA.
                </span>
              </div>

              <div className="side-row" style={{ alignItems: "flex-start", marginTop: 10 }}>
                <span className="side-label" style={{ display: "flex", gap: 6 }}>
                  <Award size={14} />
                  Consejo
                </span>
                <span style={{ fontSize: 12, color: "#4b5563", textAlign: "right" }}>
                  Si no estás seguro, elige la opción más cercana a la práctica
                  habitual de tu organización.
                </span>
              </div>
            </div>
          </aside>

          {/* Zona principal derecha */}
          <section>
            <div className="eval-body-card">
              {/* Cabecera azul de la pregunta */}
              <div className="eval-body-card__headband">
                <div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Evaluación de Gobernanza</div>
                  <h2>{`Pregunta ${currentIndex + 1}`}</h2>
                </div>
                <div className="framework-pill">
                  {currentQuestion.framework}
                </div>
              </div>

              {/* Texto de pregunta */}
              <p className="question-text">{currentQuestion.text}</p>

              {/* Opciones */}
              <div className="options-list">
                {currentQuestion.options.map((opt, idx) => {
                  const active = selected === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`option-item ${active ? "option-item--active" : ""}`}
                      onClick={() => handleSelect(idx)}
                    >
                      <span
                        className={`option-dot ${
                          active ? "option-dot--active" : ""
                        }`}
                      />
                      <span
                        className={`option-text ${
                          active ? "option-text--active" : ""
                        }`}
                      >
                        {opt}
                      </span>
                      {active && (
                        <span className="option-check">
                          <CheckCircle size={18} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subida de documentos cada 10 preguntas */}
              {(currentIndex === 9 || currentIndex === 19 || currentIndex === 29) && (
                <DocumentUpload
                  currentFileIndex={Math.floor(currentIndex / 10)}
                  maxFiles={3}
                  maxSizeMB={2}
                  uploadedFile={documents[Math.floor(currentIndex / 10)]}
                  evaluationId={evaluationId}
                  onUpload={(documentData) => {
                    setDocuments(prev => ({
                      ...prev,
                      [Math.floor(currentIndex / 10)]: documentData
                    }));
                    // Actualizar evaluationId si viene en la respuesta
                    if (documentData.id_evaluacion && !evaluationId) {
                      setEvaluationId(documentData.id_evaluacion);
                    }
                  }}
                  disabled={isSubmitting}
                />
              )}

              {/* Mensaje de error y opción de reintentar */}
              {submitError && (
                <div style={{
                  marginTop: 12,
                  padding: 16,
                  background: showRetry ? "#fef3c7" : "#fee2e2",
                  border: `1px solid ${showRetry ? "#fcd34d" : "#fecaca"}`,
                  borderRadius: 12,
                  color: showRetry ? "#92400e" : "#991b1b",
                  fontSize: 14
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: 4 }}>
                        {showRetry ? "⏱️ Tiempo de espera agotado" : "❌ Error al enviar"}
                      </strong>
                      <p style={{ margin: 0, fontSize: 13 }}>
                        {submitError}
                      </p>
                    </div>
                  </div>
                  
                  {showRetry && (
                    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="btn-nav btn-nav--next"
                        onClick={handleRetry}
                        disabled={isSubmitting}
                        style={{
                          background: "linear-gradient(90deg, #f59e0b, #f97316)",
                          color: "#fff",
                          border: "none",
                          padding: "10px 20px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          opacity: isSubmitting ? 0.6 : 1,
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Reintentando...
                          </>
                        ) : (
                          <>
                            🔄 Reintentar Envío
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navegación */}
              <div className="eval-nav">
                <button
                  type="button"
                  className="btn-nav btn-nav--prev"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft size={16} />
                  Anterior
                </button>

                <div className="eval-nav__center">
                  {selected === null ? (
                    <span className="eval-nav__center--pending">
                      Selecciona una respuesta para continuar
                    </span>
                  ) : (
                    <span className="eval-nav__center--ok">
                      <CheckCircle size={14} />
                      Respuesta seleccionada ({answeredCount}/{TOTAL_QUESTIONS})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-nav btn-nav--next"
                  onClick={handleNext}
                  disabled={selected === null || isSubmitting}
                  title={
                    selected === null 
                      ? "Debes seleccionar una respuesta para continuar" 
                      : currentIndex === TOTAL_QUESTIONS - 1 && answeredCount < TOTAL_QUESTIONS
                        ? `Te faltan ${TOTAL_QUESTIONS - answeredCount} pregunta${TOTAL_QUESTIONS - answeredCount > 1 ? 's' : ''} por responder`
                        : ""
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : currentIndex === TOTAL_QUESTIONS - 1 ? (
                    <>
                      {answeredCount < TOTAL_QUESTIONS ? (
                        <>
                          Finalizar ({answeredCount}/{TOTAL_QUESTIONS})
                        </>
                      ) : (
                        <>
                          Finalizar
                          <ArrowRight size={16} />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Puntos de avance abajo */}
            <div className="eval-dots">
              <div className="eval-dots__box">
                {QUESTIONS.map((_, i) => {
                  const isCurrent = i === currentIndex;
                  const isAnswered = answers[i] !== undefined;
                  return (
                    <span
                      key={i}
                      className={`eval-dot ${
                        isCurrent
                          ? "eval-dot--current"
                          : isAnswered
                          ? "eval-dot--answered"
                          : ""
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
