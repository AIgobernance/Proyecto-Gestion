import React, { useState } from "react";
import imgRectangle13 from "../assets/logo-principal.jpg";
import { Input } from "../ui/input";
import { UserCreatedSuccessModal } from "./UserCreatedSuccessModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

/* Íconos SVG inline */
const Icon = {
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <path d="M12 19l-7-7 7-7" /><path d="M5 12h14" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2" {...p}>
      <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
};

const styles = `
:root{
  --brand:#1f3d93; --ink:#0b1324;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{background:#e8f0f8;min-height:100vh;display:flex;flex-direction:column}
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:64px;display:flex;align-items:center;justify-content:space-between;padding:10px 20px}
.header img{height:44px;width:auto;object-fit:contain}
.btn-pill{border:none;border-radius:999px;padding:10px 24px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.12);background:#eff3ff;color:#173b8f}
.main{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px 40px;background:linear-gradient(180deg, #213e90 0%, #1a2e74 100%)}
.card{width:100%;max-width:640px;border-radius:22px;background:#fff;color:#0f172a;box-shadow:var(--shadow);border:1px solid #e5e7eb}
.card-h{padding:18px 22px;border-top-left-radius:22px;border-top-right-radius:22px;background:#fff}
.card-title{margin:0;font-size:22px;color:#0b1324}
.card-desc{margin:6px 0 0;color:#334155;font-size:14px}
.card-c{padding:18px 22px 22px}
.section-title{color:#0b1324;margin:0 0 8px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
label{color:#0b1324;font-weight:600;margin-bottom:6px;display:block}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media (max-width:780px){.grid2{grid-template-columns:1fr}}
.input-like,[data-slot="select-trigger"]{background:#fff;color:var(--ink);border-radius:999px;height:38px;padding:8px 14px;border:1px solid #cbd5e1;width:100%}

/* Dropdown IGUAL al de usuario */
[data-slot="select-content"]{background:#fff;color:#0b1324;border:1px solid #e5e7eb;border-radius:12px;box-shadow:var(--shadow);padding:6px}
[data-slot="select-item"]{color:#0b1324;padding:8px 34px 8px 12px;border-radius:8px;cursor:pointer;position:relative}
[data-slot="select-item"]:hover{background:#eef2ff}
[data-slot="select-item"]::after{content:"";position:absolute;right:10px;top:50%;transform:translateY(-50%);opacity:0;transition:opacity .15s}
[data-slot="select-item"]:hover::after{content:"✓";opacity:1;font-weight:700}
[data-slot="select-item"][data-state="checked"]::after{content:"✓";opacity:1}

.alert{background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;border-radius:12px;padding:10px 12px;margin-bottom:8px}
.text-error{color:#b91c1c;font-size:12px}
.actions{display:flex;flex-direction:column;gap:10px;align-items:center;margin-top:18px}
.actions .full{width:100%;max-width:360px}
.btn-primary{background:linear-gradient(90deg,#4d82bc,#5a8fc9);color:#fff}
.chkbox{appearance:none;-webkit-appearance:none;-moz-appearance:none;width:18px;height:18px;border:2px solid var(--brand);border-radius:4px;display:inline-block;position:relative;background:#fff;vertical-align:middle}
.chkbox:checked{background:var(--brand);border-color:var(--brand)}
.chkbox:checked::after{content:"";position:absolute;left:4px;top:1px;width:5px;height:10px;border:2px solid #fff;border-top:0;border-left:0;transform:rotate(45deg)}
.policies{display:flex;gap:12px;align-items:flex-start;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;border-radius:12px;padding:12px 14px}
`;

