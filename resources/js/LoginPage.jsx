import React, { useState } from "react";
import axios from "axios";
import imgLogo from "../assets/logo-principal.jpg";
import { VerificationMethodModal } from "./VerificationMethodModal";
import { CodeVerificationModal } from "./CodeVerificationModal";
import { PasswordResetSuccessModal } from "./PasswordResetSuccessModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "../ui/dialog";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { ArrowLeft, Lock, User, AlertCircle, Mail, Shield, KeyRound } from "lucide-react";

// Configurar axios
const token = document.head?.querySelector('meta[name="csrf-token"]');
if (token) {
  axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

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
  const [resetEmail, setResetEmail] = useState("");
  const [resetUserId, setResetUserId] = useState(null);
  const [resetMethod, setResetMethod] = useState("email"); // 'email' | 'sms'
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null); // Guardar datos del usuario después del login

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

      if (response.status === 200) {
        // Verificar si requiere 2FA
        if (response.data.requires_2fa) {
          // Guardar user_id para verificación 2FA
          setUserData({
            id: response.data.user_id,
            nombre: username
          });
          // Mostrar modal de selección de método
          setVerificationStep("selectMethod");
          return;
        }
        
        // Si no requiere 2FA, login directo (por compatibilidad)
        if (response.data.user) {
          setUserData(response.data.user);
    setVerificationStep("selectMethod");
          return;
        }
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

  const handleSelectEmail = async () => {
    setVerificationMethod("email");
    
    // Enviar código 2FA por email
    if (!userData || !userData.id) {
      setError("Error: No se encontró información del usuario.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axios.post('/login/send-2fa', {
        user_id: userData.id,
        method: 'email'
      });

      if (response.status === 200) {
        setVerificationStep("enterCode");
      }
    } catch (error) {
      console.error('Error al enviar código 2FA:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Error al enviar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPhone = async () => {
    setVerificationMethod("phone");
    
    // Notificar al backend que se seleccionó SMS
    if (!userData || !userData.id) {
      setError("Error: No se encontró información del usuario.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axios.post('/login/send-2fa', {
        user_id: userData.id,
        method: 'sms'
      });

      if (response.status === 200) {
        setVerificationStep("enterCode");
      }
    } catch (error) {
      console.error('Error al seleccionar método SMS:', error);
      // Aún así mostrar el modal, ya que SMS funciona sin validación
      setVerificationStep("enterCode");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (code) => {
    if (!code || code.length !== 6) {
      setError("Por favor, ingresa un código de 6 dígitos");
      return;
    }

    if (!userData || !userData.id) {
      setError("Error: No se encontró información del usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    // Si es SMS, aceptar cualquier código sin validar
    if (verificationMethod === "phone" || verificationMethod === "sms") {
      // Obtener datos del usuario de la sesión pendiente
      try {
        const token = document.head?.querySelector('meta[name="csrf-token"]');
        if (token) {
          axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }

        const response = await axios.post('/login/verify-2fa', {
          user_id: userData.id,
          code: code.trim(),
          method: 'sms'
        });

        if (response.status === 200 && response.data.user) {
          // Verificación exitosa - limpiar errores
          setError("");
          if (onLoginSuccess) {
            onLoginSuccess(response.data.user.nombre || username, response.data.user);
          }
        }
      } catch (error) {
        console.error('Error al verificar código SMS:', error);
        setError("Error al verificar el código. Por favor, intenta nuevamente.");
      }
      return;
    }

    // Si es email, validar con el backend
    setError("");
    setIsSubmitting(true);

    try {
      // Configurar token CSRF
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      // Verificar código 2FA con el backend
      const response = await axios.post('/login/verify-2fa', {
        user_id: userData.id,
        code: code.trim(),
        method: 'email'
      });

      if (response.status === 200 && response.data.user) {
        // Verificación exitosa - limpiar errores y completar login
        setError("");
        if (onLoginSuccess) {
          onLoginSuccess(response.data.user.nombre || username, response.data.user);
        }
      }
    } catch (error) {
      console.error('Error al verificar código 2FA:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = '';
        
        if (errorData.errors?.code) {
          errorMessage = Array.isArray(errorData.errors.code) 
            ? errorData.errors.code[0] 
            : errorData.errors.code;
        } else {
          errorMessage = errorData.message || "Código incorrecto. Por favor, verifica e intenta nuevamente.";
        }
        
        setError(errorMessage);
        
        // Si la cuenta fue bloqueada, redirigir al login
        if (errorData.blocked) {
          setTimeout(() => {
            setVerificationStep("login");
            setUserData(null);
            setError("Tu cuenta ha sido bloqueada. Por favor, contacte con soporte.");
          }, 2000);
          return;
        }
        
        // El código se limpiará automáticamente en el modal cuando detecte el error
      } else if (error.response?.status === 419) {
        setError("Error de seguridad. Por favor, recarga la página e intenta nuevamente.");
        const token = document.head?.querySelector('meta[name="csrf-token"]');
        if (token) {
          axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }
      } else {
        setError("Error al verificar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!userData || !userData.id) {
      setError("Error: No se encontró información del usuario.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axios.post('/login/resend-2fa', {
        user_id: userData.id
      });

      if (response.status === 200) {
        setError(""); // Limpiar errores
        // Mostrar mensaje de éxito (puedes agregar un estado para esto)
        alert("Código reenviado exitosamente. Por favor, revisa tu correo.");
      }
    } catch (error) {
      console.error('Error al reenviar código:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Error al reenviar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToMethod = () => setVerificationStep("selectMethod");
  const handleCloseModal = () => setVerificationStep("login");

  // Reset contraseña
  const handleResetPassword = () => setVerificationStep("resetPassword");
  
  // Paso 1: Validar email y mostrar selección de método
  const handleInitiatePasswordReset = async () => {
    if (!resetEmail) {
      setResetError("Por favor, ingrese su correo electrónico");
      return;
    }
    
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetError("Por favor, ingrese un correo electrónico válido");
      return;
    }

    setResetError("");
    setIsSubmitting(true);

    try {
      // Configurar token CSRF
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      // Enviar petición al backend para validar email
      const axiosClient = window.axios || axios;
      const response = await axiosClient.post('/password/reset/initiate', {
        email: resetEmail,
      });

      if (response.status === 200) {
        // Guardar user_id y avanzar al paso de selección de método
        setResetUserId(response.data.user_id);
        setVerificationStep("resetSelectMethod");
      }
    } catch (error) {
      console.error('Error al iniciar restablecimiento de contraseña:', error);
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        if (responseData.errors) {
          const backendErrors = responseData.errors;
          const errorMessage = backendErrors.email 
            ? (Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email)
            : backendErrors.general
            ? (Array.isArray(backendErrors.general) ? backendErrors.general[0] : backendErrors.general)
            : responseData.message || "Error al iniciar el restablecimiento";
          setResetError(errorMessage);
        } else {
          setResetError(responseData.message || "Error al iniciar el restablecimiento. Verifica los datos e intenta nuevamente.");
        }
      } else {
        setResetError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seleccionar método de verificación para restablecimiento
  const handleSelectResetEmail = async () => {
    setResetMethod("email");
    setResetError("");
    setIsSubmitting(true);

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axios.post('/password/reset/send-code', {
        email: resetEmail,
        method: 'email'
      });

      if (response.status === 200) {
        setVerificationStep("resetEnterCode");
      }
    } catch (error) {
      console.error('Error al enviar código:', error);
      if (error.response?.data?.message) {
        setResetError(error.response.data.message);
      } else {
        setResetError("Error al enviar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectResetPhone = async () => {
    setResetMethod("sms");
    setResetError("");
    setIsSubmitting(true);

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const response = await axios.post('/password/reset/send-code', {
        email: resetEmail,
        method: 'sms'
      });

      if (response.status === 200) {
        setVerificationStep("resetEnterCode");
      }
    } catch (error) {
      console.error('Error al enviar código SMS:', error);
      if (error.response?.data?.message) {
        setResetError(error.response.data.message);
      } else {
        setResetError("Error al enviar el código. Por favor, intenta nuevamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Paso 2: Verificar código y cambiar contraseña
  const handleAcceptResetPassword = async () => {
    if (!resetCode || !newPassword || !confirmPassword) {
      setResetError("Por favor, complete todos los campos");
      return;
    }
    
    if (resetCode.length !== 6) {
      setResetError("El código debe tener 6 dígitos");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setResetError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setResetError("");
    setIsSubmitting(true);

    try {
      // Configurar token CSRF
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      // Enviar petición al backend para restablecer contraseña
      const axiosClient = window.axios || axios;
      const response = await axiosClient.post('/password/reset', {
        email: resetEmail,
        code: resetCode,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      if (response.status === 200) {
        // Contraseña restablecida exitosamente, mostrar modal de éxito
        setVerificationStep("resetSuccess");
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        
        if (responseData.errors) {
          const backendErrors = responseData.errors;
          const errorMessage = backendErrors.code 
            ? (Array.isArray(backendErrors.code) ? backendErrors.code[0] : backendErrors.code)
            : backendErrors.email 
            ? (Array.isArray(backendErrors.email) ? backendErrors.email[0] : backendErrors.email)
            : backendErrors.general
            ? (Array.isArray(backendErrors.general) ? backendErrors.general[0] : backendErrors.general)
            : responseData.message || "Error al restablecer la contraseña";
          setResetError(errorMessage);
        } else {
          setResetError(responseData.message || "Error al restablecer la contraseña. Verifica los datos e intenta nuevamente.");
        }
      } else {
        setResetError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancelResetPassword = () => {
    setResetEmail(""); 
    setResetUserId(null);
    setResetMethod("email");
    setResetCode("");
    setNewPassword(""); 
    setConfirmPassword(""); 
    setResetError(""); 
    setVerificationStep("login");
  };
  const handleResetSuccessContinue = () => { handleCancelResetPassword(); };

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
                <Button 
                  className="btn-primary btn-pill" 
                  onClick={handleAccept}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
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
        {/* Paso 1: Solicitar email para restablecer contraseña */}
        <Dialog
          open={verificationStep === "resetPassword"}
          onOpenChange={(open) => !open && handleCancelResetPassword()}
        >
          <DialogContent className="p-0 overflow-hidden" style={{ maxWidth: "520px" }}>
            <DialogClose data-slot="dialog-close" aria-label="Cerrar">
              <span aria-hidden="true"></span>
              <span className="sr-only">Cerrar</span>
            </DialogClose>

            <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
              <CardContent className="p-8" style={{ padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  {/* Badge/ícono */}
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
                    <KeyRound className="h-8 w-8 text-white" strokeWidth={2.5} />
                  </div>

                  {/* Título y descripción */}
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
                      Restablecer Contraseña
                    </h3>
                    <p style={{ 
                      display: "block", 
                      fontSize: 15, 
                      color: "#64748b", 
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      Ingresa tu correo electrónico para continuar
                    </p>
                  </div>

                  {/* Error */}
                  {resetError && (
                    <Alert variant="destructive" style={{ width: "100%", borderRadius: "12px" }}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Campo de email */}
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                    <Label htmlFor="reset-email" style={{
                      color: "#0b1324", 
                      fontWeight: 600,
                      fontSize: 14
                    }}>
                      Correo Electrónico
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="tu@correo.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isSubmitting}
                      style={{
                        borderRadius: "12px",
                        padding: "12px 16px",
                        border: "2px solid #e2e8f0",
                        fontSize: 15,
                        transition: "all 0.2s ease"
                      }}
                    />
                  </div>

                  {/* Botones */}
                  <div style={{ width: "100%", display: "flex", gap: 12, marginTop: 8 }}>
                    <Button 
                      className="btn-primary btn-pill" 
                      style={{ 
                        flex: 1,
                        borderRadius: "12px",
                        padding: "14px 24px",
                        fontWeight: 600,
                        fontSize: 15
                      }} 
                      onClick={handleInitiatePasswordReset}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando códigos..." : "Enviar Códigos"}
                    </Button>
                    <Button 
                      className="btn-pill" 
                      style={{ 
                        flex: 1,
                        borderRadius: "12px",
                        padding: "14px 24px",
                        fontWeight: 600,
                        fontSize: 15,
                        background: "#f8fafc",
                        color: "#64748b",
                        border: "2px solid #e2e8f0"
                      }} 
                      onClick={handleCancelResetPassword}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>

        {/* Modal de selección de método para restablecimiento */}
        {verificationStep === "resetSelectMethod" && (
          <VerificationMethodModal
            onSelectEmail={handleSelectResetEmail}
            onSelectPhone={handleSelectResetPhone}
            onClose={handleCancelResetPassword}
          />
        )}

        {/* Paso 2: Ingresar código y nueva contraseña */}
        <Dialog
          open={verificationStep === "resetEnterCode"}
          onOpenChange={(open) => !open && handleCancelResetPassword()}
        >
          <DialogContent className="p-0 overflow-hidden" style={{ maxWidth: "520px" }}>
            <DialogClose data-slot="dialog-close" aria-label="Cerrar">
              <span aria-hidden="true"></span>
              <span className="sr-only">Cerrar</span>
            </DialogClose>

            <Card style={{ border: "none", boxShadow: "none", padding: 0 }}>
              <CardContent className="p-8" style={{ padding: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  {/* Badge/ícono */}
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

                  {/* Título y descripción */}
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
                      Verificar y Restablecer
                    </h3>
                    <p style={{ 
                      display: "block", 
                      fontSize: 15, 
                      color: "#64748b", 
                      margin: 0,
                      lineHeight: 1.5
                    }}>
                      Ingresa el código recibido por {resetMethod === "email" ? "email" : "SMS"} y tu nueva contraseña
                    </p>
                  </div>

                  {/* Error */}
                  {resetError && (
                    <Alert variant="destructive" style={{ width: "100%", borderRadius: "12px" }}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{resetError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Campos */}
                  <div style={{ width: "100%", display: "grid", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Label htmlFor="reset-code" style={{
                        color: "#0b1324", 
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        Código de Verificación (6 dígitos)
                      </Label>
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="000000"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        disabled={isSubmitting}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          border: "2px solid #e2e8f0",
                          fontSize: 15,
                          textAlign: "center",
                          letterSpacing: "0.1em",
                          fontFamily: "monospace",
                          transition: "all 0.2s ease"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Label htmlFor="new-password" style={{
                        color: "#0b1324", 
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        Nueva contraseña
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          border: "2px solid #e2e8f0",
                          fontSize: 15,
                          transition: "all 0.2s ease"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <Label htmlFor="confirm-password" style={{
                        color: "#0b1324", 
                        fontWeight: 600,
                        fontSize: 14
                      }}>
                        Confirmar contraseña
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirma tu nueva contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          borderRadius: "12px",
                          padding: "12px 16px",
                          border: "2px solid #e2e8f0",
                          fontSize: 15,
                          transition: "all 0.2s ease"
                        }}
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div style={{ width: "100%", display: "flex", gap: 12, marginTop: 8 }}>
                    <Button 
                      className="btn-primary btn-pill" 
                      style={{ 
                        flex: 1,
                        borderRadius: "12px",
                        padding: "14px 24px",
                        fontWeight: 600,
                        fontSize: 15
                      }} 
                      onClick={handleAcceptResetPassword}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Procesando..." : "Restablecer"}
                    </Button>
                    <Button 
                      className="btn-pill" 
                      style={{ 
                        flex: 1,
                        borderRadius: "12px",
                        padding: "14px 24px",
                        fontWeight: 600,
                        fontSize: 15,
                        background: "#f8fafc",
                        color: "#64748b",
                        border: "2px solid #e2e8f0"
                      }} 
                      onClick={handleCancelResetPassword}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
            onResendCode={handleResendCode}
            error={error}
            onCodeCleared={() => {
              // Callback para limpiar el código cuando hay error
              // El modal ya maneja esto internamente
            }}
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
