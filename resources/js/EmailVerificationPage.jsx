import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, X, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [step, setStep] = useState("info"); // 'info', 'verifying', 'success', 'error', 'already_activated'
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Si no hay token, mostrar error inmediatamente
    if (!token) {
      setStep("error");
      setErrorMessage("Token de activación no proporcionado");
      return;
    }
    
    // Si hay token, hacer la verificación automáticamente cuando se carga la página
    // Esto permite que funcione cuando se hace clic en el link del email
    const verifyEmail = async () => {
      if (loading) return;
      
      setStep("verifying");
      setLoading(true);
      setErrorMessage("");

      try {
        console.log('Iniciando verificación de email, token:', token ? token.substring(0, 30) + '...' : 'no token');
        console.log('URL completa:', `/verify-email?token=${encodeURIComponent(token)}`);
        
        const response = await axios.get(`/verify-email?token=${encodeURIComponent(token)}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        console.log('Respuesta del servidor:', response.status, response.data);

        if (response.data.already_activated) {
          setStep("already_activated");
        } else if (response.data.success) {
          setStep("success");
        } else {
          setStep("error");
          setErrorMessage(response.data.message || "Error al activar la cuenta");
        }
      } catch (error) {
        console.error('Error completo al verificar:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        setStep("error");
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response?.data?.error) {
          setErrorMessage(error.response.data.error);
        } else if (error.message) {
          setErrorMessage(`Error: ${error.message}`);
        } else {
          setErrorMessage("Error al verificar el token. Por favor, intenta nuevamente.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    verifyEmail();
  }, [token]); // Solo depende de token

  const handleContinue = async () => {
    if (!token) return;
    
    // Evitar múltiples llamadas simultáneas
    if (loading) return;

    setStep("verifying");
    setLoading(true);
    setErrorMessage("");

    try {
      console.log('Iniciando verificación de email, token:', token ? token.substring(0, 30) + '...' : 'no token');
      console.log('URL completa:', `/verify-email?token=${encodeURIComponent(token)}`);
      
      const response = await axios.get(`/verify-email?token=${encodeURIComponent(token)}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('Respuesta del servidor:', response.status, response.data);

      if (response.data.already_activated) {
        setStep("already_activated");
      } else if (response.data.success) {
        setStep("success");
      } else {
        setStep("error");
        setErrorMessage(response.data.message || "Error al activar la cuenta");
      }
    } catch (error) {
      console.error('Error completo al verificar:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      setStep("error");
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.message) {
        setErrorMessage(`Error: ${error.message}`);
      } else {
        setErrorMessage("Error al verificar el token. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  const handleClose = () => {
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .verification-overlay {
          position: fixed;
          inset: 0;
          z-index: 60;
          background: rgba(10, 15, 30, 0.55);
          backdrop-filter: blur(2.5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .verification-card {
          width: 100%;
          max-width: 520px;
          background: #fff;
          border: 1px solid #e9edf5;
          border-radius: 24px;
          box-shadow: 0 24px 64px rgba(2, 6, 23, 0.28);
          position: relative;
          overflow: hidden;
        }
        .verification-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.15s ease;
        }
        .verification-close:hover {
          background: #f7f9ff;
        }
        .verification-head {
          padding: 28px 28px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .verification-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.1);
        }
        .verification-icon.info {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #4d82bc;
        }
        .verification-icon.success {
          background: linear-gradient(135deg, #e8fff3, #f5fff9);
          color: #129c55;
        }
        .verification-icon.error {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          color: #ef4444;
        }
        .verification-icon.warning {
          background: linear-gradient(135deg, #fffbeb, #fef3c7);
          color: #f59e0b;
        }
        .verification-title {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
          text-align: center;
        }
        .verification-desc {
          margin: 0;
          font-size: 15px;
          color: #334155;
          text-align: center;
          line-height: 1.6;
        }
        .verification-body {
          padding: 16px 28px 28px;
        }
        .verification-cta {
          width: 100%;
          background: linear-gradient(90deg, #4d82bc, #5a8fc9);
          color: #fff;
          border-radius: 999px;
          padding: 12px 20px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(2, 6, 23, 0.18);
          transition: filter 0.15s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .verification-cta:hover {
          filter: brightness(1.02);
        }
        .verification-cta:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .verification-info-box {
          background: #f8f9fa;
          border-left: 4px solid #4d82bc;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
        .verification-info-item {
          margin: 8px 0;
          font-size: 14px;
          color: #334155;
        }
        .verification-info-label {
          font-weight: 600;
          color: #64748b;
        }
      `}</style>

      <div className="verification-overlay" role="dialog" aria-modal="true">
        <div className="verification-card">
          <button
            className="verification-close"
            aria-label="Cerrar"
            onClick={handleClose}
          >
            <X className="w-5 h-5" style={{ color: "#64748b" }} />
          </button>

          {/* Paso 1: Información del correo */}
          {step === "info" && (
            <>
              <div className="verification-head">
                <div className="verification-icon info">
                  <Mail className="w-9 h-9" />
                </div>
                <h3 className="verification-title">Verificación de Email</h3>
                <p className="verification-desc">
                  Has recibido un correo electrónico con un enlace de activación.
                  Haz clic en "Continuar" para verificar y activar tu cuenta.
                </p>
              </div>

              <div className="verification-body">
                <div className="verification-info-box">
                  <div className="verification-info-item">
                    <span className="verification-info-label">¿Qué sigue?</span>
                  </div>
                  <div className="verification-info-item">
                    • Verificaremos que el enlace sea válido
                  </div>
                  <div className="verification-info-item">
                    • Activaremos tu cuenta automáticamente
                  </div>
                  <div className="verification-info-item">
                    • Podrás iniciar sesión inmediatamente
                  </div>
                </div>

                <button
                  className="verification-cta"
                  onClick={handleContinue}
                  disabled={!token}
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {/* Paso 2: Verificando */}
          {step === "verifying" && (
            <>
              <div className="verification-head">
                <div className="verification-icon info">
                  <Loader2 className="w-9 h-9" style={{ animation: "spin 1s linear infinite" }} />
                </div>
                <h3 className="verification-title">Verificando...</h3>
                <p className="verification-desc">
                  Estamos validando tu token de activación. Por favor espera.
                </p>
              </div>

              <div className="verification-body">
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <Loader2
                    className="w-8 h-8"
                    style={{
                      color: "#4d82bc",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto",
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Paso 3: Éxito */}
          {step === "success" && (
            <>
              <div className="verification-head">
                <div className="verification-icon success">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="verification-title">¡Cuenta Activada!</h3>
                <p className="verification-desc">
                  Tu cuenta ha sido activada exitosamente. Ya puedes iniciar sesión
                  y comenzar a usar la plataforma.
                </p>
              </div>

              <div className="verification-body">
                <button className="verification-cta" onClick={handleGoToLogin}>
                  <CheckCircle2 className="w-5 h-5" />
                  Ir a Iniciar Sesión
                </button>
              </div>
            </>
          )}

          {/* Paso 4: Ya activado */}
          {step === "already_activated" && (
            <>
              <div className="verification-head">
                <div className="verification-icon warning">
                  <AlertCircle className="w-9 h-9" />
                </div>
                <h3 className="verification-title">Cuenta Ya Activada</h3>
                <p className="verification-desc">
                  Tu cuenta ya está activada. Puedes iniciar sesión normalmente.
                </p>
              </div>

              <div className="verification-body">
                <button className="verification-cta" onClick={handleGoToLogin}>
                  Ir a Iniciar Sesión
                </button>
              </div>
            </>
          )}

          {/* Paso 5: Error */}
          {step === "error" && (
            <>
              <div className="verification-head">
                <div className="verification-icon error">
                  <X className="w-9 h-9" />
                </div>
                <h3 className="verification-title">Error de Verificación</h3>
                <p className="verification-desc">
                  {errorMessage || "No se pudo verificar el token. El enlace puede haber expirado o ser inválido."}
                </p>
              </div>

              <div className="verification-body">
                <div className="verification-info-box" style={{ borderLeftColor: "#ef4444" }}>
                  <div className="verification-info-item">
                    <strong>Posibles causas:</strong>
                  </div>
                  <div className="verification-info-item">
                    • El enlace ha expirado (válido por 24 horas)
                  </div>
                  <div className="verification-info-item">
                    • El enlace ya fue utilizado
                  </div>
                  <div className="verification-info-item">
                    • El enlace es inválido o fue modificado
                  </div>
                </div>

                <button className="verification-cta" onClick={handleGoToLogin}>
                  Ir a Iniciar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

