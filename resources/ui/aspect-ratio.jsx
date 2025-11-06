
import React, { forwardRef } from "react";

/**
 * <AspectRatio ratio={16/9}> ... </AspectRatio>
 * - Usa CSS `aspect-ratio` si está disponible
 * - Fallback con "padding-top" para navegadores antiguos
 */
export const AspectRatio = forwardRef(function AspectRatio(
  { ratio = 1, className, style, children, ...rest },
  ref
) {
  // Fallback: alto = 100% / (ancho/alto) = 100 / ratio
  const paddingTop = `${100 / (ratio || 1)}%`;

  return (
    <div
      data-slot="aspect-ratio"
      ref={ref}
      className={className}
      style={{
        position: "relative",
        // Si el navegador soporta aspect-ratio, lo aprovecha; si no, el fallback sigue funcionando.
        aspectRatio: ratio, // Ej: 1.777... (16/9)
        ...style,
      }}
      {...rest}
    >
      {/* Fallback para browsers sin aspect-ratio */}
      <span
        aria-hidden="true"
        style={{ display: "block", paddingTop }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
});
