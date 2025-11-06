"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =========================================================================
   Tooltip (React puro) — sin Radix
   - <TooltipProvider delayDuration={0} />
   - <Tooltip> <TooltipTrigger asChild>…</TooltipTrigger> <TooltipContent side="top" sideOffset={0}>…</TooltipContent> </Tooltip>
   - Accesible: abre con hover/focus, cierra con blur/leave/Escape
   - Portal + posicionamiento sencillo por side/offset + flecha
========================================================================= */

// Slot mínimo para soportar asChild
const Slot = React.forwardRef(function Slot({ children, className, ...rest }, ref) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...rest,
      ref,
      className: cn(children.props.className, className),
    });
  }
  return <span ref={ref} className={className} {...rest} />;
});

const Ctx = React.createContext(null);
const ProviderCtx = React.createContext({ delayDuration: 0 });

function usePortalNode(id = "tooltip-portal-root") {
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

/* ============================== Provider ============================== */
function TooltipProvider({ delayDuration = 0, ...props }) {
  return (
    <ProviderCtx.Provider value={{ delayDuration }}>
      <div data-slot="tooltip-provider" {...props} />
    </ProviderCtx.Provider>
  );
}

/* ================================ Root ================================ */
function Tooltip({ children }) {
  const { delayDuration } = React.useContext(ProviderCtx);
  const [open, setOpen] = React.useState(false);
  const [openByFocus, setOpenByFocus] = React.useState(false);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const timerRef = React.useRef(null);

  const api = React.useMemo(
    () => ({
      open,
      setOpen,
      openByFocus,
      setOpenByFocus,
      triggerRef,
      contentRef,
      delayDuration,
      startOpenTimer() {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(true), delayDuration);
      },
      clearTimer() {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      },
    }),
    [open, openByFocus, delayDuration]
  );

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return <Ctx.Provider value={api}><div data-slot="tooltip">{children}</div></Ctx.Provider>;
}

/* =============================== Trigger ============================== */
function TooltipTrigger({ asChild = false, onMouseEnter, onMouseLeave, onFocus, onBlur, onKeyDown, ...props }) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("TooltipTrigger must be used within <Tooltip>");
  const { triggerRef, setOpen, setOpenByFocus, startOpenTimer, clearTimer } = ctx;
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="tooltip-trigger"
      ref={triggerRef}
      aria-describedby={undefined}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        setOpenByFocus(false);
        startOpenTimer();
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        clearTimer();
        setOpen(false);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        setOpenByFocus(true);
        startOpenTimer();
      }}
      onBlur={(e) => {
        onBlur?.(e);
        clearTimer();
        setOpen(false);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
        }
      }}
      {...props}
    />
  );
}

/* =============================== Content ============================== */
function TooltipContent({
  className,
  side = "top",          // "top" | "right" | "bottom" | "left"
  sideOffset = 0,
  children,
  ...props
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("TooltipContent must be used within <Tooltip>");

  const portal = usePortalNode();
  const { open, setOpen, triggerRef, contentRef } = ctx;
  const [style, setStyle] = React.useState({});
  const [arrowStyle, setArrowStyle] = React.useState({});
  const id = React.useId();

  const updatePosition = React.useCallback(() => {
    const trigger = triggerRef.current;
    const panel = contentRef.current;
    if (!trigger || !panel) return;

    const tr = trigger.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();

    let top = 0, left = 0;
    let arrow = {};

    const offset = Number(sideOffset) || 0;
    const gap = 6 + offset; // pequeño espacio + offset

    if (side === "top") {
      top = tr.top - pr.height - gap;
      left = tr.left + tr.width / 2 - pr.width / 2;
      arrow = { bottom: -5, left: pr.width / 2 - 5 };
    } else if (side === "bottom") {
      top = tr.bottom + gap;
      left = tr.left + tr.width / 2 - pr.width / 2;
      arrow = { top: -5, left: pr.width / 2 - 5 };
    } else if (side === "left") {
      top = tr.top + tr.height / 2 - pr.height / 2;
      left = tr.left - pr.width - gap;
      arrow = { right: -5, top: pr.height / 2 - 5 };
    } else {
      // right
      top = tr.top + tr.height / 2 - pr.height / 2;
      left = tr.right + gap;
      arrow = { left: -5, top: pr.height / 2 - 5 };
    }

    // clamp dentro de viewport con un margen
    const margin = 4;
    const vw = window.innerWidth, vh = window.innerHeight;
    left = Math.min(Math.max(margin, left), vw - pr.width - margin);
    top  = Math.min(Math.max(margin, top),  vh - pr.height - margin);

    setStyle({ position: "fixed", top, left });
    setArrowStyle(arrow);
  }, [side, sideOffset, triggerRef]);

  React.useEffect(() => {
    if (!open) return;
    updatePosition();
    const cb = () => updatePosition();
    window.addEventListener("scroll", cb, true);
    window.addEventListener("resize", cb);
    return () => {
      window.removeEventListener("scroll", cb, true);
      window.removeEventListener("resize", cb);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, setOpen]);

  if (!portal || !open) return null;

  return createPortal(
    <div
      id={id}
      ref={contentRef}
      role="tooltip"
      data-slot="tooltip-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
        className
      )}
      data-side={side}
      style={style}
      {...props}
    >
      {children}
      {/* Arrow */}
      <span
        aria-hidden
        className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] absolute"
        style={arrowStyle}
      />
    </div>,
    portal
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
