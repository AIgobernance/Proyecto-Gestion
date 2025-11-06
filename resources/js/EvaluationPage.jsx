import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { motion, AnimatePresence } from "motion/react";
// 👇 cambia la ruta por tu imagen real
import imgLogo from "../assets/logo-principal.jpg";

// Datos de ejemplo - en una app real vendrían de una API
const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "¿Pregunta 1?",
    options: ["Respuesta 1", "Respuesta 2", "Respuesta 3", "Respuesta 4"],
    framework: "Marco: ****",
  },
  {
    id: 2,
    text: "¿Pregunta 2?",
    options: ["Respuesta 1", "Respuesta 2", "Respuesta 3", "Respuesta 4"],
    framework: "Marco: ****",
  },
  // Puedes agregar más preguntas según sea necesario
];

const TOTAL_QUESTIONS = 50;

export function EvaluationPage({ onBack, onPause, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [direction, setDirection] = useState(0); // Para animaciones

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex] || MOCK_QUESTIONS[0];
  const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = TOTAL_QUESTIONS - answeredCount;

  // Temporizador
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));
    }

    setDirection(1);

    if (currentQuestionIndex === TOTAL_QUESTIONS - 1) {
      onComplete?.();
    } else if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] ?? null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1);
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="bg-gradient-to-br from-[#e8f0f8] to-[#f0f7ff] relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-6 shadow-md">
        {/* Logo */}
        <div className="h-[113px] w-[287px]">
          <img
            alt="Logo"
            className="max-w-none object-cover pointer-events-none size-full"
            src={imgLogo}
          />
        </div>

        {/* Botones y temporizador */}
        <div className="flex items-center gap-4">
          <div className="bg-white/80 rounded-[20px] px-4 py-2 flex items-center gap-2 shadow-sm">
            <Clock className="w-4 h-4 text-[#4a7ba7]" />
            <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-[#1e3a8a]">
              {formatTime(elapsedTime)}
            </span>
          </div>

          <button
            className="bg-white hover:bg-gray-100 rounded-[20px] px-6 py-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">
              Volver
            </span>
          </button>
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-[20px] px-6 py-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            onClick={onPause}
          >
            <Pause className="w-4 h-4" />
            <span className="font-['Inter:Regular',_sans-serif] text-[16px]">
              Pausar
            </span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-4">
            {/* Card progreso */}
            <Card className="border-none shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[18px]">
                  <Target className="w-5 h-5 text-[#4a7ba7]" />
                  Progreso General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[14px] text-gray-600">Completado</span>
                    <span className="text-[14px] text-[#1e3a8a]">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-600">Pregunta actual:</span>
                    <Badge variant="outline" className="text-[#1e3a8a]">
                      {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-600">Respondidas:</span>
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {answeredCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="text-gray-600">Pendientes:</span>
                    <span className="text-orange-600">{unansweredCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card información */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[16px]">
                  <Info className="w-5 h-5 text-blue-600" />
                  Información
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2 text-[13px] text-gray-700">
                  <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>Puedes navegar entre preguntas usando los botones</span>
                </div>
                <div className="flex items-start gap-2 text-[13px] text-gray-700">
                  <Award className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                  <span>Tus respuestas se guardan automáticamente</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Área principal */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h1 className="font-['Inter:Regular',_sans-serif] text-[32px] text-[#1e3a8a]">
                  Evaluación de Gobernanza
                </h1>
                <Badge className="bg-[#4a7ba7] text-white hover:bg-[#3a6b97] text-[14px] px-4 py-1">
                  {currentQuestion.framework}
                </Badge>
              </div>
              <p className="text-[16px] text-gray-600">
                Responde cada pregunta basándote en la situación actual de tu organización
              </p>
            </div>

            {/* Card pregunta */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentQuestionIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card className="border-none shadow-xl bg-gradient-to-br from-[#c4dafa] to-[#b3d4f5]">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="bg-[#4a7ba7] text-white w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="font-['Inter:Regular',_sans-serif] text-[18px]">
                          {currentQuestionIndex + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-[22px] text-[#1e3a8a] leading-relaxed">
                          {currentQuestion.text}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup
                      value={selectedAnswer?.toString() ?? ""}
                      onValueChange={(value) => handleSelectAnswer(parseInt(value))}
                    >
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, index) => (
                          <div
                            key={index}
                            className={`relative rounded-[20px] transition-all duration-200 ${
                              selectedAnswer === index
                                ? "bg-[#4a7ba7] shadow-lg scale-[1.02]"
                                : "bg-white/80 hover:bg-white hover:shadow-md"
                            }`}
                          >
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                            >
                              <RadioGroupItem
                                value={index.toString()}
                                id={`option-${index}`}
                                className={
                                  selectedAnswer === index ? "border-white text-white" : ""
                                }
                              />
                              <span
                                className={`font-['Inter:Regular',_sans-serif] text-[16px] flex-1 ${
                                  selectedAnswer === index
                                    ? "text-white"
                                    : "text-[#1e3a8a]"
                                }`}
                              >
                                {option}
                              </span>
                              {selectedAnswer === index && (
                                <CheckCircle className="w-5 h-5 text-white" />
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>

                    {/* Navegación */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/30">
                      <button
                        className={`bg-white hover:bg-gray-100 rounded-[25px] px-6 py-3 transition-all duration-200 shadow-md flex items-center gap-2 ${
                          currentQuestionIndex === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-lg"
                        }`}
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-['Inter:Regular',_sans-serif] text-[15px] text-[#1e3a8a]">
                          Anterior
                        </span>
                      </button>

                      <div className="text-center">
                        <p className="text-[13px] text-[#1e3a8a]">
                          {selectedAnswer !== null ? (
                            <span className="flex items-center gap-1 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              Respuesta seleccionada
                            </span>
                          ) : (
                            "Selecciona una respuesta"
                          )}
                        </p>
                      </div>

                      <button
                        className={`bg-[#4a7ba7] hover:bg-[#3a6b97] text-white rounded-[25px] px-6 py-3 transition-all duration-200 shadow-md flex items-center gap-2 ${
                          selectedAnswer === null
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:shadow-lg"
                        }`}
                        onClick={handleNext}
                        disabled={selectedAnswer === null}
                      >
                        <span className="font-['Inter:Regular',_sans-serif] text-[15px]">
                          {currentQuestionIndex === TOTAL_QUESTIONS - 1
                            ? "Finalizar"
                            : "Siguiente"}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Indicador */}
            <div className="mt-6 flex justify-center">
              <div className="bg-white rounded-[25px] px-6 py-3 shadow-md">
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(10, TOTAL_QUESTIONS))].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        i === currentQuestionIndex % 10
                          ? "bg-[#4a7ba7] w-8"
                          : answers[i] !== undefined
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                  {TOTAL_QUESTIONS > 10 && (
                    <span className="text-[12px] text-gray-500 ml-2">
                      +{TOTAL_QUESTIONS - 10} más
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
