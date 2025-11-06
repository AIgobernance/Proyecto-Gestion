import React from "react";
import imgLogo from "../assets/club-deportivo-alvear-de-general-alvear.svg";
import { motion } from "motion/react";
import {
  FileText,
  Calendar,
  Award,
  TrendingUp,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

// Datos de ejemplo - en una aplicación real vendrían de una API
const MOCK_EVALUATIONS = [
  {
    id: 1,
    name: "Evaluación ISO 27090",
    date: "15/10/2024",
    time: "14:30",
    score: 95,
    framework: "ISO 27090",
    status: "Completada",
  },
  {
    id: 2,
    name: "Evaluación NIS2/AI Act",
    date: "20/09/2024",
    time: "10:15",
    score: 85,
    framework: "NIS2/AI Act",
    status: "Completada",
  },
  {
    id: 3,
    name: "Evaluación ISO 42001",
    date: "05/08/2024",
    time: "16:45",
    score: 78,
    framework: "ISO 42001",
    status: "Completada",
  },
];

const getScoreBadge = (score) => {
  if (score >= 90)
    return { label: "Excelente", variant: "default", color: "bg-green-500" };
  if (score >= 75)
    return { label: "Bueno", variant: "secondary", color: "bg-blue-500" };
  if (score >= 60)
    return { label: "Regular", variant: "outline", color: "bg-yellow-500" };
  return { label: "Necesita Mejora", variant: "destructive", color: "bg-red-500" };
};

export function ViewEvaluationsPage({ onExit, onViewResults }) {
  const avgScore = Math.round(
    MOCK_EVALUATIONS.reduce((acc, ev) => acc + ev.score, 0) /
      MOCK_EVALUATIONS.length
  );

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img alt="Logo" className="h-14 w-auto object-contain" src={imgLogo} />

          <h1 className="text-[24px] text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#4d82bc]" />
            Mis Evaluaciones
          </h1>

          <Button variant="outline" onClick={onExit} className="gap-2">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Resumen de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] text-gray-600 mb-1">Total Evaluaciones</p>
                  <p className="text-[32px] text-gray-900">{MOCK_EVALUATIONS.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <FileText className="h-8 w-8 text-[#4d82bc]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] text-gray-600 mb-1">Puntuación Promedio</p>
                  <p className="text-[32px] text-gray-900">{avgScore}%</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] text-gray-600 mb-1">Última Evaluación</p>
                  <p className="text-[18px] text-gray-900">
                    {MOCK_EVALUATIONS[0].date}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de evaluaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#4d82bc]" />
                Historial de Evaluaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_EVALUATIONS.map((evaluation, index) => {
                const badge = getScoreBadge(evaluation.score);

                return (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#4d82bc]/50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4">
                          {/* Información principal */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-[18px] text-gray-900 mb-1">
                                  {evaluation.name}
                                </h3>
                                <div className="flex items-center gap-4 text-[14px] text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {evaluation.date}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {evaluation.time}
                                  </div>
                                </div>
                              </div>

                              <Badge className={`${badge.color} text-white`}>
                                {badge.label}
                              </Badge>
                            </div>

                            {/* Barra de progreso */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[14px]">
                                <span className="text-gray-600">Puntuación</span>
                                <span className="text-gray-900">{evaluation.score}%</span>
                              </div>
                              <Progress value={evaluation.score} className="h-2" />
                            </div>

                            <div className="flex items-center gap-2 text-[13px] text-gray-500">
                              <FileText className="h-4 w-4" />
                              <span>Marco: {evaluation.framework}</span>
                            </div>
                          </div>

                          {/* Botón de ver resultados */}
                          <Button
                            onClick={() => onViewResults(evaluation.id)}
                            className="bg-gradient-to-r from-[#4d82bc] to-[#5a8fc9] hover:from-[#3d6a9c] hover:to-[#4a7fb9] gap-2"
                          >
                            Ver Resultados
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensaje cuando no hay evaluaciones */}
        {MOCK_EVALUATIONS.length === 0 && (
          <Card className="mt-8">
            <CardContent className="py-16 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-[20px] text-gray-900 mb-2">No tienes evaluaciones</h3>
              <p className="text-[14px] text-gray-600">
                Completa tu primera evaluación para ver los resultados aquí
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
