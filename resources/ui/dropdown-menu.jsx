import * as React from "react";

/** Contenedor (posición relativa) */
export function DropdownMenu({ className = "", children }) {
  return (
    <div className={`dd ${className}`} style={{ position: "relative", display: "inline-block" }}>
      {children}
    </div>
  );
}

/** Trigger: se renderiza tal cual */
export function DropdownMenuTrigger({ children }) {
  return children;
}

/** Contenido del menú (controla open/close y click fuera) */
export function DropdownMenuContent({ className = "", children }) {
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const el = contentRef.current?.previousElementSibling || null;
    triggerRef.current = el;
    if (!el) return;
    const toggle = () => setOpen((v) => !v);
    el.addEventListener("click", toggle);
    return () => el.removeEventListener("click", toggle);
  }, []);

  React.useEffect(() => {
    const onDoc = (e) => {
      if (!open) return;
      if (!contentRef.current) return;
      if (!contentRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const style = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: 180,
    padding: 8,
    background: "#fff",
    border: "1px solid #cfd7e6",
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(16,24,40,.08), 0 2px 6px rgba(16,24,40,.04)",
    zIndex: 50,
    display: open ? "block" : "none",
  };

  return (
    <div ref={contentRef} className={`dd-content ${className}`} style={style}>
      {open ? children : null}
    </div>
  );
}

/** Ítem de menú */
export function DropdownMenuItem({ className = "", onSelect, children }) {
  const base = {
    width: "100%",
    textAlign: "left",
    border: "none",
    background: "transparent",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
  };
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      className={`dd-item ${className}`}
      onClick={() => onSelect && onSelect()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, background: hover ? "#f2f5fb" : "transparent" }}
    >
      {children}
    </button>
  );
}
