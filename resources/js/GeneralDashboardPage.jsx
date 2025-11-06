import React from "react";
import imgLogo from "../assets/logo-principal.jpg";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Users,
  ClipboardCheck,
  FileText,
  Download,
  Filter,
  TrendingUp,
  ArrowLeft,
  BarChart3,
  Activity,
  Calendar,
  ChevronDown,
  AlertCircle,
  Award,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { motion } from "motion/react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function GeneralDashboardPage({ onBack }) {
  // Datos para gráficos
  const userTrendData = [
    { month: "Ene", users: 45 },
    { month: "Feb", users: 58 },
    { month: "Mar", users: 72 },
    { month: "Abr", users: 95 },
    { month: "May", users: 112 },
    { month: "Jun", users: 130 },
  ];

  const evaluationsPerMonthData = [
    { month: "Ene", evaluations: 85 },
    { month: "Feb", evaluations: 70 },
    { month: "Mar", evaluations: 55 },
    { month: "Abr", evaluations: 95 },
    { month: "May", evaluations: 110 },
  ];

  const documentTypeData = [
    { name: "ISO 42001", value: 30, color: "#3b82f6" },
    { name: "NIS2/AI Act", value: 25, color: "#8b5cf6" },
    { name: "CONPES 4144", value: 20, color: "#ec4899" },
    { name: "ISO 27090", value: 25, color: "#10b981" },
  ];

  const documentsPerMonthData = [
    { month: "Ene", documents: 50 },
    { month: "Feb", documents: 75 },
    { month: "Mar", documents: 60 },
    { month: "Abr", documents: 85 },
    { month: "May", documents: 92 },
  ];

  // Datos de actividad reciente
  const recentActivity = [
    { user: "Ana García", action: "Completó evaluación ISO 42001", time: "Hace 2 horas" },
    { user: "Carlos López", action: "Generó reporte NIS2", time: "Hace 3 horas" },
    { user: "María Rodríguez", action: "Inició evaluación", time: "Hace 5 horas" },
  ];

  const handleDownload = (chartName) => {
    console.log(`Descargando ${chartName}`);
    // Implementar lógica de descarga
  };

  // KPIs con comparación
  const kpiData = {
    users: { current: 130, previous: 95, percentChange: 36.8 },
    evaluations: { current: 110, previous: 85, percentChange: 29.4 },
    documents: { current: 92, previous: 75, percentChange: 22.7 },
  };

  return (
    <div className="bg-gradient-to-br from-[#e8f0f8] to-[#f0f7ff] min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-8 shadow-md">
        {/* Logo */}
        <div className="w-[180px] h-[90px]">
          <img alt="AI Governance Evaluator" className="w-full h-full object-contain" src={imgLogo} />
        </div>

        {/* Título central con icono */}
        <div className="flex-1 text-center">
          <div className="flex items-center justify-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#1e3a8a]" />
            <h1 className="font-['Inter:Regular',_sans-serif] text-[28px] text-[#1e3a8a]">
              Dashboard General
            </h1>
          </div>
          <p className="text-[14px] text-gray-600 mt-1">Análisis y métricas del sistema</p>
        </div>

        {/* Botón Volver */}
        <button
          onClick={onBack}
          className="bg-white hover:bg-gray-100 transition-all duration-200 rounded-[20px] px-8 py-2 font-['Inter:Regular',_sans-serif] text-[16px] text-[#1e3a8a] shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-8 py-8 max-w-7xl">
        {/* Tarjetas de métricas KPI mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Usuarios Registrados */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] text-gray-700">Usuarios Registrados</CardTitle>
                  <div className="bg-blue-500 p-3 rounded-[15px] group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[42px] text-[#1e3a8a] mb-1">{kpiData.users.current}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{kpiData.users.percentChange}%
                      </Badge>
                      <span className="text-[12px] text-gray-600">vs. mes anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evaluaciones Completadas */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] text-gray-700">Evaluaciones Completadas</CardTitle>
                  <div className="bg-purple-500 p-3 rounded-[15px] group-hover:scale-110 transition-transform">
                    <ClipboardCheck className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[42px] text-[#1e3a8a] mb-1">{kpiData.evaluations.current}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{kpiData.evaluations.percentChange}%
                      </Badge>
                      <span className="text-[12px] text-gray-600">vs. mes anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Documentos Generados */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[16px] text-gray-700">Documentos Generados</CardTitle>
                  <div className="bg-green-500 p-3 rounded-[15px] group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[42px] text-[#1e3a8a] mb-1">{kpiData.documents.current}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{kpiData.documents.percentChange}%
                      </Badge>
                      <span className="text-[12px] text-gray-600">vs. mes anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Barra de herramientas - Filtros y acciones */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mb-8 bg-white rounded-[20px] px-6 py-4 shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Selector de período */}
            <Select defaultValue="month">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="quarter">Último trimestre</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
              </SelectContent>
            </Select>

            {/* Botón de filtros avanzados */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros Avanzados
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tipo de Marco</h4>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los marcos" />
                      </SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="completed">Completadas</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Aplicar Filtros</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 text-[14px] text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Última actualización: Hoy,{" "}
              {new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </motion.div>

        {/* Tabs para organizar contenido */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-md">
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analíticas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Actividad Reciente
            </TabsTrigger>
          </TabsList>

          {/* Tab de Analíticas */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Gráficos - Primera fila */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Tendencia de Usuarios Registrados */}
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[18px]">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Tendencia de Usuarios Registrados
                    </span>
                    <Badge variant="outline" className="text-blue-600">
                      6 meses
                    </Badge>
                  </CardTitle>
                  <CardDescription>Crecimiento mensual de usuarios en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={userTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => handleDownload("Tendencia de Usuarios")} variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluaciones Completadas por Mes */}
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[18px]">
                      <ClipboardCheck className="w-5 h-5 text-purple-600" />
                      Evaluaciones Completadas por Mes
                    </span>
                    <Badge variant="outline" className="text-purple-600">
                      5 meses
                    </Badge>
                  </CardTitle>
                  <CardDescription>Número de evaluaciones finalizadas mensualmente</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={evaluationsPerMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="evaluations" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => handleDownload("Evaluaciones por Mes")} variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Gráficos - Segunda fila */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Distribución de Documentos por Marco */}
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[18px]">
                      <Award className="w-5 h-5 text-pink-600" />
                      Distribución por Marco de Gobernanza
                    </span>
                  </CardTitle>
                  <CardDescription>Proporción de documentos según marco de referencia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={documentTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {documentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => handleDownload("Distribución de Marcos")} variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Distribución de documentos por Mes */}
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[18px]">
                      <FileText className="w-5 h-5 text-green-600" />
                      Documentos Generados por Mes
                    </span>
                    <Badge variant="outline" className="text-green-600">5 meses</Badge>
                  </CardTitle>
                  <CardDescription>Evolución de la generación de documentos mensuales</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={documentsPerMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="documents" radius={[10, 10, 0, 0]} fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => handleDownload("Documentos por Mes")} variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Tab de Actividad Reciente */}
          <TabsContent value="activity">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[20px]">
                    <Activity className="w-6 h-6 text-blue-600" />
                    Actividad Reciente del Sistema
                  </CardTitle>
                  <CardDescription>Últimas acciones realizadas por los usuarios</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-[15px] hover:shadow-md transition-shadow"
                      >
                        <div className="bg-blue-500 p-2 rounded-full">
                          <ClipboardCheck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[15px] text-[#1e3a8a]">
                            <span className="font-medium">{activity.user}</span>
                          </p>
                          <p className="text-[14px] text-gray-600">{activity.action}</p>
                        </div>
                        <Badge variant="outline" className="text-gray-600">
                          {activity.time}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Alerta informativa */}
                  <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-[10px]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[15px] text-yellow-800 font-medium mb-1">Nota sobre la actividad</h4>
                        <p className="text-[14px] text-yellow-700">
                          Se muestra la actividad de las últimas 24 horas. Para ver el historial completo,
                          descarga el reporte detallado.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Descargar Reporte de Actividad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
