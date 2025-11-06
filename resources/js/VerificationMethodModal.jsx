import React from "react";
import { Mail, Phone, Shield, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../ui/card";

export function VerificationMethodModal({ onSelectEmail, onSelectPhone, onClose }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md"
        >
          <Card className="shadow-2xl overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-[#4d82bc] to-[#5a8fc9] p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-white text-[22px]">Verificación en Dos Pasos</h2>
              </div>

              <p className="text-white/90 text-[14px] text-center">
                Selecciona cómo quieres recibir tu código de verificación
              </p>
            </div>

            {/* Opciones */}
            <div className="p-6 space-y-3">
              {/* Opción Correo */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelectEmail}
                className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-300 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[16px] text-gray-900 mb-0.5">Correo Electrónico</p>
                    <p className="text-[13px] text-gray-600">Recibirás un código en tu email</p>
                  </div>
                </div>
              </motion.button>

              {/* Opción Teléfono */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSelectPhone}
                className="w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-300 rounded-xl p-4 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[16px] text-gray-900 mb-0.5">Mensaje de Texto</p>
                    <p className="text-[13px] text-gray-600">Recibirás un SMS en tu teléfono</p>
                  </div>
                </div>
              </motion.button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
