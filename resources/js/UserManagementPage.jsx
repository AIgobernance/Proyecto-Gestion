import React, { useState } from "react";
import logoSuccess from "../assets/check-solid.svg";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Users, UserPlus, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";

export function UserManagementPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'crear' | 'restablecer'
  const [users, setUsers] = useState([
    { id: 1, usuario: "Angel", rol: "Usuario", estado: "Activo", activado: true },
    { id: 2, usuario: "Mauricio", rol: "Usuario", estado: "Inactivo", activado: false },
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordResetSuccessModal, setShowPasswordResetSuccessModal] = useState(false);

  // Form state for creating new user
  const [newUser, setNewUser] = useState({
    usuario: "",
    empresa: "",
    tipoDocumento: "",
    numeroDocumento: "",
    sector: "",
    pais: "",
    tamanoOrganizacional: "",
    correo: "",
    telefono: "",
    crearContrasena: "",
    confirmarContrasena: "",
    aceptaPoliticas: false,
  });

  // Form state for password reset
  const [resetPassword, setResetPassword] = useState({
    usuario: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  const handleToggleUser = (userId) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const newActivado = !user.activado;
          return {
            ...user,
            activado: newActivado,
            estado: newActivado ? "Activo" : "Inactivo",
          };
        }
        return user;
      })
    );
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    // Mostrar modal de éxito
    setShowSuccessModal(true);
  };

  const handleContinueAfterSuccess = () => {
    // Agregar el nuevo usuario a la lista
    const newUserData = {
      id: users.length + 1,
      usuario: newUser.usuario,
      rol: "Usuario",
      estado: "Activo",
      activado: true,
    };
    setUsers([...users, newUserData]);

    // Resetear el formulario
    setNewUser({
      usuario: "",
      empresa: "",
      tipoDocumento: "",
      numeroDocumento: "",
      sector: "",
      pais: "",
      tamanoOrganizacional: "",
      correo: "",
      telefono: "",
      crearContrasena: "",
      confirmarContrasena: "",
      aceptaPoliticas: false,
    });

    // Cerrar modal y volver a la pestaña de usuarios
    setShowSuccessModal(false);
    setActiveTab("usuarios");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // Mostrar modal de éxito
    setShowPasswordResetSuccessModal(true);
  };

  const handleContinueAfterPasswordReset = () => {
    // Resetear el formulario
    setResetPassword({
      usuario: "",
      nuevaContrasena: "",
      confirmarContrasena: "",
    });

    // Cerrar modal y volver a la pestaña de usuarios
    setShowPasswordResetSuccessModal(false);
    setActiveTab("usuarios");
  };

  const handleCancelResetPassword = () => {
    setResetPassword({
      usuario: "",
      nuevaContrasena: "",
      confirmarContrasena: "",
    });
  };

  return (
    <div className="bg-[#e8f0f8] relative min-h-screen flex">
      {/* Sidebar */}
      <div className="bg-gradient-to-b from-[#c4dff5] to-[#a8c7e7] w-[280px] min-h-screen flex flex-col items-center pt-8 px-4 shadow-lg">
        {/* Menu buttons */}
        <div className="w-full flex flex-col gap-3 mt-8">
          <button
            onClick={() => setActiveTab("usuarios")}
            className={`w-full py-4 px-5 rounded-[20px] font-['Inter:Regular',_sans-serif] text-[15px] transition-all duration-200 flex items-center gap-3 ${
              activeTab === "usuarios"
                ? "bg-white text-[#4a7ba7] shadow-md scale-105"
                : "bg-white/30 text-black hover:bg-white/50 hover:shadow-sm"
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === "usuarios" ? "text-[#4a7ba7]" : "text-black"}`} />
            <span>Usuarios</span>
          </button>
          <button
            onClick={() => setActiveTab("crear")}
            className={`w-full py-4 px-5 rounded-[20px] font-['Inter:Regular',_sans-serif] text-[15px] transition-all duration-200 flex items-center gap-3 ${
              activeTab === "crear"
                ? "bg-white text-[#4a7ba7] shadow-md scale-105"
                : "bg-white/30 text-black hover:bg-white/50 hover:shadow-sm"
            }`}
          >
            <UserPlus className={`w-5 h-5 ${activeTab === "crear" ? "text-[#4a7ba7]" : "text-black"}`} />
            <span>Crear Nuevo Usuario</span>
          </button>
          <button
            onClick={() => setActiveTab("restablecer")}
            className={`w-full py-4 px-5 rounded-[20px] font-['Inter:Regular',_sans-serif] text-[15px] transition-all duration-200 flex items-center gap-3 ${
              activeTab === "restablecer"
                ? "bg-white text-[#4a7ba7] shadow-md scale-105"
                : "bg-white/30 text-black hover:bg-white/50 hover:shadow-sm"
            }`}
          >
            <KeyRound className={`w-5 h-5 ${activeTab === "restablecer" ? "text-[#4a7ba7]" : "text-black"}`} />
            <span>Restablecer Contraseña</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white/50 h-[100px] flex items-center justify-between px-8 shadow-sm">
          <div className="flex-1" />
          <h1 className="flex-1 text-center font-['Inter:Regular',_sans-serif] text-[28px] text-[#4a7ba7]">
            Administración de usuarios
          </h1>
          <div className="flex-1 flex justify-end">
            <button
              onClick={onBack}
              className="bg-[#4a7ba7] hover:bg-[#3d6a92] text-white transition-all duration-200 rounded-[25px] px-8 py-3 font-['Inter:Regular',_sans-serif] text-[16px] shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-8 pb-8">
          {activeTab === "usuarios" && (
            <div className="bg-white rounded-[30px] p-8 min-h-[500px] shadow-lg">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 mb-2 pb-4 border-b-2 border-[#4a7ba7]">
                <div className="font-['Inter:Regular',_sans-serif] text-[18px] text-center text-[#4a7ba7]">
                  Usuario
                </div>
                <div className="font-['Inter:Regular',_sans-serif] text-[18px] text-center text-[#4a7ba7]">
                  Rol
                </div>
                <div className="font-['Inter:Regular',_sans-serif] text-[18px] text-center text-[#4a7ba7]">
                  Estado
                </div>
                <div className="font-['Inter:Regular',_sans-serif] text-[18px] text-center text-[#4a7ba7]">
                  Activar/Desactivar
                </div>
              </div>

              {/* Table Rows */}
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-4 gap-4 py-5 border-b border-[#e0e7f1] hover:bg-[#f5f9fc] transition-colors ${
                    index % 2 === 0 ? "bg-[#fafbfd]" : "bg-white"
                  }`}
                >
                  <div className="font-['Inter:Regular',_sans-serif] text-[16px] text-center text-black flex items-center justify-center">
                    {user.usuario}
                  </div>
                  <div className="font-['Inter:Regular',_sans-serif] text-[16px] text-center text-black flex items-center justify-center">
                    <span className="bg-[#e8f0f8] px-4 py-1 rounded-[15px]">{user.rol}</span>
                  </div>
                  <div className="font-['Inter:Regular',_sans-serif] text-[16px] text-center flex items-center justify-center">
                    <span
                      className={`px-4 py-1 rounded-[15px] ${
                        user.estado === "Activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.estado}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-['Inter:Regular',_sans-serif] text-[14px] text-black">
                      {user.activado ? "Activo" : "Desactivado"}
                    </span>
                    <Switch checked={user.activado} onCheckedChange={() => handleToggleUser(user.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "crear" && (
            <div className="bg-white rounded-[30px] p-8 min-h-[500px] shadow-lg">
              {/* Título */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <UserPlus className="w-7 h-7 text-[#4a7ba7]" />
                <h2 className="font-['Inter:Regular',_sans-serif] text-[24px] text-center text-[#4a7ba7]">
                  Crear Usuario
                </h2>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCreateUser} className="max-w-[800px] mx-auto space-y-5 bg-[#f5f9fc] p-8 rounded-[20px]">
                {/* Usuario y Empresa */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Usuario:
                    </label>
                    <Input
                      type="text"
                      value={newUser.usuario}
                      onChange={(e) => setNewUser({ ...newUser, usuario: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Empresa:
                    </label>
                    <Input
                      type="text"
                      value={newUser.empresa}
                      onChange={(e) => setNewUser({ ...newUser, empresa: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                </div>

                {/* Tipo de documento y Número de documento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Tipo de documento:
                    </label>
                    <Input
                      type="text"
                      value={newUser.tipoDocumento}
                      onChange={(e) => setNewUser({ ...newUser, tipoDocumento: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Número de documento:
                    </label>
                    <Input
                      type="text"
                      value={newUser.numeroDocumento}
                      onChange={(e) => setNewUser({ ...newUser, numeroDocumento: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                </div>

                {/* Sector y País */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Sector:
                    </label>
                    <Input
                      type="text"
                      value={newUser.sector}
                      onChange={(e) => setNewUser({ ...newUser, sector: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      País:
                    </label>
                    <Input
                      type="text"
                      value={newUser.pais}
                      onChange={(e) => setNewUser({ ...newUser, pais: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                </div>

                {/* Tamaño Organizacional */}
                <div>
                  <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                    Tamaño Organizacional:
                  </label>
                  <Input
                    type="text"
                    value={newUser.tamanoOrganizacional}
                    onChange={(e) => setNewUser({ ...newUser, tamanoOrganizacional: e.target.value })}
                    className="w-full bg-white border-none rounded-md"
                  />
                </div>

                {/* Correo */}
                <div>
                  <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                    Correo:
                  </label>
                  <Input
                    type="email"
                    value={newUser.correo}
                    onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })}
                    className="w-full bg-white border-none rounded-md"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                    Teléfono:
                  </label>
                  <Input
                    type="tel"
                    value={newUser.telefono}
                    onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })}
                    className="w-full bg-white border-none rounded-md"
                  />
                </div>

                {/* Crear Contraseña y Confirmar Contraseña */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Crear Contraseña:
                    </label>
                    <Input
                      type="password"
                      value={newUser.crearContrasena}
                      onChange={(e) => setNewUser({ ...newUser, crearContrasena: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-1">
                      Confirmar Contraseña:
                    </label>
                    <Input
                      type="password"
                      value={newUser.confirmarContrasena}
                      onChange={(e) => setNewUser({ ...newUser, confirmarContrasena: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>
                </div>

                {/* Checkbox de políticas */}
                <div className="flex items-center gap-2 justify-center mt-4">
                  <Checkbox
                    id="politicas"
                    checked={newUser.aceptaPoliticas}
                    onCheckedChange={(checked) => setNewUser({ ...newUser, aceptaPoliticas: checked })}
                  />
                  <label
                    htmlFor="politicas"
                    className="font-['Inter:Regular',_sans-serif] text-[14px] text-black cursor-pointer"
                  >
                    Acepto Políticas Protección Datos
                  </label>
                </div>

                {/* Botón Crear Cuenta */}
                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-[#4a7ba7] hover:bg-[#3d6a92] text-white transition-all duration-200 rounded-[20px] px-16 py-3 font-['Inter:Regular',_sans-serif] text-[16px] shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Crear Cuenta</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "restablecer" && (
            <div className="bg-white rounded-[30px] p-8 min-h-[500px] flex items-center justify-center shadow-lg">
              <div className="bg-[#f5f9fc] rounded-[30px] p-12 max-w-[550px] w-full border-2 border-[#c4dff5]">
                {/* Título */}
                <div className="flex items-center justify-center gap-3 mb-10">
                  <KeyRound className="w-7 h-7 text-[#4a7ba7]" />
                  <h2 className="font-['Inter:Regular',_sans-serif] text-[24px] text-center text-[#4a7ba7]">
                    Restablecer Contraseña
                  </h2>
                </div>

                {/* Formulario */}
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* Usuario */}
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-2 text-center">
                      Usuario:
                    </label>
                    <Input
                      type="text"
                      value={resetPassword.usuario}
                      onChange={(e) => setResetPassword({ ...resetPassword, usuario: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>

                  {/* Nueva Contraseña */}
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-2 text-center">
                      Nueva Contraseña:
                    </label>
                    <Input
                      type="password"
                      value={resetPassword.nuevaContrasena}
                      onChange={(e) => setResetPassword({ ...resetPassword, nuevaContrasena: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>

                  {/* Confirmar Contraseña */}
                  <div>
                    <label className="font-['Inter:Regular',_sans-serif] text-[14px] text-black block mb-2 text-center">
                      Confirmar Contraseña:
                    </label>
                    <Input
                      type="password"
                      value={resetPassword.confirmarContrasena}
                      onChange={(e) => setResetPassword({ ...resetPassword, confirmarContrasena: e.target.value })}
                      className="w-full bg-white border-none rounded-md"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex justify-center gap-4 mt-10">
                    <button
                      type="submit"
                      className="bg-[#4a7ba7] hover:bg-[#3d6a92] text-white transition-all duración-200 rounded-[20px] px-10 py-3 font-['Inter:Regular',_sans-serif] text-[16px] shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Aceptar</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelResetPassword}
                      className="bg-white hover:bg-gray-100 text-black transition-all duración-200 rounded-[20px] px-10 py-3 font-['Inter:Regular',_sans-serif] text-[16px] border-2 border-[#c4dff5] shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de éxito - Crear Usuario */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-white border-none p-0 max-w-[600px]">
          <DialogTitle className="sr-only">Usuario creado con éxito</DialogTitle>
          <DialogDescription className="sr-only">El usuario ha sido creado exitosamente en el sistema</DialogDescription>
          <div className="bg-[#e8f0f8] p-4">
            <div className="flex items-center gap-3">
              <img src={logoSuccess} alt="AI Governance Evaluator" className="w-[50px] h-[50px] object-contain" />
              <div className="flex flex-col">
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">AI</span>
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">GOVERNANCE</span>
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">EVALUATOR</span>
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col items-center justify-center py-20 px-8">
            <div className="bg-[#a8c7e7] rounded-[30px] p-12 flex flex-col items-center gap-6 max-w-[450px] w-full">
              <p className="font-['Inter:Regular',_sans-serif] text-[24px] text-center text-black">Usuario creado con Éxito</p>
              <button
                onClick={handleContinueAfterSuccess}
                className="bg-white hover:bg-gray-100 transition-colors rounded-[20px] px-10 py-2 font-['Inter:Regular',_sans-serif] text-[16px] text-black"
              >
                Continuar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de éxito - Restablecer Contraseña */}
      <Dialog open={showPasswordResetSuccessModal} onOpenChange={setShowPasswordResetSuccessModal}>
        <DialogContent className="bg-white border-none p-0 max-w-[600px]">
          <DialogTitle className="sr-only">Contraseña cambiada con éxito</DialogTitle>
          <DialogDescription className="sr-only">La contraseña ha sido cambiada exitosamente</DialogDescription>
          <div className="bg-[#e8f0f8] p-4">
            <div className="flex items-center gap-3">
              <img src={logoSuccess} alt="AI Governance Evaluator" className="w-[50px] h-[50px] object-contain" />
              <div className="flex flex-col">
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">AI</span>
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">GOVERNANCE</span>
                <span className="font-['Inter:Regular',_sans-serif] text-[16px] text-black">EVALUATOR</span>
              </div>
            </div>
          </div>
          <div className="bg-white flex flex-col items-center justify-center py-20 px-8">
            <div className="bg-[#a8c7e7] rounded-[30px] p-12 flex flex-col items-center gap-6 max-w-[450px] w-full">
              <p className="font-['Inter:Regular',_sans-serif] text-[24px] text-center text-black">Contraseña cambiada con éxito</p>
              <button
                onClick={handleContinueAfterPasswordReset}
                className="bg-white hover:bg-gray-100 transition-colors rounded-[20px] px-10 py-2 font-['Inter:Regular',_sans-serif] text-[16px] text-black"
              >
                Continuar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
