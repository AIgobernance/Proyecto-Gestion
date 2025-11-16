// resources/js/GeneralDashboardPage.jsx
import React from "react";
import imgLogo from "../assets/logo-principal.jpg";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, ClipboardCheck, FileText, Download, Filter, TrendingUp, ArrowLeft,
  BarChart3, Activity, Calendar as CalIcon, ChevronDown, AlertCircle, Award,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
.tabs-wrap{display:flex;justify-content:center;margin:0 0 16px}
.tabs-list{
  display:flex !important; gap:12px;
  background:#fff;border:1px solid #e9edf5;border-radius:999px;box-shadow:var(--shadow);
  padding:6px; width:fit-content;
}
.tabs-trigger{
  border-radius:999px;padding:12px 18px;font-weight:800;color:#173b8f;
  min-width: 220px; text-align:center; display:inline-flex; align-items:center; justify-content:center;
}
.tabs-trigger[data-state="active"]{ background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; }

/* Grids de charts */
.charts{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width: 1020px){ .charts{grid-template-columns:1fr} }

/* Botón Primario */
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border:none;
  border-radius:999px; padding:10px 16px; font-weight:800;
  display:inline-flex;align-items:center;gap:8px; cursor:pointer;
  box-shadow:0 12px 28px rgba(2,6,23,.18);
}
.btn-primary:hover{filter:brightness(1.02)}
`;

/* ===== Datos de ejemplo ===== */
const userTrendData = [
  { month: "Ene", users: 45 }, { month: "Feb", users: 58 }, { month: "Mar", users: 72 },
  { month: "Abr", users: 95 }, { month: "May", users: 112 }, { month: "Jun", users: 130 },
];

const evaluationsPerMonthData = [
  { month: "Ene", evaluations: 85 }, { month: "Feb", evaluations: 70 }, { month: "Mar", evaluations: 55 },
  { month: "Abr", evaluations: 95 }, { month: "May", evaluations: 110 },
];

const documentTypeData = [
  { name: "ISO 42001", value: 30, color: "#3b82f6" },
  { name: "NIS2/AI Act", value: 25, color: "#8b5cf6" },
  { name: "CONPES 4144", value: 20, color: "#ec4899" },
  { name: "ISO 27090", value: 25, color: "#10b981" },
];

const documentsPerMonthData = [
  { month: "Ene", documents: 50 }, { month: "Feb", documents: 75 }, { month: "Mar", documents: 60 },
  { month: "Abr", documents: 85 }, { month: "May", documents: 92 },
];

const recentActivity = [
  { user: "Ana García", action: "Completó evaluación ISO 42001", time: "Hace 2 horas" },
  { user: "Carlos López", action: "Generó reporte NIS2", time: "Hace 3 horas" },
  { user: "María Rodríguez", action: "Inició evaluación", time: "Hace 5 horas" },
];

const kpiData = {
  users: { current: 130, percentChange: 36.8 },
  evaluations: { current: 110, percentChange: 29.4 },
  documents: { current: 92, percentChange: 22.7 },
};

export default function GeneralDashboardPage({
  onBack = () =>
    (window.history.length > 1
      ? window.history.back()
      : window.location.assign("/admin/dashboard")),
}) {
  console.log('GeneralDashboardPage - Función ejecutada');
  const handleDownload = (name) => console.log("Descargando", name);

  // Debug: verificar que el componente se está renderizando
  React.useEffect(() => {
    console.log('GeneralDashboardPage se está renderizando - useEffect');
  }, []);

  console.log('GeneralDashboardPage - Retornando JSX');
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
                  <span className="icon-pill"><Users className="w-5 h-5" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{kpiData.users.current}</div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                    <TrendingUp className="w-3 h-3" /> +{kpiData.users.percentChange}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:.05}}>
            <Card className="card">
              <CardHeader style={{padding:"16px 18px 8px"}}>
                <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{color:"#5b677a",fontSize:14}}>Evaluaciones completadas</span>
                  <span className="icon-pill" style={{background:"#7a4fd6"}}><ClipboardCheck className="w-5 h-5" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{kpiData.evaluations.current}</div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                    <TrendingUp className="w-3 h-3" /> +{kpiData.evaluations.percentChange}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25,delay:.1}}>
            <Card className="card">
              <CardHeader style={{padding:"16px 18px 8px"}}>
                <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{color:"#5b677a",fontSize:14}}>Documentos generados</span>
                  <span className="icon-pill" style={{background:"#10b981"}}><FileText className="w-5 h-5" /></span>
                </CardTitle>
              </CardHeader>
              <CardContent style={{padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{fontSize:38,color:"#173b8f",fontWeight:900}}>{kpiData.documents.current}</div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100" variant="outline">
                    <TrendingUp className="w-3 h-3" /> +{kpiData.documents.percentChange}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Toolbar: filtros/estado */}
        <section className="toolbar">
          <div className="toolbar-left">
            <Select defaultValue="month">
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

            <Popover>
              <PopoverTrigger asChild>
                <button className="btn-outline">
                  <Filter className="w-4 h-4" /> Filtros avanzados <ChevronDown className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tipo de Marco</h4>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Todos los marcos" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="iso42001">ISO 42001</SelectItem>
                        <SelectItem value="nis2">NIS2/AI Act</SelectItem>
                        <SelectItem value="conpes">CONPES 4144</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Estado</h4>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Todos los estados" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="completed">Completadas</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button className="btn-primary" style={{width:"100%"}}>Aplicar filtros</button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div style={{display:"inline-flex",alignItems:"center",gap:8,color:"#5b677a"}}>
            <CalIcon className="w-4 h-4" />
            <span>Última actualización: Hoy, {new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
        </section>

        {/* Tabs centradas */}
        <div className="tabs-wrap">
          <Tabs defaultValue="analytics" className="space-y-6" style={{width:"100%"}}>
            <TabsList className="tabs-list">
              <TabsTrigger value="analytics" className="tabs-trigger">
                <BarChart3 className="w-4 h-4" /> Analíticas
              </TabsTrigger>
              <TabsTrigger value="activity" className="tabs-trigger">
                <Activity className="w-4 h-4" /> Actividad Reciente
              </TabsTrigger>
            </TabsList>

            {/* Analíticas */}
            <TabsContent value="analytics" className="space-y-6">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25}} className="charts">
                {/* Tendencia de Usuarios */}
                <Card className="card">
                  <CardHeader>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:18}}>
                        <TrendingUp className="w-5 h-5" style={{color:"#4d82bc"}} />
                        Tendencia de usuarios
                      </span>
                      <Badge variant="outline" className="text-blue-600">6 meses</Badge>
                    </CardTitle>
                    <CardDescription>Crecimiento mensual de usuarios en la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={userTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8}} />
                        <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{fill:"#3b82f6",r:5}} activeDot={{r:7}} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
                      <button className="btn-outline" onClick={()=>handleDownload("Tendencia de Usuarios")}>
                        <Download className="w-4 h-4" /> Descargar
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Evaluaciones por Mes */}
                <Card className="card">
                  <CardHeader>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:18}}>
                        <ClipboardCheck className="w-5 h-5" style={{color:"#7a4fd6"}} />
                        Evaluaciones por mes
                      </span>
                      <Badge variant="outline" className="text-purple-600">5 meses</Badge>
                    </CardTitle>
                    <CardDescription>Número de evaluaciones finalizadas mensualmente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={evaluationsPerMonthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8}} />
                        <Bar dataKey="evaluations" radius={[10,10,0,0]} fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
                      <button className="btn-outline" onClick={()=>handleDownload("Evaluaciones por Mes")}>
                        <Download className="w-4 h-4" /> Descargar
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25}} className="charts">
                {/* Distribución por Marco */}
                <Card className="card">
                  <CardHeader>
                    <CardTitle style={{display:"flex",alignItems:"center",gap:8,fontSize:18}}>
                      <Award className="w-5 h-5" style={{color:"#ec4899"}} />
                      Distribución por marco de gobernanza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={documentTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {documentTypeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8}} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
                      <button className="btn-outline" onClick={()=>handleDownload("Distribución de Marcos")}>
                        <Download className="w-4 h-4" /> Descargar
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Documentos por Mes */}
                <Card className="card">
                  <CardHeader>
                    <CardTitle style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:8,fontSize:18}}>
                        <FileText className="w-5 h-5" style={{color:"#10b981"}} />
                        Documentos por mes
                      </span>
                      <Badge variant="outline" className="text-green-600">5 meses</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={documentsPerMonthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8}} />
                        <Bar dataKey="documents" radius={[10,10,0,0]} fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{display:"flex",justifyContent:"center",marginTop:12}}>
                      <button className="btn-outline" onClick={()=>handleDownload("Documentos por Mes")}>
                        <Download className="w-4 h-4" /> Descargar
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Actividad reciente */}
            <TabsContent value="activity">
              <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.25}}>
                <Card className="card">
                  <CardHeader>
                    <CardTitle style={{display:"flex",alignItems:"center",gap:8,fontSize:20}}>
                      <Activity className="w-5 h-5" style={{color:"#4d82bc"}} />
                      Actividad reciente del sistema
                    </CardTitle>
                    <CardDescription>Últimas acciones realizadas por los usuarios</CardDescription>
                  </CardHeader>
                  <CardContent style={{padding:18}}>
                    <div style={{display:"grid",gap:12}}>
                      {recentActivity.map((a, i) => (
                        <div key={i} style={{
                          display:"flex",alignItems:"center",gap:12,
                          background:"linear-gradient(90deg,#f6faff,#f3f0ff)", border:"1px solid #e9edf5",
                          borderRadius:16,padding:12
                        }}>
                          <span className="icon-pill"><ClipboardCheck className="w-4 h-4" /></span>
                          <div style={{flex:1}}>
                            <div style={{color:"#173b8f",fontWeight:700}}>{a.user}</div>
                            <div style={{color:"#475569",fontSize:14}}>{a.action}</div>
                          </div>
                          <Badge variant="outline" className="text-gray-600">{a.time}</Badge>
                        </div>
                      ))}
                    </div>

                    <div style={{marginTop:16,background:"#fff6db",border:"1px solid #fde68a",borderRadius:12,padding:12}}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:8,color:"#a16207"}}>
                        <AlertCircle className="w-5 h-5" />
                        <div>
                          <div style={{fontWeight:800}}>Nota sobre la actividad</div>
                          <div style={{fontSize:14}}>Se muestra la actividad de las últimas 24 horas. Para ver el historial completo, descarga el reporte detallado.</div>
                        </div>
                      </div>
                    </div>

                    <div style={{display:"flex",justifyContent:"center",marginTop:14}}>
                      <button className="btn-primary">
                        <Download className="w-4 h-4" /> Descargar reporte de actividad
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
