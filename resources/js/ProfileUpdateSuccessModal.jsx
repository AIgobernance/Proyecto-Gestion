import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserCheck } from "lucide-react";

export function ProfileUpdateSuccessModal({ onContinue }) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-[28px] mb-4">
            ¡Perfil Actualizado!
          </DialogTitle>

          <DialogDescription className="text-center text-[16px] px-4 leading-relaxed text-gray-600">
            Tus cambios han sido guardados exitosamente. Tu información está ahora actualizada.
          </DialogDescription>

          <div className="flex items-center justify-center gap-2 mt-4 px-4 py-3 bg-green-50 rounded-lg">
            <UserCheck className="h-5 h-5 w-5 text-green-600" />
            <p className="text-[14px] text-green-700">
              Los cambios se reflejarán en todo el sistema
            </p>
          </div>
        </DialogHeader>

        <div className="flex justify-center pt-6 pb-2">
          <Button
            className="w-full bg-gradient-to-r from-[#4d82bc] to-[#5a8fc9] hover:from-[#3d6a9c] hover:to-[#4a7fb9] shadow-lg transition-all"
            size="lg"
            onClick={onContinue}
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
