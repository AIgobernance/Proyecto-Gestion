"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Icono inline (ChevronDown)
======================================================================= */
function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* =======================================================================
   Util: portal opcional (no necesario aquí) y position helper
======================================================================= */
function computePosition(trigger, panel, { sideOffset = 8 } = {}) {
  if (!trigger || !panel) return { top: 0, left: 0, width: 0 };
  const t = trigger.getBoundingClientRect();
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;
  const top = t.bottom + sideOffset + sy;
  const left = t.left + sx;
  return { top, left, width: t.width };
}

/* =======================================================================
   CSS helper (reemplazo simple de cva)
======================================================================= */
function navigationMenuTriggerStyle() {
  return (
    "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium " +
    "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground " +
    "disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground " +
    "data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] " +
    "focus-visible:ring-[3px] focus-visible:outline-1"
  );
}

/* =======================================================================
   Contextos
======================================================================= */
const NavRootCtx = React.createContext(null);
const NavItemCtx = React.createContext(null);

/* =======================================================================
   Root
======================================================================= */
function NavigationMenu({ className, children, viewport = true, ...props }) {
  const [activeTrigger, setActiveTrigger] = React.useState(null); // HTMLElement
  const rootRef = React.useRef(null);

  const value = React.useMemo(
    () => ({ activeTrigger, setActiveTrigger, viewport, rootRef }),
    [activeTrigger, viewport]
  );

  return (
    <NavRootCtx.Provider value={value}>
      <div
        ref={rootRef}
        data-slot="navigation-menu"
        data-viewport={viewport}
        className={cn(
          "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
          className
        )}
        {...props}
      >
        {children}
        {viewport ? <NavigationMenuViewport /> : null}
      </div>
    </NavRootCtx.Provider>
  );
}

/* =======================================================================
   List / Item
======================================================================= */
function NavigationMenuList({ className, ...props }) {
  return (
    <div
      role="menubar"
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props}
    />
  );
}

function NavigationMenuItem({ className, ...props }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const ctx = React.useMemo(() => ({ open, setOpen, triggerRef }), [open]);
  return (
    <NavItemCtx.Provider value={ctx}>
      <div data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
    </NavItemCtx.Provider>
  );
}

/* =======================================================================
   Trigger
======================================================================= */
function NavigationMenuTrigger({ className, children, ...props }) {
  const root = React.useContext(NavRootCtx);
  const item = React.useContext(NavItemCtx);
  const ref = item.triggerRef;

  return (
    <button
      ref={ref}
      type="button"
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      data-state={item.open ? "open" : "closed"}
      aria-expanded={item.open}
      onClick={(e) => {
        props.onClick?.(e);
        const next = !item.open;
        item.setOpen(next);
        if (next) root.setActiveTrigger(ref.current); else root.setActiveTrigger(null);
      }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        if (e.key === "Escape") { item.setOpen(false); root.setActiveTrigger(null); }
        if (e.key === "ArrowDown") { e.preventDefault(); item.setOpen(true); root.setActiveTrigger(ref.current); }
      }}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}

/* =======================================================================
   Content: dos modos
   - viewport=true: contenido se renderiza en el Viewport del root
   - viewport=false: contenido se posiciona bajo el trigger
======================================================================= */
function NavigationMenuContent({ className, children, ...props }) {
  const root = React.useContext(NavRootCtx);
  const item = React.useContext(NavItemCtx);
  const panelRef = React.useRef(null);

  // Modo inline (viewport=false): posición absoluta bajo el trigger
  React.useEffect(() => {
    if (!root.viewport && item.open) {
      const el = panelRef.current;
      const trig = item.triggerRef.current;
      if (!el || !trig) return;
      const { top, left } = computePosition(trig, el, { sideOffset: 6 });
      Object.assign(el.style, { position: "absolute", top: `${top}px`, left: `${left}px` });
      el.setAttribute("data-state", "open");
      return () => el.setAttribute("data-state", "closed");
    }
  }, [root.viewport, item.open]);

  if (root.viewport) {
    // Renderizamos en el viewport compartido usando estado del item
    if (!item.open) return null;
    return (
      <div
        data-slot="navigation-menu-content"
        className={cn(
          "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
          "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",
          "data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
          "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
          "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // viewport=false: panel propio
  if (!item.open) return null;
  return (
    <div
      ref={panelRef}
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* =======================================================================
   Viewport compartido
======================================================================= */
function NavigationMenuViewport({ className, ...props }) {
  const root = React.useContext(NavRootCtx);
  const [rect, setRect] = React.useState({ width: 0 });
  const viewportRef = React.useRef(null);

  // Medir trigger activo para anchura opcional
  React.useEffect(() => {
    const trig = root.activeTrigger;
    if (!trig) return;
    const r = trig.getBoundingClientRect();
    setRect({ width: r.width });
  }, [root.activeTrigger]);

  return (
    <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}> 
      <div
        ref={viewportRef}
        data-slot="navigation-menu-viewport"
        style={{ width: rect.width ? rect.width : undefined }}
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props}
      >
        {/* El contenido activo se inyecta por cada NavigationMenuContent cuando item.open=true */}
      </div>
    </div>
  );
}

/* =======================================================================
   Link e Indicator
======================================================================= */
function NavigationMenuLink({ className, ...props }) {
  return (
    <a
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50",
        "[&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({ className, ...props }) {
  const root = React.useContext(NavRootCtx);
  const [style, setStyle] = React.useState({ left: 0, width: 0, opacity: 0 });

  React.useEffect(() => {
    const el = root.activeTrigger;
    if (!el) { setStyle((s) => ({ ...s, opacity: 0 })); return; }
    const r = el.getBoundingClientRect();
    const parentR = el.offsetParent?.getBoundingClientRect?.() || { left: 0 };
    setStyle({ left: r.left - parentR.left, width: r.width, opacity: 1 });
  }, [root.activeTrigger]);

  return (
    <div
      data-slot="navigation-menu-indicator"
      style={{ position: "absolute", top: "100%", left: style.left, width: style.width, opacity: style.opacity }}
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      data-state={style.opacity ? "visible" : "hidden"}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </div>
  );
}

/* =======================================================================
   Exports
======================================================================= */
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};