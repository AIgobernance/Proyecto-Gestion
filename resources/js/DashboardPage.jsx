import React from "react";
import { User, FileText, LogOut, PlayCircle, BarChart3, TrendingUp, Award, CheckCircle2, Clock, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
// 👇 reemplaza esta ruta con tu logo real
import imgLogo from "../assets/logo-principal.jpg";

export function DashboardPage({
  username = "Usuario",
  onLogout,
  onViewEvaluations,
  onStartEvaluation,
  onViewProfile,
}) {
  // Datos de ejemplo para el dashboard
  const userStats = {
    totalEvaluations: 3,
    lastEvaluation: "15 Oct 2024",
    averageScore: 78,
    completionRate: 100,
  };

  return (
    <div className="bg-gradient-to-br from-[#e8f0f8] to-[#f0f7ff] relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="h-[113px] w-[287px]">
          <img
            alt="Logo"
            className="max-w-none object-cover pointer-events-none size-full"
            src={imgLogo}
          />
        </div>

        {/* Opciones del header */}
        <div className="flex items-center gap-3">
          {/* Botón de perfil de usuario */}
          <button
            className="flex items-center gap-2 bg-white/80 hover:bg-white rounded-[20px] px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md group"
            onClick={onViewProfile}
          >
            <User className="w-4 h-4 text-[#4a7ba7]" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black group-hover:text-[#4a7ba7] transition-colors">
              {username}
            </span>
          </button>

          {/* Separador visual */}
          <div className="h-8 w-px bg-[#93b8dc]" />

          {/* Botón Ver Evaluaciones */}
          <button
            className="flex items-center gap-2 bg-transparent hover:bg-white/50 rounded-[20px] px-4 py-2 transition-all duration-200 group"
            onClick={onViewEvaluations}
          >
            <FileText className="w-4 h-4 text-[#4a7ba7]" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black group-hover:text-[#4a7ba7] transition-colors">
              Ver Evaluaciones
            </span>
          </button>

          {/* Botón Cerrar Sesión */}
          <button
            className="flex items-center gap-2 bg-[#f87171]/90 hover:bg-[#ef4444] rounded-[20px] px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md group"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-white">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Título de bienvenida */}
        <div className="mb-10">
          <h1 className="font-['Inter:Regular',_sans-serif] text-[36px] text-[#1e3a8a] mb-2">
            Bienvenido, {username}
          </h1>
          <p className="font-['Inter:Regular',_sans-serif] text-[16px] text-gray-600">
            Panel de control del Evaluador de Gobernanza de IA
          </p>
        </div>

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Evaluaciones Totales */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[32px] text-[#1e3a8a] mb-1">{userStats.totalEvaluations}</div>
              <p className="text-[13px] text-gray-500">Completadas</p>
            </CardContent>
          </Card>

          {/* Última evaluación */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                Última Evaluación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[18px] text-[#1e3a8a] mb-1">{userStats.lastEvaluation}</div>
              <p className="text-[13px] text-gray-500">Fecha reciente</p>
            </CardContent>
          </Card>

          {/* Score Promedio */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="bg-green-100 p-2 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                Score Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[32px] text-[#1e3a8a] mb-1">{userStats.averageScore}%</div>
              <p className="text-[13px] text-gray-500">Nivel de madurez</p>
            </CardContent>
          </Card>

          {/* Tasa de Completitud */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[16px]">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                Completitud
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[32px] text-[#1e3a8a] mb-1">{userStats.completionRate}%</div>
              <p className="text-[13px] text-gray-500">Cuestionarios</p>
            </CardContent>
          </Card>
        </div>

        {/* Sección principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Nueva Evaluación */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-[#5882b8] to-[#4a7ba7]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-[24px]">
                <PlayCircle className="w-7 h-7" />
                Nueva Evaluación de Gobernanza
              </CardTitle>
              <CardDescription className="text-white/90 text-[15px]">
                Evalúa el nivel de madurez de tu organización en gobernanza de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6">
                <h3 className="text-white text-[18px] mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Sobre la Evaluación
                </h3>
                <ul className="space-y-2 text-white/90 text-[14px]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>50 preguntas estructuradas en 5 dimensiones clave</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Basado en marcos internacionales (ISO 27090, ISO 42001, NIS2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Resultados detallados con gráficos y recomendaciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Tiempo estimado: 15-20 minutos</span>
                  </li>
                </ul>
              </div>

              <button
                className="w-full bg-white hover:bg-gray-100 text-[#4a7ba7] rounded-[25px] px-8 py-4 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                onClick={onStartEvaluation}
              >
                <PlayCircle className="w-6 h-6" />
                <span className="font-['Inter:Regular',_sans-serif] text-[18px]">
                  Iniciar Nueva Evaluación
                </span>
              </button>
            </CardContent>
          </Card>

          {/* Acciones rápidas */}
          <Card className="border-none shadow-xl">
            <CardHeader>
              <CardTitle className="text-[20px] text-[#1e3a8a]">Acciones Rápidas</CardTitle>
              <CardDescription>Accede a tus opciones principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={onViewEvaluations}
                className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-[20px] p-4 transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <div className="bg-blue-500 p-2 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-['Inter:Regular',_sans-serif] text-[15px] text-[#1e3a8a]">
                    Ver Evaluaciones
                  </div>
                  <div className="text-[12px] text-gray-600">Historial completo</div>
                </div>
              </button>

              <button
                onClick={onViewProfile}
                className="w-full bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-[20px] p-4 transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <div className="bg-purple-500 p-2 rounded-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-['Inter:Regular',_sans-serif] text-[15px] text-[#1e3a8a]">
                    Mi Perfil
                  </div>
                  <div className="text-[12px] text-gray-600">Configuración</div>
                </div>
              </button>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-[20px] p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="font-['Inter:Regular',_sans-serif] text-[15px] text-green-800">
                    Nivel Actual
                  </span>
                </div>
                <Badge className="bg-green-600 text-white hover:bg-green-700">
                  Intermedio
                </Badge>
                <p className="text-[12px] text-gray-600 mt-2">
                  Continúa evaluando para mejorar tu nivel de gobernanza
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card className="mt-6 border-none shadow-lg bg-gradient-to-r from-indigo-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-['Inter:Regular',_sans-serif] text-[18px] text-[#1e3a8a] mb-2">
                  Sobre el Evaluador de Gobernanza de IA
                </h3>
                <p className="text-[14px] text-gray-700 leading-relaxed">
                  Esta herramienta te permite evaluar el nivel de madurez de tu organización en gobernanza de inteligencia artificial,
                  basándose en marcos de referencia internacionales como ISO 27090, ISO 23894, NIS2/AI Act, ISO 42001-42005 y CONPES 4144.
                  Los resultados te proporcionarán una visión clara de tus fortalezas y áreas de mejora.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
