import React from "react";
import imgLogo from "../assets/logo-principal.jpg";



export function ActivationLinkModal({ onAccept, onBack }) {

  React.useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "auto";
  };
}, []);


  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "blur",
        backdropFilter: "blur(3px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "460px",
          background: "white",
          borderRadius: "22px",
          padding: "32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "82px",
            height: "82px",
            background: "#eef4ff",
            borderRadius: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="42"
            height="42"
            stroke="#2a4fb8"
            fill="none"
            strokeWidth="1.7"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "6px",
          }}
        >
          Enlace de Activación
        </h2>

        <p style={{ fontSize: "15px", color: "#475569", marginBottom: "14px" }}>
          Verifique su correo electrónico para activar la cuenta.
        </p>

        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "22px" }}>
          ¿No llegó el correo? Puede reenviar el enlace.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => alert("Se reenvió el enlace (simulado).")}
            style={{
              padding: "10px 22px",
              borderRadius: "14px",
              border: "1px solid #cbd5e1",
              background: "white",
              fontWeight: "500",
            }}
          >
            Enviar nuevamente
          </button>

          <button
            onClick={onAccept}
            style={{
              padding: "10px 22px",
              borderRadius: "14px",
              background: "#2f5ac7",
              color: "white",
              fontWeight: "600",
            }}
          >
            Aceptar
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            right: "14px",
            top: "14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
