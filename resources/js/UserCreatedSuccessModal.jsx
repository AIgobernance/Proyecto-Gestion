import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import successImg from "../assets/Check.jpg";

export function UserCreatedSuccessModal({ open = true, onContinue }) {
  return (
    <Dialog open={open} onOpenChange={(state) => !state && onContinue?.()}>
      <DialogContent className="p-0 overflow-hidden rounded-2xl max-w-md">
        <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center gap-4">

              <div className="relative mb-1">
                <img
                  src={successImg}
                  alt="Cuenta creada con éxito"
                  width={80}
                  height={80}
                  style={{
                    display: "block",
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                  }}
                />
              </div>

              <h3 className="text-[22px] font-bold text-gray-900">
                ¡Cuenta creada con éxito!
              </h3>

              <p className="text-[14px] text-gray-600">
                El administrador ha sido registrado correctamente.
              </p>

              <Button
                onClick={onContinue}
                className="btn-primary"
                style={{ width: "100%" }}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
