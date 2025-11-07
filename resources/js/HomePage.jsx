import React from "react";
import imgLogo1 from "../assets/logo-principal.jpg";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";


/* ====== ICONOS SVG (vanilla) ====== */
const IconGlobe = (props) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
  </svg>
);
const IconShield = (props) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path d="M12 2l8 3v6c0 5-4 9-8 11C8 20 4 16 4 11V5z" />
  </svg>
);
const IconBlocks = (props) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <rect x="3" y="3" width="8" height="8" rx="2" />
    <rect x="13" y="3" width="8" height="8" rx="2" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);
const IconDoc = (props) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

const frameworks = [
  {
    icon: IconGlobe,
    title: "ISO 27090 DIS - 27091",
    desc: "Marcos de evaluación y gestión de riesgos de ciberseguridad de IA.",
    badge: "Seguridad",
  },
  {
    icon: IconShield,
    title: "ISO 23894",
    desc: "Norma internacional que orienta la gestión de riesgos de IA.",
    badge: "Riesgos IA",
  },
  {
    icon: IconBlocks,
    title: "NIS2 / AI Act",
    desc: "NIS2 refuerza la ciberseguridad; el AI Act regula el uso de IA.",
    badge: "UE",
  },
  {
    icon: IconDoc,
    title: "ISO 42001 - 42005",
    desc: "Sistema de gestión para IA responsable; privacidad y evaluación.",
    badge: "Gestión",
  },
];

/* ====== ESTILOS VANILLA ====== */
const styles = `
:root{
  --brand:#1f3d93;       /* azul oscuro botones/encabezados */
  --brand-2:#2c4fb5;     /* azul medio */
  --brand-3:#3d65d4;     /* azul vivo hover */
  --bg:#ffffff;          /* fondo principal */
  --ink:#0b1324;         /* texto */
  --muted:#5b677a;       /* texto secundario */
  --panel:#0b142b;       /* azul muy oscuro para zonas profundas */
  --card:#ffffff;
  --ring:#cfd7e6;
  --shadow:0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04);
}
*{box-sizing:border-box}
html,body,#root{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}
a{color:inherit;text-decoration:none}

.container{max-width:1120px;margin:0 auto;padding:0 24px}

/* Header */
.header{position:sticky;top:0;background:#fff;border-bottom:1px solid #eef1f6;z-index:10}
.header-inner{display:flex;justify-content:space-between;align-items:center;height:72px}
.brand{display:flex;gap:12px;align-items:center}
.brand img{height:36px;border-radius:8px}
.brand h1{font-size:17px;line-height:1.1;margin:0}
.brand small{display:block;color:var(--muted);font-size:11px;margin-top:2px}
.actions{display:flex;gap:12px;align-items:center}
.dd{position:relative;display:inline-block}
.dd-c{position:absolute;top:calc(100% + 8px);right:0;min-width:180px;background:#fff;border:1px solid var(--ring);border-radius:10px;box-shadow:var(--shadow);padding:8px;display:none}
.dd-c.is-open{display:block}
.dd-i{width:100%;text-align:left;border:none;background:transparent;padding:10px 12px;border-radius:8px;font-size:14px;cursor:pointer}
.dd-i:hover{background:#f2f5fb}

/* Botones */
.btn{border:1px solid var(--ring);background:#fff;color:var(--ink);padding:10px 18px;border-radius:26px;cursor:pointer;font-size:15px;transition:.15s ease;box-shadow:0 0 0 0 rgba(0,0,0,0)}
.btn:focus{outline:3px solid #dbe4ff;outline-offset:2px}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:var(--brand);color:#fff;border-color:var(--brand)}
.btn-primary:hover{background:var(--brand-3)}
.btn-outline{background:#fff;color:var(--ink);border-color:#dfe5f2}
.btn-outline:hover{background:#f6f8fc}

/* Hero */
.hero{padding:80px 0 56px}
.hero h2{font-size:64px;letter-spacing:.3px;line-height:1.05;margin:0 0 16px;text-align:center}
.hero p{max-width:840px;margin:0 auto 28px;text-align:center;font-size:20px;line-height:1.7;color:var(--muted)}
.hero-actions{display:flex;gap:18px;justify-content:center}

/* Sección Marcos */
.section-blue{background:linear-gradient(180deg,#213e90 0%, #1a2e74 100%);color:#fff;padding:48px 0 64px;margin-top:60px}
.section-blue h3{font-size:40px;margin:0 0 8px;text-align:center}
.section-blue .sub{color:#cfe0ff;text-align:center;margin:0 auto 28px;max-width:860px;font-size:18px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:22px}
.card{background:var(--card);border-radius:18px;box-shadow:var(--shadow);padding:22px;color:#0f172a;border:1px solid #eef2f8}
.card-h{display:flex;flex-direction:column;align-items:center;text-align:center}
.icon-wrap{height:58px;width:58px;border-radius:18px;background:#eaf0ff;color:#2c50b5;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.card-t{font-size:18px;margin:6px 0 6px}
.card-d{font-size:15px;color:#475569;line-height:1.6;margin:0}
.badge{display:inline-block;margin-top:12px;padding:6px 10px;font-size:12px;border-radius:999px;background:#edf2ff;color:#2c50b5;border:1px solid #d9e5ff;font-weight:600}

/* Footer */
.footer{background:var(--panel);color:#c6d4f7;margin-top:56px;border-top:1px solid #10204b}
.footer-top{padding:44px 0}
.footer-grid{display:grid;grid-template-columns:1.2fr .8fr .8fr;gap:24px}
.footer h5{margin:0 0 10px;font-size:18px;color:#fff}
.f-brand{display:flex;gap:14px;align-items:center}
.f-brand img{height:42px;border-radius:10px}
.footer p, .footer a{font-size:14px;color:#c6d4f7}
.footer a:hover{color:#ffffff}
.footer-links{display:grid;gap:8px}
.cta{display:flex;align-items:center;gap:10px}
.social{display:flex;gap:12px;margin-top:12px}
.social a{display:inline-flex;height:36px;width:36px;border-radius:50%;background:#21409a;align-items:center;justify-content:center;color:#fff;transition:.15s}
.social a:hover{transform:translateY(-1px);background:#2b51c2}
.footer-bottom{border-top:1px solid #162a62;padding:14px 0;text-align:center;font-size:13px}

/* Responsive */
@media (max-width: 1100px){
  .grid{grid-template-columns:repeat(2,1fr)}
  .hero h2{font-size:48px}
}
@media (max-width: 680px){
  .grid{grid-template-columns:1fr}
  .hero h2{font-size:36px}
  .actions{gap:8px}
}
`;

