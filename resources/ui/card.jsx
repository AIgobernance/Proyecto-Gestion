import * as React from "react";

export function Card({ className = "", children, style, ...props }) {
  const base = {
    background: "#fff",
    border: "1px solid #eef2f8",
    borderRadius: 18,
    boxShadow: "0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04)",
    padding: 22,
    color: "#0f172a",
  };
  return (
    <div className={`card ${className}`} style={{ ...base, ...style }} {...props}>
      {children}
    </div>
  );
}
export function CardHeader({ className = "", ...props }) {
  return <div className={`card-h ${className}`} {...props} />;
}
export function CardTitle({ className = "", ...props }) {
  return <h4 className={`card-t ${className}`} {...props} />;
}
export function CardDescription({ className = "", ...props }) {
  return <p className={`card-d ${className}`} {...props} />;
}
export function CardContent({ className = "", ...props }) {
  return <div className={`card-c ${className}`} {...props} />;
}
export function CardFooter({ className = "", ...props }) {
  return <div className={`card-f ${className}`} {...props} />;
}
