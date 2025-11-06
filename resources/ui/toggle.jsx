"use client";

import * as React from "react";
import { cn } from "./utils";

/** =========================================================================
 *  toggleVariants — reemplazo ligero de cva (sin dependencias)
 *  Usage: toggleVariants({ variant: "outline"|"default", size: "sm"|"default"|"lg", className })
 * ========================================================================= */
function toggleVariants({ variant = "default", size = "default", className } = {}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap";

  const variants = {
    default: "bg-transparent",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-9 px-2 min-w-9",
    sm: "h-8 px-1.5 min-w-8",
    lg: "h-10 px-2.5 min-w-10",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
}

/** =========================================================================
 *  Toggle (React puro, sin Radix)
 *  Props: pressed, defaultPressed, onPressedChange, disabled, variant, size, className, children
 *  Accesible: aria-pressed, teclado (Espacio/Enter)
 * ========================================================================= */
const Toggle = React.forwardRef(function Toggle(
  {
    className,
    variant = "default",
    size = "default",
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    disabled,
    children,
    ...rest
  },
  ref
) {
  const isControlled = controlledPressed !== undefined;
  const [internal, setInternal] = React.useState(!!defaultPressed);
  const pressed = isControlled ? !!controlledPressed : internal;

  const setPressed = React.useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      if (typeof onPressedChange === "function") onPressedChange(next);
    },
    [isControlled, onPressedChange]
  );

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setPressed(!pressed);
  }, [pressed, setPressed, disabled]);

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      aria-pressed={pressed}
      disabled={disabled}
      data-slot="toggle"
      data-state={pressed ? "on" : "off"}
      className={toggleVariants({ variant, size, className })}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!e.defaultPrevented) toggle();
      }}
      onKeyDown={(e) => {
        rest.onKeyDown?.(e);
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
});

export { Toggle, toggleVariants };