export default function HomePage() {
  const handleRegisterUserClick = () => alert("Registrar Usuario");
  const handleAdminClick = () => alert("Administrador");
  const handleUserClick = () => alert("Iniciar Sesión Usuario");

  return (
    <div>
      <style>{styles}</style>

      {/* ===== Header ===== */}
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <img src={imgLogo1} alt="AI Governance" />
            <div>
              <h1>AI Governance</h1>
              <small>EVALUATOR</small>
            </div>
          </div>

          <div className="actions">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button className="btn-primary">Registrar</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleRegisterUserClick}>Usuario</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleAdminClick}>Administrador</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button className="btn-outline">Inicia sesión</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={handleUserClick}>Usuario</DropdownMenuItem>
                <DropdownMenuItem onSelect={handleAdminClick}>Administrador</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="container">
          <h2>AI Governance Evaluator</h2>
          <p>
            Aplicativo web permite a las organizaciones evaluar su nivel de madurez en gobernanza de
            inteligencia artificial y generar de forma automática una hoja de ruta personalizada para
            cumplir con estándares nacionales e internacionales.
          </p>
          <div className="hero-actions">
            <Button className="btn-primary" onClick={handleRegisterUserClick}>
              Comenzar Evaluación
            </Button>
            <Button className="btn-outline" onClick={handleUserClick}>
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </section>

      {/* ===== Marcos de Referencia ===== */}
      <section className="section-blue">
        <div className="container">
          <h3>Marcos de Referencia Integrados</h3>
          <p className="sub">
            Principales estándares internacionales y nacionales de gobernanza de IA
          </p>

          <div className="grid">
            {frameworks.map((fw, i) => (
              <Card key={i}>
                <CardHeader className="card-h">
                  <div className="icon-wrap">{React.createElement(fw.icon)}</div>
                  <CardTitle className="card-t">{fw.title}</CardTitle>
                  <CardDescription className="card-d">{fw.desc}</CardDescription>
                  <Badge>{fw.badge}</Badge>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div className="container footer-top">
          <div className="footer-grid">
            <div>
              <div className="f-brand">
                <img src={imgLogo1} alt="AI Governance" />
                <div>
                  <h5>AI Governance</h5>
                  <small>EVALUATOR</small>
                </div>
              </div>
              <p style={{marginTop:12}}>
                Plataforma para evaluación de gobernanza de IA con enfoque moderno y responsable.
              </p>
            </div>

            <div>
              <h5>Enlaces Rápidos</h5>
              <div className="footer-links">
                <a href="#">Comenzar Evaluación</a>
                <a href="#">Marcos de Referencia</a>
                <a href="#">Documentación</a>
                <a href="#">Soporte</a>
              </div>
            </div>

            <div>
              <h5>Contacto</h5>
              <div className="cta">
                <Button className="btn-outline">✉️ Enviar Mensaje</Button>
              </div>
              <div className="social">
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="Facebook">f</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2025 AI Governance Evaluator. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
