import React, { useState } from "react";
import imgRectangle13 from "../assets/logo-principal.jpg";
import { ActivationLinkModal } from "./ActivationLinkModal";
import { RegistrationSuccessModal } from "./RegistrationSuccessModal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";  
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Building2,
  FileText,
  Hash,
  Briefcase,
  Globe,
  Users,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const styles = `
:root{
  --brand:#1f3d93;
  --brand-2:#2c4fb5;
  --brand-3:#3d65d4;
  --bg:#ffffff;
  --ink:#0b1324;
  --muted:#5b677a;
  --panel:#0b142b;
  --card:#ffffff;
  --ring:#cfd7e6;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}

/* Reset / layout */
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}

/* Header (alineado con estilo del homepage) */
.bg-header {
  background: linear-gradient(90deg, rgba(202,223,251,1) 0%, rgba(232,242,252,1) 100%);
  border-bottom: 1px solid rgba(238,241,246,1);
}
.bg-header .brand-img {
  background: rgba(13,44,86,0.06);
  padding: 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items:center;
}

/* Form card centrada y colores coherentes con HomePage */
.form-card {
  max-width: 720px;
  margin: 40px auto;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--brand-2) 0%, var(--brand) 100%);
  box-shadow: var(--shadow);
  border: 0;
  color: #fff;
}

/* header interno de la tarjeta (titulo) */
.form-card .card-header {
  background: transparent;
  padding: 36px 28px 28px;
  text-align: center;
}
.form-card .card-header .card-title {
  font-size: 28px;
  margin: 0 0 6px;
  color: #ffffff;
}
.form-card .card-header .card-description {
  color: rgba(255,255,255,0.9);
  font-size: 15px;
}

/* contenido de la tarjeta */
.form-card .card-content {
  background: transparent;
  padding: 28px;
  color: #fff;
}

/* labels, iconos y secciones */
.form-card label {
  color: rgba(255,255,255,0.95);
  font-weight:600;
}
.form-card h3 {
  color: rgba(255,255,255,0.95);
}

/* Inputs y selects estilo "pill" blanco para contraste */
.form-card input,
.form-card textarea,
.form-card select,
.form-card .select-trigger {
  background: #fff !important;
  color: var(--ink) !important;
  border-radius: 999px !important;
  padding: 8px 14px !important;
  height: 36px !important;
  border: 1px solid rgba(0,0,0,0.06) !important;
  box-shadow: none !important;
}

/* Ajustes específicos para componentes que usan padding adicional */
.form-card .relative .pr-10 { padding-right: 2.5rem; }

/* Iconos dentro de labels más claros */
.form-card svg { color: rgba(255,255,255,0.9); }

/* Checkbox box y info */
.form-card .bg-blue-50 { background: rgba(255,255,255,0.08); border-radius: 12px; }

/* Botón principal estilo "pill" inverso (fondo blanco) */
.form-card .create-btn {
  background: #ffffff !important;
  color: var(--brand) !important;
  border-radius: 999px !important;
  padding: 8px 22px !important;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(15,23,42,0.12);
  border: none !important;
}

/* Texto pequeño e indicaciones */
.form-card .text-gray-600, .form-card .text-[12px] {
  color: rgba(255,255,255,0.9);
}

/* Responsive */
@media (max-width: 680px) {
  .form-card { margin: 20px 16px; border-radius:20px; }
  .form-card .card-header { padding: 24px; }
  .form-card input, .form-card select { height: 40px; }
}
`;

