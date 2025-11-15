import React, { useState } from "react";
import imgRectangle13 from "../assets/logo-principal.jpg";

import { ActivationLinkModal } from "./ActivationLinkModal";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

/* Íconos inline */
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <path d="M12 19l-7-7 7-7" /><path d="M5 12h14" />
    </svg>
  ),
  Eye: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.73 21.73 0 0 1 5.06-6.94" />
      <path d="M23 1 1 23" />
      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" {...p}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <path d="M12 2l8 3v6c0 5-4 9-8 11C8 20 4 16 4 11V5z" />
    </svg>
  ),
};

/* ==========================
   ESTILOS (alineados con RegisterPage)
   ========================== */
const styles = `
:root{
  --brand:#1f3d93;
  --ink:#0b1324;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}

.page-header{
  background:#fff;
  border-bottom:1px solid #e5e7eb;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:10px 20px;
  height:64px;
}
.page-header__logo img{
  height:44px;
  width:auto;
  object-fit:contain;
}

.page-wrap{
  min-height:calc(100vh - 64px);
  background:linear-gradient(180deg,#213e90 0%, #1a2e74 100%);
  display:flex;
  justify-content:center;
  align-items:flex-start;
  padding:24px 16px 40px;
}

/* CARD */
.form-card{
  width:100%;
  max-width:640px;
  border-radius:22px;
  background:#ffffff;
  color:#0f172a;
  box-shadow:var(--shadow);
  border:1px solid #e5e7eb;
}
.card-header{ padding:18px 22px; }
.card-title{ margin:0; font-size:22px; color:#0b1324; }
.card-description{ margin:6px 0 0; color:#334155; font-size:14px; }
.card-content{ padding:18px 22px 22px; }

.section-title{
  color:#0b1324;
  margin:0 0 8px;
  font-weight:700;
  border-bottom:1px solid #e5e7eb;
  padding-bottom:6px;
}
label{
  color:#0b1324;
  font-weight:600;
  margin-bottom:6px;
  display:block;
}
.form-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}
@media (max-width:780px){
  .form-row{ grid-template-columns:1fr;}
}

.input-like,
[data-slot="select-trigger"]{
  background:#fff;
  color:#000;
  border-radius:999px;
  height:38px;
  padding:8px 14px;
  border:1px solid #cbd5e1;
}

/* SELECT */
[data-slot="select-content"]{
  background:#fff !important;
  color:#000 !important;
  border-radius:12px;
  border:1px solid #e5e7e8;
  box-shadow:var(--shadow);
  padding:6px;
}

[data-slot="select-item"]{
  color:#0b1324 !important;
  padding:8px 34px 8px 12px;
  border-radius:8px;
  cursor:pointer;
}
[data-slot="select-item"]:hover{
  background:#eef2ff;
}

/* ALERTAS */
.alert{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  color:#0f172a;
  border-radius:12px;
  padding:10px 12px;
  margin-bottom:8px;
}
.text-error{
  color:#b91c1c;
  font-size:12px;
}

/* BOTONES */
.btn-pill{
  border:none;
  border-radius:999px;
  padding:10px 24px;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 6px 18px rgba(15,23,42,.12);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9);
  color:#fff;
}
.btn-secondary{
  background:#f1f5f9;
  color:#173b8f;
  border:1px solid #c7d2fe;
}

/* CHECKBOX */
.chkbox{
  appearance:none;
  position:relative;
  width:18px;
  height:18px;
  border:2px solid var(--brand);
  border-radius:4px;
  background:#fff;
}
.chkbox:checked{
  background:var(--brand);
  border-color:var(--brand);
}
.chkbox:checked::after{
  content:"";
  position:absolute;
  left:4px; top:1px;
  width:5px; height:10px;
  border:2px solid #fff;
  border-top:0; border-left:0;
  transform:rotate(45deg);
}

.policies{
  display:flex;
  gap:12px;
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:12px 14px;
}
.policies small{ color:#334155; }

/* Acciones */
.actions{
  display:flex;
  flex-direction:column;
  gap:10px;
  align-items:center;
}
.actions .full{
  width:100%;
  max-width:360px;
}

/* === Overlay y panel del Dialog (IGUAL QUE REGISTER PAGE) === */
[data-slot="dialog-overlay"]{
  position:fixed;
  inset:0;
  z-index:50;
  background:rgba(2,6,23,.55);
  backdrop-filter:blur(2px);
}

[data-slot="dialog-content"]{
  position:fixed;
  left:50%;
  top:50%;
  transform:translate(-50%,-50%);
  z-index:51;
  width:100%;
  max-width:560px;
  background:#fff;
  border-radius:22px;
  box-shadow:var(--shadow);
  padding:22px;
}

/* Botón de cierre si el diálogo lo usa */
[data-slot="dialog-close"]{
  position:absolute;
  right:12px;
  top:12px;
  border:none;
  background:transparent;
  cursor:pointer;
  opacity:.7;
}
[data-slot="dialog-close"]:hover{ opacity:1 }

/* Clase accesible para ocultar texto "Close" */
.sr-only{
  position:absolute;
  width:1px;
  height:1px;
  padding:0;
  margin:-1px;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
  border:0;
}

body, html {
  background: transparent !important;
}
`;

