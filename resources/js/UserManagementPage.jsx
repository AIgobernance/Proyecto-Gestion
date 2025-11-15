import React, { useState } from "react";
import imgLogo from "../assets/logo-principal.jpg";
import logoSuccess from "../assets/check-solid.svg";

import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";

import {
  Users,
  UserPlus,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";

/* ===== Estilos coherentes con el resto del proyecto ===== */
const styles = `
:root{
  --brand:#1f3d93; --brand-2:#2c4fb5; --ink:#0b1324;
  --ring:#cfd7e6; --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
.page{min-height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#213e90 0%,#1a2e74 100%)}

/* Header */
.header{background:#fff;border-bottom:1px solid #e5e7eb;height:70px;display:flex;align-items:center;justify-content:space-between;padding:10px 18px}
.header__logo img{height:46px;width:auto;object-fit:contain}
.btn-ghost{background:#fff;border:1px solid var(--ring);color:#173b8f;padding:10px 18px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:800}
.btn-ghost:hover{background:#f6f8fc}

/* Contenido */
.container{max-width:1180px;margin:0 auto;padding:28px 16px}

/* Título y subtítulo */
.page-title{display:flex;align-items:center;gap:10px;color:#0f172a;font-weight:900;font-size:22px;margin:0}
.page-hint{color:#e6eefc;font-weight:600;font-size:15px;margin:6px 0 18px}

/* Tabs (3 secciones) */
.tabs{
  display:flex;align-items:center;justify-content:center;gap:12px;
  margin-bottom:18px;
}
.tab{
  border:1px solid var(--ring); background:#fff; color:#173b8f;
  border-radius:999px; padding:12px 18px; font-weight:800; cursor:pointer;
  display:inline-flex; gap:10px; align-items:center; box-shadow:var(--shadow); min-width:220px; justify-content:center;
}
.tab--active{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border-color:transparent;
}

/* Card contenedora */
.card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow)}
.card__body{padding:18px}

/* Tabla usuarios */
.table{width:100%;border-collapse:separate;border-spacing:0 8px}
.th, .td{padding:12px 14px;text-align:center}
.th{color:#173b8f;font-weight:900;border-bottom:2px solid #d9e4f7}
.tr{background:#f8fbff;border:1px solid #e9edf5;border-radius:14px}
.tr:nth-child(even){background:#ffffff}
.badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-weight:800}
.badge--role{background:#eef4ff;color:#173b8f}
.badge--ok{background:#eaf8ef;color:#10713a}
.badge--ko{background:#ffefef;color:#a11a1a}

/* Formularios */
.form{max-width:880px;margin:0 auto;background:#f6f9ff;border:1px solid #e9edf5;border-radius:18px;padding:18px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media (max-width: 820px){ .row{grid-template-columns:1fr} }
label{color:#0b1324;font-weight:700;margin-bottom:6px;display:block}
.input{background:#fff;border:1px solid #dfe7f4;border-radius:10px;height:40px;padding:8px 12px}

/* Botones */
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border:none;
  border-radius:999px; padding:10px 18px; font-weight:800;
  display:inline-flex;align-items:center;gap:8px; cursor:pointer;
  box-shadow:0 12px 28px rgba(2,6,23,.18);
}
.btn-primary:hover{filter:brightness(1.02)}
.btn-secondary{
  background:#fff;border:1px solid var(--ring);color:#0f172a;border-radius:999px;padding:10px 18px;font-weight:800;display:inline-flex;align-items:center;gap:8px
}

/* Diálogos */
[data-slot="dialog-content"]{
  border-radius:22px !important; border:none !important;
  box-shadow:0 28px 60px rgba(2,6,23,.35) !important;
}
.modal-head{display:flex;align-items:center;gap:12px;background:#f6f9ff;border-bottom:1px solid #e9edf5;padding:14px 18px;border-top-left-radius:22px;border-top-right-radius:22px}
.modal-body{padding:28px 18px}
.modal-card{background:#e8f1ff;border:1px solid #d8e4ff;border-radius:18px;padding:24px;max-width:420px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:16px}
`;

/* ======================== Componente ======================== */
export function UserManagementPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'crear' | 'restablecer'

  const [users, setUsers] = useState([
    { id: 1, usuario: "Angel", rol: "Usuario", estado: "Activo", activado: true },
    { id: 2, usuario: "Mauricio", rol: "Usuario", estado: "Inactivo", activado: false },
  ]);

  // Modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordResetSuccessModal, setShowPasswordResetSuccessModal] = useState(false);

  // Form crear usuario
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

  // Form reset pass
  const [resetPassword, setResetPassword] = useState({
    usuario: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  const handleToggleUser = (userId) => {
    setUsers(users.map(u => u.id === userId
      ? { ...u, activado: !u.activado, estado: !u.activado ? "Activo" : "Inactivo" }
      : u
    ));
  };

  const handleCreateUser = (e) => { e.preventDefault(); setShowSuccessModal(true); };

  const handleContinueAfterSuccess = () => {
    const data = {
      id: users.length + 1,
      usuario: newUser.usuario || `usuario_${users.length + 1}`,
      rol: "Usuario",
      estado: "Activo",
      activado: true,
    };
    setUsers(prev => [...prev, data]);
    setNewUser({
      usuario: "", empresa: "", tipoDocumento: "", numeroDocumento: "",
      sector: "", pais: "", tamanoOrganizacional: "", correo: "",
      telefono: "", crearContrasena: "", confirmarContrasena: "", aceptaPoliticas: false,
    });
    setShowSuccessModal(false);
    setActiveTab("usuarios");
  };

  const handleResetPassword = (e) => { e.preventDefault(); setShowPasswordResetSuccessModal(true); };

  const handleContinueAfterPasswordReset = () => {
    setResetPassword({ usuario: "", nuevaContrasena: "", confirmarContrasena: "" });
    setShowPasswordResetSuccessModal(false);
    setActiveTab("usuarios");
  };

  const handleCancelResetPassword = () => {
    setResetPassword({ usuario: "", nuevaContrasena: "", confirmarContrasena: "" });
  };

  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>
        <h1 className="page-title">
          <Users className="w-5 h-5" style={{color:"#4d82bc"}} />
          Administración de usuarios
        </h1>
        <button className="btn-ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </header>

      {/* Contenido */}
      <main className="container">
        <p className="page-hint">Gestiona altas, edición, estados y restablecimiento de contraseñas</p>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "usuarios" ? "tab--active":""}`}
            onClick={()=>setActiveTab("usuarios")}
          >
            <Users className="w-4 h-4" /> Usuarios
          </button>
          <button
            className={`tab ${activeTab === "crear" ? "tab--active":""}`}
            onClick={()=>setActiveTab("crear")}
          >
            <UserPlus className="w-4 h-4" /> Crear nuevo usuario
          </button>
          <button
            className={`tab ${activeTab === "restablecer" ? "tab--active":""}`}
            onClick={()=>setActiveTab("restablecer")}
          >
            <KeyRound className="w-4 h-4" /> Restablecer contraseña
          </button>
        </div>

        {/* Sección: Usuarios */}
        {activeTab === "usuarios" && (
          <section className="card">
            <div className="card__body">
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Usuario</th>
                    <th className="th">Rol</th>
                    <th className="th">Estado</th>
                    <th className="th">Activar / Desactivar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="tr">
                      <td className="td" style={{fontWeight:800,color:"#0b1324"}}>{u.usuario}</td>
                      <td className="td">
                        <span className="badge badge--role">{u.rol}</span>
                      </td>
                      <td className="td">
                        {u.estado === "Activo" ? (
                          <span className="badge badge--ok">Activo</span>
                        ) : (
                          <span className="badge badge--ko">Inactivo</span>
                        )}
                      </td>
                      <td className="td">
                        <div style={{display:"inline-flex",alignItems:"center",gap:10}}>
                          <span style={{fontWeight:800}}>{u.activado ? "Activo" : "Desactivado"}</span>
                          <Switch checked={u.activado} onCheckedChange={()=>handleToggleUser(u.id)} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Sección: Crear usuario */}
        {activeTab === "crear" && (
          <section className="card">
            <div className="card__body">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <UserPlus className="w-5 h-5" style={{color:"#4d82bc"}} />
                <h2 style={{margin:0,color:"#173b8f",fontWeight:900,fontSize:18}}>Crear usuario</h2>
              </div>

              <form onSubmit={handleCreateUser} className="form">
                <div className="row">
                  <div>
                    <label>Usuario</label>
                    <Input value={newUser.usuario} onChange={(e)=>setNewUser({...newUser,usuario:e.target.value})} className="input" />
                  </div>
                  <div>
                    <label>Empresa</label>
                    <Input value={newUser.empresa} onChange={(e)=>setNewUser({...newUser,empresa:e.target.value})} className="input" />
                  </div>
                </div>

                <div className="row">
                  <div>
                    <label>Tipo de documento</label>
                    <Input value={newUser.tipoDocumento} onChange={(e)=>setNewUser({...newUser,tipoDocumento:e.target.value})} className="input" />
                  </div>
                  <div>
                    <label>Número de documento</label>
                    <Input value={newUser.numeroDocumento} onChange={(e)=>setNewUser({...newUser,numeroDocumento:e.target.value})} className="input" />
                  </div>
                </div>

                <div className="row">
                  <div>
                    <label>Sector</label>
                    <Input value={newUser.sector} onChange={(e)=>setNewUser({...newUser,sector:e.target.value})} className="input" />
                  </div>
                  <div>
                    <label>País</label>
                    <Input value={newUser.pais} onChange={(e)=>setNewUser({...newUser,pais:e.target.value})} className="input" />
                  </div>
                </div>

                <div>
                  <label>Tamaño organizacional</label>
                  <Input value={newUser.tamanoOrganizacional} onChange={(e)=>setNewUser({...newUser,tamanoOrganizacional:e.target.value})} className="input" />
                </div>

                <div className="row">
                  <div>
                    <label>Correo</label>
                    <Input type="email" value={newUser.correo} onChange={(e)=>setNewUser({...newUser,correo:e.target.value})} className="input" />
                  </div>
                  <div>
                    <label>Teléfono</label>
                    <Input type="tel" value={newUser.telefono} onChange={(e)=>setNewUser({...newUser,telefono:e.target.value})} className="input" />
                  </div>
                </div>

                <div className="row">
                  <div>
                    <label>Crear contraseña</label>
                    <Input type="password" value={newUser.crearContrasena} onChange={(e)=>setNewUser({...newUser,crearContrasena:e.target.value})} className="input" />
                  </div>
                  <div>
                    <label>Confirmar contraseña</label>
                    <Input type="password" value={newUser.confirmarContrasena} onChange={(e)=>setNewUser({...newUser,confirmarContrasena:e.target.value})} className="input" />
                  </div>
                </div>

                <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginTop:8}}>
                  <Checkbox
                    id="politicas"
                    checked={newUser.aceptaPoliticas}
                    onCheckedChange={(v)=>setNewUser({...newUser,aceptaPoliticas:v})}
                  />
                  <label htmlFor="politicas" style={{cursor:"pointer",fontWeight:800}}>Acepto Políticas de Protección de Datos</label>
                </div>

                <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:14}}>
                  <button type="submit" className="btn-primary">
                    <CheckCircle2 className="w-4 h-4" /> Crear cuenta
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Sección: Restablecer contraseña */}
        {activeTab === "restablecer" && (
          <section className="card">
            <div className="card__body">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <KeyRound className="w-5 h-5" style={{color:"#4d82bc"}} />
                <h2 style={{margin:0,color:"#173b8f",fontWeight:900,fontSize:18}}>Restablecer contraseña</h2>
              </div>

              <form onSubmit={handleResetPassword} className="form" style={{maxWidth:560}}>
                <div>
                  <label>Usuario</label>
                  <Input value={resetPassword.usuario} onChange={(e)=>setResetPassword({...resetPassword,usuario:e.target.value})} className="input" />
                </div>

                <div>
                  <label>Nueva contraseña</label>
                  <Input type="password" value={resetPassword.nuevaContrasena} onChange={(e)=>setResetPassword({...resetPassword,nuevaContrasena:e.target.value})} className="input" />
                </div>

                <div>
                  <label>Confirmar contraseña</label>
                  <Input type="password" value={resetPassword.confirmarContrasena} onChange={(e)=>setResetPassword({...resetPassword,confirmarContrasena:e.target.value})} className="input" />
                </div>

                <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:14}}>
                  <button type="submit" className="btn-primary">
                    <BadgeCheck className="w-4 h-4" /> Aceptar
                  </button>
                  <button type="button" onClick={handleCancelResetPassword} className="btn-secondary">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* ===== Modal Éxito: Crear Usuario ===== */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-[640px] p-0">
          <DialogTitle className="sr-only">Usuario creado</DialogTitle>
          <DialogDescription className="sr-only">Usuario creado con éxito</DialogDescription>

          <div className="modal-head">
            <img src={logoSuccess} alt="ok" style={{width:40,height:40}} />
            <strong style={{color:"#173b8f"}}>Usuario creado con éxito</strong>
          </div>

          <div className="modal-body">
            <div className="modal-card">
              <p style={{margin:0,fontWeight:900,fontSize:18,color:"#0b1324"}}>¡Listo!</p>
              <p style={{margin:0,color:"#334155",textAlign:"center"}}>El usuario fue agregado a la plataforma.</p>

              <button onClick={handleContinueAfterSuccess} className="btn-secondary" style={{marginTop:6}}>
                Continuar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Modal Éxito: Restablecer Contraseña ===== */}
      <Dialog open={showPasswordResetSuccessModal} onOpenChange={setShowPasswordResetSuccessModal}>
        <DialogContent className="max-w-[640px] p-0">
          <DialogTitle className="sr-only">Contraseña cambiada</DialogTitle>
          <DialogDescription className="sr-only">La contraseña se cambió correctamente</DialogDescription>

          <div className="modal-head">
            <img src={logoSuccess} alt="ok" style={{width:40,height:40}} />
            <strong style={{color:"#173b8f"}}>Contraseña cambiada con éxito</strong>
          </div>

          <div className="modal-body">
            <div className="modal-card">
              <p style={{margin:0,fontWeight:900,fontSize:18,color:"#0b1324"}}>¡Hecho!</p>
              <p style={{margin:0,color:"#334155",textAlign:"center"}}>El usuario ya puede iniciar sesión con su nueva contraseña.</p>

              <button onClick={handleContinueAfterPasswordReset} className="btn-secondary" style={{marginTop:6}}>
                Continuar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
