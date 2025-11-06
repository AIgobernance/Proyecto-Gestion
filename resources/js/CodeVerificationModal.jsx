import React, { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Mail, Phone, Shield, ArrowLeft, CheckCircle2, RotateCw } from "lucide-react";

export function CodeVerificationModal({ method, onVerify, onBack }) {
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = () => {
    if (code.length === 6) {
      onVerify(code);
    }
  };

  const handleResendCode = () => {
    setIsResending(true);
    // Simulamos el reenvío del código
    setTimeout(() => {
      setIsResending(false);
      alert(
        `Código reenviado a tu ${
          method === "email" ? "correo electrónico" : "teléfono"
        }`
      );
    }, 1500);
  };

  const Icon = method === "email" ? Mail : Phone;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#6b9bc9] to-[#5882b8] rounded-[40px] px-12 py-10 shadow-2xl max-w-md w-full">
        {/* Icono y Título */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/20 p-4 rounded-full mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-['Inter:Regular',_sans-serif] text-[28px] text-white text-center mb-2">
            Verificación de Código
          </h2>

          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-[20px]">
            <Icon className="w-5 h-5 text-white" />
            <p className="font-['Inter:Regular',_sans-serif] text-[15px] text-white">
              {method === "email"
                ? "Código enviado a tu correo"
                : "Código enviado a tu teléfono"}
            </p>
          </div>
        </div>

        {/* Campo de código OTP */}
        <div className="mb-6">
          <label className="font-['Inter:Regular',_sans-serif] text-[16px] text-white flex items-center justify-center gap-2 mb-4">
            Ingresa el código de 6 dígitos:
          </label>
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={(value) => setCode(value)}>
              <InputOTPGroup>
                <InputOTPSlot
                  index={0}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
                <InputOTPSlot
                  index={3}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-14 text-[24px] bg-white border-2 border-white/50 rounded-[12px]"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-white/70 text-center mt-3 text-[13px]">
            {code.length}/6 dígitos
          </p>
        </div>

        {/* Reenviar código */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-2 text-[14px] disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
            {isResending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
          </button>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 justify-center">
          <button
            className="bg-white/20 hover:bg-white/30 text-white h-[44px] px-6 rounded-[25px] transition-all duration-200 flex items-center gap-2 border-2 border-white/30"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-['Inter:Regular',_sans-serif] text-[16px]">Volver</span>
          </button>
          <button
            className={`bg-white hover:bg-gray-100 text-[#5882b8] h-[44px] px-8 rounded-[25px] transition-all duration-200 flex items-center gap-2 shadow-lg ${
              code.length !== 6 ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl"
            }`}
            onClick={handleSubmit}
            disabled={code.length !== 6}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-['Inter:Regular',_sans-serif] text-[16px]">Verificar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
