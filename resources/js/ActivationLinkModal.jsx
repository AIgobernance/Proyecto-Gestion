import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";

const IconMail = (p) => (
  <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export function ActivationLinkModal({ open = true, onAccept, onBack }) {
  const handleResend = () => {
    alert("Se ha reenviado el enlace de activación (simulado).");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onBack?.()}>
      <DialogContent className="p-0 overflow-hidden">
        {/* X solo-ícono */}
        <DialogClose data-slot="dialog-close" aria-label="Cerrar">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <CardContent className="p-8">
            {/* Contenido centrado en columna */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              {/* Ícono */}
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
                <IconMail />
              </div>

              {/* Título y descripción APILADOS */}
              <div style={{ textAlign: "center", margin: 0 }}>
                <h3
                  style={{
                    display: "block",
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0b1324",
                    margin: 0,
                    marginBottom: 4,
                  }}
                >
                  Enlace de Activación
                </h3>
                <p
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "#334155",
                    margin: 0,
                  }}
                >
                  Verifique su correo electrónico para activar la cuenta.
                </p>
              </div>

              {/* Nota más discreta */}
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                ¿No llegó el correo? Puede reenviar el enlace.
              </p>

              {/* Botones centrados */}
              <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
                <Button onClick={handleResend} className="btn-outline">
                  Enviar nuevamente
                </Button>
                <Button onClick={onAccept} className="btn-primary">
                  Aceptar
                </Button>
              </div>
            </div>
          </CardContent>

          <DialogFooter className="p-0" />
        </Card>
      </DialogContent>
    </Dialog>
  );
}
