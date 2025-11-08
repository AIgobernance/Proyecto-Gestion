import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "../ui/dialog";

// ⬇️ Cambia la ruta/archivo por tu imagen
import successImg from "../assets/Check.jpg";

export function RegistrationSuccessModal({ open = true, onContinue }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onContinue?.()}>
      <DialogContent className="p-0 overflow-hidden">
        {/* X solo-ícono */}
        <DialogClose data-slot="dialog-close" aria-label="Cerrar">
          <span aria-hidden="true">×</span>
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <CardContent className="p-8">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              {/* Imagen de éxito */}
              <div className="relative" style={{ marginBottom: 4 }}>
                <img
                  src={successImg}
                  alt="Cuenta creada con éxito"
                  width={80}
                  height={80}
                  style={{
                    display: "block",
                    borderRadius: 12, // usa 999 si la quieres circular
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                  }}
                />
              </div>

              {/* Texto apilado (h3 + p) para evitar fila */}
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
                  ¡Cuenta creada con éxito!
                </h3>
                <p
                  style={{
                    display: "block",
                    fontSize: 14,
                    color: "#334155",
                    margin: 0,
                  }}
                >
                  Se creó con éxito la cuenta.
                </p>
              </div>

              {/* Botón */}
              <div style={{ width: "100%", marginTop: 12 }}>
                <Button onClick={onContinue} className="btn-primary" style={{ width: "100%" }}>
                  Ir al inicio de sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
