// resources/js/GeneralDashboardPage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import imgLogo from "../assets/logo-principal.jpg";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, ArrowLeft,
  BarChart3, Calendar as CalIcon, Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

/* ===== Estilos coherentes + FIX Select (portal) y Tabs centradas ===== */
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
.btn-ghost{background:#fff;border:1px solid var(--ring);color:#173b8f;padding:10px 18px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:800}
.btn-ghost:hover{background:#f6f8fc}

/* Contenido */
.container{max-width:1180px;margin:0 auto;padding:28px 16px;overflow:visible}

/* Barra superior (título y subtítulo) */
.page-title{display:flex;align-items:center;gap:10px;color:#0f172a;font-weight:900;font-size:22px;margin:0}
.page-hint{color:#e6eefc;font-weight:600;font-size:15px;margin:6px 0 10px}

/* KPI Cards */
.kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
@media (max-width: 960px){ .kpi-grid{grid-template-columns:1fr} }
.card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.icon-pill{background:#4d82bc;color:#fff;border-radius:16px;padding:10px;display:inline-flex}

/* Toolbar filtros */
.toolbar{
  display:flex;align-items:center;justify-content:space-between;
  background:#fff;border:1px solid #e9edf5;border-radius:18px;
  box-shadow:var(--shadow);padding:10px 12px;margin:18px 0;
  overflow: visible;
}
.toolbar-left{display:flex;align-items:center;gap:10px}
.btn-outline{background:#fff;border:1px solid var(--ring);color:#0f172a;padding:10px 14px;border-radius:12px;display:inline-flex;align-items:center;gap:8px}
.btn-outline:hover{background:#f7f9ff}

/* ====== Ajustes Select (nuestro ui/select hace portal + anclado) ====== */
[data-slot="select-trigger"]{ position:relative; z-index:10; }
[data-slot="select-content"]{
  /* El ui/select ya lo porta a body y calcula posición.
     Aquí solo estética consistente del menú. */
  background:#fff; color:#0b1324; border:1px solid #e5e7eb;
  border-radius:12px; box-shadow:0 18px 40px rgba(2,6,23,.20), 0 6px 14px rgba(2,6,23,.10);
  padding:6px;
}
[data-slot="select-item"]{
  color:#0b1324; padding:10px 34px 10px 12px; border-radius:8px; cursor:pointer; position:relative;
}
[data-slot="select-item"]:hover{ background:#eef2ff; }
[data-slot="select-item"][data-state="checked"]::after{
  content:"✓"; position:absolute; right:10px; top:50%; transform:translateY(-50%);
  opacity:1; font-weight:700;
}

/* ====== TABS centradas y del mismo tamaño ====== */
.tabs-wrap{display:flex;justify-content:center;margin:24px 0 32px}
.tabs-list{
  display:flex !important; gap:8px;
  background:#fff;border:1px solid #e9edf5;border-radius:16px;box-shadow:var(--shadow);
  padding:6px; width:fit-content;
}
.tabs-trigger{
  border-radius:12px;padding:14px 24px;font-weight:700;color:#173b8f;
  min-width: 200px; text-align:center; display:inline-flex; align-items:center; justify-content:center;
  transition:all 0.2s ease;
}
.tabs-trigger[data-state="active"]{ 
  background:linear-gradient(135deg,#4d82bc,#5a8fc9); 
  color:#fff; 
  box-shadow:0 4px 12px rgba(77,130,188,0.3);
}
.tabs-trigger:hover:not([data-state="active"]){ 
  background:#f6f8fc;
}

/* Grids de charts */
.charts{display:grid;grid-template-columns:1fr;gap:24px;max-width:900px;margin:0 auto}
@media (min-width: 1200px){ .charts{grid-template-columns:1fr 1fr;max-width:100%} }

/* Botón Primario */
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border:none;
  border-radius:999px; padding:10px 16px; font-weight:800;
  display:inline-flex;align-items:center;gap:8px; cursor:pointer;
  box-shadow:0 12px 28px rgba(2,6,23,.18);
}
.btn-primary:hover{filter:brightness(1.02)}
`;

/* ===== Datos iniciales (se reemplazarán con datos reales) ===== */
const initialData = {
  kpis: {
    users: { current: 0, percentChange: 0 },
    evaluations: { current: 0, percentChange: 0 },
    documents: { current: 0, percentChange: 0 }
  },
  userTrend: [],
  evaluationsPerMonth: [],
  distributionByFramework: [],
  documentsPerMonth: []
};

export default function GeneralDashboardPage({
  onBack = () =>
    (window.history.length > 1
      ? window.history.back()
      : window.location.assign("/admin/dashboard")),
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month"); // Estado para el período seleccionado

  // Funciones para exportar gráficos
  const exportChartAsPNG = (chartId, filename) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    import('html2canvas').then(html2canvas => {
      html2canvas.default(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }).catch(err => console.error('Error al exportar PNG:', err));
  };

  const exportChartAsSVG = (chartId, filename) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = svgUrl;
    link.click();
    URL.revokeObjectURL(svgUrl);
  };

  const exportChartAsPDF = (chartId, filename) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    import('html2canvas').then(html2canvas => {
      return import('jspdf').then(jsPDF => {
        html2canvas.default(chartElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF.default('landscape', 'mm', 'a4');
          const imgWidth = 280;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save(`${filename}.pdf`);
        });
      });
    }).catch(err => console.error('Error al exportar PDF:', err));
  };

  // Cargar datos del dashboard cuando cambia el período
  useEffect(() => {
    loadGeneralStats();
  }, [period]);

  const loadGeneralStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      // Enviar el período seleccionado al backend
      const response = await axiosClient.get('/api/dashboard/general-stats', {
        params: {
          refresh: 'true',
          period: period, // Enviar el período seleccionado
          _t: Date.now()
        },
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (response.data && response.data.success && response.data.data) {
        setData(response.data.data);
      } else {
        console.error('Respuesta inesperada:', response.data);
        setError('No se pudieron cargar las estadísticas. Por favor, intenta más tarde.');
      }
    } catch (err) {
      console.error('Error al cargar estadísticas generales:', err);
      setError('No se pudieron cargar las estadísticas. Por favor, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (name) => console.log("Descargando", name);
  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>
        <h1 className="page-title">
          <BarChart3 className="w-5 h-5" style={{color:"#4d82bc"}} />
          Dashboard general
        </h1>
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </header>

      {/* Contenido */}
      <main className="container">
        <p className="page-hint">Análisis y métricas del sistema</p>

        {/* KPIs */}
        <section className="kpi-grid">
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25}}>
            <Card className="card">
              <CardHeader style={{padding:"16px 18px 8px"}}>
                <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{color:"#5b677a",fontSize:14}}>Usuarios registrados</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:38,color:"#173b8f"}}>
                    <div className="animate-spin" style={{width:24,height:24,border:"3px solid #e5e7eb",borderTopColor:"#173b8f",borderRadius:"50%"}}></div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{data.kpis.users.current}</div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                      <TrendingUp className="w-3 h-3" /> {data.kpis.users.percentChange >= 0 ? '+' : ''}{data.kpis.users.percentChange}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:.05}}>
            <Card className="card">
              <CardHeader style={{padding:"16px 18px 8px"}}>
                <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{color:"#5b677a",fontSize:14}}>Evaluaciones completadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:38,color:"#173b8f"}}>
                    <div className="animate-spin" style={{width:24,height:24,border:"3px solid #e5e7eb",borderTopColor:"#173b8f",borderRadius:"50%"}}></div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{data.kpis.evaluations.current}</div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                      <TrendingUp className="w-3 h-3" /> {data.kpis.evaluations.percentChange >= 0 ? '+' : ''}{data.kpis.evaluations.percentChange}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:.1}}>
            <Card className="card">
              <CardHeader style={{padding:"16px 18px 8px"}}>
                <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{color:"#5b677a",fontSize:14}}>Documentos generados</span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                {loading ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,fontSize:38,color:"#173b8f"}}>
                    <div className="animate-spin" style={{width:24,height:24,border:"3px solid #e5e7eb",borderTopColor:"#173b8f",borderRadius:"50%"}}></div>
                  </div>
                ) : (
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{data.kpis.documents.current}</div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                      <TrendingUp className="w-3 h-3" /> {data.kpis.documents.percentChange >= 0 ? '+' : ''}{data.kpis.documents.percentChange}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Toolbar: período, tabs y actualización */}
        <section className="toolbar">
          <div className="toolbar-left">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="btn-outline" style={{width:180}}>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>
            
          </div>

          <div style={{display:"inline-flex",alignItems:"center",gap:8,color:"#5b677a"}}>
            <CalIcon className="w-4 h-4" />
            <span>Última actualización: Hoy, {new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        </section>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            marginBottom: 20,
            padding: 16,
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            color: "#991b1b"
          }}>
            <p style={{margin: 0, fontSize: 14}}>{error}</p>
          </div>
        )}

        {/* Contenido de Tabs */}
        <div className="space-y-6" style={{width:"100%"}}>
          <div className="space-y-6" style={{width:"100%"}}>
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25}} className="charts">
                {/* Tendencia de Usuarios */}
                <Card className="card" style={{boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
                  <CardHeader style={{padding:"20px 24px 12px"}}>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:10,fontSize:20,fontWeight:700,color:"#0f172a"}}>
                        Tendencia de usuarios
                      </span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{display:"flex",gap:4}}>
                          <button 
                            onClick={() => exportChartAsPNG('chart-users', 'tendencia-usuarios')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar PNG"
                          >
                            PNG
                          </button>
                          <button 
                            onClick={() => exportChartAsSVG('chart-users', 'tendencia-usuarios')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar SVG"
                          >
                            SVG
                          </button>
                          <button 
                            onClick={() => exportChartAsPDF('chart-users', 'tendencia-usuarios')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar PDF"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription style={{color:"#64748b",fontSize:14}}>Crecimiento mensual de usuarios en la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent style={{padding:"0 24px 24px"}}>
                    {loading ? (
                      <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:300}}>
                        <div className="animate-spin" style={{width:40,height:40,border:"4px solid #e5e7eb",borderTopColor:"#4d82bc",borderRadius:"50%"}}></div>
                      </div>
                    ) : (
                      <div id="chart-users">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={data.userTrend.length > 0 ? data.userTrend : [{month: 'Sin datos', users: 0}]} margin={{top:10,right:20,left:0,bottom:10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                          <XAxis dataKey="month" stroke="#64748b" style={{fontSize:12}} />
                          <YAxis stroke="#64748b" style={{fontSize:12}} />
                          <Tooltip 
                            contentStyle={{
                              background:"#fff",
                              border:"1px solid #e5e7eb",
                              borderRadius:12,
                              boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
                              padding:"12px"
                            }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="users" 
                            stroke="#4d82bc" 
                            strokeWidth={3} 
                            dot={{fill:"#4d82bc",r:6,strokeWidth:2,stroke:"#fff"}} 
                            activeDot={{r:8,stroke:"#fff",strokeWidth:2}} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Evaluaciones por Mes */}
                <Card className="card" style={{boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
                  <CardHeader style={{padding:"20px 24px 12px"}}>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:10,fontSize:20,fontWeight:700,color:"#0f172a"}}>
                        Evaluaciones por mes
                      </span>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{display:"flex",gap:4}}>
                          <button 
                            onClick={() => exportChartAsPNG('chart-evaluations', 'evaluaciones-por-mes')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar PNG"
                          >
                            PNG
                          </button>
                          <button 
                            onClick={() => exportChartAsSVG('chart-evaluations', 'evaluaciones-por-mes')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar SVG"
                          >
                            SVG
                          </button>
                          <button 
                            onClick={() => exportChartAsPDF('chart-evaluations', 'evaluaciones-por-mes')}
                            style={{padding:"6px 10px",border:"1px solid #e5e7eb",borderRadius:8,background:"#fff",cursor:"pointer",fontSize:12}}
                            title="Descargar PDF"
                          >
                            PDF
                          </button>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription style={{color:"#64748b",fontSize:14}}>Número de evaluaciones finalizadas mensualmente</CardDescription>
                  </CardHeader>
                  <CardContent style={{padding:"0 24px 24px"}}>
                    {loading ? (
                      <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:300}}>
                        <div className="animate-spin" style={{width:40,height:40,border:"4px solid #e5e7eb",borderTopColor:"#7a4fd6",borderRadius:"50%"}}></div>
                      </div>
                    ) : (
                      <div id="chart-evaluations">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data.evaluationsPerMonth.length > 0 ? data.evaluationsPerMonth : [{month: 'Sin datos', evaluations: 0}]} margin={{top:10,right:20,left:0,bottom:10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                          <XAxis dataKey="month" stroke="#64748b" style={{fontSize:12}} />
                          <YAxis stroke="#64748b" style={{fontSize:12}} />
                          <Tooltip 
                            contentStyle={{
                              background:"#fff",
                              border:"1px solid #e5e7eb",
                              borderRadius:12,
                              boxShadow:"0 4px 12px rgba(0,0,0,0.1)",
                              padding:"12px"
                            }} 
                          />
                          <Bar dataKey="evaluations" radius={[12,12,0,0]} fill="url(#evaluationsGradient)" />
                          <defs>
                            <linearGradient id="evaluationsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#7a4fd6" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Total de Documentos Subidos */}
                <Card className="card" style={{boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
                  <CardHeader style={{padding:"20px 24px 12px"}}>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontSize:20,fontWeight:700,color:"#0f172a"}}>
                        Total de documentos subidos
                      </span>
                    </CardTitle>
                    <CardDescription style={{color:"#64748b",fontSize:14}}>Documentos subidos como evidencia en evaluaciones</CardDescription>
                  </CardHeader>
                  <CardContent style={{padding:"24px"}}>
                    {loading ? (
                      <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:200}}>
                        <div className="animate-spin" style={{width:40,height:40,border:"4px solid #e5e7eb",borderTopColor:"#10b981",borderRadius:"50%"}}></div>
                      </div>
                    ) : (
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
                        <div style={{fontSize:64,color:"#10b981",fontWeight:900}}>
                          {data.kpis.documents.current}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                            <TrendingUp className="w-3 h-3" /> {data.kpis.documents.percentChange >= 0 ? '+' : ''}{data.kpis.documents.percentChange}%
                          </Badge>
                        </div>
                        <div style={{color:"#64748b",fontSize:14,textAlign:"center"}}>
                          Documentos de evidencia en el sistema
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
