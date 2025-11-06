"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =======================================================================
   Contexto interno
======================================================================= */
const PopoverCtx = React.createContext(null);
function usePopoverCtx() {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) throw new Error("Must be used within <Popover>");
  return ctx;
}

/* =======================================================================
   Helpers
======================================================================= */
function usePortalNode(id = "popover-portal-root") {
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

function computePosition(anchor, content, { side = "bottom", align = "center", sideOffset = 4 } = {}) {
  if (!anchor || !content) return { top: 0, left: 0 };
  const a = anchor.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;

  let top = 0, left = 0;
  if (side === "bottom") {
    top = a.bottom + sideOffset;
    if (align === "start") left = a.left; else if (align === "end") left = a.right - c.width; else left = a.left + (a.width - c.width) / 2;
  } else if (side === "top") {
    top = a.top - c.height - sideOffset;
    if (align === "start") left = a.left; else if (align === "end") left = a.right - c.width; else left = a.left + (a.width - c.width) / 2;
  } else if (side === "right") {
    left = a.right + sideOffset;
    if (align === "start") top = a.top; else if (align === "end") top = a.bottom - c.height; else top = a.top + (a.height - c.height) / 2;
  } else if (side === "left") {
    left = a.left - c.width - sideOffset;
    if (align === "start") top = a.top; else if (align === "end") top = a.bottom - c.height; else top = a.top + (a.height - c.height) / 2;
  }

  return { top: top + sy, left: left + sx };
}

function useClickOutside(refs, handler) {
  React.useEffect(() => {
    function onDown(e) {
      const target = e.target;
      const isInside = refs.some(r => r.current && r.current.contains(target));
      if (!isInside) handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [refs, handler]);
}

/* =======================================================================
   Root
======================================================================= */
function Popover({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((next) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const value = React.useMemo(() => ({ open, setOpen, triggerEl, setTriggerEl, anchorEl, setAnchorEl }), [open, triggerEl, anchorEl]);

  return (
    <PopoverCtx.Provider value={value}>
      <div data-slot="popover" {...props}>{children}</div>
    </PopoverCtx.Provider>
  );
}

/* =======================================================================
   Trigger
======================================================================= */
function PopoverTrigger({ asChild = false, ...props }) {
  const { open, setOpen, setTriggerEl } = usePopoverCtx();
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) setTriggerEl(ref.current); }, [setTriggerEl]);

  const common = {
    "data-slot": "popover-trigger",
    "aria-haspopup": "dialog",
    "aria-expanded": open || false,
    onClick: (e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(!open); },
    ref,
    ...props,
  };

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children, common);
  }
  return <button type="button" {...common} />;
}

/* =======================================================================
   Anchor (opcional, si no se usa se posiciona respecto al trigger)
======================================================================= */
function PopoverAnchor({ asChild = false, ...props }) {
  const { setAnchorEl } = usePopoverCtx();
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) setAnchorEl(ref.current); }, [setAnchorEl]);

  const common = { "data-slot": "popover-anchor", ref, ...props };
  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children, common);
  }
  return <span {...common} />;
}

/* =======================================================================
   Content (portal + posicionamiento + accesibilidad)
======================================================================= */
function PopoverContent({ className, align = "center", side = "bottom", sideOffset = 4, children, ...props }) {
  const { open, setOpen, triggerEl, anchorEl } = usePopoverCtx();
  const portal = usePortalNode();
  const ref = React.useRef(null);

  useClickOutside([ref, { current: triggerEl }], () => setOpen(false));

  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  React.useEffect(() => {
    if (!open) return;
    const el = ref.current; if (!el) return;
    const anchor = anchorEl || triggerEl;
    const pos = computePosition(anchor, el, { side, align, sideOffset });
    Object.assign(el.style, { position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` });
    el.dataset.side = side;
    requestAnimationFrame(() => el.setAttribute("data-state", "open"));
    return () => el.setAttribute("data-state", "closed");
  }, [open, triggerEl, anchorEl, side, align, sideOffset]);

  // focus dentro y devolver al trigger al cerrar
  React.useEffect(() => {
    if (!open) return;
    const el = ref.current; if (!el) return;
    const prev = document.activeElement;
    const focusable = el.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable || el).focus();
    return () => { if (prev && prev.focus) prev.focus(); };
  }, [open]);

  if (!open || !portal) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      data-slot="popover-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-hidden",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    portal
  );
}

/* =======================================================================
   Exports
======================================================================= */
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };