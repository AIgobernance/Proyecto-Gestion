import React, { useState } from "react";
import imgLogo from "../assets/logo-principal.jpg";
import { VerificationMethodModal } from "./VerificationMethodModal";
import { CodeVerificationModal } from "./CodeVerificationModal";
import { PasswordResetSuccessModal } from "./PasswordResetSuccessModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { ArrowLeft, Lock, User, AlertCircle } from "lucide-react";

export function LoginPage({ onBack, onRegister, onLoginSuccess }) {
  const [verificationStep, setVerificationStep] = useState("login"); // 'login' | 'selectMethod' | 'enterCode' | 'resetPassword' | 'resetSelectMethod' | 'resetEnterCode' | 'resetSuccess'
  const [verificationMethod, setVerificationMethod] = useState("email"); // 'email' | 'phone'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Estados para restablecer contraseña
  const [resetUsername, setResetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const handleAccept = () => {
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

  const handleResetPassword = () => {
    setVerificationStep("resetPassword");
  };

  const handleAcceptResetPassword = () => {
    if (!resetUsername || !newPassword || !confirmPassword) {
      setResetError("Por favor, complete todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setResetError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setResetError("");
    setVerificationStep("resetSelectMethod");
  };

  const handleCancelResetPassword = () => {
    setResetUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setVerificationStep("login");
  };

  const handleSelectEmailForReset = () => {
    setVerificationMethod("email");
    setVerificationStep("resetEnterCode");
  };

  const handleSelectPhoneForReset = () => {
    setVerificationMethod("phone");
    setVerificationStep("resetEnterCode");
  };

  const handleVerifyResetCode = (code) => {
    console.log("Verificando código de reset:", code);
    setVerificationStep("resetSuccess");
  };

  const handleResetSuccessContinue = () => {
    setResetUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setResetError("");
    setVerificationStep("login");
  };

  const handleBackToResetMethod = () => {
    setVerificationStep("resetSelectMethod");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="h-[70px] w-[260px]">
              <img alt="AI Governance Evaluator" className="h-full w-full object-contain" src={imgLogo} />
            </div>

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
              <CardDescription className="text-center">Ingresa tus credenciales para acceder</CardDescription>
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
              <Button className="w-full bg-[#4d82bc] hover:bg-[#3d6a9c]" onClick={handleAccept}>
                Iniciar Sesión
              </Button>

              <Separator className="my-4" />

              {/* Enlaces */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={handleResetPassword}>
                  Restablecer Contraseña
                </Button>
                <Button variant="ghost" className="w-full" onClick={onRegister}>
                  ¿No tienes cuenta? Regístrate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Cambiar Contraseña */}
      <Dialog
        open={verificationStep === "resetPassword"}
        onOpenChange={(open) => !open && handleCancelResetPassword()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Restablecer Contraseña</DialogTitle>
            <DialogDescription>Ingresa tu usuario y nueva contraseña</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Mensaje de error */}
            {resetError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            {/* Campo Usuario */}
            <div className="space-y-2">
              <Label htmlFor="reset-username">Usuario</Label>
              <Input
                id="reset-username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
              />
            </div>

            {/* Campo Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            {/* Campo Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1 bg-[#4d82bc] hover:bg-[#3d6a9c]" onClick={handleAcceptResetPassword}>
                Aceptar
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCancelResetPassword}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales de verificación - Login normal */}
      {verificationStep === "selectMethod" && (
        <VerificationMethodModal
          onSelectEmail={handleSelectEmail}
          onSelectPhone={handleSelectPhone}
          onClose={handleCloseModal}
        />
      )}

      {verificationStep === "enterCode" && (
        <CodeVerificationModal method={verificationMethod} onVerify={handleVerify} onBack={onBack ? handleBackToMethod : undefined} />
      )}

      {/* Modales de verificación - Reset de contraseña */}
      {verificationStep === "resetSelectMethod" && (
        <VerificationMethodModal
          onSelectEmail={handleSelectEmailForReset}
          onSelectPhone={handleSelectPhoneForReset}
          onClose={handleCancelResetPassword}
        />
      )}

      {verificationStep === "resetEnterCode" && (
        <CodeVerificationModal
          method={verificationMethod}
          onVerify={handleVerifyResetCode}
          onBack={handleBackToResetMethod}
        />
      )}

      {/* Modal de éxito de cambio de contraseña */}
      {verificationStep === "resetSuccess" && <PasswordResetSuccessModal onContinue={handleResetSuccessContinue} />}
    </div>
  );
}
