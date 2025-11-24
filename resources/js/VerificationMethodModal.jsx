import React, { useState } from "react";
import { Mail, Phone, Shield, Check } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export function VerificationMethodModal({ onSelectEmail, onSelectPhone, onClose }) {
  const [hovered, setHovered] = useState(null);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="p-0 overflow-hidden" style={{ maxWidth: "520px" }}>
        {/* X solo-ícono */}
        <DialogClose data-slot="dialog-close" aria-label="Cerrar">
          <span aria-hidden="true"></span>
          <span className="sr-only">Cerrar</span>
        </DialogClose>

        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <CardContent className="p-8" style={{ padding: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              {/* Badge/ícono mejorado */}
              <div
                className="relative"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #4d82bc 0%, #5a8fc9 100%)",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 8px 24px rgba(77, 130, 188, 0.25)",
                  marginBottom: 8,
                }}
              >
                <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>

              {/* Título y descripción mejorados */}
              <div style={{ textAlign: "center", margin: 0 }}>
                <h3 style={{ 
                  display: "block", 
                  fontSize: 24, 
                  fontWeight: 700, 
                  color: "#0b1324", 
                  margin: 0, 
                  marginBottom: 8,
                  letterSpacing: "-0.02em"
                }}>
                  Verificación en Dos Pasos
                </h3>
                <p style={{ 
                  display: "block", 
                  fontSize: 15, 
                  color: "#64748b", 
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  Selecciona cómo quieres recibir tu código de verificación
                </p>
              </div>

              {/* Opciones mejoradas */}
              <div style={{ width: "100%", display: "grid", gap: 12, marginTop: 8 }}>
                <Button
                  onClick={onSelectEmail}
                  onMouseEnter={() => setHovered("email")}
                  onMouseLeave={() => setHovered(null)}
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 16,
                    borderRadius: "16px",
                    padding: "20px",
                    background: hovered === "email" 
                      ? "linear-gradient(135deg, #f0f7ff 0%, #e8f2ff 100%)" 
                      : "#ffffff",
                    color: "#0b1324",
                    border: hovered === "email" 
                      ? "2px solid #4d82bc" 
                      : "2px solid #e2e8f0",
                    boxShadow: hovered === "email" 
                      ? "0 4px 12px rgba(77, 130, 188, 0.15)" 
                      : "0 2px 4px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Indicador de hover */}
                  {hovered === "email" && (
                    <div style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#4d82bc",
                      display: "grid",
                      placeItems: "center",
                    }}>
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                  
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #4d82bc 0%, #5a8fc9 100%)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(77, 130, 188, 0.3)",
                    }}
                  >
                    <Mail className="h-6 w-6" strokeWidth={2} />
                  </div>
                  
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: "#0b1324",
                      marginBottom: 4,
                      lineHeight: 1.4
                    }}>
                      Correo Electrónico
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      color: "#64748b",
                      lineHeight: 1.4
                    }}>
                      Recibirás un código en tu email
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={onSelectPhone}
                  onMouseEnter={() => setHovered("phone")}
                  onMouseLeave={() => setHovered(null)}
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 16,
                    borderRadius: "16px",
                    padding: "20px",
                    background: hovered === "phone" 
                      ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" 
                      : "#ffffff",
                    color: "#0b1324",
                    border: hovered === "phone" 
                      ? "2px solid #16a34a" 
                      : "2px solid #e2e8f0",
                    boxShadow: hovered === "phone" 
                      ? "0 4px 12px rgba(22, 163, 74, 0.15)" 
                      : "0 2px 4px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Indicador de hover */}
                  {hovered === "phone" && (
                    <div style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#16a34a",
                      display: "grid",
                      placeItems: "center",
                    }}>
                      <Check className="h-4 w-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                  
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <Phone className="h-6 w-6" strokeWidth={2} />
                  </div>
                  
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ 
                      fontSize: 16, 
                      fontWeight: 600, 
                      color: "#0b1324",
                      marginBottom: 4,
                      lineHeight: 1.4
                    }}>
                      Mensaje de Texto
                    </div>
                    <div style={{ 
                      fontSize: 13, 
                      color: "#64748b",
                      lineHeight: 1.4
                    }}>
                      Recibirás un SMS en tu teléfono
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
