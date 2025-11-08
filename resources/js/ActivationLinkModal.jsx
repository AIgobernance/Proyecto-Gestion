import React from "react";
import imgLogo from "../assets/logo-principal.jpg";

export function ActivationLinkModal({ onAccept, onBack }) {
  const handleResend = () => {
    // Aquí podrías invocar tu API de reenvío
    // Por ahora solo informativo.
    alert("Se ha reenviado el enlace de activación (simulado).");
  };

  return (
    <div className="bg-[#e5e7eb] relative min-h-screen">
      {/* Header consistente con HomePage */}
      <div className="bg-[#cadffb] border-b border-gray-200 h-[60px] w-full flex items-center justify-between px-6">
        <div className="h-[40px] w-[101px]">
          <img alt="logo" className="max-w-none object-cover pointer-events-none size-full" src={imgLogo} />
        </div>
        <button
          className="bg-white border border-gray-300 rounded-[20px] px-[24px] py-[6px] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onBack}
        >
          Volver
        </button>
      </div>

      {/* Modal */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="bg-[#5b9fd8] rounded-[20px] px-[80px] py-[60px] w-full max-w-[580px] shadow-lg">
          <div className="text-center">
            <h2 className="text-[28px] text-white mb-4">Enlace de Activación</h2>
            <p className="text-[14px] text-white mb-8 leading-relaxed">
              Verifique su correo electrónico<br />para activar la cuenta
            </p>

            <div className="flex flex-col items-center gap-3">
              <button
                className="bg-white rounded-[20px] px-[40px] py-[8px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                onClick={handleResend}
              >
                Enviar nuevamente
              </button>

              <button
                className="bg-white rounded-[20px] px-[40px] py-[8px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                onClick={onAccept}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
