import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";

/* ------- utils ------- */
function cn(...cls) {
  return cls.filter(Boolean).join(" ");
}

/* variantes básicas para botones (puedes reemplazar por tu propio buttonVariants) */
function buttonVariants({ variant = "default" } = {}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/40";
  const map = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  };
  return `${base} ${map[variant]}`;
}

/* ------- Contexto ------- */
const Ctx = createContext(null);

export function AlertDialog({ defaultOpen = false, open: controlledOpen, onOpenChange, children }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (v) => {
      if (!isControlled) setUncontrolledOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  const api = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <Ctx.Provider value={api}><div data-slot="alert-dialog">{children}</div></Ctx.Provider>;
}

/* Trigger */
export function AlertDialogTrigger({ asChild, children, ...rest }) {
  const { setOpen } = useContext(Ctx) || {};
  const onClick = () => setOpen?.(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick, ...rest });
  }
  return (
    <button data-slot="alert-dialog-trigger" onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

/* Portal */
export function AlertDialogPortal({ children }) {
  const [node, setNode] = useState(null);
  useEffect(() => {
    let el = document.getElementById("alert-dialog-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "alert-dialog-portal";
      document.body.appendChild(el);
    }
    setNode(el);
  }, []);
  if (!node) return null;
  return createPortal(children, node);
}

/* Overlay */
export function AlertDialogOverlay({ className, ...rest }) {
  const { open } = useContext(Ctx) || {};
  if (!open) return null;
  return (
    <div
      data-slot="alert-dialog-overlay"
      data-state={open ? "open" : "closed"}
      className={cn(
        "fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[1px] transition-opacity duration-200",
        className
      )}
      {...rest}
    />
  );
}

/* Focus trap muy simple */
function useFocusTrap(active, containerRef) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const root = containerRef.current;
    const selectors =
      'a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(root.querySelectorAll(selectors)).filter(
      (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
    );

    // foco inicial
    const prev = document.activeElement;
    (focusables[0] || root).focus();

    function onKey(e) {
      if (e.key !== "Tab") return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      prev && prev.focus?.();
    };
  }, [active, containerRef]);
}

/* Content (modal) */
export function AlertDialogContent({ className, children, ...rest }) {
  const { open, setOpen } = useContext(Ctx) || {};
  const ref = useRef(null);
  const labelId = useId();
  const descId = useId();

  // cerrar con ESC y click fuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!ref.current) return;
      if (e.target === document.getElementById("alert-dialog-portal")) return;
      // cerrar si se clickea overlay (elemento fuera del contenedor)
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, setOpen]);

  useFocusTrap(open, ref);

  if (!open) return null;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        data-slot="alert-dialog-content"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelId}
        aria-describedby={descId}
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[1001] grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-xl duration-200 sm:max-w-lg",
          "animate-in fade-in-0 zoom-in-95",
          className
        )}
        {...rest}
      >
        {/* Inyectamos ids accesibles a los hijos Title/Description */}
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { __labelId: labelId, __descId: descId })
            : child
        )}
      </div>
    </AlertDialogPortal>
  );
}

/* Header / Footer */
export function AlertDialogHeader({ className, ...rest }) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...rest}
    />
  );
}
export function AlertDialogFooter({ className, ...rest }) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...rest}
    />
  );
}

/* Title / Description */
export function AlertDialogTitle({ className, __labelId, ...rest }) {
  return (
    <h2
      id={__labelId}
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...rest}
    />
  );
}
export function AlertDialogDescription({ className, __descId, ...rest }) {
  return (
    <p
      id={__descId}
      data-slot="alert-dialog-description"
      className={cn("text-sm text-slate-600", className)}
      {...rest}
    />
  );
}

/* Action / Cancel */
export function AlertDialogAction({ className, ...rest }) {
  const { setOpen } = useContext(Ctx) || {};
  return (
    <button
      onClick={() => setOpen?.(false)}
      className={cn(buttonVariants(), className)}
      {...rest}
    />
  );
}
export function AlertDialogCancel({ className, ...rest }) {
  const { setOpen } = useContext(Ctx) || {};
  return (
    <button
      onClick={() => setOpen?.(false)}
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...rest}
    />
  );
}
