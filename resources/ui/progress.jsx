"use client";

import * as React from "react";
import { cn } from "./utils";

function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max));
}

function Progress({ className, value, max = 100, ...props }) {
  const pct = typeof value === "number" ? clamp(value, 0, max) : undefined;
  const translate = (() => {
    if (pct == null) return "translateX(-100%)"; // indeterminate base
    const percent = (pct / max) * 100;
    return `translateX(-${100 - percent}%)`;
  })();

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={pct == null ? undefined : pct}
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "bg-primary h-full w-full flex-1 transition-all",
          pct == null && "animate-pulse" // fallback indeterminate animation
        )}
        style={{ transform: translate }}
      />
    </div>
  );
}

export { Progress };