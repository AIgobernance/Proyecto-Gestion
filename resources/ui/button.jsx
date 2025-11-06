import * as React from "react";
import { cn } from "./utils";

/** Slot mínimo: aplica className/props/refs al hijo si es ReactElement */
const Slot = React.forwardRef(function Slot({ children, className, ...props }, ref) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(children.props.className, className),
    });
  }
  // Si el child no es un elemento válido, renderiza un botón como fallback
  return <button ref={ref} className={className} {...props} />;
});

/** Clases base (equivalentes a las que generaba cva) */
const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " +
  "text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 " +
  "outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] " +
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

/** Variantes */
const VARIANTS = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline:
    "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
  link: "text-primary underline-offset-4 hover:underline",
};

/** Tamaños */
const SIZES = {
  default: "h-9 px-4 py-2 has-[>svg]:px-3",
  sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
  lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
  icon: "size-9 rounded-md",
};

export const buttonVariants = ({ variant = "default", size = "default", className } = {}) =>
  cn(BASE, VARIANTS[variant] ?? VARIANTS.default, SIZES[size] ?? SIZES.default, className);

export const Button = React.forwardRef(function Button(
  { className, variant = "default", size = "default", asChild = false, ...props },
  ref
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  );
});
