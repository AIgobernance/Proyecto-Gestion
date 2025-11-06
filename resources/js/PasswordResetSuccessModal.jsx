import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle2, Shield } from "lucide-react";
import { motion } from "motion/react";

export function PasswordResetSuccessModal({ onContinue }) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader>
            {/* Ícono de éxito */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50"></div>
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4 shadow-lg">
                  <CheckCircle2 className="h-16 w-16 text-white" strokeWidth={2.5} />
                </div>
              </motion.div>
            </div>

            {/* Título */}
            <DialogTitle className="text-center text-[28px] mb-2">
              ¡Contraseña Actualizada!
            </DialogTitle>

            {/* Descripción */}
            <DialogDescription className="text-center text-[16px] px-4 leading-relaxed text-gray-600">
              Tu contraseña ha sido cambiada exitosamente. Tu cuenta ahora está más segura.
            </DialogDescription>

            {/* Mensaje de seguridad */}
            <div className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-[#4d82bc]" />
              <p className="text-[14px] text-[#4d82bc]">
                Puedes iniciar sesión con tu nueva contraseña
              </p>
            </div>
          </DialogHeader>

          {/* Botón continuar */}
          <div className="flex justify-center pt-6 pb-2">
            <Button
              className="w-full bg-gradient-to-r from-[#4d82bc] to-[#5a8fc9] hover:from-[#3d6a9c] hover:to-[#4a7fb9] shadow-lg transition-all"
              size="lg"
              onClick={onContinue}
            >
              Iniciar Sesión
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
