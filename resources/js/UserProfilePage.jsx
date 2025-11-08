import React, { useState } from "react";
import imgLogo from "../assets/logo-principal.jpg";
import { User, Camera, Mail, Phone, Lock, Pencil } from "lucide-react";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ChangePhotoModal } from "./ChangePhotoModal";
import { ProfileUpdateSuccessModal } from "./ProfileUpdateSuccessModal";

/* ===== Estilos embebidos ===== */
const styles = `
:root{
  --brand:#1f3d93; --brand-2:#2c4fb5; --ink:#0b1324; --muted:#475569;
  --ring:#cfd7e6; --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#213e90 0%,#1a2e74 100%)}

/* Header blanco */
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:70px;display:flex;align-items:center;justify-content:space-between;padding:10px 18px}
.header__logo img{height:46px;width:auto;object-fit:contain}
.btn-pill{border-radius:999px}

/* Contenido */
.main{flex:1}
.wrap{max-width:1024px;margin:0 auto;padding:32px 16px}

/* Card perfil */
.profile-card{background:#fff;border:1px solid #e9edf5;border-radius:22px;box-shadow:var(--shadow)}
.card-header{padding:18px 22px;border-bottom:1px solid #eef2f7}
.card-title{margin:0;color:#0f172a}
.card-content{padding:18px 22px 22px}

/* Layout 2 columnas */
.grid{display:grid;grid-template-columns:320px 1fr;gap:24px}
@media (max-width: 900px){ .grid{grid-template-columns:1fr} }

/* Avatar */
.avatar{display:flex;flex-direction:column;gap:14px;align-items:center}
.avatar-ring{width:168px;height:168px;border-radius:50%;background:linear-gradient(90deg,#5b86c5,#6b96d5);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 40px rgba(23,59,143,.18)}
.avatar-inner{width:154px;height:154px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden}
.avatar .name{font-weight:800;color:#173b8f}

/* Inputs “pill” */
.field{margin-bottom:14px}
label{color:#0b1324;font-weight:700;margin-bottom:6px;display:block}
.input-like{background:#fff;color:var(--ink);border-radius:999px;height:40px;padding:10px 14px;border:1px solid #cbd5e1;display:flex;align-items:center;gap:10px}
.input-like input{border:0;outline:0;flex:1;min-width:0;background:transparent;color:#0b1324}
.input-like:focus-within{box-shadow:0 0 0 3px rgba(44,79,181,.12);border-color:#b7c5f6}

/* Vista de solo lectura */
.view{display:grid;gap:12px}
.view-row{display:grid;grid-template-columns:220px 1fr;gap:16px;align-items:center;background:linear-gradient(90deg,#f7faff,#eef4ff);border:1px solid #e7eefc;border-radius:14px;padding:10px 14px}
@media (max-width: 600px){ .view-row{grid-template-columns:1fr} }
.view-row .k{font-weight:800;color:#173b8f}
.view-row .v{color:#0b1324}

/* Acciones */
.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:6px}
.btn-primary{background:linear-gradient(90deg,#4d82bc,#5a8fc9);color:#fff;border:none;border-radius:999px;padding:10px 22px;font-weight:800;box-shadow:0 12px 28px rgba(2,6,23,.18);cursor:pointer}
.btn-secondary{background:#fff;border:1px solid #cfd7e6;color:#173b8f;border-radius:999px;padding:10px 22px;font-weight:800}

/* Bloques */
.block{background:linear-gradient(90deg,#f7faff,#eef4ff);border:1px solid #e7eefc;border-radius:16px;padding:14px}
.hint{color:#5b677a;font-size:13px}
`;

