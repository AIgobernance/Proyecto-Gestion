import React, { useState, useEffect } from "react";
import axios from "axios";
import imgLogo from "../assets/logo-principal.jpg";
import logoSuccess from "../assets/check-solid.svg";

import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ChangePhotoModal } from "./ChangePhotoModal";
import { PasswordResetSuccessModal } from "./PasswordResetSuccessModal";

import {
  Users,
  UserPlus,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  BadgeCheck,
  Camera,
  X,
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
.input{background:#fff;color:#0b1324;border:1px solid #dfe7f4;border-radius:10px;height:40px;padding:8px 12px}
.input::placeholder{color:#64748b}

/* Selects con texto negro */
[data-slot="select-trigger"]{background:#fff;color:#0b1324;border-radius:10px;height:40px;padding:8px 12px;border:1px solid #dfe7f4}
[data-slot="select-content"]{background:#fff;color:#0b1324;border:1px solid #e5e7eb;border-radius:12px;box-shadow:var(--shadow);padding:6px}
[data-slot="select-item"]{color:#0b1324;padding:8px 34px 8px 12px;border-radius:8px;cursor:pointer;position:relative}
[data-slot="select-item"]:hover{background:#eef2ff}
[data-slot="select-item"]::after{content:"";position:absolute;right:10px;top:50%;transform:translateY(-50%);opacity:0;transition:opacity .15s}
[data-slot="select-item"]:hover::after{content:"✓";opacity:1;font-weight:700;color:#0b1324}
[data-slot="select-item"][data-state="checked"]::after{content:"✓";opacity:1;color:#0b1324}

/* Checkbox cuadrado visible */
.chkbox{appearance:none;-webkit-appearance:none;-moz-appearance:none;width:18px;height:18px;border:2px solid var(--brand);border-radius:4px;display:inline-block;position:relative;background:#fff;cursor:pointer;flex-shrink:0;margin-top:2px}
.chkbox:checked{background:var(--brand);border-color:var(--brand)}
.chkbox:checked::after{content:"";position:absolute;left:4px;top:1px;width:5px;height:10px;border:2px solid #fff;border-top:0;border-left:0;transform:rotate(45deg)}
.chkbox:hover{border-color:var(--brand-2)}
.chkbox:focus{outline:2px solid var(--brand-2);outline-offset:2px}

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
  border-radius:24px !important; border:none !important;
  box-shadow:0 24px 64px rgba(2,6,23,.28) !important;
  padding:0 !important;
  position:relative;
  overflow:hidden;
}

`;

/* ======================== Componente ======================== */
export function UserManagementPage({ onBack }) {
  const [activeTab, setActiveTab] = useState("usuarios"); // 'usuarios' | 'crear' | 'restablecer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);

  // Modales
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPasswordResetSuccessModal, setShowPasswordResetSuccessModal] = useState(false);
  const [showUploadPhotoModal, setShowUploadPhotoModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Form crear usuario
  const [newUser, setNewUser] = useState({
    usuario: "",
    empresa: "",
    nit: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Form reset pass
  const [resetPassword, setResetPassword] = useState({
    correo: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  // Cerrar modal de foto cuando cambia el tab
  useEffect(() => {
    if (activeTab !== "usuarios") {
      setShowUploadPhotoModal(false);
      setSelectedUserId(null);
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      const response = await axiosClient.get('/admin/users/list');

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUser = async (userId) => {
    // Obtener el usuario actual para saber su estado
    const usuarioActual = users.find(u => u.id === userId);
    if (!usuarioActual) return;

    // Actualizar el estado local inmediatamente para feedback visual
    const nuevoEstado = !usuarioActual.activado;
    setUsers(users.map(u => u.id === userId
      ? { 
          ...u, 
          activado: nuevoEstado,
          estado: nuevoEstado ? "Activo" : "Inactivo"
        }
      : u
    ));

    setError("");
    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      const response = await axiosClient.put(`/admin/users/${userId}/toggle-status`);

      if (response.status === 200) {
        // Confirmar el estado desde el servidor
        const estadoConfirmado = response.data.activate === 1 || response.data.activate === true;
        setUsers(users.map(u => u.id === userId
          ? { 
              ...u, 
              activado: estadoConfirmado,
              estado: estadoConfirmado ? "Activo" : "Inactivo"
            }
          : u
        ));
      }
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      // Revertir el cambio si falla
      setUsers(users.map(u => u.id === userId
        ? { 
            ...u, 
            activado: usuarioActual.activado,
            estado: usuarioActual.activado ? "Activo" : "Inactivo"
          }
        : u
      ));
      
      if (error.response && error.response.data) {
        setError(error.response.data.message || "Error al cambiar el estado del usuario");
      } else {
        setError("Error al cambiar el estado del usuario");
      }
    }
  };

  const validateForm = () => {
    const e = {};
    if (!newUser.usuario.trim()) e.usuario = "El usuario es requerido";
    if (!newUser.empresa.trim()) e.empresa = "La empresa es requerida";
    if (!newUser.nit.trim()) e.nit = "El NIT es requerido";
    else if (!/^\d{7,15}$/.test(newUser.nit.replace(/\D/g, ""))) e.nit = "Ingrese un NIT válido";
    if (!newUser.tipoDocumento) e.tipoDocumento = "Seleccione un tipo de documento";
    if (!newUser.numeroDocumento.trim()) e.numeroDocumento = "El número de documento es requerido";
    if (!newUser.sector) e.sector = "Seleccione un sector";
    if (!newUser.pais) e.pais = "Seleccione un país";
    if (!newUser.tamanoOrganizacional) e.tamanoOrganizacional = "Seleccione el tamaño organizacional";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newUser.correo.trim()) e.correo = "El correo es requerido";
    else if (!emailRe.test(newUser.correo)) e.correo = "Ingrese un correo válido";
    if (!newUser.telefono.trim()) e.telefono = "El teléfono es requerido";
    else if (newUser.telefono.replace(/\D/g, "").length < 10) e.telefono = "Ingrese un teléfono válido";
    if (!newUser.crearContrasena) e.crearContrasena = "La contraseña es requerida";
    else if (newUser.crearContrasena.length < 8) e.crearContrasena = "La contraseña debe tener al menos 8 caracteres";
    if (!newUser.confirmarContrasena) e.confirmarContrasena = "Confirme su contraseña";
    else if (newUser.crearContrasena !== newUser.confirmarContrasena) e.confirmarContrasena = "Las contraseñas no coinciden";
    if (!newUser.aceptaPoliticas) e.aceptaPoliticas = "Debe aceptar las políticas de protección de datos";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError("Por favor corrija los errores en el formulario.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      const response = await axiosClient.post('/admin/users', {
        usuario: newUser.usuario,
        empresa: newUser.empresa,
        nit: newUser.nit || 'N/A',
        tipoDocumento: newUser.tipoDocumento,
        numeroDocumento: newUser.numeroDocumento,
        sector: newUser.sector,
        pais: newUser.pais,
        tamanoOrganizacional: newUser.tamanoOrganizacional,
        correo: newUser.correo,
        telefono: newUser.telefono,
        crearContrasena: newUser.crearContrasena,
        confirmarContrasena: newUser.confirmarContrasena,
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
        // Recargar la lista de usuarios
        await loadUsers();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          setError(errorMessages.join(', ') || responseData.message || "Error al crear el usuario");
        } else {
          setError(responseData.message || "Error al crear el usuario");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAfterSuccess = () => {
    setNewUser({
      usuario: "", empresa: "", nit: "", tipoDocumento: "", numeroDocumento: "",
      sector: "", pais: "", tamanoOrganizacional: "", correo: "",
      telefono: "", crearContrasena: "", confirmarContrasena: "", aceptaPoliticas: false,
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowSuccessModal(false);
    setActiveTab("usuarios");
    setError("");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validar correo
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetPassword.correo.trim()) {
      setError("El correo es requerido");
      setLoading(false);
      return;
    } else if (!emailRe.test(resetPassword.correo)) {
      setError("Ingrese un correo válido");
      setLoading(false);
      return;
    }

    // Validar que las contraseñas coincidan
    if (resetPassword.nuevaContrasena !== resetPassword.confirmarContrasena) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    // Validar longitud de contraseña
    if (resetPassword.nuevaContrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setLoading(false);
      return;
    }

    try {
      const token = document.head?.querySelector('meta[name="csrf-token"]');
      if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
      }

      const axiosClient = window.axios || axios;
      const response = await axiosClient.post('/admin/users/reset-password', {
        correo: resetPassword.correo,
        nuevaContrasena: resetPassword.nuevaContrasena,
        confirmarContrasena: resetPassword.confirmarContrasena,
      });

      if (response.status === 200) {
        setShowPasswordResetSuccessModal(true);
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      if (error.response && error.response.data) {
        const responseData = error.response.data;
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          setError(errorMessages.join(', ') || responseData.message || "Error al restablecer la contraseña");
        } else {
          setError(responseData.message || "Error al restablecer la contraseña");
        }
      } else {
        setError("Error de conexión. Verifica tu conexión a internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAfterPasswordReset = () => {
    setResetPassword({ correo: "", nuevaContrasena: "", confirmarContrasena: "" });
    setShowPasswordResetSuccessModal(false);
    setActiveTab("usuarios");
  };

  const handleCancelResetPassword = () => {
    setResetPassword({ correo: "", nuevaContrasena: "", confirmarContrasena: "" });
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
              {error && (
                <div style={{padding:12,marginBottom:12,background:"#ffefef",border:"1px solid #a11a1a",borderRadius:8,color:"#a11a1a"}}>
                  {error}
                </div>
              )}
              {loading ? (
                <div style={{textAlign:"center",padding:40,color:"#173b8f"}}>Cargando usuarios...</div>
              ) : users.length === 0 ? (
                <div style={{textAlign:"center",padding:40,color:"#334155"}}>No hay usuarios registrados</div>
              ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="th">Usuario</th>
                    <th className="th">Correo</th>
                    <th className="th">Rol</th>
                    <th className="th">Estado</th>
                    <th className="th">Activar / Desactivar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="tr">
                      <td className="td" style={{fontWeight:800,color:"#0b1324",display:"flex",alignItems:"center",gap:10}}>
                        <div style={{position:"relative"}}>
                          {u.fotoPerfil ? (
                            <img 
                              src={u.fotoPerfil.startsWith('http') ? u.fotoPerfil : `/storage/${u.fotoPerfil}`} 
                              alt={u.usuario}
                              style={{width:32,height:32,borderRadius:"50%",objectFit:"cover"}}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{width:32,height:32,borderRadius:"50%",background:"#4d82bc",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14}}>
                              {u.usuario.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setShowUploadPhotoModal(true);
                            }}
                            style={{
                              position:"absolute",
                              bottom:-2,
                              right:-2,
                              width:20,
                              height:20,
                              borderRadius:"50%",
                              background:"#4d82bc",
                              border:"2px solid #fff",
                              display:"flex",
                              alignItems:"center",
                              justifyContent:"center",
                              cursor:"pointer",
                              padding:0
                            }}
                            title="Cambiar foto"
                          >
                            <Camera className="w-3 h-3" style={{color:"#fff"}} />
                          </button>
                        </div>
                        {u.usuario}
                      </td>
                      <td className="td" style={{color:"#334155"}}>{u.correo}</td>
                      <td className="td">
                        <span className="badge badge--role">{u.rol === 'admin' ? 'Administrador' : 'Usuario'}</span>
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
                          <span style={{
                            fontWeight:800,
                            color:u.activado ? "#10713a" : "#a11a1a",
                            fontSize:14
                          }}>
                            {u.activado ? "Activo" : "Desactivado"}
                          </span>
                          <Switch 
                            checked={u.activado} 
                            onCheckedChange={()=>handleToggleUser(u.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </section>
        )}

        {/* Sección: Crear usuario */}
        {activeTab === "crear" && (
          <section className="card">
            <div className="card__body">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <UserPlus className="w-5 h-5" style={{color:"#4d82bc"}} />
                <h2 style={{margin:0,color:"#0b1324",fontWeight:900,fontSize:18}}>Crear usuario</h2>
              </div>

              {error && (
                <div style={{padding:12,marginBottom:12,background:"#ffefef",border:"1px solid #a11a1a",borderRadius:8,color:"#a11a1a"}}>
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="form">
                {/* Información Personal */}
                <section style={{marginTop:12}}>
                  <h3 style={{color:"#0b1324",margin:"0 0 8px",fontWeight:700,borderBottom:"1px solid #e5e7eb",paddingBottom:6}}>Información Personal</h3>
                <div className="row">
                  <div>
                      <Label htmlFor="usuario" style={{color:"#0b1324"}}>Usuario *</Label>
                      <Input 
                        id="usuario" 
                        value={newUser.usuario} 
                        onChange={(e)=>setNewUser({...newUser,usuario:e.target.value})} 
                        className="input" 
                        placeholder="Ingrese su usuario"
                        aria-invalid={!!errors.usuario}
                      />
                      {errors.usuario && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.usuario}</p>}
                    </div>
                    <div>
                      <Label htmlFor="empresa" style={{color:"#0b1324"}}>Empresa *</Label>
                      <Input 
                        id="empresa" 
                        value={newUser.empresa} 
                        onChange={(e)=>setNewUser({...newUser,empresa:e.target.value})} 
                        className="input" 
                        placeholder="Nombre de su empresa"
                        aria-invalid={!!errors.empresa}
                      />
                      {errors.empresa && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.empresa}</p>}
                    </div>
                  </div>
                  <div className="row" style={{marginTop:12}}>
                  <div>
                      <Label htmlFor="nit" style={{color:"#0b1324"}}>NIT *</Label>
                      <Input 
                        id="nit" 
                        value={newUser.nit} 
                        onChange={(e)=>setNewUser({...newUser,nit:e.target.value})} 
                        className="input" 
                        placeholder="Ej. 900123456"
                        aria-invalid={!!errors.nit}
                      />
                      {errors.nit && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.nit}</p>}
                    </div>
                    <div />
                  </div>
                </section>

                {/* Documentación */}
                <section style={{marginTop:16}}>
                  <h3 style={{color:"#0b1324",margin:"0 0 8px",fontWeight:700,borderBottom:"1px solid #e5e7eb",paddingBottom:6}}>Documentación</h3>
                <div className="row">
                  <div>
                      <Label htmlFor="tipoDocumento" style={{color:"#0b1324"}}>Tipo de Documento *</Label>
                      <Select value={newUser.tipoDocumento} onValueChange={(v)=>setNewUser({...newUser,tipoDocumento:v})}>
                        <SelectTrigger className="input" aria-invalid={!!errors.tipoDocumento}>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                          <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.tipoDocumento && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.tipoDocumento}</p>}
                  </div>
                  <div>
                      <Label htmlFor="numeroDocumento" style={{color:"#0b1324"}}>Número de Documento *</Label>
                      <Input 
                        id="numeroDocumento" 
                        value={newUser.numeroDocumento} 
                        onChange={(e)=>setNewUser({...newUser,numeroDocumento:e.target.value})} 
                        className="input" 
                        placeholder="Número de documento"
                        aria-invalid={!!errors.numeroDocumento}
                      />
                      {errors.numeroDocumento && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.numeroDocumento}</p>}
                    </div>
                  </div>
                </section>

                {/* Organización */}
                <section style={{marginTop:16}}>
                  <h3 style={{color:"#0b1324",margin:"0 0 8px",fontWeight:700,borderBottom:"1px solid #e5e7eb",paddingBottom:6}}>Información Organizacional</h3>
                <div className="row">
                  <div>
                      <Label htmlFor="sector" style={{color:"#0b1324"}}>Sector *</Label>
                      <Select value={newUser.sector} onValueChange={(v)=>setNewUser({...newUser,sector:v})}>
                        <SelectTrigger className="input" aria-invalid={!!errors.sector}>
                          <SelectValue placeholder="Seleccione sector" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Industrial">Industrial</SelectItem>
                          <SelectItem value="Servicios">Servicios</SelectItem>
                          <SelectItem value="Comercial">Comercial</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.sector && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.sector}</p>}
                    </div>
                    <div>
                      <Label htmlFor="pais" style={{color:"#0b1324"}}>País *</Label>
                      <Select value={newUser.pais} onValueChange={(v)=>setNewUser({...newUser,pais:v})}>
                        <SelectTrigger className="input" aria-invalid={!!errors.pais}>
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
                      {errors.pais && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.pais}</p>}
                    </div>
                  </div>

                  <div style={{marginTop:12}}>
                    <Label htmlFor="tamanoOrganizacional" style={{color:"#0b1324"}}>Tamaño Organizacional *</Label>
                    <Select value={newUser.tamanoOrganizacional} onValueChange={(v)=>setNewUser({...newUser,tamanoOrganizacional:v})}>
                      <SelectTrigger className="input" aria-invalid={!!errors.tamanoOrganizacional}>
                        <SelectValue placeholder="Seleccione tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pequeña (1-50 empleados)">Pequeña (1-50 empleados)</SelectItem>
                        <SelectItem value="Mediana (51-250 empleados)">Mediana (51-250 empleados)</SelectItem>
                        <SelectItem value="Grande (251+ empleados)">Grande (251+ empleados)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tamanoOrganizacional && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.tamanoOrganizacional}</p>}
                  </div>
                </section>

                {/* Contacto */}
                <section style={{marginTop:16}}>
                  <h3 style={{color:"#0b1324",margin:"0 0 8px",fontWeight:700,borderBottom:"1px solid #e5e7eb",paddingBottom:6}}>Información de Contacto</h3>
                <div className="row">
                  <div>
                      <Label htmlFor="correo" style={{color:"#0b1324"}}>Correo Electrónico *</Label>
                      <Input 
                        id="correo" 
                        type="email" 
                        value={newUser.correo} 
                        onChange={(e)=>setNewUser({...newUser,correo:e.target.value})} 
                        className="input" 
                        placeholder="correo@ejemplo.com"
                        aria-invalid={!!errors.correo}
                      />
                      {errors.correo && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.correo}</p>}
                  </div>
                  <div>
                      <Label htmlFor="telefono" style={{color:"#0b1324"}}>Teléfono *</Label>
                      <Input 
                        id="telefono" 
                        type="tel" 
                        value={newUser.telefono} 
                        onChange={(e)=>setNewUser({...newUser,telefono:e.target.value})} 
                        className="input" 
                        placeholder="+57 300 000 0000"
                        aria-invalid={!!errors.telefono}
                      />
                      {errors.telefono && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.telefono}</p>}
                    </div>
                  </div>
                </section>

                {/* Seguridad */}
                <section style={{marginTop:16}}>
                  <h3 style={{color:"#0b1324",margin:"0 0 8px",fontWeight:700,borderBottom:"1px solid #e5e7eb",paddingBottom:6}}>Seguridad</h3>
                <div className="row">
                  <div>
                      <Label htmlFor="crearContrasena" style={{color:"#0b1324"}}>Contraseña *</Label>
                      <div style={{position:"relative"}}>
                        <Input 
                          id="crearContrasena" 
                          type={showPassword ? "text" : "password"} 
                          value={newUser.crearContrasena} 
                          onChange={(e)=>setNewUser({...newUser,crearContrasena:e.target.value})} 
                          className="input" 
                          placeholder="Mínimo 8 caracteres"
                          aria-invalid={!!errors.crearContrasena}
                        />
                        <button 
                          type="button" 
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          onClick={()=>setShowPassword((v)=>!v)}
                          style={{position:"absolute",right:10,top:8,background:"transparent",border:0,cursor:"pointer",opacity:.7}}
                        >
                          {showPassword ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.73 21.73 0 0 1 5.06-6.94" />
                              <path d="M23 1 1 23" />
                              <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.crearContrasena && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.crearContrasena}</p>}
                  </div>
                  <div>
                      <Label htmlFor="confirmarContrasena" style={{color:"#0b1324"}}>Confirmar Contraseña *</Label>
                      <div style={{position:"relative"}}>
                        <Input 
                          id="confirmarContrasena" 
                          type={showConfirmPassword ? "text" : "password"} 
                          value={newUser.confirmarContrasena} 
                          onChange={(e)=>setNewUser({...newUser,confirmarContrasena:e.target.value})} 
                          className="input" 
                          placeholder="Repita su contraseña"
                          aria-invalid={!!errors.confirmarContrasena}
                        />
                        <button 
                          type="button" 
                          aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                          onClick={()=>setShowConfirmPassword((v)=>!v)}
                          style={{position:"absolute",right:10,top:8,background:"transparent",border:0,cursor:"pointer",opacity:.7}}
                        >
                          {showConfirmPassword ? (
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.73 21.73 0 0 1 5.06-6.94" />
                              <path d="M23 1 1 23" />
                              <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {newUser.confirmarContrasena && newUser.crearContrasena === newUser.confirmarContrasena && (
                        <p style={{color:"#15803d",display:"flex",gap:6,alignItems:"center",fontSize:12,marginTop:4}}>
                          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Las contraseñas coinciden
                        </p>
                      )}
                      {errors.confirmarContrasena && <p style={{color:"#b91c1c",fontSize:12,marginTop:4}}>{errors.confirmarContrasena}</p>}
                    </div>
                  </div>
                </section>

                {/* Políticas */}
                <section style={{marginTop:16}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:12,color:"#0f172a"}}>
                    <input
                    id="politicas"
                      type="checkbox"
                      className="chkbox"
                    checked={newUser.aceptaPoliticas}
                      onChange={(e)=>setNewUser({...newUser,aceptaPoliticas:e.target.checked})}
                      aria-invalid={!!errors.aceptaPoliticas}
                  />
                    <div style={{flex:1}}>
                      <Label htmlFor="politicas" style={{cursor:"pointer",fontWeight:700,color:"#0b1324",display:"block"}}>
                        <span style={{display:"inline-flex",gap:8,alignItems:"center"}}>
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2">
                            <path d="M12 2l8 3v6c0 5-4 9-8 11C8 20 4 16 4 11V5z" />
                          </svg>
                          Acepto las Políticas de Protección de Datos *
                        </span>
                      </Label>
                      <small style={{display:"block",color:"#334155",marginTop:4,fontSize:13}}>Al marcar esta casilla, acepto que mis datos sean procesados según la política de privacidad.</small>
                      {errors.aceptaPoliticas && <p style={{color:"#b91c1c",fontSize:12,marginTop:6}}>{errors.aceptaPoliticas}</p>}
                    </div>
                </div>
                </section>

                {/* Acciones */}
                <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:18}}>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    <CheckCircle2 className="w-4 h-4" /> 
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
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
                  <Label htmlFor="correoReset" style={{color:"#0b1324"}}>Correo Electrónico *</Label>
                  <Input 
                    id="correoReset"
                    type="email" 
                    value={resetPassword.correo} 
                    onChange={(e)=>setResetPassword({...resetPassword,correo:e.target.value})} 
                    className="input" 
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="nuevaContrasenaReset" style={{color:"#0b1324"}}>Nueva contraseña *</Label>
                  <Input 
                    id="nuevaContrasenaReset"
                    type="password" 
                    value={resetPassword.nuevaContrasena} 
                    onChange={(e)=>setResetPassword({...resetPassword,nuevaContrasena:e.target.value})} 
                    className="input" 
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmarContrasenaReset" style={{color:"#0b1324"}}>Confirmar contraseña *</Label>
                  <Input 
                    id="confirmarContrasenaReset"
                    type="password" 
                    value={resetPassword.confirmarContrasena} 
                    onChange={(e)=>setResetPassword({...resetPassword,confirmarContrasena:e.target.value})} 
                    className="input" 
                    placeholder="Repita la nueva contraseña"
                  />
                </div>

                {error && (
                  <div style={{padding:12,marginTop:12,background:"#ffefef",border:"1px solid #a11a1a",borderRadius:8,color:"#a11a1a"}}>
                    {error}
                  </div>
                )}

                <div style={{display:"flex",justifyContent:"center",gap:10,marginTop:14}}>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={loading}
                  >
                    <BadgeCheck className="w-4 h-4" /> 
                    {loading ? "Procesando..." : "Aceptar"}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelResetPassword} 
                    className="btn-secondary"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* ===== Modal Éxito: Crear Usuario ===== */}
      {showSuccessModal && (
        <>
          <style>{`
            .overlay-user-success{
              position:fixed; inset:0; z-index:60;
              background:rgba(10,15,30,.55);
              backdrop-filter:blur(2.5px);
              display:flex; align-items:center; justify-content:center;
              padding:16px;
            }
            .card-user-success{
              width:100%; max-width:520px;
              background:#fff; border:1px solid #e9edf5;
              border-radius:24px; box-shadow:0 24px 64px rgba(2,6,23,.28);
              position:relative; overflow:hidden;
            }
            .user-success-close{
              position:absolute; top:12px; right:12px;
              width:36px;height:36px;border-radius:999px;border:1px solid #e5e7eb;background:#fff;
              display:inline-flex;align-items:center;justify-content:center; cursor:pointer;
              z-index:10;
              transition:background .15s ease;
            }
            .user-success-close:hover{ background:#f7f9ff }

            .user-success-head{ padding:28px 28px 12px; display:flex;flex-direction:column;align-items:center;gap:14px}
            .user-success-icon{
              width:72px;height:72px;border-radius:50%;
              background:linear-gradient(135deg,#e8fff3,#f5fff9);
              color:#129c55; display:flex;align-items:center;justify-content:center;
              box-shadow:0 10px 26px rgba(18,156,85,.18);
            }
            .user-success-title{margin:0;font-size:24px;font-weight:900;color:#0f172a;text-align:center}
            .user-success-desc{margin:0;font-size:15px;color:#334155;text-align:center}

            .user-success-body{padding:16px 28px 28px}
            .user-success-btn{
              width:100%;
              background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff;
              border-radius:999px; padding:12px 20px; font-weight:800; border:none; cursor:pointer;
              box-shadow:0 12px 30px rgba(2,6,23,.18);
              transition:filter .15s ease;
              display:inline-flex;align-items:center;justify-content:center;gap:8px;
            }
            .user-success-btn:hover{ filter:brightness(1.02) }
          `}</style>

          <div className="overlay-user-success" role="dialog" aria-modal="true" onClick={(e)=>e.stopPropagation()}>
            <div className="card-user-success">
              <button className="user-success-close" aria-label="Cerrar" onClick={handleContinueAfterSuccess}>
                <X className="w-5 h-5" style={{color:"#64748b"}} />
              </button>

              <div className="user-success-head">
                <div className="user-success-icon">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="user-success-title">¡Usuario creado con éxito!</h3>
                <p className="user-success-desc">El usuario fue agregado a la plataforma correctamente.</p>
          </div>

              <div className="user-success-body">
                <button className="user-success-btn" onClick={handleContinueAfterSuccess}>
                  <CheckCircle2 className="w-5 h-5" />
                Continuar
              </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== Modal Éxito: Restablecer Contraseña ===== */}
      {showPasswordResetSuccessModal && (
        <PasswordResetSuccessModal onContinue={handleContinueAfterPasswordReset} />
      )}

      {/* ===== Modal: Cambiar Foto de Perfil ===== */}
      {showUploadPhotoModal && selectedUserId && (
        <ChangePhotoModal
          onClose={() => {
            setShowUploadPhotoModal(false);
            setSelectedUserId(null);
          }}
          onSave={async (file) => {
            try {
              const token = document.head?.querySelector('meta[name="csrf-token"]');
              if (token) {
                axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
              }

              const formData = new FormData();
              formData.append('foto', file);

              const axiosClient = window.axios || axios;
              const response = await axiosClient.post(`/admin/users/${selectedUserId}/upload-photo`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              });

              if (response.status === 200) {
                // Actualizar la foto en la lista local
                setUsers(users.map(u => 
                  u.id === selectedUserId 
                    ? { ...u, fotoPerfil: response.data.foto }
                    : u
                ));
                setShowUploadPhotoModal(false);
                setSelectedUserId(null);
              }
            } catch (error) {
              console.error('Error al subir foto:', error);
              if (error.response && error.response.data) {
                const responseData = error.response.data;
                const errorMessage = responseData.message || "Error al subir la foto";
                setError(errorMessage);
              } else {
                setError("Error de conexión. Verifica tu conexión a internet.");
              }
            }
          }}
        />
      )}
    </div>
  );
}
