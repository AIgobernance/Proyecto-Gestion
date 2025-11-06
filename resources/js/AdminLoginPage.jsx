import React, { useState } from "react";
import { VerificationMethodModal } from "./VerificationMethodModal";
import { CodeVerificationModal } from "./CodeVerificationModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { ArrowLeft, Lock, User, AlertCircle, Shield } from "lucide-react";
// 👇 cambia esta ruta por tu logo real
import imgLogo from "../assets/logo-principal.jpg";

export function AdminLoginPage({ onBack, onLoginSuccess }) {
  const [verificationStep, setVerificationStep] = useState("login");
  const [verificationMethod, setVerificationMethod] = useState("email");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAccept = () => {
    // Validación
    if (!username || !password) {
      setError("Por favor, complete todos los campos");
      return;
    }

    setError("");
    setVerificationStep("selectMethod");
  };

  const handleSelectEmail = () => {
    setVerificationMethod("email");
    setVerificationStep("enterCode");
  };

  const handleSelectPhone = () => {
    setVerificationMethod("phone");
    setVerificationStep("enterCode");
  };

  const handleVerify = (code) => {
    console.log("Verificando código:", code);
    if (onLoginSuccess) {
      onLoginSuccess(username);
    }
  };

  const handleBackToMethod = () => {
    setVerificationStep("selectMethod");
  };

  const handleCloseModal = () => {
    setVerificationStep("login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="h-[70px] w-[260px]">
              <img
                alt="AI Governance Evaluator"
                className="h-full w-full object-contain"
                src={imgLogo}
              />
            </div>

            {/* Badge Administrador */}
            <Badge className="bg-[#4d82bc] text-white border-0 px-3 py-1">
              <Shield className="h-4 w-4 mr-1" />
              Administrador
            </Badge>

            {/* Botón Volver */}
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-[28px]">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales de administrador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mensaje de error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Campo Usuario */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  <User className="inline h-4 w-4 mr-2" />
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAccept()}
                />
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAccept()}
                />
              </div>

              {/* Botón Aceptar */}
              <Button
                className="w-full bg-[#4d82bc] hover:bg-[#3d6a9c]"
                onClick={handleAccept}
              >
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modales de verificación */}
      {verificationStep === "selectMethod" && (
        <VerificationMethodModal
          onSelectEmail={handleSelectEmail}
          onSelectPhone={handleSelectPhone}
          onClose={handleCloseModal}
        />
      )}

      {verificationStep === "enterCode" && (
        <CodeVerificationModal
          method={verificationMethod}
          onVerify={handleVerify}
          onBack={handleBackToMethod}
        />
      )}
    </div>
  );
}

