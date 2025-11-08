import React, { useState } from "react";
import imgRectangle13 from "../assets/logo-principal.jpg";
import { ActivationLinkModal } from "./ActivationLinkModal";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

/* Íconos inline */
const Icon = {
  ArrowLeft: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M12 19l-7-7 7-7" /><path d="M5 12h14" /></svg>),
  Eye: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>),
  EyeOff: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.73 21.73 0 0 1 5.06-6.94" /><path d="M23 1 1 23" /><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" /></svg>),
  User: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.38 8.38 0 0 1 13 0" /></svg>),
  Building: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h2M7 11h2M7 15h2M11 7h2M11 11h2M11 15h2M15 7h2M15 11h2M15 15h2M12 21v-4" /></svg>),
  File: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>),
  Hash: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M5 9h14M5 15h14M11 4L9 20M15 4l-2 16" /></svg>),
  Briefcase: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>),
  Globe: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>),
  Users: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><circle cx="9" cy="7" r="4" /><path d="M17 11a4 4 0 1 0-4-4" /><path d="M2 21a7 7 0 0 1 14 0" /><path d="M17 21a6 6 0 0 0-7-5" /></svg>),
  Mail: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>),
  Phone: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.77.6 2.61a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.47-1.06a2 2 0 0 1 2.11-.45c.84.28 1.71.48 2.61.6A2 2 0 0 1 22 16.92z" /></svg>),
  Lock: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>),
  Shield: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...p}><path d="M12 2l8 3v6c0 5-4 9-8 11C8 20 4 16 4 11V5z" /></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5" {...p}><polyline points="20 6 9 17 4 12" /></svg>),
};

/* ===== Estilos: card blanca + texto oscuro ===== */
const styles = `
:root{
  --brand:#1f3d93;
  --brand-2:#2c4fb5;
  --ink:#0b1324;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page-header{background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:10px 20px;height:64px}
.page-header__logo img{height:44px;width:auto;object-fit:contain}

.page-wrap{min-height:calc(100vh - 64px);background:linear-gradient(180deg, #213e90 0%, #1a2e74 100%);display:flex;justify-content:center;align-items:flex-start;padding:24px 16px 40px}

/* Card blanca */
.form-card{width:100%;max-width:720px;border-radius:22px;background:#ffffff;color:#0f172a;box-shadow:var(--shadow);border:1px solid #e5e7eb}
.card-header{padding:18px 22px;border-top-left-radius:22px;border-top-right-radius:22px;background:#ffffff}
.card-title{margin:0;color:#0b1324;font-size:22px}
.card-description{margin:6px 0 0;color:#334155;font-size:14px}
.card-content{padding:18px 22px 22px}

/* Secciones y labels oscuros */
.section-title{color:#0b1324;margin:0 0 8px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:6px}
label{color:#0b1324;font-weight:600;margin-bottom:6px;display:block}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media (max-width:780px){.form-row{grid-template-columns:1fr}}
.input-like,[data-slot="select-trigger"]{background:#fff;color:var(--ink);border-radius:999px;height:38px;padding:8px 14px;border:1px solid #cbd5e1}

/* Dropdown legible y con check en hover/selección */
[data-slot="select-content"]{background:#fff;color:#0b1324;border:1px solid #e5e7eb;border-radius:12px;box-shadow:var(--shadow);padding:6px}
[data-slot="select-item"]{color:#0b1324;padding:8px 34px 8px 12px;border-radius:8px;cursor:pointer;position:relative}
[data-slot="select-item"]:hover{background:#eef2ff}
[data-slot="select-item"]::after{content:"";position:absolute;right:10px;top:50%;transform:translateY(-50%);opacity:0;transition:opacity .15s}
[data-slot="select-item"]:hover::after{content:"✓";opacity:1;font-weight:700}
[data-slot="select-item"][data-state="checked"]::after{content:"✓";opacity:1}

/* Aviso y errores */
.alert{background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;border-radius:12px;padding:10px 12px}
.text-error{color:#b91c1c;font-size:12px}

/* Botones */
.btn-pill{border:none;border-radius:999px;padding:10px 24px;font-weight:700;cursor:pointer;box-shadow:0 6px 18px rgba(15,23,42,.12)}
.btn-primary{background:linear-gradient(90deg,#4d82bc,#5a8fc9);color:#fff}
.btn-secondary{background:#f1f5f9;color:#173b8f;border:1px solid #c7d2fe}

/* Checkbox cuadrado visible */
.chkbox{appearance:none;-webkit-appearance:none;-moz-appearance:none;width:18px;height:18px;border:2px solid var(--brand);border-radius:4px;display:inline-block;position:relative;background:#fff}
.chkbox:checked{background:var(--brand);border-color:var(--brand)}
.chkbox:checked::after{content:"";position:absolute;left:4px;top:1px;width:5px;height:10px;border:2px solid #fff;border-top:0;border-left:0;transform:rotate(45deg)}

/* Policies */
.policies{display:flex;gap:12px;align-items:flex-start;background:#f8fafc;border:1px solid #e2e8f0;color:#0f172a;border-radius:12px;padding:12px 14px}
.policies small{display:block;color:#334155}

/* Acciones */
.actions{display:flex;flex-direction:column;gap:10px;align-items:center}
.actions .full{width:100%;max-width:360px}

/* Overlay y panel del Dialog */
[data-slot="dialog-overlay"]{
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(2, 6, 23, .55);
  backdrop-filter: blur(2px);
}

[data-slot="dialog-content"]{
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
  width: 100%;
  max-width: 560px;
  background: #fff;
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 22px;
}

/* Botón de cierre si tu <Dialog> lo renderiza */
[data-slot="dialog-close"]{
  position: absolute;
  right: 12px;
  top: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: .7;
}
[data-slot="dialog-close"]:hover{ opacity: 1 }

/* Clase accesible para ocultar “Close” */
.sr-only{
  position:absolute;width:1px;height:1px;padding:0;margin:-1px;
  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
`;

