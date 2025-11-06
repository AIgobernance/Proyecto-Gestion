"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Slider (React puro) — compatible con tus clases y data-slots
   - Soporta 1..N thumbs (usa array en value/defaultValue)
   - Controlado / no controlado (onValueChange)
   - Teclado: ← → ↑ ↓ Home End PageUp PageDown
   - Drag en thumb y clic en track (elige el thumb más cercano)
   - Horizontal (por defecto) y vertical
======================================================================= */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function roundToStep(n, step, min) {
  if (!step || step <= 0) return n;
  const r = Math.round((n - min) / step) * step + min;
  const decimals = (step.toString().split(".")[1] || "").length;
  return parseFloat(r.toFixed(decimals));
}

export function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  onValueChange,
  disabled,
  ...props
}) {
  // Inicializa número de thumbs como en tu wrapper original
  const initial = React.useMemo(() => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === "number") return [defaultValue];
    return [min, max];
  }, [value, defaultValue, min, max]);

  const isControlled = Array.isArray(value);
  const [internal, setInternal] = React.useState(initial);
  const values = isControlled ? value : internal;
  const setValues = React.useCallback(
    (next) => {
      const clamped = next.map((v) => clamp(roundToStep(v, step, min), min, max));
      // Mantener orden (no solapar por defecto)
      clamped.sort((a, b) => a - b);
      if (!isControlled) setInternal(clamped);
      onValueChange?.(clamped);
    },
    [isControlled, onValueChange, step, min, max]
  );

  const rootRef = React.useRef(null);
  const trackRef = React.useRef(null);

  const vertical = orientation === "vertical";
  const percent = (v) => ((v - min) / (max - min)) * 100;

  const rangeStart = Math.min(...values);
  const rangeEnd = Math.max(...values);
  const startPct = percent(rangeStart);
  const endPct = percent(rangeEnd);

  function posToValue(clientX, clientY) {
    const track = trackRef.current;
    if (!track) return min;
    const rect = track.getBoundingClientRect();
    let ratio;
    if (vertical) {
      const y = clamp(clientY - rect.top, 0, rect.height);
      // vertical: top -> min, bottom -> max (como Radix)
      ratio = y / rect.height;
    } else {
      const x = clamp(clientX - rect.left, 0, rect.width);
      ratio = x / rect.width;
    }
    const raw = min + ratio * (max - min);
    return clamp(roundToStep(raw, step, min), min, max);
  }

  function nearestThumbIndex(v) {
    let idx = 0;
    let best = Infinity;
    values.forEach((val, i) => {
      const d = Math.abs(val - v);
      if (d < best) { best = d; idx = i; }
    });
    return idx;
  }

  // Dragging
  const dragIndexRef = React.useRef(null);
  const onPointerDownTrack = (e) => {
    if (disabled) return;
    e.preventDefault();
    const v = posToValue(e.clientX, e.clientY);
    const i = nearestThumbIndex(v);
    dragIndexRef.current = i;
    setValues(values.map((x, idx) => (idx === i ? v : x)));
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };
  const onPointerDownThumb = (e, i) => {
    if (disabled) return;
    e.preventDefault();
    dragIndexRef.current = i;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };
  const onPointerMove = (e) => {
    const i = dragIndexRef.current;
    if (i == null) return;
    const v = posToValue(e.clientX, e.clientY);
    const next = values.slice();
    next[i] = v;
    setValues(next);
  };
  const onPointerUp = (e) => {
    dragIndexRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  // Keyboard handlers per thumb
  function onKeyDown(e, i) {
    if (disabled) return;
    let delta = 0;
    const big = step * 10;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    if (e.key === "PageUp") delta = big;
    if (e.key === "PageDown") delta = -big;
    if (e.key === "Home") {
      e.preventDefault();
      setValues(values.map((v, idx) => (idx === i ? min : v)));
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setValues(values.map((v, idx) => (idx === i ? max : v)));
      return;
    }
    if (delta !== 0) {
      e.preventDefault();
      const next = values.slice();
      next[i] = clamp(roundToStep(next[i] + delta, step, min), min, max);
      setValues(next);
    }
  }

  // estilos dinámicos
  const trackClasses = cn(
    "bg-muted relative grow overflow-hidden rounded-full",
    "data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full",
    "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
  );
  const rangeStyle = vertical
    ? { top: `${startPct}%`, height: `${endPct - startPct}%` }
    : { left: `${startPct}%`, width: `${endPct - startPct}%` };

  return (
    <div
      ref={rootRef}
      role="group"
      data-slot="slider"
      data-disabled={disabled ? "" : undefined}
      data-orientation={orientation}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-[disabled]:opacity-50",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <div
        ref={trackRef}
        data-slot="slider-track"
        data-orientation={orientation}
        className={trackClasses}
        onPointerDown={onPointerDownTrack}
      >
        <div
          data-slot="slider-range"
          data-orientation={orientation}
          className={cn("bg-primary absolute", "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")}
          style={rangeStyle}
        />
      </div>

      {values.map((val, i) => {
        const pct = percent(val);
        const thumbStyle = vertical
          ? { transform: `translate(-50%, ${-pct}%)`, bottom: `${pct}%`, left: "50%" }
          : { transform: `translate(-${pct}%, -50%)`, left: `${pct}%`, top: "50%" };
        return (
          <button
            key={i}
            type="button"
            role="slider"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={val}
            aria-orientation={vertical ? "vertical" : "horizontal"}
            aria-disabled={disabled || undefined}
            data-slot="slider-thumb"
            data-orientation={orientation}
            className={cn(
              "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow]",
              "hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            style={{ position: "absolute", ...thumbStyle }}
            disabled={disabled}
            onPointerDown={(e) => onPointerDownThumb(e, i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          />
        );
      })}
    </div>
  );
}

export default Slider;