/* ==========================
   COMPONENTE PRINCIPAL
   ========================== */
export function AdminRegisterPage({ onBack, onLoginRedirect }) {
  const [showActivation, setShowActivation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    aceptaPoliticas: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
    if (notice) setNotice("");
  };

  const validate = () => {
    const e = {};

    if (!formData.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!formData.tipoDocumento) e.tipoDocumento = "Seleccione un tipo";
    if (!formData.numeroDocumento.trim()) e.numeroDocumento = "Número requerido";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) e.correo = "Ingrese un correo";
    else if (!emailRe.test(formData.correo)) e.correo = "Correo inválido";

    if (!formData.telefono.trim()) e.telefono = "Ingrese teléfono";
    else if (formData.telefono.replace(/\D/g, "").length < 10)
      e.telefono = "Teléfono inválido";

    if (!formData.contrasena) e.contrasena = "Ingrese contraseña";
    else if (formData.contrasena.length < 8) e.contrasena = "Mínimo 8 caracteres";

    if (!formData.confirmarContrasena)
      e.confirmarContrasena = "Confirme contraseña";
    else if (formData.contrasena !== formData.confirmarContrasena)
      e.confirmarContrasena = "No coinciden";

    if (!formData.aceptaPoliticas)
      e.aceptaPoliticas = "Debe aceptar las políticas";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) {
      setNotice("Por favor corrija los errores.");
      return;
    }

    setIsSubmitting(true);

    // Simula llamada a API
    await new Promise((r) => setTimeout(r, 500));

    setIsSubmitting(false);
    setShowActivation(true); // PRIMERO sale modal de activación
  };

  const handleAcceptActivation = () => {
    setShowActivation(false);
    setShowSuccess(true); // LUEGO modal de éxito/creación
  };

  const handleContinue = () => {
    setShowSuccess(false);
    onLoginRedirect?.();
  };

  return (
    <div>
      <style>{styles}</style>

      {/* HEADER */}
      <header className="page-header">
        <div className="page-header__logo">
          <img src={imgRectangle13} alt="Logo" />
        </div>

        <button className="btn-pill btn-secondary" onClick={onBack}>
          <Icon.ArrowLeft /> Volver
        </button>
      </header>

      {/* FORM MAIN WRAP */}
      <main className="page-wrap">
        <Card className="form-card">
          <CardHeader>
            <CardTitle>Registro de Administrador</CardTitle>
            <CardDescription>
              Complete los datos básicos del administrador.
            </CardDescription>
          </CardHeader>

          {/* Modales IGUAL que en RegisterPage */}
          {showActivation && (
            <ActivationLinkModal
              open={showActivation}
              onAccept={handleAcceptActivation}
              onBack={() => setShowActivation(false)}
            />
          )}

          {showSuccess && (
            <RegistrationSuccessModal
              open={showSuccess}
              onContinue={handleContinue}
            />
          )}

          <CardContent>
            {/* ALERTA */}
            {notice && <div className="alert">{notice}</div>}

            {/* ==========================
                INFORMACIÓN PERSONAL
               ========================== */}
            <section style={{ marginTop: 12 }}>
              <h3 className="section-title">Información Personal</h3>

              <div className="form-row">
                {/* NOMBRE */}
                <div>
                  <Label>Nombre completo *</Label>
                  <Input
                    className="input-like"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                  />
                  {errors.nombre && (
                    <p className="text-error">{errors.nombre}</p>
                  )}
                </div>

                {/* TIPO DOCUMENTO */}
                <div>
                  <Label>Tipo de documento *</Label>

                  <Select
                    value={formData.tipoDocumento}
                    onValueChange={(v) => handleInputChange("tipoDocumento", v)}
                  >
                    <SelectTrigger className="input-like">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>

                  {errors.tipoDocumento && (
                    <p className="text-error">{errors.tipoDocumento}</p>
                  )}
                </div>
              </div>

              {/* DOCUMENTO */}
              <div className="form-row" style={{ marginTop: 12 }}>
                <div>
                  <Label>Número de documento *</Label>
                  <Input
                    className="input-like"
                    value={formData.numeroDocumento}
                    onChange={(e) =>
                      handleInputChange("numeroDocumento", e.target.value)
                    }
                  />
                  {errors.numeroDocumento && (
                    <p className="text-error">{errors.numeroDocumento}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ==========================
                INFORMACIÓN DE CONTACTO
               ========================== */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Información de contacto</h3>

              <div className="form-row">
                {/* CORREO */}
                <div>
                  <Label>Correo electrónico *</Label>
                  <Input
                    type="email"
                    className="input-like"
                    value={formData.correo}
                    onChange={(e) => handleInputChange("correo", e.target.value)}
                  />
                  {errors.correo && (
                    <p className="text-error">{errors.correo}</p>
                  )}
                </div>

                {/* TELÉFONO */}
                <div>
                  <Label>Teléfono *</Label>
                  <Input
                    className="input-like"
                    value={formData.telefono}
                    onChange={(e) =>
                      handleInputChange("telefono", e.target.value)
                    }
                  />
                  {errors.telefono && (
                    <p className="text-error">{errors.telefono}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ==========================
                SEGURIDAD
               ========================== */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Seguridad</h3>

              <div className="form-row">
                {/* CONTRASEÑA */}
                <div>
                  <Label>Contraseña *</Label>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="input-like"
                      value={formData.contrasena}
                      onChange={(e) =>
                        handleInputChange("contrasena", e.target.value)
                      }
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 8,
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        opacity: 0.7,
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                    </button>
                  </div>
                  {errors.contrasena && (
                    <p className="text-error">{errors.contrasena}</p>
                  )}
                </div>

                {/* CONFIRMAR */}
                <div>
                  <Label>Confirmar contraseña *</Label>
                  <div style={{ position: "relative" }}>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      className="input-like"
                      value={formData.confirmarContrasena}
                      onChange={(e) =>
                        handleInputChange("confirmarContrasena", e.target.value)
                      }
                      placeholder="Repita su contraseña"
                    />
                    <button
                      type="button"
                      style={{
                        position: "absolute",
                        right: 10,
                        top: 8,
                        background: "transparent",
                        border: 0,
                        cursor: "pointer",
                        opacity: 0.7,
                      }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                    </button>
                  </div>

                  {formData.confirmarContrasena &&
                    formData.contrasena === formData.confirmarContrasena && (
                      <p
                        style={{
                          color: "#15803d",
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        <Icon.Check /> Las contraseñas coinciden
                      </p>
                    )}

                  {errors.confirmarContrasena && (
                    <p className="text-error">{errors.confirmarContrasena}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ==========================
                POLÍTICAS
               ========================== */}
            <section style={{ marginTop: 16 }}>
              <div className="policies">
                <input
                  id="politicas-admin"
                  type="checkbox"
                  className="chkbox"
                  checked={formData.aceptaPoliticas}
                  onChange={(e) =>
                    handleInputChange("aceptaPoliticas", e.target.checked)
                  }
                />

                <div>
                  <Label
                    htmlFor="politicas-admin"
                    style={{ cursor: "pointer", fontWeight: 700 }}
                  >
                    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                      <Icon.Shield /> Acepto las Políticas de Protección de Datos *
                    </span>
                  </Label>

                  <small>
                    Al marcar esta casilla, acepto que mis datos sean procesados
                    según la política de privacidad.
                  </small>

                  {errors.aceptaPoliticas && (
                    <p className="text-error">{errors.aceptaPoliticas}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ==========================
                BOTONES
               ========================== */}
            <div className="actions" style={{ marginTop: 22 }}>
              <button
                className="btn-pill btn-primary full"
                onClick={handleCreateAccount}
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                style={{ width: "100%", marginBottom: 10 }}
              >
                {isSubmitting ? "Creando..." : "Crear Cuenta"}
              </button>

              <button
                className="btn-pill btn-secondary full"
                onClick={onLoginRedirect}
                style={{ width: "100%" }}
              >
                Ir al inicio de sesión admin
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
