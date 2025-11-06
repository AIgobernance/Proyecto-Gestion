"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =======================================================================
   Contexto interno
======================================================================= */
const HoverCardCtx = React.createContext(null);
function useHoverCardCtx() {
  const ctx = React.useContext(HoverCardCtx);
  if (!ctx) throw new Error("Must be used within <HoverCard>");
  return ctx;
}

/* =======================================================================
   Portal util
======================================================================= */
function usePortalNode(id = "hovercard-portal-root") {
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

/* =======================================================================
   Position helpers
======================================================================= */
function computePosition(trigger, content, { side = "top", align = "center", sideOffset = 4 } = {}) {
  if (!trigger || !content) return { top: 0, left: 0 };
  const t = trigger.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;

  // horizontal alignment for top/bottom; vertical alignment for left/right
  const alignStart = align === "start";
  const alignEnd = align === "end";

  let top = 0, left = 0;
  if (side === "top") {
    top = t.top - c.height - sideOffset;
    if (alignStart) left = t.left; else if (alignEnd) left = t.right - c.width; else left = t.left + (t.width - c.width) / 2;
  } else if (side === "bottom") {
    top = t.bottom + sideOffset;
    if (alignStart) left = t.left; else if (alignEnd) left = t.right - c.width; else left = t.left + (t.width - c.width) / 2;
  } else if (side === "left") {
    left = t.left - c.width - sideOffset;
    if (alignStart) top = t.top; else if (alignEnd) top = t.bottom - c.height; else top = t.top + (t.height - c.height) / 2;
  } else if (side === "right") {
    left = t.right + sideOffset;
    if (alignStart) top = t.top; else if (alignEnd) top = t.bottom - c.height; else top = t.top + (t.height - c.height) / 2;
  }

  return { top: top + sy, left: left + sx };
}

/* =======================================================================
   Root
======================================================================= */
function HoverCard({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState(null);
  const hoverTimeout = React.useRef(null);

  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((next) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const value = React.useMemo(() => ({ open, setOpen, triggerEl, setTriggerEl, hoverTimeout }), [open, triggerEl]);

  return (
    <HoverCardCtx.Provider value={value}>
      <div data-slot="hover-card" {...props}>{children}</div>
    </HoverCardCtx.Provider>
  );
}

/* =======================================================================
   Trigger
======================================================================= */
function HoverCardTrigger({ asChild = false, ...props }) {
  const { setOpen, setTriggerEl, hoverTimeout } = useHoverCardCtx();
  const ref = React.useRef(null);

  React.useEffect(() => { if (ref.current) setTriggerEl(ref.current); }, [setTriggerEl]);

  const common = {
    "data-slot": "hover-card-trigger",
    onMouseEnter: (e) => { props.onMouseEnter?.(e); clearTimeout(hoverTimeout.current); setOpen(true); },
    onMouseLeave: (e) => { props.onMouseLeave?.(e); hoverTimeout.current = setTimeout(() => setOpen(false), 100); },
    ref,
    ...props,
  };

  if (asChild && React.isValidElement(props.children)) {
    return React.cloneElement(props.children, common);
  }
  return <button type="button" {...common} />;
}

/* =======================================================================
   Content (portal + posicionamiento + hover delay)
======================================================================= */
function HoverCardContent({ className, align = "center", side = "top", sideOffset = 4, children, ...props }) {
  const { open, setOpen, triggerEl, hoverTimeout } = useHoverCardCtx();
  const portal = usePortalNode();
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const el = ref.current; if (!el || !triggerEl) return;
    const pos = computePosition(triggerEl, el, { side, align, sideOffset });
    Object.assign(el.style, { position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` });
    el.dataset.side = side;
    requestAnimationFrame(() => el.setAttribute("data-state", "open"));
    return () => el.setAttribute("data-state", "closed");
  }, [open, triggerEl, side, align, sideOffset]);

  if (!open || !portal) return null;

  const handlers = {
    onMouseEnter: (e) => { props.onMouseEnter?.(e); clearTimeout(hoverTimeout.current); setOpen(true); },
    onMouseLeave: (e) => { props.onMouseLeave?.(e); hoverTimeout.current = setTimeout(() => setOpen(false), 100); },
  };

  return createPortal(
    <div data-slot="hover-card-portal">
      <div
        ref={ref}
        role="dialog"
        tabIndex={-1}
        data-slot="hover-card-content"
        className={cn(
          "bg-popover text-popover-foreground z-50 w-64 rounded-md border p-4 shadow-md outline-hidden",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...handlers}
        {...props}
      >
        {children}
      </div>
    </div>,
    portal
  );
}

/* =======================================================================
   Exports
======================================================================= */
export { HoverCard, HoverCardTrigger, HoverCardContent };