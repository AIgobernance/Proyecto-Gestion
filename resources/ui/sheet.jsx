"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* ================================================================
   Icono inline (X)
================================================================ */
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/* ================================================================
   Helpers
================================================================ */
function usePortalNode(id = "sheet-portal-root") {
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

function getFocusables(container) {
  if (!container) return [];
  const selectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ];
  return Array.from(container.querySelectorAll(selectors.join(",")));
}

/* ================================================================
   Contexto root
================================================================ */
const SheetCtx = React.createContext(null);
function useSheetCtx() {
  const ctx = React.useContext(SheetCtx);
  if (!ctx) throw new Error("Must be used within <Sheet>");
  return ctx;
}

/* ================================================================
   Root (controlado / no controlado)
================================================================ */
function Sheet({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState(null);

  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((next) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const value = React.useMemo(() => ({ open, setOpen, triggerEl, setTriggerEl }), [open, setOpen, triggerEl]);

  return (
    <SheetCtx.Provider value={value}>
      <div data-slot="sheet" {...props}>{children}</div>
    </SheetCtx.Provider>
  );
}

/* ================================================================
   Trigger / Close / Portal / Overlay
================================================================ */
function SheetTrigger({ asChild = false, ...props }) {
  const { setOpen, setTriggerEl } = useSheetCtx();
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) setTriggerEl(ref.current); }, [setTriggerEl]);

  const common = {
    "data-slot": "sheet-trigger",
    onClick: (e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(true); },
    ref,
    ...props,
  };
  if (asChild && React.isValidElement(props.children)) return React.cloneElement(props.children, common);
  return <button type="button" {...common} />;
}

function SheetClose({ asChild = false, ...props }) {
  const { setOpen } = useSheetCtx();
  const common = {
    "data-slot": "sheet-close",
    onClick: (e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(false); },
    ...props,
  };
  if (asChild && React.isValidElement(props.children)) return React.cloneElement(props.children, common);
  return <button type="button" {...common} />;
}

function SheetPortal({ children, ...props }) {
  const node = usePortalNode();
  if (!node) return null;
  return createPortal(<div data-slot="sheet-portal" {...props}>{children}</div>, node);
}

function SheetOverlay({ className, ...props }) {
  const { open } = useSheetCtx();
  return (
    <div
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      data-state={open ? "open" : "closed"}
      {...props}
    />
  );
}

/* ================================================================
   Content (posicionado por side) + foco/escape/click fuera
================================================================ */
function SheetContent({ className, children, side = "right", ...props }) {
  const { open, setOpen, triggerEl } = useSheetCtx();
  const contentRef = React.useRef(null);

  // Cerrar con Escape y clic fuera
  React.useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    function onMouseDown(e) {
      const content = contentRef.current;
      if (!content) return;
      const overlay = document.querySelector('[data-slot="sheet-overlay"]');
      if (overlay && e.target === overlay) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onMouseDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onMouseDown); };
  }, [open, setOpen]);

  // Foco inicial y restaurar al trigger
  React.useEffect(() => {
    if (!open) return;
    const el = contentRef.current; if (!el) return;
    const focusables = getFocusables(el);
    const prev = document.activeElement;
    (focusables[0] || el).focus();
    return () => { if (triggerEl && triggerEl.focus) triggerEl.focus(); else if (prev && prev.focus) prev.focus(); };
  }, [open, triggerEl]);

  if (!open) return null;

  return (
    <SheetPortal>
      <SheetOverlay />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-slot="sheet-content"
        data-state={open ? "open" : "closed"}
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </div>
    </SheetPortal>
  );
}

/* ================================================================
   Header / Footer / Title / Description
================================================================ */
function SheetHeader({ className, ...props }) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}
function SheetFooter({ className, ...props }) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}
const SheetTitle = React.forwardRef(function SheetTitle({ className, ...props }, ref) {
  return <h2 ref={ref} data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />;
});
const SheetDescription = React.forwardRef(function SheetDescription({ className, ...props }, ref) {
  return <p ref={ref} data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
});

/* ================================================================
   Exports
================================================================ */
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};