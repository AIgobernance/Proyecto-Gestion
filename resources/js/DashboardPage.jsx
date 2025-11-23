import React, { useState, useEffect } from "react";
import axios from "axios";
import imgLogo from "../assets/logo-principal.jpg";
import {
  User, FileText, LogOut, PlayCircle, BarChart3,
  TrendingUp, Award, CheckCircle2, Clock, Info, Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

/* ===== Estilos embebidos ===== */
const styles = `
:root{
  --brand:#1f3d93;
  --brand-2:#2c4fb5;
  --ink:#0b1324;
  --muted:#475569;
  --ring:#cfd7e6;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#213e90 0%,#1a2e74 100%)}

/* Header */
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:70px;display:flex;align-items:center;justify-content:space-between;padding:10px 18px}
.header__logo img{height:46px;width:auto;object-fit:contain}
.btn-pill{border-radius:999px}
.btn-ghost{background:#fff;border:1px solid var(--ring);color:var(--ink);padding:10px 18px}
.btn-ghost:hover{background:#f6f8fc}

/* Layout */
.main{flex:1}
.container{max-width:1120px;margin:0 auto;padding:40px 20px}

/* Hero */
.hero{text-align:center;margin-bottom:28px}
.hero h1{margin:0 0 8px;font-size:30px;font-weight:800;color:#fff}
.hero p{margin:0;font-size:14px;color:rgba(255,255,255,.85)}

/* Métricas */
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
@media (max-width: 1024px){ .grid{grid-template-columns:repeat(2,1fr)} }
@media (max-width: 600px){ .grid{grid-template-columns:1fr} }
.card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.card-title{display:flex;align-items:center;gap:10px;font-size:14px;color:#0f172a}
.icon-badge{background:#eaf0ff;color:#2c50b5;border-radius:14px;padding:8px;display:inline-flex}

/* CTA + Acciones */
.cols{display:grid;grid-template-columns:2fr 1fr;gap:18px;margin-top:20px}
@media (max-width: 1024px){ .cols{grid-template-columns:1fr} }

/* CTA */
.cta{border-radius:18px;background:#ffffff;color:#0f172a;box-shadow:var(--shadow);border:1px solid #e9edf5}
.cta .body{padding:20px}
.cta h3{margin:0 0 6px;font-size:18px;display:flex;align-items:center;gap:8px;color:#0f172a;font-weight:800}
.cta p{margin:0 0 10px;color:#0f172a;font-weight:700}   /* <-- texto negro y en negrita */

/* Lista “Detalles” con ícono alineado */
.bubble{background:#f8fbff;border-radius:16px;padding:16px;border:1px solid #e7eefc}
.bubble h4{margin:0 0 10px;display:flex;align-items:center;gap:8px;color:#0f172a}
.list{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.list li{display:flex;align-items:center;gap:10px;color:#0f172a}
.list li svg{flex-shrink:0}

/* Botón CTA */
.btn-primary{
  background:#fff;color:#4a7ba7;border:1px solid #e7ecf7;
  padding:12px 20px;border-radius:999px;font-weight:700;
  box-shadow:0 12px 30px rgba(2,6,23,.15);
  display:inline-flex;align-items:center;gap:10px;
  cursor:pointer; transition:transform .15s ease, box-shadow .15s ease, background .15s ease;
}
.btn-primary:hover{background:#f7f9ff; transform:translateY(-1px); box-shadow:0 16px 36px rgba(2,6,23,.2)}
.btn-primary:active{transform:translateY(0)}

/* Acciones rápidas (mismo tamaño) */
.quick{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.quick .item{
  width:100%; display:flex;align-items:center;gap:14px;
  border-radius:14px; padding:16px 18px;
  background:linear-gradient(90deg,#f7faff,#eef4ff);
  border:1px solid #e5edff; cursor:pointer;
  transition:transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
  min-height:96px; box-sizing:border-box;
}
.quick .item + .item{margin-top:12px}
.quick .item:hover{transform:translateY(-1px); box-shadow:0 10px 24px rgba(2,6,23,.14); border-color:#d7e3ff}
.quick .ico{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;background:#2b51c2;color:#fff;border-radius:12px;flex-shrink:0}
.quick .txt{display:flex;flex-direction:column;gap:4px;flex:1;min-width:0}
.quick .txt h4{margin:0;font-size:15px;color:#173b8f;font-weight:800}
.quick .txt small{display:block;color:#5b677a;font-size:13px;line-height:1.2}

/* Info */
.info{margin-top:18px;border-radius:18px;background:linear-gradient(90deg,#eef2ff,#f5f8ff);border:0;box-shadow:var(--shadow)}
.info .wrap{display:flex;gap:14px;align-items:flex-start;padding:18px}
.info .dot{background:#cdd9ff;color:#2744a8;border-radius:12px;padding:10px;display:inline-flex}
.info h5{margin:0 0 6px;color:#173b8f;font-size:16px}
.info p{margin:0;color:#334155;font-size:14px;line-height:1.6}

.quick .txt.centered{
  align-items:center;      /* centra el h4 y el small como columna */
  text-align:center;       /* alinea el texto al centro */
}

/* Animación de carga */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
`;

export function DashboardPage({
  username = "juan",
  onLogout = () => window.location.assign("/login"),
  onViewEvaluations = () => window.location.assign("/evaluations"),
  onStartEvaluation = () => window.location.assign("/evaluation/start"),
  onViewProfile = () => window.location.assign("/profile"),
}) {
  const [userStats, setUserStats] = useState({
    totalEvaluations: 0,
    lastEvaluation: "N/A",
    averageScore: 0,
    completitud: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      // Forzar actualización agregando timestamp para evitar caché del navegador
      const response = await axiosClient.get('/api/dashboard/stats', {
        params: {
          refresh: 'true',
          _t: Date.now() // Timestamp para evitar caché del navegador
        }
      });

      if (response.data && response.data.success && response.data.data) {
        setUserStats({
          totalEvaluations: response.data.data.totalEvaluaciones || 0,
          lastEvaluation: response.data.data.ultimaEvaluacion || "N/A",
          averageScore: Math.round(response.data.data.promedioPuntuacion || 0),
          completitud: Math.round(response.data.data.completitud || 100),
        });
      }
    } catch (err) {
      console.error('Error al cargar estadísticas del dashboard:', err);
      setError('No se pudieron cargar las estadísticas. Por favor, intenta más tarde.');
      // Mantener valores por defecto en caso de error
      setUserStats({
        totalEvaluations: 0,
        lastEvaluation: "N/A",
        averageScore: 0,
        completitud: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>

        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <Button className="btn-pill btn-ghost" onClick={onViewProfile}>
            <User className="w-4 h-4 me-2" style={{color:"#173b8f"}} />
            <span className="capitalize">{username}</span>
          </Button>
          <Button className="btn-pill btn-ghost" onClick={onViewEvaluations}>
            <FileText className="w-4 h-4 me-2" style={{color:"#173b8f"}} />
            Ver Evaluaciones
          </Button>
          <Button className="btn-pill" style={{background:"#ef4444",color:"#fff"}} onClick={onLogout}>
            <LogOut className="w-4 h-4 me-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="main">
        <div className="container">
          {/* Bienvenida */}
          <section className="hero">
            <h1>Bienvenido, <span className="capitalize">{username}</span></h1>
            <p>Panel de control del Evaluador de Gobernanza de IA</p>
          </section>

          {/* Métricas */}
          <section className="grid">
            <Card className="card">
              <CardHeader className="pb-2">
                <CardTitle className="card-title">
                  <span className="icon-badge"><FileText className="w-5 h-5" /></span>
                  Evaluaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:32,color:"#173b8f"}}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div style={{fontSize:32,color:"#173b8f",fontWeight:800}}>{userStats.totalEvaluations}</div>
                )}
                <CardDescription className="text-slate-500 text-xs mt-1">Completadas</CardDescription>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="pb-2">
                <CardTitle className="card-title">
                  <span className="icon-badge" style={{background:"#f1eaff",color:"#7a4fd6"}}>
                    <Clock className="w-5 h-5" />
                  </span>
                  Última Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:18,color:"#173b8f"}}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  <div style={{fontSize:18,color:"#173b8f",fontWeight:700}}>{userStats.lastEvaluation}</div>
                )}
                <CardDescription className="text-slate-500 text-xs mt-1">Fecha reciente</CardDescription>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="pb-2">
                <CardTitle className="card-title">
                  <span className="icon-badge" style={{background:"#e9fbf0",color:"#1b9a59"}}>
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  Score Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:32,color:"#173b8f"}}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div style={{fontSize:32,color:"#173b8f",fontWeight:800}}>{userStats.averageScore}%</div>
                )}
                <CardDescription className="text-slate-500 text-xs mt-1">Nivel de madurez</CardDescription>
              </CardContent>
            </Card>

            <Card className="card">
              <CardHeader className="pb-2">
                <CardTitle className="card-title">
                  <span className="icon-badge" style={{background:"#fff6e5",color:"#b26a05"}}>
                    <Award className="w-5 h-5" />
                  </span>
                  Completitud
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:32,color:"#173b8f"}}>
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div style={{fontSize:32,color:"#173b8f",fontWeight:800}}>{userStats.completitud}%</div>
                )}
                <CardDescription className="text-slate-500 text-xs mt-1">Cuestionarios</CardDescription>
              </CardContent>
            </Card>
          </section>

          {/* Mensaje de error */}
          {error && (
            <div style={{
              marginTop: 20,
              padding: 16,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              color: "#991b1b"
            }}>
              <p style={{margin: 0, fontSize: 14}}>{error}</p>
            </div>
          )}

          {/* CTA + Acciones */}
          <section className="cols">
            {/* CTA */}
            <Card className="cta">
              <div className="body">
                <h3>
                  <PlayCircle className="w-5 h-5" />
                  Nueva Evaluación de Gobernanza
                </h3>

                {/* Texto en negro y negrita */}
                <p><strong>Evalúa el nivel de madurez de tu organización en gobernanza de IA</strong></p>

                <div className="bubble">
                  <h4><Info className="w-5 h-5" /> Detalles</h4>

                  {/* Lista con iconos alineados */}
                  <ul className="list">
                    <li><CheckCircle2 className="w-5 h-5" /> <span>30 preguntas en 5 dimensiones</span></li>
                    <li><CheckCircle2 className="w-5 h-5" /> <span>Basado en ISO 27090 DIS - 27091, ISO 23894, NIS2 / AI Act, ISO 42001 - 42005, CONPES 4144</span></li>
                    <li><CheckCircle2 className="w-5 h-5" /> <span>Resultados con gráficos y recomendaciones</span></li>
                    <li><CheckCircle2 className="w-5 h-5" /> <span>Tiempo estimado: 15–20 minutos</span></li>
                  </ul>
                </div>

                <div style={{marginTop:16, display:"flex", flexDirection:"column", gap:12}}>
                  <button 
                    className="btn-primary" 
                    onClick={onStartEvaluation} 
                    aria-label="Iniciar nueva evaluación"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Iniciar Nueva Evaluación
                  </button>
                </div>
              </div>
            </Card>

            {/* Acciones rápidas */}
            <Card className="quick">
              <CardHeader>
                <CardTitle style={{color:"#173b8f"}}>Acciones Rápidas</CardTitle>
                <CardDescription>Accede a tus opciones principales</CardDescription>
              </CardHeader>
              <CardContent>
                <button className="item" onClick={onViewEvaluations}>
                  <span className="ico"><BarChart3 className="w-5 h-5" /></span>
                  <div className="txt">
                    <h4>Ver Evaluaciones</h4>
                    <small>Historial completo y resultados</small>
                  </div>
                </button>

                <button className="item" onClick={onViewProfile}>
                  <span className="ico" style={{background:"#7c3aed"}}><User className="w-5 h-5" /></span>
                  <div className="txt">
                    <h4>Mi Perfil</h4>
                    <small>Datos y configuración</small>
                  </div>
                </button>

                <div className="item" style={{background:"linear-gradient(90deg,#ecfdf5,#def7ec)"}}>
                <span className="ico" style={{background:"#10b981"}}><Award className="w-5 h-5" /></span>
                <div className="txt centered">  
                  <h4>Nivel Actual</h4>
                  <small>Intermedio — ¡sigue mejorando!</small>
                </div>
              </div>
              </CardContent>
            </Card>
          </section>

          {/* Info extra */}
          <Card className="info">
            <div className="wrap">
              <span className="dot"><Info className="w-5 h-5" /></span>
              <div>
                <h5>Sobre el Evaluador de Gobernanza de IA</h5>
                <p>
                  Evalúa la madurez de tu organización con base en marcos como ISO 27090 DIS - 27091, ISO 23894, NIS2 / AI Act, ISO 42001 - 42005, CONPES 4144.
                  Obtén recomendaciones prácticas y una visión clara de fortalezas y áreas de mejora.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
