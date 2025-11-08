import React from "react";
import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckCircle2, Shield } from "lucide-react";

export function PasswordResetSuccessModal({ onContinue }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onContinue?.()}>
      <DialogContent className="p-0 overflow-hidden">
        {/* X solo-ícono */}
        <DialogClose data-slot="dialog-close" aria-label="Cerrar">
          <span aria-hidden="true"></span>
          <span className="sr-only">Cerrar</span>
        </DialogClose>

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
                  background: "linear-gradient(135deg,#dcfce7,#bbf7d0)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                }}
              >
                <CheckCircle2 className="h-8 w-8 text-green-700" />
              </div>

              {/* Texto apilado */}
              <div style={{ textAlign: "center", margin: 0 }}>
                <h3 style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#0b1324", margin: 0, marginBottom: 4 }}>
                  ¡Contraseña Actualizada!
                </h3>
                <p style={{ display: "block", fontSize: 14, color: "#334155", margin: 0 }}>
                  Tu contraseña se cambió correctamente.
                </p>
              </div>

              {/* Mensaje de seguridad (tenue) */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#eff6ff",
                  borderRadius: 12,
                  marginTop: 4,
                }}
              >
                <Shield className="h-4 w-4 text-[#4d82bc]" />
                <small style={{ color: "#4d82bc" }}>Ahora puedes iniciar sesión con tu nueva contraseña.</small>
              </div>

              {/* Botón */}
              <div style={{ width: "100%", marginTop: 12 }}>
                <Button onClick={onContinue} className="btn-primary" style={{ width: "100%" }}>
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