export function UserProfilePage({
  username = "juan",
  onBack = () => window.location.assign("/dashboard"),
}) {
  // Perfil original (para cancelar)
  const [original, setOriginal] = useState({
    username,
    email: "juan@empresa.com",
    phone: "+57 300 000 0000",
  });

  // Campos editables (se sincronizan con original al entrar/salir de edición)
  const [form, setForm] = useState({ ...original, password: "" });

  // Estados UI
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSelectFile = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const startEdit = () => {
    setForm({ ...original, password: "" });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setForm({ ...original, password: "" });
    setIsEditing(false);
  };

  const handleSave = () => {
    // Guardar (simulado)
    const { username: u, email, phone } = form;
    setOriginal({ username: u, email, phone });
    setIsEditing(false);        // vuelve a lectura
    setShowSuccessModal(true);  // abre modal de éxito
  };

  // >>> Cambiado: cerrar modal sin salir de la página y dejando modo lectura
  const handleSuccessContinue = () => {
    setShowSuccessModal(false); // cierra modal
    setIsEditing(false);        // asegura lectura
  };

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-secondary" onClick={onBack}>Volver</button>
        </div>
      </header>

      {/* Contenido */}
      <main className="main">
        <div className="wrap">
          <Card className="profile-card">
            <CardHeader className="card-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <CardTitle className="card-title">Mi Perfil</CardTitle>

              {!isEditing ? (
                <button className="btn-primary" onClick={startEdit}>
                  <Pencil className="w-4 h-4 me-2" /> Modificar
                </button>
              ) : (
                <div className="actions" style={{margin:0}}>
                  <button className="btn-primary" onClick={handleSave}>Guardar cambios</button>
                  <button className="btn-secondary" onClick={cancelEdit}>Cancelar</button>
                </div>
              )}
            </CardHeader>

            <CardContent className="card-content">
              <div className="grid">
                {/* Columna Avatar */}
                <section className="avatar">
                  <div className="avatar-ring">
                    <div className="avatar-inner">
                      {profileImage ? (
                        <img src={profileImage} alt="Foto de perfil" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-[72px] h-[72px] text-[#173b8f]" />
                      )}
                    </div>
                  </div>
                  <div className="block" style={{width:"100%", textAlign:"center"}}>
                    <div className="hint">Foto de perfil</div>
                    <div className="actions" style={{justifyContent:"center"}}>
                      <button className="btn-primary" onClick={()=>setShowChangePhotoModal(true)}>
                        <Camera className="w-4 h-4 me-2" /> Cambiar foto
                      </button>
                    </div>
                  </div>
                </section>

                {/* Columna Datos */}
                <section>
                  {!isEditing ? (
                    /* ====== MODO LECTURA ====== */
                    <div className="view">
                      <div className="view-row">
                        <div className="k">Usuario</div>
                        <div className="v">{original.username}</div>
                      </div>
                      <div className="view-row">
                        <div className="k">Correo</div>
                        <div className="v">{original.email}</div>
                      </div>
                      <div className="view-row">
                        <div className="k">Teléfono</div>
                        <div className="v">{original.phone}</div>
                      </div>
                      <div className="view-row">
                        <div className="k">Contraseña</div>
                        <div className="v">••••••••</div>
                      </div>
                    </div>
                  ) : (
                    /* ====== MODO EDICIÓN ====== */
                    <div>
                      {/* Usuario */}
                      <div className="field">
                        <Label htmlFor="user">Usuario</Label>
                        <div className="input-like">
                          <User className="w-4 h-4 text-[#173b8f]" />
                          <input
                            id="user"
                            value={form.username}
                            onChange={(e)=>setForm((p)=>({...p, username: e.target.value}))}
                            placeholder="Tu usuario"
                          />
                        </div>
                      </div>

                      {/* Correo */}
                      <div className="field">
                        <Label htmlFor="email">Correo</Label>
                        <div className="input-like">
                          <Mail className="w-4 h-4 text-[#173b8f]" />
                          <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e)=>setForm((p)=>({...p, email: e.target.value}))}
                            placeholder="correo@empresa.com"
                          />
                        </div>
                      </div>

                      {/* Teléfono */}
                      <div className="field">
                        <Label htmlFor="phone">Teléfono</Label>
                        <div className="input-like">
                          <Phone className="w-4 h-4 text-[#173b8f]" />
                          <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e)=>setForm((p)=>({...p, phone: e.target.value}))}
                            placeholder="+57 300 000 0000"
                          />
                        </div>
                      </div>

                      {/* Contraseña */}
                      <div className="field">
                        <Label htmlFor="pass">Nueva contraseña</Label>
                        <div className="input-like">
                          <Lock className="w-4 h-4 text-[#173b8f]" />
                          <input
                            id="pass"
                            type="password"
                            value={form.password}
                            onChange={(e)=>setForm((p)=>({...p, password: e.target.value}))}
                            placeholder="Mínimo 8 caracteres"
                          />
                        </div>
                        <div className="hint" style={{marginTop:6}}>
                          * Para actualizar, ingresa una nueva contraseña (mínimo 8 caracteres). Si la dejas vacía, no se modifica.
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modales */}
      {showChangePhotoModal && (
        <ChangePhotoModal
          onClose={() => setShowChangePhotoModal(false)}
          onSelectFile={handleSelectFile}
        />
      )}

      {showSuccessModal && (
        <ProfileUpdateSuccessModal onContinue={handleSuccessContinue} />
      )}
    </div>
  );
}

export default UserProfilePage;