export function AdminRegisterPage({ onBack, onLoginRedirect }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState({});

  // SOLO datos del administrador
  const [formData, setFormData] = useState({
    usuario: "",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    aceptaPoliticas: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
    if (notice) setNotice("");
  };

  const validate = () => {
    const e = {};
    if (!formData.usuario.trim()) e.usuario = "El usuario es requerido";
    if (!formData.tipoDocumento) e.tipoDocumento = "Seleccione un tipo de documento";
    if (!formData.numeroDocumento.trim()) e.numeroDocumento = "El número de documento es requerido";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) e.correo = "El correo es requerido";
    else if (!emailRe.test(formData.correo)) e.correo = "Ingrese un correo válido";
    if (!formData.telefono.trim()) e.telefono = "El teléfono es requerido";
    else if (formData.telefono.replace(/\D/g, "").length < 10) e.telefono = "Ingrese un teléfono válido";
    if (!formData.contrasena) e.contrasena = "La contraseña es requerida";
    else if (formData.contrasena.length < 8) e.contrasena = "Mínimo 8 caracteres";
    if (!formData.confirmarContrasena) e.confirmarContrasena = "Confirme su contraseña";
    else if (formData.contrasena !== formData.confirmarContrasena) e.confirmarContrasena = "Las contraseñas no coinciden";
    if (!formData.aceptaPoliticas) e.aceptaPoliticas = "Debe aceptar las políticas de protección de datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validate()) { setNotice("Por favor corrija los errores en el formulario."); return; }
    setIsSubmitting(true);
    try { await new Promise((r) => setTimeout(r, 400)); setShowSuccess(true); }
    finally { setIsSubmitting(false); }
  };

  const handleContinueFromSuccess = () => {
    setShowSuccess(false);
    if (onLoginRedirect) onLoginRedirect();
  };

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header: solo logo + volver */}
      <div className="header">
        <img src={imgRectangle13} alt="Logo" />
        <button className="btn-pill" onClick={onBack}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon.ArrowLeft /> Volver
          </span>
        </button>
      </div>

      {/* Contenido */}
      <div className="main">
        <div className="card">
          <div className="card-h">
            <h1 className="card-title">Registro de Administrador</h1>
            <p className="card-desc">Complete los datos básicos del administrador.</p>
          </div>

          <div className="card-c">
            {notice && <div className="alert" role="alert">{notice}</div>}

            {/* Cuenta */}
            <h3 className="section-title">Información de la cuenta</h3>
            <div className="grid2">
              <div>
                <label htmlFor="usuario">Usuario *</label>
                <Input id="usuario" className="input-like" value={formData.usuario}
                  onChange={(e)=>handleInputChange("usuario", e.target.value)} placeholder="Ingrese usuario" />
                {errors.usuario && <p className="text-error">{errors.usuario}</p>}
              </div>
              <div>
                <label htmlFor="tipoDocumento">Tipo de documento *</label>
                {/* === Select igual al del usuario === */}
                <Select value={formData.tipoDocumento} onValueChange={(v)=>handleInputChange("tipoDocumento", v)}>
                  <SelectTrigger className="input-like" id="tipoDocumento" aria-invalid={!!errors.tipoDocumento}>
                    <SelectValue placeholder="Seleccione tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipoDocumento && <p className="text-error">{errors.tipoDocumento}</p>}
              </div>
            </div>

            <div className="grid2" style={{ marginTop: 12 }}>
              <div>
                <label htmlFor="numeroDocumento">Número de documento *</label>
                <Input id="numeroDocumento" className="input-like" value={formData.numeroDocumento}
                  onChange={(e)=>handleInputChange("numeroDocumento", e.target.value)} placeholder="Número" />
                {errors.numeroDocumento && <p className="text-error">{errors.numeroDocumento}</p>}
              </div>
              <div />
            </div>

            {/* Contacto */}
            <h3 className="section-title" style={{ marginTop: 16 }}>Contacto</h3>
            <div className="grid2">
              <div>
                <label htmlFor="correo">Correo *</label>
                <Input id="correo" type="email" className="input-like" value={formData.correo}
                  onChange={(e)=>handleInputChange("correo", e.target.value)} placeholder="correo@ejemplo.com" />
                {errors.correo && <p className="text-error">{errors.correo}</p>}
              </div>
              <div>
                <label htmlFor="telefono">Teléfono *</label>
                <Input id="telefono" type="tel" className="input-like" value={formData.telefono}
                  onChange={(e)=>handleInputChange("telefono", e.target.value)} placeholder="+57 300 000 0000" />
                {errors.telefono && <p className="text-error">{errors.telefono}</p>}
              </div>
            </div>

            {/* Seguridad */}
            <h3 className="section-title" style={{ marginTop: 16 }}>Seguridad</h3>
            <div className="grid2">
              <div>
                <label htmlFor="contrasena">Crear contraseña *</label>
                <Input id="contrasena" type="password" className="input-like" value={formData.contrasena}
                  onChange={(e)=>handleInputChange("contrasena", e.target.value)} placeholder="Contraseña (mín. 8)" />
                {errors.contrasena && <p className="text-error">{errors.contrasena}</p>}
              </div>
              <div>
                <label htmlFor="confirmarContrasena">Confirmar contraseña *</label>
                <Input id="confirmarContrasena" type="password" className="input-like" value={formData.confirmarContrasena}
                  onChange={(e)=>handleInputChange("confirmarContrasena", e.target.value)} placeholder="Confirmar" />
                {errors.confirmarContrasena && <p className="text-error">{errors.confirmarContrasena}</p>}
              </div>
            </div>

            {/* Políticas */}
            <div className="policies" style={{ marginTop: 16 }}>
              <input
                id="politicas-admin"
                type="checkbox"
                className="chkbox"
                checked={formData.aceptaPoliticas}
                onChange={(e)=>handleInputChange("aceptaPoliticas", e.target.checked)}
              />
              <div>
                <label htmlFor="politicas-admin" style={{ cursor:"pointer", fontWeight:700 }}>
                  Acepto las Políticas de Protección de Datos *
                </label>
                <small>Al marcar esta casilla, acepto que mis datos sean procesados según la política de privacidad.</small>
                {errors.aceptaPoliticas && <p className="text-error" style={{ marginTop:6 }}>{errors.aceptaPoliticas}</p>}
              </div>
            </div>

            {/* Acciones */}
            <div className="actions">
              <button className="btn-primary btn-pill full" onClick={handleCreateAccount} disabled={isSubmitting} aria-busy={isSubmitting}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
                  <Icon.CheckCircle /> {isSubmitting ? "Creando..." : "Crear Cuenta"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <UserCreatedSuccessModal onContinue={handleContinueFromSuccess} />
      )}
    </div>
  );
}
