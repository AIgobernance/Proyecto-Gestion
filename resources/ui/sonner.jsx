"use client";

import * as React from "react";
import { createPortal } from "react-dom";

// =====================================================================================
// Toaster (React puro) compatible visualmente con tu uso de <Sonner />
// - Sin next-themes ni sonner
// - Acepta props clave: theme ("light" | "dark" | "system"), position, duration
// - Exporta un helper global `toast(message, opts?)`
// - Usa variables CSS como en tu ejemplo: --normal-bg, --normal-text, --normal-border
// =====================================================================================

const DEFAULT_DURATION = 3000;
const EVT_ADD = "__toast:add";
const EVT_DISMISS = "__toast:dismiss";

function systemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * toast API (global, simple)
 * @param {string | React.ReactNode} message
 * @param {{ id?: string, description?: React.ReactNode, duration?: number, variant?: 'default'|'success'|'error'|'warning', action?: { label: string, onClick: () => void } }} [opts]
 */
export function toast(message, opts = {}) {
  const detail = { message, ...opts };
  window.dispatchEvent(new CustomEvent(EVT_ADD, { detail }));
  return detail.id;
}
export function dismiss(id) {
  window.dispatchEvent(new CustomEvent(EVT_DISMISS, { detail: { id } }));
}

function usePortalNode(id = "toaster-root") {
  const [node, setNode] = React.useState(null);
  React.useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    setNode(el);
  }, [id]);
  return node;
}

let _uid = 0; const uid = () => `t_${++_uid}`;

/** Single toast item */
function ToastItem({ t, onClose }) {
  const [leaving, setLeaving] = React.useState(false);
  React.useEffect(() => {
    if (!t.duration) return;
    const id = setTimeout(() => { setLeaving(true); }, t.duration);
    return () => clearTimeout(id);
  }, [t.duration]);

  React.useEffect(() => {
    if (!leaving) return;
    const id = setTimeout(() => onClose(t.id), 150); // pequeño tiempo para animación
    return () => clearTimeout(id);
  }, [leaving, onClose, t.id]);

  const variantRing = t.variant === 'success' ? 'ring-emerald-400/30'
    : t.variant === 'error' ? 'ring-red-400/30'
    : t.variant === 'warning' ? 'ring-amber-400/30'
    : 'ring-ring/30';

  return (
    <div
      role="status"
      data-slot="toast"
      data-variant={t.variant || 'default'}
      className={[
        "bg-[var(--normal-bg)] text-[var(--normal-text)] border border-[var(--normal-border)]",
        "rounded-md shadow-sm ring-2",
        variantRing,
        "px-3 py-2 w-[min(92vw,380px)]",
        "transition-all duration-150",
        leaving ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0",
        "flex items-start gap-3",
      ].join(' ')}
    >
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm leading-5 truncate">{t.message}</div>
        {t.description ? (
          <div className="text-xs opacity-80 mt-0.5 line-clamp-3">{t.description}</div>
        ) : null}
      </div>
      {t.action ? (
        <button
          className="text-xs font-medium underline underline-offset-2"
          onClick={() => { try { t.action.onClick?.(); } finally { onClose(t.id); } }}
        >
          {t.action.label}
        </button>
      ) : null}
      <button
        aria-label="Close"
        className="ml-1 opacity-60 hover:opacity-100"
        onClick={() => onClose(t.id)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/** Container */
function ToastViewport({ toasts, onClose, position }) {
  const posClass = (
    position === 'top-left' ? 'top-4 left-4 items-start' :
    position === 'top-center' ? 'top-4 left-1/2 -translate-x-1/2 items-center' :
    position === 'top-right' ? 'top-4 right-4 items-end' :
    position === 'bottom-left' ? 'bottom-4 left-4 items-start' :
    position === 'bottom-center' ? 'bottom-4 left-1/2 -translate-x-1/2 items-center' :
    /* bottom-right */ 'bottom-4 right-4 items-end'
  );
  return (
    <div className={[
      'pointer-events-none fixed z-[9999] flex flex-col gap-2',
      posClass
    ].join(' ')}>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

export function Toaster({
  className,
  style,
  theme = 'system',
  position = 'bottom-right',
  duration = DEFAULT_DURATION,
  ...props
}) {
  const portal = usePortalNode();
  const [toasts, setToasts] = React.useState([]);
  const resolvedTheme = theme === 'system' ? systemTheme() : theme;

  React.useEffect(() => {
    function onAdd(e) {
      const d = e.detail || {}; // { message, id?, description?, duration?, variant?, action? }
      const id = d.id || uid();
      const t = { id, message: d.message, description: d.description, duration: d.duration ?? duration, variant: d.variant, action: d.action };
      setToasts((prev) => [...prev, t]);
    }
    function onDismiss(e) {
      const id = e.detail?.id;
      setToasts((prev) => id ? prev.filter((t) => t.id !== id) : []);
    }
    window.addEventListener(EVT_ADD, onAdd);
    window.addEventListener(EVT_DISMISS, onDismiss);
    return () => { window.removeEventListener(EVT_ADD, onAdd); window.removeEventListener(EVT_DISMISS, onDismiss); };
  }, [duration]);

  const handleClose = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (!portal) return null;

  const themeVars = resolvedTheme === 'dark'
    ? { '--normal-bg': 'var(--popover)', '--normal-text': 'var(--popover-foreground)', '--normal-border': 'var(--border)' }
    : { '--normal-bg': 'var(--popover)', '--normal-text': 'var(--popover-foreground)', '--normal-border': 'var(--border)' };

  return createPortal(
    <div
      data-slot="toaster"
      className={["toaster group", className].filter(Boolean).join(' ')}
      style={{ ...(themeVars), ...(style || {}) }}
      {...props}
    >
      <ToastViewport toasts={toasts} onClose={handleClose} position={position} />
    </div>,
    portal
  );
}

export default Toaster;