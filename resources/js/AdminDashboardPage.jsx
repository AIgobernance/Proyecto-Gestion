import React from "react";
import imgLogo from "../assets/logo-principal.jpg";
import {
  Users, BarChart3, ShieldCheck, Home, LogOut, ChevronRight, UserCircle
} from "lucide-react";

/* ===== Estilos embebidos (coherentes con el resto del proyecto) ===== */
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
.header__right{display:flex;align-items:center;gap:10px}
.badge-admin{display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:1px solid var(--ring);border-radius:999px;padding:8px 12px;color:#173b8f;font-weight:800}
.btn-ghost{background:#fff;border:1px solid var(--ring);color:#0f172a;padding:10px 14px;border-radius:999px;display:inline-flex;align-items:center;gap:8px;font-weight:800}
.btn-ghost:hover{background:#f6f8fc}

/* Contenido */
.wrap{max-width:1120px;margin:0 auto;padding:28px 16px}
.subhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.title{display:flex;align-items:center;gap:10px;color:#0f172a;font-weight:900;font-size:22px;margin:0}
.hint{color:#e6eefc;font-weight:600;font-size:15px;margin:6px 0 0}

/* Grid acciones */
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width: 900px){ .grid{grid-template-columns:1fr} }
.card{background:#fff;border:1px solid #e9edf5;border-radius:18px;box-shadow:var(--shadow);transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease}
.card:hover{transform:translateY(-2px);box-shadow:0 14px 28px rgba(2,6,23,.16);border-color:#d7e5ff}
.card-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #eef2f7}
.card-title{display:flex;align-items:center;gap:10px;color:#173b8f;font-size:18px;margin:0}
.card-body{padding:18px;display:grid;gap:12px}
.row{display:flex;align-items:center;gap:8px;color:#475569;font-size:14px}

/* Botón primario */
.btn-primary{
  background:linear-gradient(90deg,#4d82bc,#5a8fc9); color:#fff; border:none;
  border-radius:999px; padding:10px 16px; font-weight:800;
  display:inline-flex;align-items:center;gap:8px; cursor:pointer;
  box-shadow:0 12px 28px rgba(2,6,23,.18);
}
.btn-primary:hover{filter:brightness(1.02)}


`;

export function AdminDashboardPage({
  username = "Admin",
  onLogout = () => {},
  onGoUsers,
  onGoAnalytics,
  onGoHome,
}) {
  return (
    <div className="page">
      <style>{styles}</style>

      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <img src={imgLogo} alt="AI Governance Evaluator" />
        </div>

        <div className="title" style={{fontSize:18}}>
          <ShieldCheck className="w-5 h-5" style={{color:"#4d82bc"}} />
          Panel administrativo
        </div>

        <div className="header__right">
          <span className="badge-admin">
            <UserCircle className="w-4 h-4" /> {username}
          </span>

          <button
            className="btn-ghost"
            onClick={() => (onGoHome ? onGoHome() : (window.history.length>1?window.history.back():window.location.href="/admin/dashboard"))}
          >
            <Home className="w-4 h-4" /> Inicio
          </button>

          <button className="btn-ghost" onClick={onLogout}>
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="wrap">
        <div className="subhead">
          <div>
            <h2 className="title" style={{color:"#ffffff"}}>
              <Users className="w-5 h-5" style={{color:"#4d82bc"}} />
              Bienvenido, {username}
            </h2>
            <p className="hint">Gestiona usuarios y visualiza métricas del sistema.</p>
          </div>
        </div>

        {/* Acciones principales */}
        <section className="grid">
          {/* Administración de usuarios */}
          <article className="card">
            <div className="card-head">
              <h3 className="card-title">
                <Users className="w-5 h-5" /> Administración de usuarios
              </h3>
            </div>
            <div className="card-body">
              <p className="row">Alta, edición y control de cuentas.</p>
              <p className="row">Restablecimiento de contraseñas y asignación de roles.</p>
              <button className="btn-primary" onClick={() => onGoUsers?.()}>
                Ir a usuarios <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>

          {/* Dashboard general */}
          <article className="card">
            <div className="card-head">
              <h3 className="card-title">
                <BarChart3 className="w-5 h-5" /> Dashboard general
              </h3>
            </div>
            <div className="card-body">
              <p className="row">Métricas globales, actividad reciente y tendencias.</p>
              <p className="row">Exportes y reportes para seguimiento.</p>
              <button className="btn-primary" onClick={() => onGoAnalytics?.()}>
                Ver dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