export function RegisterPage({ onBack, onLoginRedirect }) {
  const [showActivation, setShowActivation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  const [formData, setFormData] = useState({
    usuario: "",
    empresa: "",
    nit: "",
    tipoDocumento: "",
    numeroDocumento: "",
    sector: "",
    pais: "",
    tamanoOrganizacional: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    aceptaPoliticas: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (notice) setNotice("");
  };

  const validateForm = () => {
    const e = {};
    if (!formData.usuario.trim()) e.usuario = "El usuario es requerido";
    if (!formData.empresa.trim()) e.empresa = "La empresa es requerida";
    if (!formData.nit.trim()) e.nit = "El NIT es requerido";
    else if (!/^\d{7,15}$/.test(formData.nit.replace(/\D/g, ""))) e.nit = "Ingrese un NIT válido";
    if (!formData.tipoDocumento) e.tipoDocumento = "Seleccione un tipo de documento";
    if (!formData.numeroDocumento.trim()) e.numeroDocumento = "El número de documento es requerido";
    if (!formData.sector) e.sector = "Seleccione un sector";
    if (!formData.pais) e.pais = "Seleccione un país";
    if (!formData.tamanoOrganizacional) e.tamanoOrganizacional = "Seleccione el tamaño organizacional";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) e.correo = "El correo es requerido";
    else if (!emailRe.test(formData.correo)) e.correo = "Ingrese un correo válido";
    if (!formData.telefono.trim()) e.telefono = "El teléfono es requerido";
    else if (formData.telefono.replace(/\D/g, "").length < 10) e.telefono = "Ingrese un teléfono válido";
    if (!formData.contrasena) e.contrasena = "La contraseña es requerida";
    else if (formData.contrasena.length < 8) e.contrasena = "La contraseña debe tener al menos 8 caracteres";
    if (!formData.confirmarContrasena) e.confirmarContrasena = "Confirme su contraseña";
    else if (formData.contrasena !== formData.confirmarContrasena) e.confirmarContrasena = "Las contraseñas no coinciden";
    if (!formData.aceptaPoliticas) e.aceptaPoliticas = "Debe aceptar las políticas de protección de datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) { setNotice("Por favor corrija los errores en el formulario."); return; }
    setIsSubmitting(true); setNotice("");
    try { await new Promise((r) => setTimeout(r, 400)); setShowActivation(true); }
    catch { setNotice("Error al crear la cuenta. Intente nuevamente."); }
    finally { setIsSubmitting(false); }
  };

  const handleAcceptActivation = () => { setShowActivation(false); setShowSuccess(true); };

  
  return (
    <div>
      <style>{styles}</style>

      {/* Header con SOLO logo y volver */}
      <header className="page-header">
        <div className="page-header__logo"><img src={imgRectangle13} alt="Logo" /></div>
        <button className="btn-pill btn-secondary" onClick={onBack}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon.ArrowLeft /> Volver
          </span>
        </button>
      </header>

      <main className="page-wrap">
        <Card className="form-card">
          <CardHeader className="card-header">
            <CardTitle className="card-title">Formulario de registro</CardTitle>
            <CardDescription className="card-description">
              Por favor complete todos los campos para crear su cuenta.
            </CardDescription>
          </CardHeader>

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
              onContinue={onLoginRedirect}
            />
            )}

          <CardContent className="card-content">
            {notice ? <div role="alert" className="alert">{notice}</div> : null}

            {/* Información Personal / Empresa */}
            <section style={{ marginTop: 12 }}>
              <h3 className="section-title">Información Personal</h3>
              <div className="form-row">
                <div>
                  <Label htmlFor="usuario">Usuario *</Label>
                  <Input id="usuario" value={formData.usuario}
                    onChange={(e)=>handleInputChange("usuario",e.target.value)}
                    className="input-like" aria-invalid={!!errors.usuario} placeholder="Ingrese su usuario" />
                  {errors.usuario && <p className="text-error">{errors.usuario}</p>}
                </div>
                <div>
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input id="empresa" value={formData.empresa}
                    onChange={(e)=>handleInputChange("empresa",e.target.value)}
                    className="input-like" aria-invalid={!!errors.empresa} placeholder="Nombre de su empresa" />
                  {errors.empresa && <p className="text-error">{errors.empresa}</p>}
                </div>
              </div>
              <div className="form-row" style={{ marginTop: 12 }}>
                <div>
                  <Label htmlFor="nit">NIT *</Label>
                  <Input id="nit" value={formData.nit}
                    onChange={(e)=>handleInputChange("nit",e.target.value)}
                    className="input-like" aria-invalid={!!errors.nit} placeholder="Ej. 900123456" />
                  {errors.nit && <p className="text-error">{errors.nit}</p>}
                </div>
                <div />
              </div>
            </section>

            {/* Documentación */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Documentación</h3>
              <div className="form-row">
                <div>
                  <Label htmlFor="tipoDocumento">Tipo de Documento *</Label>
                  <Select value={formData.tipoDocumento} onValueChange={(v)=>handleInputChange("tipoDocumento",v)}>
                    <SelectTrigger className="input-like" aria-invalid={!!errors.tipoDocumento}>
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
                <div>
                  <Label htmlFor="numeroDocumento">Número de Documento *</Label>
                  <Input id="numeroDocumento" value={formData.numeroDocumento}
                    onChange={(e)=>handleInputChange("numeroDocumento",e.target.value)}
                    className="input-like" aria-invalid={!!errors.numeroDocumento} placeholder="Número de documento" />
                  {errors.numeroDocumento && <p className="text-error">{errors.numeroDocumento}</p>}
                </div>
              </div>
            </section>

            {/* Organización */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Información Organizacional</h3>
              <div className="form-row">
                <div>
                  <Label htmlFor="sector">Sector *</Label>
                  <Select value={formData.sector} onValueChange={(v)=>handleInputChange("sector",v)}>
                    <SelectTrigger className="input-like" aria-invalid={!!errors.sector}>
                      <SelectValue placeholder="Seleccione sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tecnología">Tecnología</SelectItem>
                      <SelectItem value="Financiero">Financiero</SelectItem>
                      <SelectItem value="Salud">Salud</SelectItem>
                      <SelectItem value="Educación">Educación</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Manufactura">Manufactura</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.sector && <p className="text-error">{errors.sector}</p>}
                </div>
                <div>
                  <Label htmlFor="pais">País *</Label>
                  <Select value={formData.pais} onValueChange={(v)=>handleInputChange("pais",v)}>
                    <SelectTrigger className="input-like" aria-invalid={!!errors.pais}>
                      <SelectValue placeholder="Seleccione país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="México">México</SelectItem>
                      <SelectItem value="España">España</SelectItem>
                      <SelectItem value="Argentina">Argentina</SelectItem>
                      <SelectItem value="Chile">Chile</SelectItem>
                      <SelectItem value="Perú">Perú</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.pais && <p className="text-error">{errors.pais}</p>}
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <Label htmlFor="tamanoOrganizacional">Tamaño Organizacional *</Label>
                <Select value={formData.tamanoOrganizacional} onValueChange={(v)=>handleInputChange("tamanoOrganizacional",v)}>
                  <SelectTrigger className="input-like" aria-invalid={!!errors.tamanoOrganizacional}>
                    <SelectValue placeholder="Seleccione tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeña (1-50 empleados)">Pequeña (1-50 empleados)</SelectItem>
                    <SelectItem value="Mediana (51-250 empleados)">Mediana (51-250 empleados)</SelectItem>
                    <SelectItem value="Grande (251+ empleados)">Grande (251+ empleados)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tamanoOrganizacional && <p className="text-error">{errors.tamanoOrganizacional}</p>}
              </div>
            </section>

            {/* Contacto */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Información de Contacto</h3>
              <div className="form-row">
                <div>
                  <Label htmlFor="correo">Correo Electrónico *</Label>
                  <Input id="correo" type="email" value={formData.correo}
                    onChange={(e)=>handleInputChange("correo",e.target.value)}
                    className="input-like" aria-invalid={!!errors.correo} placeholder="correo@ejemplo.com" />
                  {errors.correo && <p className="text-error">{errors.correo}</p>}
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono *</Label>
                  <Input id="telefono" type="tel" value={formData.telefono}
                    onChange={(e)=>handleInputChange("telefono",e.target.value)}
                    className="input-like" aria-invalid={!!errors.telefono} placeholder="+57 300 000 0000" />
                  {errors.telefono && <p className="text-error">{errors.telefono}</p>}
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section style={{ marginTop: 16 }}>
              <h3 className="section-title">Seguridad</h3>
              <div className="form-row">
                <div>
                  <Label htmlFor="contrasena">Contraseña *</Label>
                  <div style={{ position: "relative" }}>
                    <Input id="contrasena" type={showPassword ? "text" : "password"} value={formData.contrasena}
                      onChange={(e)=>handleInputChange("contrasena",e.target.value)}
                      className="input-like" aria-invalid={!!errors.contrasena} placeholder="Mínimo 8 caracteres" />
                    <button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={()=>setShowPassword((v)=>!v)}
                      style={{ position:"absolute", right:10, top:8, background:"transparent", border:0, cursor:"pointer", opacity:.7 }}>
                      {showPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                    </button>
                  </div>
                  {errors.contrasena && <p className="text-error">{errors.contrasena}</p>}
                </div>
                <div>
                  <Label htmlFor="confirmarContrasena">Confirmar Contraseña *</Label>
                  <div style={{ position: "relative" }}>
                    <Input id="confirmarContrasena" type={showConfirmPassword ? "text" : "password"} value={formData.confirmarContrasena}
                      onChange={(e)=>handleInputChange("confirmarContrasena",e.target.value)}
                      className="input-like" aria-invalid={!!errors.confirmarContrasena} placeholder="Repita su contraseña" />
                    <button type="button" aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                      onClick={()=>setShowConfirmPassword((v)=>!v)}
                      style={{ position:"absolute", right:10, top:8, background:"transparent", border:0, cursor:"pointer", opacity:.7 }}>
                      {showConfirmPassword ? <Icon.EyeOff /> : <Icon.Eye />}
                    </button>
                  </div>
                  {formData.confirmarContrasena && formData.contrasena === formData.confirmarContrasena && (
                    <p style={{ color:"#15803d", display:"flex", gap:6, alignItems:"center", fontSize:12 }}>
                      <Icon.Check /> Las contraseñas coinciden
                    </p>
                  )}
                  {errors.confirmarContrasena && <p className="text-error">{errors.confirmarContrasena}</p>}
                </div>
              </div>
            </section>

            {/* Políticas */}
            <section style={{ marginTop: 16 }}>
              <div className="policies">
                <input
                  id="aceptaPoliticas"
                  type="checkbox"
                  className="chkbox"
                  checked={formData.aceptaPoliticas}
                  onChange={(e)=>handleInputChange("aceptaPoliticas", e.target.checked)}
                  aria-invalid={!!errors.aceptaPoliticas}
                />
                <div>
                  <Label htmlFor="aceptaPoliticas" style={{ cursor:"pointer", fontWeight:700 }}>
                    <span style={{ display:"inline-flex", gap:8, alignItems:"center" }}>
                      <Icon.Shield /> Acepto las Políticas de Protección de Datos *
                    </span>
                  </Label>
                  <small>Al marcar esta casilla, acepto que mis datos sean procesados según la política de privacidad.</small>
                  {errors.aceptaPoliticas && <p className="text-error" style={{ marginTop:6 }}>{errors.aceptaPoliticas}</p>}
                </div>
              </div>
            </section>

            {/* Acciones */}
            <div className="actions" style={{ marginTop: 18 }}>
              <button className="btn-pill btn-primary full" onClick={handleCreateAccount} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
              <button className="btn-pill btn-secondary full" onClick={onLoginRedirect}>
                Inicia sesión aquí
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
