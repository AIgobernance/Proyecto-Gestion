import React from "react";
import {
  CheckCircle2,
  Trophy,
  Star,
  Download,
  Share2,
  ArrowLeft,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { motion } from "motion/react";
// 👇 Cambia la ruta al logo real en tu proyecto
import imgLogo from "../assets/logo-principal.jpg";

export function EvaluationCompletedPage({ onBack, onViewResults }) {
  // Datos de ejemplo
  const evaluationData = {
    questionsAnswered: 50,
    timeSpent: "18 min",
    completionDate: new Date().toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    status: "Completada",
  };

  return (
    <div className="bg-gradient-to-br from-[#e8f0f8] to-[#f0f7ff] relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-6 shadow-sm">
        {/* Logo */}
        <div className="h-[113px] w-[287px]">
          <img
            alt="Logo"
            className="max-w-none object-cover pointer-events-none size-full"
            src={imgLogo}
          />
        </div>

        {/* Botón Volver */}
        <button
          className="bg-white hover:bg-gray-100 rounded-[20px] px-[30px] py-[8px] transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">
            Volver al Dashboard
          </span>
        </button>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Animación de éxito */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
            className="inline-flex items-center justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-2xl">
                <CheckCircle2 className="w-20 h-20 text-white" />
              </div>
              {/* Estrellas decorativas */}
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>

          <h1 className="font-['Inter:Regular',_sans-serif] text-[42px] text-[#1e3a8a] mb-3">
            ¡Evaluación Completada!
          </h1>
          <p className="font-['Inter:Regular',_sans-serif] text-[18px] text-gray-600 max-w-2xl mx-auto">
            Has completado exitosamente la evaluación de gobernanza de IA. Tus respuestas han sido procesadas y los resultados están listos.
          </p>
        </motion.div>

        {/* Cards con información */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {/* Preguntas Respondidas */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200 bg-white">
            <CardContent className="pt-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-[36px] text-[#1e3a8a] mb-1">
                {evaluationData.questionsAnswered}
              </div>
              <p className="text-[14px] text-gray-600">Preguntas Respondidas</p>
            </CardContent>
          </Card>

          {/* Tiempo Invertido */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200 bg-white">
            <CardContent className="pt-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-[36px] text-[#1e3a8a] mb-1">{evaluationData.timeSpent}</div>
              <p className="text-[14px] text-gray-600">Tiempo Invertido</p>
            </CardContent>
          </Card>

          {/* Estado */}
          <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-200 bg-white">
            <CardContent className="pt-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-[20px] text-[#1e3a8a] mb-1">
                <Badge className="bg-green-600 text-white hover:bg-green-700 text-[14px] px-4 py-1">
                  {evaluationData.status}
                </Badge>
              </div>
              <p className="text-[14px] text-gray-600 mt-2">{evaluationData.completionDate}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card principal de resultados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl bg-gradient-to-br from-[#5882b8] to-[#4a7ba7] overflow-hidden">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-white text-[28px]">
                <TrendingUp className="w-8 h-8" />
                Resultados Disponibles
              </CardTitle>
              <CardDescription className="text-white/90 text-[16px]">
                Tu análisis detallado de gobernanza de IA está listo para visualizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-[20px] p-6">
                <h3 className="text-white text-[18px] mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  Lo que encontrarás en tus resultados:
                </h3>
                <ul className="space-y-3 text-white/90 text-[15px]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                    <span>Puntuación general de madurez en gobernanza de IA</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                    <span>Análisis detallado por cada una de las 5 dimensiones evaluadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                    <span>Gráficos interactivos de radar y barras comparativas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                    <span>Recomendaciones personalizadas para mejorar tu gobernanza</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-300" />
                    <span>Comparación con estándares internacionales (ISO, NIS2, CONPES)</span>
                  </li>
                </ul>
              </div>

              {/* Botón Ver Resultados */}
              <button
                className="w-full bg-white hover:bg-gray-100 text-[#4a7ba7] rounded-[30px] px-8 py-5 transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group"
                onClick={onViewResults}
              >
                <TrendingUp className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="font-['Inter:Regular',_sans-serif] text-[20px]">
                  Ver Resultados Detallados
                </span>
              </button>

              {/* Botones secundarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-[25px] px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-white/30">
                  <Download className="w-5 h-5" />
                  <span className="font-['Inter:Regular',_sans-serif] text-[15px]">
                    Descargar Reporte PDF
                  </span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white rounded-[25px] px-6 py-3 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-white/30">
                  <Share2 className="w-5 h-5" />
                  <span className="font-['Inter:Regular',_sans-serif] text-[15px]">
                    Compartir Resultados
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensaje de agradecimiento */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 text-[14px]">
            Gracias por utilizar nuestro Evaluador de Gobernanza de IA. Tu compromiso con la gobernanza responsable es fundamental.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
