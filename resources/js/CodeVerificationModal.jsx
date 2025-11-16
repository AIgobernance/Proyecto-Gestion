import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Mail, Phone, Shield, ArrowLeft, CheckCircle2, RotateCw } from "lucide-react";

export function CodeVerificationModal({ method, onVerify, onBack, onResendCode }) {
  const [code, setCode] = useState("");
  const [isResending, setIsResending] = useState(false);
  const otpWrapperRef = useRef(null);

  const Icon = method === "email" ? Mail : Phone;

  const handleSubmit = () => {
    if (code.length === 6) onVerify(code);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      if (onResendCode) {
        await onResendCode();
      } else {
        // Fallback si no se proporciona la función
        setTimeout(() => {
          setIsResending(false);
          alert(`Código reenviado a tu ${method === "email" ? "correo electrónico" : "teléfono"}`);
        }, 1200);
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Si el usuario hace click en el contenedor, enfocamos el primer slot
  const focusFirstSlot = () => {
    const el = otpWrapperRef.current?.querySelector("input");
    if (el) el.focus();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onBack?.()}>
      <DialogContent className="p-0 overflow-hidden">
        {/* X solo-ícono */}
        <DialogClose data-slot="dialog-close" aria-label="Cerrar">
          <span aria-hidden="true"></span>
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        {/* Estilos de las cajitas */}
        <style>{`
          .otp-row{
            display:flex;
            justify-content:center;
            gap:12px;
          }
          .otp-box{
            width:48px;
            height:56px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:24px;
            background:#ffffff;
            border:1.5px solid #cbd5e1;
            border-radius:14px;
            box-shadow: 0 2px 6px rgba(16,24,40,.06);
            transition: border-color .2s, box-shadow .2s, transform .06s;
          }
          /* resalta cuando el input interno tiene foco */
          .otp-box:focus-within{
            border-color:#4d82bc;
            box-shadow: 0 0 0 3px rgba(77,130,188,.22), 0 2px 6px rgba(16,24,40,.06);
          }
          /* animación sutil al teclear */
          .otp-box:active{
            transform: scale(.98);
          }
        `}</style>

        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <CardContent className="p-8">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
              {/* Badge/ícono */}
              <div
                className="relative"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 999,
                  background: "linear-gradient(135deg,#eef2ff,#e2e8f0)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                }}
              >
                <Shield className="h-8 w-8 text-[#1f3d93]" />
              </div>

              {/* Título + leyenda */}
              <div style={{ textAlign: "center", margin: 0 }}>
                <h3 style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#0b1324", margin: 0, marginBottom: 4 }}>
                  Verificación de Código
                </h3>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon className="h-4 w-4" />
                  <p style={{ display: "block", fontSize: 14, color: "#334155", margin: 0 }}>
                    {method === "email" ? "Código enviado a tu correo" : "Código enviado a tu teléfono"}
                  </p>
                </div>
              </div>

              {/* === Label + OTP con CAJITAS === */}
              <div style={{ width: "100%", marginTop: 6 }}>
                <Label id="otp-label" htmlFor="otp-hidden-input" style={{ display: "block", textAlign: "center" }}>
                  Ingresa el código de 6 dígitos
                </Label>

                <div
                  ref={otpWrapperRef}
                  onClick={focusFirstSlot}
                  role="group"
                  aria-labelledby="otp-label"
                  className="otp-row"
                  style={{ marginTop: 12 }}
                >
                  <InputOTP
                    id="otp-hidden-input"
                    maxLength={6}
                    value={code}
                    onChange={(v) => setCode(v)}
                    autoFocus
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="otp-box"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p style={{ color: "#64748b", textAlign: "center", fontSize: 13, marginTop: 8 }}>
                  {code.length}/6 dígitos
                </p>
              </div>

              {/* Reenviar (discreto) */}
              <button
                onClick={handleResendCode}
                disabled={isResending}
                style={{
                  color: "rgba(15,23,42,.7)",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                  opacity: isResending ? 0.6 : 1,
                }}
              >
                <RotateCw className={`h-4 w-4 ${isResending ? "animate-spin" : ""}`} />
                {isResending ? "Reenviando..." : "¿No recibiste el código? Reenviar"}
              </button>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center", marginTop: 6 }}>
                <Button onClick={onBack} className="btn" style={{ background: "#f1f5f9", color: "#0b1324" }}>
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={code.length !== 6}
                  className="btn-primary"
                  style={{ opacity: code.length !== 6 ? 0.6 : 1 }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Verificar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

// Default opcional
export default CodeVerificationModal;
