import React from "react";
import { Upload, Camera, X } from "lucide-react";

export function ChangePhotoModal({ onClose, onSelectFile }) {
  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#b8d4f1] rounded-[30px] px-[60px] py-[50px] shadow-xl relative">
        {/* Botón cerrar */}
        <button
          className="absolute top-4 right-4 text-black hover:text-[#4a7ba7] transition-colors"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center gap-6">
          {/* Título */}
          <h2 className="font-['Inter:Regular',_sans-serif] font-normal text-[24px] text-black text-center">
            Cambiar foto de perfil
          </h2>

          {/* Opciones */}
          <div className="flex flex-col gap-4 w-full min-w-[320px]">
            {/* Opción: Importar desde PC */}
            <label
              htmlFor="file-upload"
              className="bg-white rounded-[20px] px-[30px] py-[15px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-3 justify-center"
            >
              <Upload className="w-5 h-5 text-[#4a7ba7]" />
              <p className="font-['Inter:Regular',_sans-serif] font-normal text-[16px] text-black">
                Importar desde PC
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Opción: Tomar foto */}
            <button
              className="bg-white rounded-[20px] px-[30px] py-[15px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm flex items-center gap-3 justify-center"
              onClick={() => {
                // Aquí iría la lógica para abrir la cámara
                console.log("Tomar foto con cámara");
                onClose();
              }}
            >
              <Camera className="w-5 h-5 text-[#4a7ba7]" />
              <p className="font-['Inter:Regular',_sans-serif] font-normal text-[16px] text-black">
                Tomar foto
              </p>
            </button>

            {/* Botón Cancelar */}
            <button
              className="bg-[#93b8dc] rounded-[20px] px-[30px] py-[10px] cursor-pointer hover:bg-[#7ea6cc] transition-colors shadow-sm mt-2"
              onClick={onClose}
            >
              <p className="font-['Inter:Regular',_sans-serif] font-normal text-[14px] text-black">
                Cancelar
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
