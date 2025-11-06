"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Icono inline (GripVertical)
======================================================================= */
function GripVerticalIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </svg>
  );
}

/* =======================================================================
   Contexto interno
======================================================================= */
const GroupCtx = React.createContext(null);

/* Panel metadata */
function makePanelMeta({ id, defaultSize, minSize = 10, maxSize = 100 }) {
  return { id, defaultSize, minSize, maxSize, ref: React.createRef(), size: defaultSize };
}

/* =======================================================================
   Root: PanelGroup
   Props soportadas principales:
   - direction: 'horizontal' (por defecto) | 'vertical'
   - onLayout?(sizes: number[])
======================================================================= */
function ResizablePanelGroup({ className, direction = "horizontal", onLayout, children, ...props }) {
  const isVertical = direction === "vertical";
  const containerRef = React.useRef(null);
  const [panels, setPanels] = React.useState([]); // array de metas

  const registerPanel = React.useCallback((meta) => {
    setPanels((prev) => {
      if (prev.find((p) => p.id === meta.id)) return prev;
      return [...prev, meta];
    });
    return () => setPanels((prev) => prev.filter((p) => p.id !== meta.id));
  }, []);

  const setPanelSize = React.useCallback((id, size) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, size } : p)));
  }, []);

  // Normaliza tamaños si no están seteados
  React.useEffect(() => {
    if (panels.length === 0) return;
    const anyUndefined = panels.some((p) => p.size == null);
    if (anyUndefined) {
      const even = 100 / panels.length;
      setPanels((prev) => prev.map((p) => ({ ...p, size: p.size ?? even })));
    }
  }, [panels.length]);

  React.useEffect(() => {
    onLayout?.(panels.map((p) => p.size ?? 0));
  }, [panels, onLayout]);

  const ctx = React.useMemo(() => ({ isVertical, containerRef, panels, setPanelSize, registerPanel }), [isVertical, panels]);

  return (
    <GroupCtx.Provider value={ctx}>
      <div
        ref={containerRef}
        data-slot="resizable-panel-group"
        data-panel-group-direction={isVertical ? "vertical" : "horizontal"}
        className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </GroupCtx.Provider>
  );
}

/* =======================================================================
   Panel (usa porcentaje como flex-basis)
======================================================================= */
function ResizablePanel({ id, defaultSize, minSize = 10, maxSize = 100, className, style, ...props }) {
  const ctx = React.useContext(GroupCtx);
  if (!ctx) throw new Error("ResizablePanel must be inside ResizablePanelGroup");
  const metaRef = React.useRef(makePanelMeta({ id, defaultSize, minSize, maxSize }));

  React.useEffect(() => ctx.registerPanel(metaRef.current), [ctx.registerPanel]);

  const size = metaRef.current.size ?? defaultSize;
  const basis = size != null ? `${size}%` : undefined;

  return (
    <div
      ref={metaRef.current.ref}
      data-slot="resizable-panel"
      style={{ flexBasis: basis, flexGrow: 0, flexShrink: 0, ...(style || {}) }}
      className={cn(className)}
      {...props}
    />
  );
}

/* =======================================================================
   Handle (arrastra entre paneles adyacentes)
======================================================================= */
function ResizableHandle({ withHandle, className, ...props }) {
  const { isVertical, containerRef, panels, setPanelSize } = React.useContext(GroupCtx) || {};
  const ref = React.useRef(null);

  const onPointerDown = (e) => {
    if (!containerRef?.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    // Determinar qué dos paneles rodean a este handle
    // Estrategia: buscar panel DOM inmediato anterior y siguiente dentro del container
    const handles = Array.from(containerRef.current.querySelectorAll('[data-slot="resizable-handle"]'));
    const idx = handles.indexOf(ref.current);
    if (idx === -1) return;

    const domPanels = Array.from(containerRef.current.querySelectorAll('[data-slot="resizable-panel"]'));
    // En layout alternado Panel,Handle,Panel,Handle,Panel... => panel izquierdo: idx, derecho: idx+1
    const leftEl = domPanels[idx];
    const rightEl = domPanels[idx + 1];
    if (!leftEl || !rightEl) return;

    const leftMeta = panels.find((p) => p.ref.current === leftEl);
    const rightMeta = panels.find((p) => p.ref.current === rightEl);
    if (!leftMeta || !rightMeta) return;

    const start = { x: e.clientX, y: e.clientY, leftSize: leftMeta.size, rightSize: rightMeta.size };

    function onMove(ev) {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      const deltaPx = isVertical ? dy : dx;
      const totalPx = isVertical ? containerRect.height : containerRect.width;
      const deltaPct = (deltaPx / totalPx) * 100;

      let nextLeft = clamp(start.leftSize + deltaPct, leftMeta.minSize, leftMeta.maxSize);
      let nextRight = clamp(start.rightSize - deltaPct, rightMeta.minSize, rightMeta.maxSize);

      // Recalcular delta real si pegamos límites
      const appliedDelta = nextLeft - start.leftSize;
      nextRight = start.rightSize - appliedDelta;

      // Evitar NaN o negativos por límites
      nextLeft = clamp(nextLeft, leftMeta.minSize, leftMeta.maxSize);
      nextRight = clamp(nextRight, rightMeta.minSize, rightMeta.maxSize);

      setPanelSize(leftMeta.id, nextLeft);
      setPanelSize(rightMeta.id, nextRight);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={isVertical ? "horizontal" : "vertical"}
      tabIndex={0}
      onPointerDown={onPointerDown}
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </div>
  );
}

/* utils */
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

/* =======================================================================
   Exports
======================================================================= */
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };