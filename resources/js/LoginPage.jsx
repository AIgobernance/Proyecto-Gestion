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

/* ===== Estilos coherentes con Registro ===== */
const styles = `
:root{
  --brand:#1f3d93;
  --ink:#0b1324;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg, #213e90 0%, #1a2e74 100%)}
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:64px;display:flex;align-items:center;justify-content:space-between;padding:10px 20px}
.header__logo img{height:44px;width:auto;object-fit:contain}
.btn-pill{border:none;border-radius:999px;padding:10px 22px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.12)}
.btn-secondary{background:#f1f5f9;color:#173b8f;border:1px solid #c7d2fe}
.main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:28px 16px 40px}
.form-wrap{width:100%;max-width:420px}
.card-white{border-radius:22px;background:#fff;color:#0f172a;box-shadow:var(--shadow);border:1px solid #e5e7eb}
.card-title{margin:0;color:#0b1324;font-size:26px;text-align:center}
.card-desc{margin:6px 0 0;color:#334155;font-size:14px;text-align:center}
.field{display:flex;flex-direction:column;gap:6px}
label[data-slot="label"]{color:#0b1324;font-weight:700}
[data-slot="input"]{background:#fff;color:var(--ink);border-radius:999px;height:40px;padding:8px 14px;border:1px solid #cbd5e1}
.actions{display:flex;flex-direction:column;gap:10px}
.btn-primary{background:linear-gradient(90deg,#4d82bc,#5a8fc9);color:#fff}
.link-ghost{background:transparent;color:#173b8f;border:none}
.sep{margin:10px 0}
.small-link{font-size:13px;color:#334155;text-align:center}

/* Overlay y panel de TODOS los Dialog del login */
[data-slot="dialog-overlay"]{
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(2,6,23,.55);
  backdrop-filter: blur(2px);
}
[data-slot="dialog-content"]{
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  z-index: 51;
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
  padding: 22px;
}
/* “X” arriba a la derecha y oculta el texto Close */
[data-slot="dialog-close"]{
  position: absolute;
  right: 12px;
  top: 12px;
  border: 0;
  background: transparent;
  cursor: pointer;
  opacity: .7;
}
[data-slot="dialog-close"]:hover{ opacity: 1 }
.sr-only{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
`;

/* ===== Componente ===== */
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

  const handleSelectEmail = () => { setVerificationMethod("email"); setVerificationStep("enterCode"); };
  const handleSelectPhone = () => { setVerificationMethod("phone"); setVerificationStep("enterCode"); };

  const handleVerify = (code) => {
    if (onLoginSuccess) onLoginSuccess(username);
  };

  const handleBackToMethod = () => setVerificationStep("selectMethod");
  const handleCloseModal = () => setVerificationStep("login");

  // Reset contraseña
  const handleResetPassword = () => setVerificationStep("resetPassword");
  const handleAcceptResetPassword = () => {
    if (!resetUsername || !newPassword || !confirmPassword) return setResetError("Por favor, complete todos los campos");
    if (newPassword !== confirmPassword) return setResetError("Las contraseñas no coinciden");
    if (newPassword.length < 6) return setResetError("La contraseña debe tener al menos 6 caracteres");
    setResetError(""); setVerificationStep("resetSelectMethod");
  };
  const handleCancelResetPassword = () => {
    setResetUsername(""); setNewPassword(""); setConfirmPassword(""); setResetError(""); setVerificationStep("login");
  };
  const handleSelectEmailForReset = () => { setVerificationMethod("email"); setVerificationStep("resetEnterCode"); };
  const handleSelectPhoneForReset = () => { setVerificationMethod("phone"); setVerificationStep("resetEnterCode"); };
  const handleVerifyResetCode = () => setVerificationStep("resetSuccess");
  const handleResetSuccessContinue = () => { handleCancelResetPassword(); };
  const handleBackToResetMethod = () => setVerificationStep("resetSelectMethod");

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img alt="AI Governance Evaluator" src={imgLogo} />
        </div>
        <Button className="btn-pill btn-secondary" onClick={onBack}>
          <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            <ArrowLeft className="h-4 w-4" /> Volver
          </span>
        </Button>
      </header>

      {/* Contenido */}
      <main className="main">
        <div className="form-wrap">
          <Card className="card-white">
            <CardHeader>
              <CardTitle className="card-title">Iniciar Sesión</CardTitle>
              <CardDescription className="card-desc">Ingresa tus credenciales para acceder</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Usuario */}
              <div className="field">
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
                  onKeyDown={(e) => e.key === "Enter" && handleAccept()}
                />
              </div>

              {/* Contraseña */}
              <div className="field">
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
                  onKeyDown={(e) => e.key === "Enter" && handleAccept()}
                />
              </div>

              {/* Acción */}
              <div className="actions">
                <Button className="btn-primary btn-pill" onClick={handleAccept}>
                  Iniciar Sesión
                </Button>
              </div>

              {/* Separador */}
              <div className="sep">
                <Separator />
              </div>

              {/* Links secundarios */}
              <div className="actions">
                <Button className="btn-pill" onClick={handleResetPassword}>
                  Restablecer Contraseña
                </Button>
                <button className="link-ghost small-link" onClick={onRegister}>
                  ¿No tienes cuenta? <b>Regístrate</b>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Modales de flujo === */}
        {/* Cambiar contraseña (dialog nativo) */}
        <Dialog
          open={verificationStep === "resetPassword"}
          onOpenChange={(open) => !open && handleCancelResetPassword()}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Restablecer Contraseña</DialogTitle>
              <DialogDescription>Ingresa tu usuario y nueva contraseña</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {resetError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetError}</AlertDescription>
                </Alert>
              )}

              <div className="field">
                <Label htmlFor="reset-username">Usuario</Label>
                <Input
                  id="reset-username"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                />
              </div>

              <div className="field">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="field">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div style={{ display:"flex", gap:10, marginTop:6 }}>
                <Button className="btn-primary btn-pill" style={{ flex:1 }} onClick={handleAcceptResetPassword}>
                  Aceptar
                </Button>
                <Button className="btn-pill" style={{ flex:1 }} onClick={handleCancelResetPassword}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Verificación en 2 pasos (login) */}
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

        {/* Verificación para reset */}
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

        {/* Éxito de cambio de contraseña */}
        {verificationStep === "resetSuccess" && (
          <PasswordResetSuccessModal onContinue={handleResetSuccessContinue} />
        )}
      </main>
    </div>
  );
}
