import React from "react";
import {
  CheckCircle2,
  Trophy,
  Star,
  Download,
  ArrowLeft,
  Clock,
  Target,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { motion } from "motion/react";
import imgLogo from "../assets/logo-principal.jpg";

/* ========= Estilos embebidos (coherentes con Login/Dashboard/Perfil) ========= */
const styles = `
:root{
  --brand:#1f3d93; --brand-2:#2c4fb5; --ink:#0b1324; --muted:#dbe7ff;
  --ring:#cfd7e6; --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#213e90 0%,#1a2e74 100%)}

/* Header blanco */
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:70px;display:flex;align-items:center;justify-content:space-between;padding:10px 18px}
.header__logo img{height:46px;width:auto;object-fit:contain}
.btn-ghost{background:#fff;border:1px solid var(--ring);color:#0f172a;padding:10px 18px;border-radius:999px;display:inline-flex;gap:8px;align-items:center;font-weight:800}
.btn-ghost:hover{background:#f6f8fc}

/* Contenido */
.wrap{max-width:1024px;margin:0 auto;padding:28px 16px}

/* Hero de éxito */
.hero{text-align:center;margin-bottom:20px}
.success-ring{position:relative;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px}
.success-core{background:linear-gradient(135deg,#22c55e,#16a34a);border-radius:999px;padding:22px;box-shadow:0 18px 50px rgba(34,197,94,.35)}
.success-glow{position:absolute;inset:-10px;background:rgba(34,197,94,.35);filter:blur(24px);border-radius:999px;opacity:.5}

/* Métricas */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:18px}
@media (max-width: 900px){ .grid{grid-template-columns:1fr} }
.metric-card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.metric-body{padding:18px;text-align:center}
.metric-icon{width:56px;height:56px;border-radius:999px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;background:#eef4ff;color:#2b51c2}
.metric-title{color:#173b8f;font-size:28px;font-weight:800;margin:0 0 4px}
.metric-sub{color:#5b677a;font-size:14px;margin:0}

/* Bloque principal resultados */
.results-card{background:linear-gradient(135deg,#5882b8,#4a7ba7);border-radius:22px;box-shadow:0 24px 64px rgba(2,6,23,.28);color:#fff;overflow:hidden;border:1px solid #4f79a7}
.results-head{padding:18px;text-align:center;border-bottom:1px solid rgba(255,255,255,.18)}
.results-title{display:inline-flex;gap:10px;align-items:center;font-size:24px;font-weight:800;margin:0}
.results-desc{color:rgba(255,255,255,.9);font-size:15px;margin-top:6px}
.results-body{padding:18px;display:grid;gap:14px}
.results-list{background:rgba(255,255,255,.1);backdrop-filter:blur(4px);border-radius:18px;padding:16px}
.results-list h3{font-size:16px;margin:0 0 10px;display:flex;align-items:center;gap:8px;color:#fff}
.results-list ul{margin:0;padding-left:0;list-style:none;display:grid;gap:8px}
.results-list li{display:flex;gap:10px;align-items:flex-start;color:rgba(255,255,255,.95);font-size:14px}

/* Botones */
.btn-secondary{
  background:rgba(255,255,255,.18);color:#fff;border:2px solid rgba(255,255,255,.3);
  border-radius:999px;padding:12px 16px;font-weight:800;display:inline-flex;gap:8px;align-items:center;justify-content:center;
  width:100%;
}
.btn-secondary:hover{background:rgba(255,255,255,.25)}

/* Footer note */
.note{color:#e2e8f0;text-align:center;font-size:13px;margin-top:16px}
`;

export function EvaluationCompletedPage({ onBack, onDownloadPdf }) {
  // Datos de ejemplo (puedes sustituir con los reales)
  const evaluationData = {
    questionsAnswered: 50,
    timeSpent: "18 min",
    completionDate: new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  };

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>
      </header>

      {/* Contenido */}
      <main className="wrap">
        {/* Hero éxito */}
        <motion.div
          className="hero"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .25 }}
        >
          <div className="success-ring">
            <div className="success-glow"></div>
            <motion.div
              className="success-core"
              initial={{ scale: .9 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 16, delay: .05 }}
            >
              <CheckCircle2 size={64} color="#fff" />
            </motion.div>
            <motion.div
              style={{ position:"absolute", top:-8, right:-8 }}
              animate={{ rotate:360, scale:[1,1.15,1] }}
              transition={{ duration:3, repeat:Infinity, ease:"linear" }}
            >
              <Sparkles size={22} color="#fde047" />
            </motion.div>
          </div>

          {/* Título y subtítulo en BLANCO */}
          <h1 style={{ margin:"0 0 6px", color:"#ffffff", fontSize:32, fontWeight:900 }}>
            ¡Evaluación completada!
          </h1>
          <p style={{ margin:0, color:"#ffffff" }}>
            Has finalizado la evaluación de gobernanza de IA. Tus resultados ya están disponibles.
          </p>
        </motion.div>

        {/* Métricas */}
        <section className="grid">
          <Card className="metric-card">
            <CardContent className="metric-body">
              <div className="metric-icon"><Target size={26} /></div>
              <div className="metric-title">{evaluationData.questionsAnswered}</div>
              <p className="metric-sub">Preguntas respondidas</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="metric-body">
              <div className="metric-icon" style={{background:"#f3ecff", color:"#7a4fd6"}}><Clock size={26} /></div>
              <div className="metric-title">{evaluationData.timeSpent}</div>
              <p className="metric-sub">Tiempo invertido</p>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="metric-body">
              <div className="metric-icon" style={{background:"#e9fbf0", color:"#16a34a"}}><Trophy size={26} /></div>
              <div className="metric-title" style={{fontSize:20}}>Completada</div>
              <p className="metric-sub">{evaluationData.completionDate}</p>
            </CardContent>
          </Card>
        </section>

        {/* Resultados disponibles (solo botón Descargar PDF) */}
        <section className="results-card">
          <div className="results-head">
            <h2 className="results-title">Resultados disponibles</h2>
            <p className="results-desc">Tu análisis detallado de gobernanza de IA está listo para descargar</p>
          </div>

          <div className="results-body">
            <div className="results-list">
              <h3><Star size={18} color="#fde047" /> Lo que incluye el informe</h3>
              <ul>
                <li><CheckCircle2 size={18} color="#bbf7d0" /> Puntuación general de madurez en gobernanza de IA.</li>
                <li><CheckCircle2 size={18} color="#bbf7d0" /> Análisis por cada una de las 5 dimensiones evaluadas.</li>
                <li><CheckCircle2 size={18} color="#bbf7d0" /> Gráficos de radar y barras comparativas.</li>
                <li><CheckCircle2 size={18} color="#bbf7d0" /> Recomendaciones priorizadas para mejorar.</li>
                <li><CheckCircle2 size={18} color="#bbf7d0" /> Comparativa con marcos (ISO, NIS2, CONPES).</li>
              </ul>
            </div>

            {/* ÚNICO botón: Descargar PDF */}
            <button className="btn-secondary" onClick={onDownloadPdf}>
              <Download size={18} /> Descargar PDF
            </button>
          </div>
        </section>

        <p className="note">
          Gracias por utilizar el Evaluador de Gobernanza de IA. Tu compromiso con la IA responsable es clave.
        </p>
      </main>
    </div>
  );
}

export default EvaluationCompletedPage;
