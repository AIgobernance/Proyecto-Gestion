"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Contexto
======================================================================= */
const SAContext = React.createContext(null);
function useSA() {
  const ctx = React.useContext(SAContext);
  if (!ctx) throw new Error("ScrollBar must be used within <ScrollArea>");
  return ctx;
}

/* =======================================================================
   Root + Viewport (con overflow)
======================================================================= */
function ScrollArea({ className, children, ...props }) {
  const viewportRef = React.useRef(null);
  const trackVRef = React.useRef(null);
  const trackHRef = React.useRef(null);
  const thumbVRef = React.useRef(null);
  const thumbHRef = React.useRef(null);

  const [state, setState] = React.useState({
    scrollWidth: 0,
    scrollHeight: 0,
    clientWidth: 0,
    clientHeight: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // Sync sizes & scroll position
  const sync = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setState((s) => ({
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    }));
  }, []);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    const mo = new MutationObserver(sync);
    mo.observe(el, { childList: true, subtree: true, attributes: true, characterData: true });
    const onScroll = () => sync();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const api = React.useMemo(() => ({ viewportRef, trackVRef, trackHRef, thumbVRef, thumbHRef, state, setState, sync }), [state, sync]);

  const showV = state.scrollHeight > state.clientHeight + 1; // tolerancia
  const showH = state.scrollWidth > state.clientWidth + 1;

  return (
    <SAContext.Provider value={api}>
      <div data-slot="scroll-area" className={cn("relative", className)} {...props}>
        <div
          ref={viewportRef}
          data-slot="scroll-area-viewport"
          className={cn(
            "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            // Asegurar scroll y stacking
            "overflow-auto"
          )}
        >
          {children}
        </div>
        {/* Barras */}
        {showV && <ScrollBar orientation="vertical" />}
        {showH && <ScrollBar orientation="horizontal" />}
        {showV && showH ? <Corner /> : null}
      </div>
    </SAContext.Provider>
  );
}

/* =======================================================================
   Thumb helpers (tamaño y posición)
======================================================================= */
function useThumbMetrics(orientation) {
  const { state } = useSA();
  const vertical = orientation === "vertical";
  const content = vertical ? state.scrollHeight : state.scrollWidth;
  const viewport = vertical ? state.clientHeight : state.clientWidth;
  const scrollPos = vertical ? state.scrollTop : state.scrollLeft;
  const trackSize = viewport; // usamos mismo grosor visual

  if (content <= viewport || viewport === 0) return { size: 0, offset: 0 };

  const size = Math.max((viewport / content) * trackSize, 20); // min 20px
  const maxOffset = trackSize - size;
  const offset = Math.min(maxOffset, (scrollPos / (content - viewport)) * maxOffset);
  return { size, offset };
}

/* =======================================================================
   ScrollBar (track + thumb con drag)
======================================================================= */
function ScrollBar({ className, orientation = "vertical", ...props }) {
  const { viewportRef, thumbVRef, thumbHRef, state } = useSA();
  const vertical = orientation === "vertical";
  const thumbRef = vertical ? thumbVRef : thumbHRef;

  const { size, offset } = useThumbMetrics(orientation);

  // Drag
  React.useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;

    let dragging = false;
    let startPos = 0;
    let startScroll = 0;

    function onPointerDown(e) {
      dragging = true;
      thumb.setPointerCapture?.(e.pointerId);
      startPos = vertical ? e.clientY : e.clientX;
      startScroll = vertical ? viewportRef.current.scrollTop : viewportRef.current.scrollLeft;
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const vp = viewportRef.current; if (!vp) return;
      const deltaPx = (vertical ? e.clientY : e.clientX) - startPos;

      const content = vertical ? vp.scrollHeight : vp.scrollWidth;
      const viewport = vertical ? vp.clientHeight : vp.clientWidth;
      const trackSize = viewport;
      const thumbSize = Math.max((viewport / content) * trackSize, 20);
      const maxThumbOffset = trackSize - thumbSize;
      const scrollMax = content - viewport;

      const newThumbOffset = Math.max(0, Math.min(maxThumbOffset, (vertical ? offset : offset) + deltaPx));
      const newScroll = (newThumbOffset / maxThumbOffset) * scrollMax;

      if (vertical) vp.scrollTop = newScroll; else vp.scrollLeft = newScroll;
    }
    function onPointerUp(e) { dragging = false; thumb.releasePointerCapture?.(e.pointerId); }

    thumb.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      thumb.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [thumbRef, viewportRef, offset, orientation]);

  // Wheel sobre el track (clic/drag en track)
  const onTrackPointerDown = (e) => {
    const vp = viewportRef.current; if (!vp) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickPos = orientation === "vertical" ? e.clientY - rect.top : e.clientX - rect.left;
    const isBefore = clickPos < (offset || 0);
    const page = orientation === "vertical" ? vp.clientHeight : vp.clientWidth;
    if (orientation === "vertical") vp.scrollTop += isBefore ? -page : page;
    else vp.scrollLeft += isBefore ? -page : page;
  };

  // Estilos dinámicos del thumb
  const thumbStyle = vertical
    ? { height: `${size}px`, transform: `translateY(${offset}px)` }
    : { width: `${size}px`, transform: `translateX(${offset}px)` };

  return (
    <div
      data-slot="scroll-area-scrollbar"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onTrackPointerDown(e);
      }}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        vertical ? "h-full w-2.5 border-l border-l-transparent absolute right-0 top-0" : "h-2.5 flex-col border-t border-t-transparent absolute left-0 bottom-0 w-full",
        className
      )}
      {...props}
    >
      <div
        ref={thumbRef}
        data-slot="scroll-area-thumb"
        className={cn("bg-border relative flex-1 rounded-full", vertical ? "w-full" : "h-full")}
        style={thumbStyle}
      />
    </div>
  );
}

/* =======================================================================
   Esquina cuando hay ambas barras
======================================================================= */
function Corner() {
  return <div className="absolute right-0 bottom-0 h-2.5 w-2.5" />;
}

/* =======================================================================
   Exports
======================================================================= */
export { ScrollArea, ScrollBar };