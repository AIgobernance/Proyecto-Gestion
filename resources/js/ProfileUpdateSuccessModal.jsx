import React from "react";
import { CheckCircle2, X } from "lucide-react";

export function ProfileUpdateSuccessModal({ onContinue }) {
  return (
    <>
      <style>{`
        .overlay-ok{
          position:fixed; inset:0; z-index:60;
          background:rgba(10,15,30,.55);
          backdrop-filter:blur(2.5px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
        }
        .card-ok{
          width:100%; max-width:520px;
          background:#fff; border:1px solid #e9edf5;
          border-radius:24px; box-shadow:0 24px 64px rgba(2,6,23,.28);
          position:relative; overflow:hidden;
        }
        .ok-close{
          position:absolute; top:10px; right:10px;
          width:36px;height:36px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;
          display:inline-flex;align-items:center;justify-content:center; cursor:pointer;
        }
        .ok-close:hover{ background:#f7f9ff }

        .ok-head{ padding:22px 22px 8px; display:flex;flex-direction:column;align-items:center;gap:10px}
        .ok-icon{
          width:68px;height:68px;border-radius:50%;
          background:linear-gradient(135deg,#e8fff3,#f5fff9);
          color:#129c55; display:flex;align-items:center;justify-content:center;
          box-shadow:0 10px 26px rgba(18,156,85,.18);
        }
        .ok-title{margin:0;font-size:22px;font-weight:900;color:#0f172a;text-align:center}
        .ok-desc{margin:0;font-size:14px;color:#334155;text-align:center}

        .ok-body{padding:14px 22px 22px}
        .ok-cta{
          width:100%;
          background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff;
          border-radius:999px; padding:12px 20px; font-weight:800; border:none; cursor:pointer;
          box-shadow:0 12px 30px rgba(2,6,23,.18);
        }
        .ok-cta:hover{ filter:brightness(1.02) }
      `}</style>

      <div className="overlay-ok" role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()}>
        <div className="card-ok">
          <button className="ok-close" aria-label="Cerrar" onClick={onContinue}>
            <X className="w-5 h-5" />
          </button>

          <div className="ok-head">
            <div className="ok-icon">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="ok-title">¡Perfil actualizado!</h3>
            <p className="ok-desc">Tus cambios se guardaron correctamente.</p>
          </div>

          <div className="ok-body">
            <button className="ok-cta" onClick={onContinue}>
              Continuar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
