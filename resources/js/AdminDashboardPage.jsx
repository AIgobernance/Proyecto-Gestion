import React from "react";
import { Users, BarChart3, LogOut, UserCircle } from "lucide-react";
// 👇 cambia esta ruta por tu imagen real:
import imgLogo from "../assets/logo-principal.jpg"

export function AdminDashboardPage({ 
  username = "Admin", 
  onLogout,
  onAdminUsers,
  onViewGeneralDashboard
}) {
  return (
    <div className="bg-[#e8f0f8] relative min-h-screen">
      {/* Header */}
      <div className="bg-[#cadffb] h-[116px] w-full flex items-center justify-between px-6">
        {/* Logo */}
        <div className="w-[180px] h-[90px]">
          <img
            alt="AI Governance Evaluator"
            className="w-full h-full object-contain"
            src={imgLogo}
          />
        </div>

        {/* Título central */}
        <div className="flex-1 text-center">
          <h1 className="font-['Inter:Regular',_sans-serif] font-normal text-[28px] text-[#1e3a8a]">
            Bienvenido al Evaluador de Governanza
          </h1>
        </div>

        {/* Opciones del header */}
        <div className="flex items-center gap-3">
          {/* Indicador de usuario administrador */}
          <div className="flex items-center gap-2 bg-white/80 rounded-[20px] px-4 py-2 shadow-sm">
            <UserCircle className="w-5 h-5 text-[#4a7ba7]" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-[#4a7ba7]">
              {username}
            </span>
          </div>

          {/* Separador visual */}
          <div className="h-8 w-px bg-[#93b8dc]" />

          {/* Botón Cerrar Sesión */}
          <button
            className="flex items-center gap-2 bg-[#f87171]/90 hover:bg-[#ef4444] rounded-[20px] px-4 py-2 transition-all duration-200 shadow-sm hover:shadow-md group"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 text-white" />
            <span className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-white">
              Cerrar Sesión
            </span>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center px-6 py-32 gap-8">
        {/* Botón Administración de usuarios */}
        <button
          onClick={onAdminUsers}
          className="bg-[#b3d0ed] hover:bg-[#9ec0e0] transition-colors rounded-[30px] w-[480px] h-[80px] flex items-center gap-4 px-6"
        >
          <div className="bg-white rounded-full p-3 flex items-center justify-center w-[56px] h-[56px]">
            <Users className="w-8 h-8 text-[#4a7ba7]" />
          </div>
          <p className="font-['Inter:Regular',_sans-serif] font-normal text-[20px] text-black">
            Administración de usuarios
          </p>
        </button>

        {/* Botón Ver dashboard general */}
        <button
          onClick={onViewGeneralDashboard}
          className="bg-[#b3d0ed] hover:bg-[#9ec0e0] transition-colors rounded-[30px] w-[480px] h-[80px] flex items-center gap-4 px-6"
        >
          <div className="bg-white rounded-full p-3 flex items-center justify-center w-[56px] h-[56px]">
            <BarChart3 className="w-8 h-8 text-[#4a7ba7]" />
          </div>
          <p className="font-['Inter:Regular',_sans-serif] font-normal text-[20px] text-black">
            Ver dashboard general
          </p>
        </button>
      </div>
    </div>
  );
}
