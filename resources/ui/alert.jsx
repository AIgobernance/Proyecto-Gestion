import * as React from "react";
import { cn } from "./utils";

// clases base (equivalente a lo que generaba cva)
const BASE =
  "relative w-full rounded-lg border px-4 py-3 text-sm grid " +
  "has-[>svg]:grid-cols-[calc(var(--spacing,1rem)*4)_1fr] grid-cols-[0_1fr] " +
  "has-[>svg]:gap-x-3 gap-y-0.5 items-start " +
  "[&>svg]:w-4 [&>svg]:h-4 [&>svg]:translate-y-0.5 [&>svg]:text-current";

const VARIANTS = {
  default: "bg-white text-slate-900 border-slate-200", // ajusta a tu tema (bg-card/text-card-foreground)
  destructive:
    // text-destructive + description algo más tenue
    "bg-white border-red-200 text-red-700 [&_*[data-slot=alert-description]]:text-red-600",
};

export function Alert({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(BASE, VARIANTS[variant] || VARIANTS.default, className)}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight line-clamp-1",
        className
      )}
      {...props}
    />
  );
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm text-slate-600 [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}
