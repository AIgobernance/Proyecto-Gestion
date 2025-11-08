import React from "react";
import imgLogo from "../assets/logo-principal.jpg";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

/* Iconos inline */
const Icon = {
  Check: (p) => (
    <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" fill="none" strokeWidth="2.5" {...p}>
      <circle cx="12" cy="12" r="10" fill="url(#g)" />
      <polyline points="17 8 10 15 7 12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Mail: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="#4d82bc" fill="none" strokeWidth="2" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
};

export function RegistrationSuccessModal({ onContinue }) {
  return (
    <div className="bg-gradient-to-br from-[#cadffb] via-[#e8f2fc] to-white min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <img alt="Logo" className="h-12 w-auto object-contain" src={imgLogo} />
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-6 py-16 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl">
            <CardContent className="p-10 text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-40" />
                  <div className="relative rounded-full p-4 shadow-lg" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
                    <Icon.Check />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h1 className="text-[28px] text-gray-900">¡Registro Exitoso!</h1>
                <p className="text-[16px] text-gray-600">Tu cuenta ha sido creada correctamente</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <Icon.Mail />
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    Hemos enviado un enlace de activación a tu correo electrónico. Por favor verifica tu bandeja de entrada.
                  </p>
                </div>
              </div>

              <Button
                onClick={onContinue}
                className="w-full"
                style={{
                  background: "linear-gradient(90deg,#4d82bc,#5a8fc9)",
                  color: "#fff",
                  borderColor: "transparent",
                }}
              >
                Continuar al Inicio de Sesión
              </Button>

              <p className="text-[12px] text-gray-500">
                Si no recibes el correo, revisa tu carpeta de spam.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
