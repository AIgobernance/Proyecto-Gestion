"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =======================================================================
   Contexto interno
======================================================================= */
const DrawerCtx = React.createContext(null);
function useDrawerCtx() {
  const ctx = React.useContext(DrawerCtx);
  if (!ctx) throw new Error("Must be used within <Drawer>");
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
function usePortalNode(id = "drawer-portal-root") {
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
   - Soporta controlado / no controlado
   - Expone direction: 'bottom' | 'top' | 'left' | 'right'
======================================================================= */
function Drawer({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  direction = "bottom",
  children,
  ...props
}) {
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
    () => ({ open, setOpen, triggerEl, setTriggerEl, direction }),
    [open, setOpen, triggerEl, direction]
  );

  return (
    <DrawerCtx.Provider value={value}>
      <div data-slot="drawer" {...props}>{children}</div>
    </DrawerCtx.Provider>
  );
}

/* =======================================================================
   Trigger
======================================================================= */
function DrawerTrigger({ asChild = false, ...props }) {
  const { setOpen, setTriggerEl } = useDrawerCtx();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (ref.current) setTriggerEl(ref.current);
  }, [setTriggerEl]);

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="drawer-trigger"
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
function DrawerPortal({ children, ...props }) {
  const node = usePortalNode();
  if (!node) return null;
  return createPortal(
    <div data-slot="drawer-portal" {...props}>{children}</div>,
    node
  );
}

/* =======================================================================
   Overlay
======================================================================= */
const DrawerOverlay = React.forwardRef(function DrawerOverlay({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="drawer-overlay"
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
   Content (incluye overlay + portal) con soporte de dirección
======================================================================= */
const DrawerContent = React.forwardRef(function DrawerContent(
  { className, children, ...props },
  ref
) {
  const { open, setOpen, triggerEl, direction } = useDrawerCtx();
  const contentRef = React.useRef(null);
  const mergedRef = React.useCallback(
    (node) => {
      contentRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  // Cerrar con Escape y clic fuera
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      const overlay = document.querySelector('[data-slot="drawer-overlay"]');
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
      if (triggerEl && typeof triggerEl.focus === "function") {
        triggerEl.focus();
      } else if (prev && prev.focus) {
        prev.focus();
      }
    };
  }, [open, triggerEl]);

  if (!open) return null;

  const stateAttr = open ? "open" : "closed";

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay data-state={stateAttr} />
      <div
        ref={mergedRef}
        role="dialog"
        aria-modal="true"
        data-slot="drawer-content"
        data-vaul-drawer-direction={direction}
        tabIndex={-1}
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          // TOP
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          // BOTTOM
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          // RIGHT
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          // LEFT
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          // Animación estado
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        data-state={stateAttr}
        {...props}
      >
        {/* Handle superior para el drawer bottom */}
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </div>
    </DrawerPortal>
  );
});

/* =======================================================================
   Close (botón)
======================================================================= */
const DrawerClose = React.forwardRef(function DrawerClose({ className, ...props }, ref) {
  const { setOpen } = useDrawerCtx();
  return (
    <button
      ref={ref}
      type="button"
      data-slot="drawer-close"
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

/* =======================================================================
   Header / Footer / Title / Description
======================================================================= */
function DrawerHeader({ className, ...props }) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

const DrawerTitle = React.forwardRef(function DrawerTitle({ className, ...props }, ref) {
  return (
    <h2
      ref={ref}
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
});

const DrawerDescription = React.forwardRef(function DrawerDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
});

/* =======================================================================
   Exports
======================================================================= */
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
