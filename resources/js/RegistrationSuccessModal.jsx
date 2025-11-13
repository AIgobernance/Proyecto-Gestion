import React from "react";


export function RegistrationSuccessModal({ onContinue }) {

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
        background: "rgba(0,0,0,0.45)",
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
          padding: "34px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "86px",
            height: "86px",
            background: "#e6f9ed",
            borderRadius: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 18px",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="44"
            height="44"
            stroke="#22c55e"
            fill="none"
            strokeWidth="2.2"
          >
            <polyline points="20 6 10 17 5 12" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          ¡Cuenta creada con éxito!
        </h2>

        <p style={{ fontSize: "15px", color: "#475569", marginBottom: "24px" }}>
          Se creó con éxito la cuenta.
        </p>

        {/* Button */}
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: "14px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            fontWeight: "600",
            fontSize: "15px",
          }}
        >
          Ir al inicio de sesión
        </button>

        {/* Close X */}
        <button
          onClick={onContinue}
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
