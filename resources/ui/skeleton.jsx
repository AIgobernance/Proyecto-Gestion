"use client";

import * as React from "react";
import { cn } from "./utils";

const Skeleton = React.forwardRef(function Skeleton(
  { className, animated = true, radius = "rounded-md", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "bg-accent",
        animated && "animate-pulse",
        radius,
        className
      )}
      {...props}
    />
  );
});

export { Skeleton };
