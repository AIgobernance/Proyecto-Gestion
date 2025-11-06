import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "./utils";

/* ---------------- Contexto interno ---------------- */
const AvatarCtx = createContext(null);

export const Avatar = forwardRef(function Avatar(
  { className, children, ...props },
  ref
) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const api = useMemo(
    () => ({
      loaded,
      errored,
      setLoaded,
      setErrored,
    }),
    [loaded, errored]
  );

  return (
    <AvatarCtx.Provider value={api}>
      <div
        ref={ref}
        data-slot="avatar"
        className={cn(
          "relative flex size-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarCtx.Provider>
  );
});

/**
 * AvatarImage
 * - Muestra <img> y notifica estado al contexto
 * - Si ocurre error, el Fallback puede mostrarse
 */
export const AvatarImage = forwardRef(function AvatarImage(
  { className, onLoad, onError, style, alt = "", ...props },
  ref
) {
  const ctx = useContext(AvatarCtx);

  const handleLoad = useCallback(
    (e) => {
      ctx?.setLoaded(true);
      onLoad?.(e);
    },
    [ctx, onLoad]
  );

  const handleError = useCallback(
    (e) => {
      ctx?.setErrored(true);
      onError?.(e);
    },
    [ctx, onError]
  );

  // Si hubo error, ocultamos la imagen para no superponer el fallback
  const hidden = ctx?.errored === true;

  return (
    <img
      ref={ref}
      data-slot="avatar-image"
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={cn("aspect-square size-full object-cover", hidden && "hidden", className)}
      style={{ display: hidden ? "none" : undefined, ...style }}
      {...props}
    />
  );
});

/**
 * AvatarFallback
 * - Muestra un contenido alternativo (iniciales, ícono, etc.)
 * - Prop opcional `delayMs` para esperar antes de mostrarse (como Radix)
 */
export const AvatarFallback = forwardRef(function AvatarFallback(
  { className, delayMs = 0, ...props },
  ref
) {
  const ctx = useContext(AvatarCtx);
  const [delayed, setDelayed] = useState(delayMs > 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const t = setTimeout(() => setDelayed(false), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  // Mostrar fallback si:
  // - hubo error de imagen, o
  // - aún no cargó y ya pasó el delay (o no hay delay)
  const shouldShow = ctx?.errored || (!ctx?.loaded && !delayed);

  if (!shouldShow) return null;

  return (
    <div
      ref={ref}
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full select-none text-sm font-medium",
        className
      )}
      {...props}
    />
  );
});
