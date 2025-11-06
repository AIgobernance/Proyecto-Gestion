"use client";

import * as React from "react";
import { cn } from "./utils";

const Separator = React.forwardRef(function Separator(
  { className, orientation = "horizontal", decorative = true, ...props },
  ref
) {
  const a11y = decorative
    ? { role: "none", "aria-hidden": true }
    : {
        role: "separator",
        "aria-orientation": orientation === "vertical" ? "vertical" : "horizontal",
      };

  return (
    <div
      ref={ref}
      data-slot="separator-root"
      data-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...a11y}
      {...props}
    />
  );
});

export { Separator };
