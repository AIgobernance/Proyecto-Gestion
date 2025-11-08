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
    <>
      <style>{`
        .modal-overlay{
          position:fixed; inset:0; z-index:50;
          background:rgba(10,15,30,.55);
          backdrop-filter:blur(2.5px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
        }
        .modal-card{
          width:100%; max-width:540px;
          background:#fff; border:1px solid #e9edf5;
          border-radius:24px; box-shadow:0 20px 60px rgba(2,6,23,.25);
          position:relative; overflow:hidden;
        }
        .modal-head{
          display:flex; flex-direction:column; align-items:center; gap:10px;
          padding:22px 22px 10px;
        }
        .modal-icon{
          width:64px;height:64px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,#eaf1ff,#f4f7ff);
          color:#2b51c2; box-shadow:0 6px 18px rgba(2,6,23,.08);
        }
        .modal-title{ margin:0; font-size:20px; font-weight:800; color:#0f172a; text-align:center}
        .modal-sub{ margin:0; font-size:14px; color:#5b677a; text-align:center}

        .modal-body{ padding:16px 22px 22px; display:grid; gap:12px}
        .opt{
          display:flex; align-items:center; gap:10px; justify-content:center;
          padding:12px 16px; border-radius:14px; border:1px solid #e7eefc;
          background:linear-gradient(90deg,#f7faff,#eef4ff);
          cursor:pointer; transition:transform .12s ease, box-shadow .12s ease;
        }
        .opt:hover{ transform:translateY(-1px); box-shadow:0 10px 24px rgba(2,6,23,.12) }

        .btn-cancel{
          background:#fff; border:1px solid #cfd7e6; color:#173b8f;
          border-radius:999px; padding:10px 18px; font-weight:800; cursor:pointer;
        }

        .btn-close{
          position:absolute; top:10px; right:10px;
          width:36px;height:36px;border-radius:999px; border:1px solid #e5e7eb;background:#fff;
          display:inline-flex;align-items:center;justify-content:center; cursor:pointer;
        }
        .btn-close:hover{ background:#f7f9ff }

        /* Oculta por completo el input nativo */
        #file-upload{ display:none; }
      `}</style>

      <div className="modal-overlay" role="dialog" aria-modal="true">
        <div className="modal-card">
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>

          <div className="modal-head">
            <div className="modal-icon">
              <Camera className="w-7 h-7" />
            </div>
            <h2 className="modal-title">Cambiar foto de perfil</h2>
            <p className="modal-sub">Sube una imagen desde tu equipo</p>
          </div>

          <div className="modal-body">
            {/* ÚNICA OPCIÓN: Importar archivo */}
            <label className="opt" htmlFor="file-upload">
              <Upload className="w-5 h-5 text-[#2b51c2]" />
              <span style={{fontWeight:700,color:"#0f172a"}}>Importar desde tu equipo</span>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
            />

            <div style={{display:"flex",justifyContent:"center",marginTop:4}}>
              <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
