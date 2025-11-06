import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export function UserCreatedSuccessModal({ onContinue }) {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-[28px] mb-4">
            Usuario creado con éxito
          </DialogTitle>

          <DialogDescription className="text-center text-[16px] px-4 leading-relaxed text-gray-600">
            El nuevo usuario ha sido registrado correctamente en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center pt-4 pb-2">
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
