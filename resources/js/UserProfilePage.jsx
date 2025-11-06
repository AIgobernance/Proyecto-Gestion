import React, { useState } from "react";
import imgLogo from "../assets/audi-7.svg";
import { User } from "lucide-react";
import { ChangePhotoModal } from "./ChangePhotoModal";
import { ProfileUpdateSuccessModal } from "./ProfileUpdateSuccessModal";

export function UserProfilePage({ username = "Usuario", onBack }) {
  const [profileUsername, setProfileUsername] = useState(username);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleSaveChanges = () => {
    console.log("Guardando cambios:", { profileUsername, email, phone, password });
    // Aquí iría la lógica para guardar los cambios
    setShowSuccessModal(true);
  };

  const handleSelectFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSuccessContinue = () => {
    setShowSuccessModal(false);
    onBack(); // Redirige al dashboard
  };

  return (
    <div className="bg-white relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="h-[113px] w-[287px]">
          <img
            alt=""
            className="max-w-none object-50%-50% object-cover pointer-events-none size-full"
            src={imgLogo}
          />
        </div>

        {/* Botón Volver */}
        <button
          className="bg-white rounded-[30px] px-[40px] py-[8px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm"
          onClick={onBack}
        >
          <p className="font-['Inter:Regular',_sans-serif] font-normal text-[16px] text-black">
            Volver
          </p>
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex items-center justify-center px-6 py-12 min-h-[calc(100vh-116px)]">
        <div className="bg-[#b8d4f1] rounded-[40px] px-[80px] py-[60px] w-full max-w-[800px] shadow-lg">
          <h1 className="font-['Inter:Regular',_sans-serif] font-normal text-[32px] text-black text-center mb-12">
            Perfil
          </h1>

          <div className="flex gap-[80px] items-start">
            {/* Avatar y botón de cambiar foto */}
            <div className="flex flex-col items-center gap-6">
              <div className="bg-[#4a7ba7] rounded-full w-[160px] h-[160px] flex items-center justify-center border-8 border-white shadow-md overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-[80px] h-[80px] text-white" strokeWidth={2} />
                )}
              </div>
              <button
                className="bg-[#93b8dc] rounded-[20px] px-[20px] py-[8px] cursor-pointer hover:bg-[#7ea6cc] transition-colors shadow-sm"
                onClick={() => setShowChangePhotoModal(true)}
              >
                <p className="font-['Inter:Regular',_sans-serif] font-normal text-[12px] text-black">
                  Cambiar foto del perfil
                </p>
              </button>
            </div>

            {/* Formulario de datos */}
            <div className="flex-1 space-y-[20px]">
              {/* Campo Usuario */}
              <div>
                <label className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black block mb-[6px]">
                  Usuario
                </label>
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  className="w-full h-[35px] rounded-[15px] px-4 bg-white border-none outline-none shadow-sm"
                />
              </div>

              {/* Campo Correo */}
              <div>
                <label className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black block mb-[6px]">
                  Correo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[35px] rounded-[15px] px-4 bg-white border-none outline-none shadow-sm"
                />
              </div>

              {/* Campo Teléfono */}
              <div>
                <label className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black block mb-[6px]">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-[35px] rounded-[15px] px-4 bg-white border-none outline-none shadow-sm"
                />
              </div>

              {/* Campo Contraseña */}
              <div>
                <label className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black block mb-[6px]">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[35px] rounded-[15px] px-4 bg-white border-none outline-none shadow-sm"
                />
              </div>

              {/* Botón Guardar cambios */}
              <div className="flex justify-center pt-4">
                <button
                  className="bg-[#7ba3cb] rounded-[20px] px-[35px] py-[8px] cursor-pointer hover:bg-[#6892ba] transition-colors shadow-sm"
                  onClick={handleSaveChanges}
                >
                  <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black">
                    Guardar cambios
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showChangePhotoModal && (
        <ChangePhotoModal onClose={() => setShowChangePhotoModal(false)} onSelectFile={handleSelectFile} />
      )}

      {showSuccessModal && <ProfileUpdateSuccessModal onContinue={handleSuccessContinue} />}
    </div>
  );
}
