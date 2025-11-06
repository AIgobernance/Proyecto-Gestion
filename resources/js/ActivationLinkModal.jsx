import React from "react";
import imgLogo from "../assets/logo-principal.jpg"; // 👈 cambia esto según tu ruta real

export function ActivationLinkModal({ onAccept, onBack }) {
  const handleResend = () => {
    // TODO: Implementar lógica para reenviar el correo de activación
    console.log("Reenviar correo de activación");
  };

  return (
    <div className="bg-[#e5e7eb] relative min-h-screen">
      {/* Header */}
      <div className="bg-[#bfdbfe] h-[60px] w-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="h-[40px] w-[101px]">
          <img
            alt="logo"
            className="max-w-none object-cover pointer-events-none size-full"
            src={imgLogo}
          />
        </div>

        {/* Botón Volver */}
        <button
          className="bg-white border border-gray-300 rounded-[20px] px-[24px] py-[6px] cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={onBack}
        >
          <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black">
            Volver
          </p>
        </button>
      </div>

      {/* Modal */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="bg-[#5b9fd8] rounded-[20px] px-[80px] py-[60px] w-full max-w-[580px] shadow-lg">
          <div className="text-center">
            {/* Título */}
            <h2 className="font-['Inter:Regular',_sans-serif] font-normal text-[28px] text-white mb-4">
              Enlace de Activación
            </h2>

            {/* Subtítulo */}
            <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-white mb-8 leading-relaxed">
              Verifique su correo electrónico<br />para activar la cuenta
            </p>

            {/* Botones */}
            <div className="flex flex-col items-center gap-3">
              <button
                className="bg-white rounded-[20px] px-[40px] py-[8px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                onClick={handleResend}
              >
                <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black">
                  Enviar nuevamente
                </p>
              </button>

              <button
                className="bg-white rounded-[20px] px-[40px] py-[8px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
                onClick={onAccept}
              >
                <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black">
                  Aceptar
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
