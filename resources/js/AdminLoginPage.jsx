import React, { useState } from "react";
import axios from "axios";
import { VerificationMethodModal } from "./VerificationMethodModal";
import { CodeVerificationModal } from "./CodeVerificationModal";
import { PasswordResetSuccessModal } from "./PasswordResetSuccessModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent } from "../ui/dialog";
import { ArrowLeft, Lock, User, AlertCircle, Shield } from "lucide-react";
// Logo
import imgLogo from "../assets/logo-principal.jpg";

/* ===== Estilos coherentes y overlay/centrado de Dialog ===== */
const styles = `
:root{
  --brand:#1f3d93;
  --ink:#0b1324;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg, #213e90 0%, #1a2e74 100%)}
.header{background:#fff;border-bottom:1px solid #e5e7eb}
.header__inner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 20px;max-width:1100px;margin:0 auto}
.header__logo img{height:48px;width:auto;object-fit:contain}
.main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px 40px}
.card-white{border-radius:22px;background:#fff;color:#0f172a;box-shadow:var(--shadow);border:1px solid #e5e7eb}
.card-title{margin:0;color:#0b1324;font-size:26px;text-align:center}
.card-desc{margin:6px 0 0;color:#334155;font-size:14px;text-align:center}
.field{display:flex;flex-direction:column;gap:6px}
label[data-slot="label"]{color:#0b1324;font-weight:700}
[data-slot="input"]{background:#fff;color:var(--ink);border-radius:999px;height:40px;padding:8px 14px;border:1px solid #cbd5e1}
.actions{display:flex;flex-direction:column;gap:10px}
.btn-primary{background:linear-gradient(90deg,#4d82bc,#5a8fc9);color:#fff;border:none;border-radius:999px;padding:10px 22px;font-weight:700;box-shadow:0 6px 18px rgba(15,23,42,.12)}
.btn-ghost{background:#f1f5f9;color:#173b8f;border:1px solid #c7d2fe;border-radius:999px;padding:10px 22px;font-weight:700}
.small-link{font-size:13px;color:#334155;text-align:center}

/* Overlay y panel de TODOS los Dialog aquí */
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
  box-shadow: var(--shadow);
  padding: 22px;
}
/* Cerrar (si lo usa el modal hijo) */
[data-slot="dialog-close"]{
  position: absolute; right: 12px; top: 12px; border: 0; background: transparent; cursor: pointer; opacity: .7;
}
[data-slot="dialog-close"]:hover{ opacity: 1 }
.sr-only{ position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
`;

