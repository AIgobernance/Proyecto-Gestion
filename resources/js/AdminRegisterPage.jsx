import React, { useState } from "react";
import { UserCreatedSuccessModal } from "./UserCreatedSuccessModal";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import {
  ArrowLeft,
  UserCog,
  Building2,
  FileText,
  Hash,
  Briefcase,
  Globe,
  Mail,
  Phone,
  Lock,
  Shield,
  CheckCircle2,
} from "lucide-react";
// 👇 cambia la ruta por la real
import imgRectangle13 from "../assets/logo-principal.jpg";

export function AdminRegisterPage({ onBack, onLoginRedirect }) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    usuario: "",
    empresa: "",
    tipoDocumento: "",
    numeroDocumento: "",
    sector: "",
    pais: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    aceptaPoliticas: false,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = () => {
    // Validación básica
    if (
      !formData.usuario ||
      !formData.empresa ||
      !formData.correo ||
      !formData.contrasena
    ) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    if (formData.contrasena !== formData.confirmarContrasena) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (!formData.aceptaPoliticas) {
      alert("Debe aceptar las políticas de protección de datos");
      return;
    }

    // TODO: Enviar datos al backend
    console.log("Datos del formulario administrador:", formData);
    setShowSuccess(true);
  };

  const handleContinueFromSuccess = () => {
    // Resetear formulario
    setFormData({
      usuario: "",
      empresa: "",
      tipoDocumento: "",
      numeroDocumento: "",
      sector: "",
      pais: "",
      correo: "",
      telefono: "",
      contrasena: "",
      confirmarContrasena: "",
      aceptaPoliticas: false,
    });
    setShowSuccess(false);
  };

  return (
    <div
      className="bg-[#e8f0f8] min-h-screen flex flex-col"
      data-name="Admin Register"
    >
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-8 shadow-md">
        <div className="h-[113px] w-[287px]">
          <img
            alt="Logo"
            className="h-full w-full object-cover"
            src={imgRectangle13}
          />
        </div>

        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white rounded-[25px] px-8 py-3 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#4a7ba7]" />
          <span className="font-['Inter:Regular',_sans-serif] text-[18px] text-[#4a7ba7]">
            Volver
          </span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="bg-gradient-to-br from-[#5882b8] to-[#4a7ba7] rounded-[40px] w-full max-w-[600px] p-10 shadow-2xl">
          {/* Título con icono */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <UserCog className="w-8 h-8 text-white" />
            <h1 className="font-['Inter:Regular',_sans-serif] text-[32px] text-center text-white">
              Registro de Administrador
            </h1>
          </div>

          {/* Row 1: Usuario y Empresa */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <UserCog className="w-4 h-4" />
                Usuario:
              </label>
              <Input
                type="text"
                value={formData.usuario}
                onChange={(e) =>
                  handleInputChange("usuario", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
                placeholder="Ingrese usuario"
              />
            </div>
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4" />
                Empresa:
              </label>
              <Input
                type="text"
                value={formData.empresa}
                onChange={(e) =>
                  handleInputChange("empresa", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
                placeholder="Ingrese empresa"
              />
            </div>
          </div>

          {/* Row 2: Tipo de documento y Número */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                Tipo de documento:
              </label>
              <select
                value={formData.tipoDocumento}
                onChange={(e) =>
                  handleInputChange("tipoDocumento", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] px-4 bg-white/95 border-none shadow-sm"
              >
                <option value="">Seleccionar</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" />
                Número de documento:
              </label>
              <Input
                type="text"
                value={formData.numeroDocumento}
                onChange={(e) =>
                  handleInputChange("numeroDocumento", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
                placeholder="Número"
              />
            </div>
          </div>

          {/* Row 3: Sector y País */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4" />
                Sector:
              </label>
              <select
                value={formData.sector}
                onChange={(e) =>
                  handleInputChange("sector", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] px-4 bg-white/95 border-none shadow-sm"
              >
                <option value="">Seleccionar</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Financiero">Financiero</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Retail">Retail</option>
                <option value="Manufactura">Manufactura</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                País:
              </label>
              <select
                value={formData.pais}
                onChange={(e) =>
                  handleInputChange("pais", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] px-4 bg-white/95 border-none shadow-sm"
              >
                <option value="">Seleccionar</option>
                <option value="Colombia">Colombia</option>
                <option value="México">México</option>
                <option value="España">España</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Correo */}
          <div className="mb-5">
            <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Correo:
            </label>
            <Input
              type="email"
              value={formData.correo}
              onChange={(e) => handleInputChange("correo", e.target.value)}
              className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div className="mb-5">
            <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              Teléfono:
            </label>
            <Input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleInputChange("telefono", e.target.value)}
              className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
              placeholder="+57 300 000 0000"
            />
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Crear Contraseña:
              </label>
              <Input
                type="password"
                value={formData.contrasena}
                onChange={(e) =>
                  handleInputChange("contrasena", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
                placeholder="Contraseña"
              />
            </div>
            <div>
              <label className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Confirmar Contraseña:
              </label>
              <Input
                type="password"
                value={formData.confirmarContrasena}
                onChange={(e) =>
                  handleInputChange("confirmarContrasena", e.target.value)
                }
                className="w-full h-[40px] rounded-[20px] bg-white/95 border-none shadow-sm"
                placeholder="Confirmar"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-center justify-center gap-3 mb-8 bg-white/10 p-4 rounded-[20px]">
            <Checkbox
              id="politicas-admin"
              checked={formData.aceptaPoliticas}
              onCheckedChange={(checked) =>
                handleInputChange("aceptaPoliticas", checked)
              }
              className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#4a7ba7]"
            />
            <label
              htmlFor="politicas-admin"
              className="font-['Inter:Regular',_sans-serif] text-[15px] text-white flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Acepto Políticas Protección Datos
            </label>
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <button
              onClick={handleCreateAccount}
              className="bg-white hover:bg-gray-100 text-[#4a7ba7] transition-all duration-200 rounded-[25px] px-12 py-3 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-['Inter:Regular',_sans-serif] text-[18px]">
                Crear Cuenta
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccess && (
        <UserCreatedSuccessModal onContinue={handleContinueFromSuccess} />
      )}
    </div>
  );
}
