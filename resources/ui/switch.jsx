"use client";

import * as React from "react";
import { cn } from "./utils";

// Switch en React puro (JSX) — sin TypeScript
// Props: checked, defaultChecked, onCheckedChange, disabled, className, ...rest
// Accesible: role="switch", aria-checked, teclado (Espacio/Enter)

const Switch = React.forwardRef(function Switch(props, ref) {
  const {
    className,
    checked: controlled,
    defaultChecked,
    onCheckedChange,
    disabled,
    ...rest
  } = props;

  const isControlled = controlled !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const checked = isControlled ? !!controlled : internal;

  const setChecked = React.useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      if (typeof onCheckedChange === "function") onCheckedChange(next);
    },
    [isControlled, onCheckedChange]
  );

  const toggle = React.useCallback(() => {
    if (disabled) return;
    setChecked(!checked);
  }, [checked, setChecked, disabled]);

  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      data-slot="switch"
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={(e) => {
        if (rest.onClick) rest.onClick(e);
        if (!e.defaultPrevented) toggle();
      }}
      onKeyDown={(e) => {
        if (rest.onKeyDown) rest.onKeyDown(e);
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...rest}
    >
      <span
        data-slot="switch-thumb"
        data-state={checked ? "checked" : "unchecked"}
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </button>
  );
});

export { Switch };