export function RegisterPage({ onBack, onLoginRedirect }) {
  const [showActivation, setShowActivation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    usuario: "",
    empresa: "",
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar campos requeridos
    if (!formData.usuario.trim()) newErrors.usuario = "El usuario es requerido";
    if (!formData.empresa.trim()) newErrors.empresa = "La empresa es requerida";
    if (!formData.tipoDocumento) newErrors.tipoDocumento = "Seleccione un tipo de documento";
    if (!formData.numeroDocumento.trim()) newErrors.numeroDocumento = "El número de documento es requerido";
    if (!formData.sector) newErrors.sector = "Seleccione un sector";
    if (!formData.pais) newErrors.pais = "Seleccione un país";
    if (!formData.tamanoOrganizacional) newErrors.tamanoOrganizacional = "Seleccione el tamaño organizacional";

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo.trim()) {
      newErrors.correo = "El correo es requerido";
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = "Ingrese un correo válido";
    }

    // Validar teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (formData.telefono.length < 10) {
      newErrors.telefono = "Ingrese un teléfono válido";
    }

    // Validar contraseña
    if (!formData.contrasena) {
      newErrors.contrasena = "La contraseña es requerida";
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = "La contraseña debe tener al menos 8 caracteres";
    }

    // Validar confirmación de contraseña
    if (!formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Confirme su contraseña";
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      newErrors.confirmarContrasena = "Las contraseñas no coinciden";
    }

    // Validar políticas
    if (!formData.aceptaPoliticas) {
      newErrors.aceptaPoliticas = "Debe aceptar las políticas de protección de datos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, text: "Débil", color: "bg-red-500" };
    if (strength <= 3) return { strength: 66, text: "Media", color: "bg-yellow-500" };
    return { strength: 100, text: "Fuerte", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.contrasena);

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular llamada API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Enviar datos al backend
      console.log("Datos del formulario:", formData);
      toast.success("Cuenta creada exitosamente");
      setShowActivation(true);
    } catch (error) {
      toast.error("Error al crear la cuenta. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptActivation = () => {
    setShowActivation(false);
    setShowSuccess(true);
  };

  const handleBackFromActivation = () => {
    setShowActivation(false);
  };

  const handleContinueFromSuccess = () => {
    onLoginRedirect();
  };

  if (showSuccess) {
    return <RegistrationSuccessModal onContinue={handleContinueFromSuccess} />;
  }

  if (showActivation) {
    return <ActivationLinkModal onAccept={handleAcceptActivation} onBack={handleBackFromActivation} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#cadffb] via-[#e8f2fc] to-white">
      <style>{styles}</style>

      {/* Header */}
      <div className="bg-[#cadffb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <img alt="Logo" className="h-20 w-auto object-contain" src={imgRectangle13} />
            <Button variant="ghost" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="card shadow-xl form-card">
          <CardHeader className="card-header">
            <CardTitle className="text-center text-[32px]">Registro de Usuario</CardTitle>
            <CardDescription className="text-center text-white/90 text-[16px]">
              Complete el formulario para crear su cuenta
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[#4d82bc] pb-2 border-b">
                <User className="h-5 w-5" />
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Usuario *
                  </Label>
                  <Input
                    id="usuario"
                    value={formData.usuario}
                    onChange={(e) => handleInputChange("usuario", e.target.value)}
                    placeholder="Ingrese su usuario"
                    className={errors.usuario ? "border-red-500" : ""}
                  />
                  {errors.usuario && <p className="text-[12px] text-red-500">{errors.usuario}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa *
                  </Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange("empresa", e.target.value)}
                    placeholder="Nombre de su empresa"
                    className={errors.empresa ? "border-red-500" : ""}
                  />
                  {errors.empresa && <p className="text-[12px] text-red-500">{errors.empresa}</p>}
                </div>
              </div>
            </div>

            {/* Documentación */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[#4d82bc] pb-2 border-b">
                <FileText className="h-5 w-5" />
                Documentación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoDocumento" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Tipo de Documento *
                  </Label>
                  <Select value={formData.tipoDocumento} onValueChange={(value) => handleInputChange("tipoDocumento", value)}>
                    <SelectTrigger className={errors.tipoDocumento ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="NIT">NIT</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipoDocumento && <p className="text-[12px] text-red-500">{errors.tipoDocumento}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroDocumento" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Número de Documento *
                  </Label>
                  <Input
                    id="numeroDocumento"
                    value={formData.numeroDocumento}
                    onChange={(e) => handleInputChange("numeroDocumento", e.target.value)}
                    placeholder="Número de documento"
                    className={errors.numeroDocumento ? "border-red-500" : ""}
                  />
                  {errors.numeroDocumento && <p className="text-[12px] text-red-500">{errors.numeroDocumento}</p>}
                </div>
              </div>
            </div>

            {/* Información Organizacional */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[#4d82bc] pb-2 border-b">
                <Briefcase className="h-5 w-5" />
                Información Organizacional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Sector *
                  </Label>
                  <Select value={formData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
                    <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
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
                  {errors.sector && <p className="text-[12px] text-red-500">{errors.sector}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    País *
                  </Label>
                  <Select value={formData.pais} onValueChange={(value) => handleInputChange("pais", value)}>
                    <SelectTrigger className={errors.pais ? "border-red-500" : ""}>
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
                  {errors.pais && <p className="text-[12px] text-red-500">{errors.pais}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamanoOrganizacional" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tamaño Organizacional *
                </Label>
                <Select
                  value={formData.tamanoOrganizacional}
                  onValueChange={(value) => handleInputChange("tamanoOrganizacional", value)}
                >
                  <SelectTrigger className={errors.tamanoOrganizacional ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pequeña (1-50 empleados)">Pequeña (1-50 empleados)</SelectItem>
                    <SelectItem value="Mediana (51-250 empleados)">Mediana (51-250 empleados)</SelectItem>
                    <SelectItem value="Grande (251+ empleados)">Grande (251+ empleados)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tamanoOrganizacional && (
                  <p className="text-[12px] text-red-500">{errors.tamanoOrganizacional}</p>
                )}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[#4d82bc] pb-2 border-b">
                <Mail className="h-5 w-5" />
                Información de Contacto
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => handleInputChange("correo", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={errors.correo ? "border-red-500" : ""}
                  />
                  {errors.correo && <p className="text-[12px] text-red-500">{errors.correo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange("telefono", e.target.value)}
                    placeholder="+57 300 000 0000"
                    className={errors.telefono ? "border-red-500" : ""}
                  />
                  {errors.telefono && <p className="text-[12px] text-red-500">{errors.telefono}</p>}
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-[#4d82bc] pb-2 border-b">
                <Lock className="h-5 w-5" />
                Seguridad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contrasena" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="contrasena"
                      type={showPassword ? "text" : "password"}
                      value={formData.contrasena}
                      onChange={(e) => handleInputChange("contrasena", e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className={errors.contrasena ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.contrasena && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          />
                        </div>
                        <span className="text-[12px]">{passwordStrength.text}</span>
                      </div>
                    </div>
                  )}
                  {errors.contrasena && <p className="text-[12px] text-red-500">{errors.contrasena}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarContrasena" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirmar Contraseña *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmarContrasena"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmarContrasena}
                      onChange={(e) => handleInputChange("confirmarContrasena", e.target.value)}
                      placeholder="Repita su contraseña"
                      className={errors.confirmarContrasena ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmarContrasena && formData.contrasena === formData.confirmarContrasena && (
                    <p className="flex items-center gap-1 text-[12px] text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Las contraseñas coinciden
                    </p>
                  )}
                  {errors.confirmarContrasena && (
                    <p className="text-[12px] text-red-500">{errors.confirmarContrasena}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Políticas */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Checkbox
                  id="aceptaPoliticas"
                  checked={formData.aceptaPoliticas}
                  onCheckedChange={(checked) => handleInputChange("aceptaPoliticas", Boolean(checked))}
                  className={errors.aceptaPoliticas ? "border-red-500" : ""}
                />
                <div className="space-y-1">
                  <Label htmlFor="aceptaPoliticas" className="cursor-pointer flex items-center gap-2">
                    <Shield className="h-4 w-4 text-[#4d82bc]" />
                    Acepto las Políticas de Protección de Datos *
                  </Label>
                  <p className="text-[12px] text-gray-600">
                    Al marcar esta casilla, acepto que mis datos sean procesados según la política de privacidad.
                  </p>
                  {errors.aceptaPoliticas && <p className="text-[12px] text-red-500">{errors.aceptaPoliticas}</p>}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleCreateAccount}
                disabled={isSubmitting}
                className="create-btn w-full md:w-auto px-6"
                size="lg"
              >
                {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </div>

            <p className="text-center text-[14px] text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button onClick={onLoginRedirect} className="text-[#4d82bc] hover:underline">
                Inicia sesión aquí
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
