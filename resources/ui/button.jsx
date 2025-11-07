import * as React from "react";

export function Button({ className = "", children, style, ...props }) {
  const base = {
    border: "1px solid #cfd7e6",
    background: "#fff",
    color: "#0b1324",
    padding: "10px 18px",
    borderRadius: 26,
    cursor: "pointer",
    fontSize: 15,
    transition: ".15s ease",
  };
  return (
    <button className={`btn ${className}`} style={{ ...base, ...style }} {...props}>
      {children}
    </button>
  );
}
