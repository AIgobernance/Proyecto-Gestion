"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =======================================================================
   Contexto interno
======================================================================= */
const DialogCtx = React.createContext(null);
function useDialogCtx() {
  const ctx = React.useContext(DialogCtx);
  if (!ctx) throw new Error("Must be used within <Dialog>");
  return ctx;
}

/* =======================================================================
   Helpers
======================================================================= */
// Slot mínimo para soportar asChild
const Slot = React.forwardRef(function Slot({ children, className, ...rest }, ref) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...rest,
      ref,
      className: cn(children.props.className, className),
    });
  }
  return <button ref={ref} className={className} {...rest} />;
});

// Crea/usa un nodo portal único
function usePortalNode(id = "dialog-portal-root") {
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

// Encuentra focusables en un contenedor
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

/* =======================================================================
   Root
======================================================================= */
function Dialog({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState(null);

  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (next) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({ open, setOpen, triggerEl, setTriggerEl }),
    [open, setOpen, triggerEl]
  );

  return (
    <DialogCtx.Provider value={value}>
      <div data-slot="dialog" {...props}>{children}</div>
    </DialogCtx.Provider>
  );
}

/* =======================================================================
   Trigger
======================================================================= */
function DialogTrigger({ asChild = false, ...props }) {
  const { setOpen, setTriggerEl } = useDialogCtx();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) setTriggerEl(ref.current);
  }, [setTriggerEl]);

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="dialog-trigger"
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) setOpen(true);
      }}
      ref={ref}
      {...props}
    />
  );
}

/* =======================================================================
   Portal
======================================================================= */
function DialogPortal({ children, ...props }) {
  const node = usePortalNode();
  if (!node) return null;
  return createPortal(
    <div data-slot="dialog-portal" {...props}>{children}</div>,
    node
  );
}

/* =======================================================================
   Overlay
======================================================================= */
const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});

/* =======================================================================
   Content (incluye overlay + portal)
======================================================================= */
const DialogContent = React.forwardRef(function DialogContent(
  { className, children, ...props },
  ref
) {
  const { open, setOpen, triggerEl } = useDialogCtx();
  const contentRef = React.useRef(null);
  const mergedRef = React.useCallback((node) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // Cerrar con Escape y clic fuera
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      const overlay = document.querySelector('[data-slot="dialog-overlay"]');
      if (overlay && e.target === overlay) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, setOpen]);

  // Focus management: foco inicial dentro y restaurar al trigger al cerrar
  React.useEffect(() => {
    if (!open) return;
    const container = contentRef.current;
    if (!container) return;
    const focusables = getFocusables(container);
    const prev = document.activeElement;
    (focusables[0] || container).focus();

    return () => {
      // al cerrar, devolver el foco al trigger si existe
      if (triggerEl && typeof triggerEl.focus === "function") {
        triggerEl.focus();
      } else if (prev && prev.focus) {
        prev.focus();
      }
    };
  }, [open, triggerEl]);

  if (!open) return null;

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay data-state={open ? "open" : "closed"} />
      <div
        ref={mergedRef}
        role="dialog"
        aria-modal="true"
        data-slot="dialog-content"
        tabIndex={-1}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        data-state={open ? "open" : "closed"}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
    </DialogPortal>
  );
});

/* =======================================================================
   Close (botón)
======================================================================= */
const DialogClose = React.forwardRef(function DialogClose({ className, ...props }, ref) {
  const { setOpen } = useDialogCtx();
  return (
    <button
      ref={ref}
      type="button"
      data-slot="dialog-close"
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) setOpen(false);
      }}
      className={cn(
        "ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
});

/* Icono X inline */
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

/* =======================================================================
   Header / Footer / Title / Description
======================================================================= */
function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <h2
      ref={ref}
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

/* =======================================================================
   Exports
======================================================================= */
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
