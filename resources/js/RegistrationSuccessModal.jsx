import imgLogo from "../assets/audi-7.svg";
import { motion } from "motion/react";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function RegistrationSuccessModal({ onContinue }) {
  return (
    <div className="bg-gradient-to-br from-[#cadffb] via-[#e8f2fc] to-white relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img alt="Logo" className="h-12 w-auto object-contain" src={imgLogo} />
        </div>
      </div>

      {/* Success Content */}
      <div className="flex items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          <Card className="shadow-xl">
            <CardContent className="p-10 text-center space-y-6">
              {/* Icono de éxito */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 shadow-lg">
                    <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              </motion.div>

              {/* Título y descripción */}
              <div className="space-y-2">
                <h1 className="text-[28px] text-gray-900">¡Registro Exitoso!</h1>
                <p className="text-[16px] text-gray-600">
                  Tu cuenta ha sido creada correctamente
                </p>
              </div>

              {/* Banner de verificación */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#4d82bc] mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[14px] text-gray-700 leading-relaxed">
                      Hemos enviado un enlace de activación a tu correo electrónico. Por favor
                      verifica tu bandeja de entrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <Button
                onClick={onContinue}
                className="w-full bg-gradient-to-r from-[#4d82bc] to-[#5a8fc9] hover:from-[#3d6a9c] hover:to-[#4a7fb9] shadow-lg"
                size="lg"
              >
                Continuar al Inicio de Sesión
              </Button>

              <p className="text-[12px] text-gray-500">
                Si no recibes el correo, revisa tu carpeta de spam
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
