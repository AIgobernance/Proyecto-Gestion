import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import imgLogo from "../assets/logo-principal.jpg";
import { motion } from "motion/react";
import {
  FileText,
  Calendar as CalIcon,
  Award,
  TrendingUp,
  LogOut,
  ChevronRight,
  Clock,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Calendar } from "../ui/calendar";

/* ===== Estilos ===== */
const styles = `
:root{
  --brand:#1f3d93; --brand-2:#2c4fb5; --ink:#0b1324;
  --ring:#cfd7e6; --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#213e90 0%,#1a2e74 100%)}

/* Header */
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:70px;display:flex;align-items:center;justify-content:space-between;padding:10px 18px}
.header__logo img{height:46px;width:auto;object-fit:contain}
.btn-ghost{background:#fff;border:1px solid var(--ring);color:var(--ink);padding:10px 18px;border-radius:999px}
.btn-ghost:hover{background:#f6f8fc}

/* Contenido */
.container{max-width:1120px;margin:0 auto;padding:28px 16px}

/* Tarjetas resumen */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media (max-width: 900px){ .grid{grid-template-columns:1fr} }
.card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.metric{display:flex;align-items:center;justify-content:space-between}
.metric .num{font-size:32px;color:#173b8f;font-weight:800}
.bubble{background:#eaf0ff;border-radius:999px;padding:10px;display:inline-flex;color:#2b51c2}

/* Filtros */
.filters{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:18px;margin-bottom:10px}
.filter-pill{
  display:inline-flex;align-items:center;gap:8px;
  background:#fff;border:1px solid var(--ring);color:#173b8f;
  padding:10px 14px;border-radius:999px;font-weight:800;cursor:pointer;
  box-shadow:0 6px 18px rgba(2,6,23,.06);
}
.filter-pill:hover{background:#f7f9ff}
.subtle{background:#fff;border:1px solid var(--ring);color:#0f172a;padding:8px 14px;border-radius:999px;cursor:pointer}
.subtle:hover{background:#f7f9ff}

/* Popups */
.pop{position:relative}
.pop-panel{
  position:absolute; z-index:40; top:52px; left:0;
  background:#fff;border:1px solid #e9edf5;border-radius:16px;box-shadow:0 24px 64px rgba(2,6,23,.28);
  padding:10px; min-width:280px;
}
.pop-actions{display:flex;justify-content:space-between;align-items:center;padding:8px 6px 2px;gap:8px}
.pop-apply{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border:none;
  border-radius:999px; padding:8px 14px; font-weight:800; cursor:pointer;
}
.pop-clear{background:#fff;border:1px solid var(--ring);border-radius:999px;padding:8px 12px;font-weight:800;color:#173b8f;cursor:pointer}

/* Popup año */
.year-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px}
.year-item{
  text-align:center;border:1px solid #e9edf5;border-radius:12px;padding:8px;cursor:pointer;
  background:linear-gradient(90deg,#f7faff,#eef4ff);
  font-weight:800;color:#173b8f;
}
.year-item:hover{box-shadow:0 8px 18px rgba(2,6,23,.12)}

/* Listado */
.list-card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.item{border:2px solid transparent;border-radius:16px;transition:border-color .15s ease, box-shadow .15s ease;cursor:pointer}
.item:hover{border-color:#cfe0ff;box-shadow:0 10px 28px rgba(2,6,23,.14)}
.item .title{font-size:18px;color:#0f172a;margin:0 0 2px}
.row{display:flex;align-items:center;gap:6px;color:#475569;font-size:14px}

/* Badge de score */
.badge{border-radius:999px;padding:6px 10px;font-weight:800;color:#fff}
.badge--excelente{background:#10b981}
.badge--bueno{background:#3b82f6}
.badge--regular{background:#f59e0b}
.badge--mejora{background:#ef4444}

/* Botón primario “pill” */
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff;
  border-radius:999px; padding:10px 16px; font-weight:800; border:none;
  display:inline-flex;align-items:center;gap:8px;
  box-shadow:0 12px 28px rgba(2,6,23,.18); cursor:pointer;
}
.btn-primary:hover{filter:brightness(1.02)}

/* Animación de carga */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
`;

/* Datos de ejemplo (fallback si no hay datos) */
const MOCK_EVALUATIONS = [];

/* Utils */
const parseDMY = (str) => { const [d, m, y] = str.split("/").map(Number); return new Date(y, m - 1, d); };
const formatDMY = (d) => d ? `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}` : "";

