"use client";

import * as React from "react";
import { cn } from "./utils";

/**
 * Props compatibles:
 * - checked, defaultChecked, onCheckedChange
 * - disabled, name, value, id
 * - className
 */
export const Checkbox = React.forwardRef(function Checkbox(
  {
    className,
    checked: controlledChecked,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    name,
    value = "on",
    id,
    ...props
  },
  ref
) {
  const isControlled = controlledChecked !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const checked = isControlled ? !!controlledChecked : uncontrolled;

  const inputRef = React.useRef(null);

  const setChecked = (next) => {
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next);
  };

  const toggle = () => {
    if (disabled) return;
    setChecked(!checked);
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggle();
    }
  };

  // Mantener el <input type="checkbox"> sincronizado (para formularios)
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = checked;
    }
  }, [checked]);

  return (
    <>
      {/* Hidden input para integrarse con <form> */}
      {name ? (
        <input
          ref={inputRef}
          type="checkbox"
          name={name}
          value={value}
          id={id}
          defaultChecked={defaultChecked}
          checked={isControlled ? checked : undefined}
          readOnly // el control real lo hace el "button"
          hidden
        />
      ) : null}

      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-slot="checkbox"
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className={cn(
          // Clases equivalentes a tu Radix Root original
          "peer size-4 shrink-0 rounded-[4px] border shadow-xs outline-none transition-shadow",
          "border bg-input-background dark:bg-input/30",
          "focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary",
          className
        )}
        {...props}
      >
        {/* Indicador */}
        <span
          data-slot="checkbox-indicator"
          aria-hidden="true"
          className={cn(
            "flex h-full w-full items-center justify-center text-current transition-none",
            checked ? "opacity-100" : "opacity-0"
          )}
        >
          {/* CheckIcon inline (reemplazo de lucide-react) */}
          <svg
            viewBox="0 0 24 24"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </button>
    </>
  );
});
