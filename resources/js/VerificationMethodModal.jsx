import React from "react";
import { Mail, Phone, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export function VerificationMethodModal({ onSelectEmail, onSelectPhone, onClose }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
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
                  background: "linear-gradient(135deg,#eef2ff,#e2e8f0)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                }}
              >
                <Shield className="h-8 w-8 text-[#1f3d93]" />
              </div>

              {/* Título y descripción (apilados) */}
              <div style={{ textAlign: "center", margin: 0 }}>
                <h3 style={{ display: "block", fontSize: 22, fontWeight: 800, color: "#0b1324", margin: 0, marginBottom: 4 }}>
                  Verificación en Dos Pasos
                </h3>
                <p style={{ display: "block", fontSize: 14, color: "#334155", margin: 0 }}>
                  Selecciona cómo quieres recibir tu código de verificación
                </p>
              </div>

              {/* Opciones */}
              <div style={{ width: "100%", display: "grid", gap: 10, marginTop: 8 }}>
                <Button
                  onClick={onSelectEmail}
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 12,
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "linear-gradient(0deg,#f8fafc,#f8fafc)",
                    color: "#0b1324",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg,#4d82bc,#5a8fc9)",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Mail className="h-5 w-5" />
                  </span>
                  <span style={{ textAlign: "left" }}>
                    <b>Correo Electrónico</b>
                    <br />
                    <small style={{ color: "#64748b" }}>Recibirás un código en tu email</small>
                  </span>
                </Button>

                <Button
                  onClick={onSelectPhone}
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 12,
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "linear-gradient(0deg,#f8fafc,#f8fafc)",
                    color: "#0b1324",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      background: "linear-gradient(135deg,#16a34a,#22c55e)",
                      color: "#fff",
                      padding: 8,
                      borderRadius: 12,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Phone className="h-5 w-5" />
                  </span>
                  <span style={{ textAlign: "left" }}>
                    <b>Mensaje de Texto</b>
                    <br />
                    <small style={{ color: "#64748b" }}>Recibirás un SMS en tu teléfono</small>
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