export function ViewEvaluationsPage({
  onExit = () => window.location.assign("/dashboard"),
  onViewResults = (id) => window.location.assign(`/evaluation/${id}/completed`),
}) {
  /* ====== Estado ====== */
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ====== Cargar evaluaciones ====== */
  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      // Forzar actualización agregando timestamp para evitar caché
      const response = await axiosClient.get('/api/evaluations', {
        params: {
          _t: Date.now() // Timestamp para evitar caché del navegador
        }
      });

      console.log('=== DEBUG: Respuesta completa del API ===', response);
      console.log('=== DEBUG: response.data ===', response.data);
      console.log('=== DEBUG: response.data.success ===', response.data?.success);
      console.log('=== DEBUG: response.data.data ===', response.data?.data);
      console.log('=== DEBUG: response.data.debug ===', response.data?.debug);
      
      // Mostrar información del debug si está disponible
      if (response.data?.debug) {
        console.log('=== DEBUG INFO ===', {
          user_id: response.data.debug.user_id,
          total_en_bd: response.data.debug.total_en_bd,
          total_formateadas: response.data.debug.total_formateadas
        });
      }

      if (response.data && response.data.success !== false) {
        const data = response.data.data || response.data || [];
        console.log('=== DEBUG: Evaluaciones recibidas ===', {
          esArray: Array.isArray(data),
          longitud: Array.isArray(data) ? data.length : 'NO ES ARRAY',
          datos: data
        });
        
        // Asegurar que los datos tengan el formato correcto
        let evaluacionesFormateadas = [];
        
        if (Array.isArray(data) && data.length > 0) {
          evaluacionesFormateadas = data.map((ev, index) => {
            console.log(`=== DEBUG: Evaluación ${index} ===`, ev);
            return {
              id: ev.id || ev.Id_Evaluacion || ev.id_evaluacion || null,
              name: ev.name || ev.Nombre || ev.nombre || `Evaluación #${ev.id || ev.Id_Evaluacion || ev.id_evaluacion || 'N/A'}`,
              date: ev.date || ev.Fecha || ev.fecha || 'N/A',
              time: ev.time || ev.Hora || ev.hora || 'N/A',
              tiempo: ev.tiempo || ev.Tiempo || ev.tiempo || 'N/A',
              score: ev.score !== undefined && ev.score !== null ? (parseFloat(ev.score) || 0) : (ev.Puntuacion !== undefined && ev.Puntuacion !== null ? (parseFloat(ev.Puntuacion) || 0) : (ev.puntuacion !== undefined && ev.puntuacion !== null ? (parseFloat(ev.puntuacion) || 0) : 0)),
              framework: ev.framework || ev.Marco || ev.marco || ev.Framework || ev.framework || 'N/A',
              status: ev.status || ev.Estado || ev.estado || 'Completada'
            };
          });
        } else if (Array.isArray(data)) {
          console.warn('=== DEBUG: Array vacío recibido ===');
          evaluacionesFormateadas = [];
        } else {
          console.warn('=== DEBUG: No es un array, tipo:', typeof data, data);
          evaluacionesFormateadas = [];
        }
        
        console.log('=== DEBUG: Evaluaciones formateadas finales ===', evaluacionesFormateadas);
        setEvaluations(evaluacionesFormateadas);
      } else {
        console.warn('La respuesta no tiene el formato esperado:', response.data);
        setEvaluations([]);
      }
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      console.error('Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError('No se pudieron cargar las evaluaciones. Por favor, intenta más tarde.');
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  /* ====== Filtros ====== */
  // Fecha (rango)
  const [openCal, setOpenCal] = useState(false);
  const [tempRange, setTempRange] = useState({ from: undefined, to: undefined });
  const [range, setRange] = useState({ from: undefined, to: undefined });

  const applyRange = () => { setRange(tempRange); setOpenCal(false); };
  const clearRange = () => {
    setTempRange({ from: undefined, to: undefined });
    setRange({ from: undefined, to: undefined });
    setOpenCal(false);
  };

  // Año (atajo)
  const [openYear, setOpenYear] = useState(false);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // últimos 10 años
  const applyYear = (year) => {
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    setTempRange({ from, to });
    setRange({ from, to });
    setOpenYear(false);
  };

  /* Filtrado */
  const filtered = useMemo(() => {
    let filteredEvals = evaluations;
    
    // Aplicar filtro de fecha si existe
    if (range.from || range.to) {
      filteredEvals = evaluations.filter((ev) => {
      const d = parseDMY(ev.date);
        if (!d) return false;
      if (range.from && d < new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate())) return false;
      if (range.to && d > new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate())) return false;
      return true;
    });
    }
    
    return filteredEvals;
  }, [evaluations, range]);

  // Calcular promedio de TODAS las evaluaciones (no solo las filtradas) con puntuación válida (> 0)
  const avgScore = useMemo(() => {
    if (evaluations.length === 0) return 0;
    const evaluacionesConPuntuacion = evaluations.filter(ev => ev.score && ev.score > 0);
    if (evaluacionesConPuntuacion.length === 0) return 0;
    const suma = evaluacionesConPuntuacion.reduce((acc, ev) => acc + (parseFloat(ev.score) || 0), 0);
    return Math.round(suma / evaluacionesConPuntuacion.length);
  }, [evaluations]);

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo"><img src={imgLogo} alt="AI Governance Evaluator" /></div>
        <h1 style={{display:"flex",alignItems:"center",gap:8,margin:0,color:"#0f172a",fontSize:20,fontWeight:800}}>
          <FileText className="w-5 h-5" style={{color:"#4d82bc"}} />
          Mis Evaluaciones
        </h1>
        <button className="btn-ghost" onClick={onExit} aria-label="Volver al Dashboard">
          <FileText className="w-4 h-4" style={{marginRight:8,color:"#173b8f"}} />
          Volver al Dashboard
        </button>
      </header>

      {/* Contenido */}
      <main className="container">
        {/* Resumen */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="grid">
          <Card className="card"><CardContent style={{padding:18}}>
            <div className="metric">
              <div>
                <div style={{color:"#5b677a",fontSize:14,marginBottom:4}}>Total Evaluaciones</div>
                <div className="num">{evaluations.length}</div>
              </div>
              <span className="bubble"><FileText className="w-6 h-6" /></span>
            </div>
          </CardContent></Card>

          <Card className="card"><CardContent style={{padding:18}}>
            <div className="metric">
              <div>
                <div style={{color:"#5b677a",fontSize:14,marginBottom:4}}>Puntuación Promedio</div>
                <div className="num">{avgScore}%</div>
              </div>
              <span className="bubble" style={{background:"#e9fbf0",color:"#1b9a59"}}><TrendingUp className="w-6 h-6" /></span>
            </div>
          </CardContent></Card>

          <Card className="card"><CardContent style={{padding:18}}>
            <div className="metric">
              <div>
                <div style={{color:"#5b677a",fontSize:14,marginBottom:4}}>Última Evaluación</div>
                <div style={{fontSize:18,color:"#173b8f",fontWeight:700}}>
                  {evaluations.length ? evaluations[0].date : "—"}
                </div>
              </div>
              <span className="bubble" style={{background:"#f3ecff",color:"#7a4fd6"}}><CalIcon className="w-6 h-6" /></span>
            </div>
          </CardContent></Card>
        </motion.div>

        {/* Filtros */}
        <div className="filters">
          {/* Fecha (rango) */}
          <div className="pop">
            <button className="filter-pill" onClick={() => { setOpenCal((v) => !v); setOpenYear(false); }}>
              <CalIcon className="w-4 h-4" />
              {range.from || range.to
                ? `${range.from ? formatDMY(range.from) : "…"} — ${range.to ? formatDMY(range.to) : "…"}`
                : "Fecha"}
            </button>

            {openCal && (
              <div className="pop-panel" onClick={(e) => e.stopPropagation()}>
                <div style={{padding:"6px 8px 0",color:"#0f172a",fontWeight:800}}>
                  Selecciona rango de fechas
                </div>

                {/* Mes a mes + dropdown de mes/año */}
                <Calendar
                  mode="range"
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={1}                // <-- 1 mes visible
                  captionLayout="dropdown"          // <-- dropdown mes y año
                  fromYear={new Date().getFullYear() - 9}
                  toYear={new Date().getFullYear() + 1}
                />

                <div className="pop-actions">
                  <button className="pop-clear" onClick={clearRange}>
                    <X className="w-4 h-4" style={{marginRight:6}} /> Limpiar
                  </button>
                  <button className="pop-apply" onClick={applyRange}>
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Año (atajo rápido) */}
          <div className="pop">
            <button className="filter-pill" onClick={() => { setOpenYear((v)=>!v); setOpenCal(false); }}>
              <CalIcon className="w-4 h-4" />
              Año
              <ChevronDown className="w-4 h-4" />
            </button>
            {openYear && (
              <div className="pop-panel" onClick={(e)=>e.stopPropagation()}>
                <div style={{padding:"6px 8px 0",color:"#0f172a",fontWeight:800}}>
                  Filtrar por año
                </div>
                <div className="year-list">
                  {years.map((y) => (
                    <button key={y} className="year-item" onClick={() => applyYear(y)}>
                      {y}
                    </button>
                  ))}
                </div>
                <div className="pop-actions" style={{justifyContent:"flex-end"}}>
                  <button className="pop-clear" onClick={clearRange}>
                    <X className="w-4 h-4" style={{marginRight:6}} /> Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {(range.from || range.to) && (
            <button className="subtle" onClick={clearRange}>Limpiar filtros</button>
          )}
        </div>

        {/* Historial */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: 0.05 }} style={{marginTop:6}}>
          <Card className="list-card">
            <CardHeader style={{padding:"16px 18px 8px"}}>
              <CardTitle style={{display:"flex",alignItems:"center",gap:8,color:"#173b8f",fontSize:18}}>
                <Award className="w-5 h-5" /> Historial de Evaluaciones
              </CardTitle>
            </CardHeader>

            <CardContent style={{padding:18,display:"grid",gap:12}}>
              {loading ? (
                <div style={{textAlign:"center",padding:"48px 8px",color:"#5b677a"}}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{margin:"0 auto 16px",color:"#4d82bc"}} />
                  <p>Cargando evaluaciones...</p>
                </div>
              ) : error ? (
                <div style={{textAlign:"center",padding:"36px 8px",color:"#ef4444"}}>
                  <p>{error}</p>
                  <button 
                    className="btn-primary" 
                    onClick={loadEvaluations}
                    style={{marginTop:16}}
                  >
                    Reintentar
                  </button>
                </div>
              ) : filtered.map((ev, i) => {
                return (
                  <motion.div key={ev.id || i} initial={{opacity:0, x:-12}} animate={{opacity:1, x:0}} transition={{duration:0.22, delay:0.05*i}}>
                    <div className="item" style={{padding:16,background:"#fff"}}>
                      <div style={{display:"flex",alignItems:"stretch",gap:16}}>
                        {/* Columna info */}
                        <div style={{flex:1,display:"grid",gap:10}}>
                          <div style={{display:"flex",alignItems:"start",justifyContent:"space-between",gap:12}}>
                            <div style={{flex:1,minWidth:0}}>
                              <h3 className="title">{ev.name}</h3>
                              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                                <div className="row"><CalIcon className="w-4 h-4" /> {ev.date}</div>
                                <div className="row"><Clock className="w-4 h-4" /> {ev.time}</div>
                                {ev.tiempo && ev.tiempo !== 'N/A' && (
                                  <div className="row" style={{color:"#7c3aed"}}>
                                    <Clock className="w-4 h-4" /> Duración: {ev.tiempo}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progreso */}
                          <div style={{display:"grid",gap:6}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
                              <span style={{color:"#475569"}}>Puntuación</span>
                              <span style={{color:"#0f172a"}}>{ev.score}%</span>
                            </div>
                            <Progress value={ev.score} className="h-2" />
                          </div>

                          <div className="row"><FileText className="w-4 h-4" /> <span>Marco: {ev.framework}</span></div>
                        </div>

                        {/* Acción */}
                        <div style={{display:"flex",alignItems:"center"}}>
                          <button className="btn-primary" onClick={() => onViewResults(ev.id)}>
                            Ver Resultados <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {!loading && !error && filtered.length === 0 && evaluations.length === 0 && (
                <div style={{textAlign:"center",padding:"36px 8px",color:"#5b677a"}}>
                  <FileText className="w-12 h-12" style={{margin:"0 auto 16px",color:"#94a3b8",opacity:0.5}} />
                  <p style={{fontSize:16,marginBottom:8,fontWeight:600}}>No tienes evaluaciones aún</p>
                  <p style={{fontSize:14,color:"#64748b"}}>Comienza creando tu primera evaluación desde el dashboard</p>
                </div>
              )}

              {!loading && !error && filtered.length === 0 && evaluations.length > 0 && (
                <div style={{textAlign:"center",padding:"36px 8px",color:"#5b677a"}}>
                  No hay evaluaciones dentro del filtro seleccionado.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default ViewEvaluationsPage;
