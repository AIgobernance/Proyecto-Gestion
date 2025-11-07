import * as React from "react";

export function Badge({ className = "", children, style, ...props }) {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    background: "#edf2ff",
    color: "#2c50b5",
    border: "1px solid #d9e5ff",
  };
  return (
    <span className={`badge ${className}`} style={{ ...base, ...style }} {...props}>
      {children}
    </span>
  );
}