export function AdminLoginPage({ onBack, onLoginSuccess }) {
  // Flujo principal de login
  const [verificationStep, setVerificationStep] = useState("login"); // login | selectMethod | enterCode | resetPassword | resetSelectMethod | resetEnterCode | resetSuccess
  const [verificationMethod, setVerificationMethod] = useState("email"); // email | phone
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null); // Guardar datos del usuario después del login

  // Flujo de recuperación
  const [resetUsername, setResetUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const handleAccept = async () => {
    if (!username || !password) {
      setError("Por favor, complete todos los campos");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      // Asegurar que el token CSRF esté configurado antes de enviar
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }
      
      // Enviar petición de login al backend
      const response = await axios.post('/login', {
        username: username,
        password: password,
      });

      if (response.status === 200 && response.data.user) {
        // Verificar que el usuario sea administrador
        const role = response.data.user.rol || 'usuario';
        if (role !== 'admin') {
          setError("Este usuario no tiene permisos de administrador");
          setIsSubmitting(false);
          return;
        }

        // Login exitoso - Guardar datos del usuario y mostrar modal de selección de método de verificación
        setUserData(response.data.user);
    setVerificationStep("selectMethod");
        return;
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      
      // Manejar error 403 (Forbidden) - usuario desactivado
      if (error.response && error.response.status === 403) {
        const responseData = error.response.data;
        if (responseData.deactivated) {
          setError("Su cuenta ha sido desactivada. Por favor, contacte con soporte para más información.");
        } else if (responseData.errors) {
          const backendErrors = responseData.errors;
          const errorMessage = backendErrors.username 
            ? (Array.isArray(backendErrors.username) ? backendErrors.username[0] : backendErrors.username)
            : responseData.message || "Su cuenta ha sido desactivada. Por favor, contacte con soporte.";
          setError(errorMessage);
        } else {
          setError(responseData.message || "Su cuenta ha sido desactivada. Por favor, contacte con soporte.");
        }
      }
      // Manejar error 401 (Unauthorized) - credenciales incorrectas
      else if (error.response && error.response.status === 401) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const backendErrors = responseData.errors;
          const errorMessage = backendErrors.username 
            ? (Array.isArray(backendErrors.username) ? backendErrors.username[0] : backendErrors.username)
            : responseData.message || "Usuario o contraseña incorrectos";
          setError(errorMessage);
        } else {
          setError(responseData.message || "Usuario o contraseña incorrectos");
        }
      } 
      // Manejar error 419 (CSRF token mismatch)
      else if (error.response && error.response.status === 419) {
        setError("Error de seguridad. Por favor, recarga la página e intenta nuevamente.");
        // Intentar refrescar el token CSRF
        const token = document.head?.querySelector('meta[name="csrf-token"]');
        if (token) {
          axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }
      }
      // Otros errores
      else if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const backendErrors = responseData.errors;
          const errorMessage = backendErrors.username 
            ? (Array.isArray(backendErrors.username) ? backendErrors.username[0] : backendErrors.username)
            : responseData.message || "Error al iniciar sesión";
          setError(errorMessage);
        } else {
          setError(responseData.message || "Error al iniciar sesión. Verifica tus credenciales.");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selección método 2FA
  const handleSelectEmail = () => { setVerificationMethod("email"); setVerificationStep("enterCode"); };
  const handleSelectPhone = () => { setVerificationMethod("phone"); setVerificationStep("enterCode"); };

  // Verificación OK
  const handleVerify = async (code) => {
    // Verificar el código de verificación aquí
    // TODO: Implementar verificación real del código con el backend
    // Por ahora, si el código es válido, llamar al callback de éxito
    if (code && code.length > 0) {
      if (onLoginSuccess && userData) {
        onLoginSuccess(userData.nombre || username, userData);
      }
    }
  };
  const handleBackToMethod = () => setVerificationStep("selectMethod");
  const handleCloseModal = () => setVerificationStep("login");

  // --- Recuperar contraseña ---
  const handleResetPassword = () => setVerificationStep("resetPassword");
  const handleAcceptResetPassword = () => {
    if (!resetUsername || !newPassword || !confirmPassword) return setResetError("Por favor, complete todos los campos");
    if (newPassword !== confirmPassword) return setResetError("Las contraseñas no coinciden");
    if (newPassword.length < 6) return setResetError("La contraseña debe tener al menos 6 caracteres");
    setResetError(""); setVerificationStep("resetSelectMethod");
  };
  const handleCancelResetPassword = () => {
    setResetUsername(""); setNewPassword(""); setConfirmPassword("");
    setResetError(""); setVerificationStep("login");
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
        <div className="header__inner">
          <div className="header__logo">
            <img alt="AI Governance Evaluator" src={imgLogo} />
          </div>

          <Badge className="bg-[#4d82bc] text-white border-0 px-3 py-1" title="Perfil actual">
            <Shield className="h-4 w-4 mr-1" />
            Administrador
          </Badge>

          <Button className="btn-ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            <span style={{ marginLeft: 8 }}>Volver</span>
          </Button>
        </div>
      </header>

      {/* Contenido */}
      <main className="main">
        <div style={{ width: "100%", maxWidth: 420 }}>
          <Card className="card-white">
            <CardHeader>
              <CardTitle className="card-title">Iniciar Sesión</CardTitle>
              <CardDescription className="card-desc">
                Ingresa tus credenciales de administrador
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
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

              {/* Acciones */}
              <div className="actions">
                <Button 
                  className="btn-primary" 
                  onClick={handleAccept}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                <Button className="btn-ghost" onClick={handleResetPassword}>
                  Restablecer Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === Modales: Verificación de login === */}
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

        {/* === Modales: Flujo de recuperación === */}
        <Dialog
          open={verificationStep === "resetPassword"}
          onOpenChange={(open) => !open && handleCancelResetPassword()}
        >
          <DialogContent className="p-0 overflow-hidden">
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#0b1324", margin: 0, marginBottom: 4 }}>
                Restablecer Contraseña
              </h3>
              <p style={{ fontSize: 14, color: "#334155", margin: 0, marginBottom: 12 }}>
                Ingresa tu usuario y nueva contraseña
              </p>

              <div className="space-y-4 py-2">
                {resetError && (
                  <div
                    className="alert"
                    role="alert"
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#7f1d1d",
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    {resetError}
                  </div>
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

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <Button
                    className="btn-primary"
                    style={{ flex: 1 }}
                    onClick={handleAcceptResetPassword}
                  >
                    Aceptar
                  </Button>
                  <Button
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={handleCancelResetPassword}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

        {verificationStep === "resetSuccess" && (
          <PasswordResetSuccessModal onContinue={handleResetSuccessContinue} />
        )}
      </main>
    </div>
  );
}
