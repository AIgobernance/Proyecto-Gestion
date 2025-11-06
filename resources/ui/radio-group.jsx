"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Icono inline (círculo relleno)
======================================================================= */
function CircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

/* =======================================================================
   Contexto
======================================================================= */
const RGContext = React.createContext(null);

/* =======================================================================
   Root
   Props compatibles clave:
   - value / defaultValue / onValueChange
   - disabled
======================================================================= */
function RadioGroup({ className, value: controlled, defaultValue, onValueChange, name, disabled, children, ...props }) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? controlled : uncontrolled;

  const setValue = React.useCallback((v) => {
    if (disabled) return;
    if (!isControlled) setUncontrolled(v);
    onValueChange?.(v);
  }, [isControlled, onValueChange, disabled]);

  const itemsRef = React.useRef([]); // [{ref, value, disabled}]
  const registerItem = React.useCallback((entry) => {
    itemsRef.current = [...itemsRef.current, entry];
    return () => {
      itemsRef.current = itemsRef.current.filter((e) => e !== entry);
    };
  }, []);

  // Foco por teclado (roving tabindex)
  function getEnabledItems() {
    return itemsRef.current.filter((i) => !i.disabled);
  }
  function focusValue(v) {
    const it = itemsRef.current.find((i) => i.value === v && !i.disabled);
    it?.ref?.current?.focus?.();
  }

  const ctx = React.useMemo(() => ({ value, setValue, name, disabled, registerItem, focusValue, getEnabledItems }), [value, name, disabled, registerItem]);

  // Determina tabindex activo: el seleccionado o el primero habilitado
  const activeValue = value ?? getEnabledItems()[0]?.value;

  return (
    <RGContext.Provider value={{ ...ctx, activeValue }}>
      <div
        role="radiogroup"
        aria-disabled={!!disabled}
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        {...props}
      >
        {children}
      </div>
    </RGContext.Provider>
  );
}

/* =======================================================================
   Item
======================================================================= */
function RadioGroupItem({ className, value, id, disabled: itemDisabled, children, ...props }) {
  const ctx = React.useContext(RGContext);
  if (!ctx) throw new Error("RadioGroupItem must be used within <RadioGroup>");
  const { value: groupValue, setValue, name, disabled: groupDisabled, registerItem, activeValue, focusValue, getEnabledItems } = ctx;

  const disabled = groupDisabled || itemDisabled;
  const checked = groupValue === value;

  const ref = React.useRef(null);
  React.useEffect(() => registerItem({ ref, value, disabled }), [registerItem, value, disabled]);

  // tabindex roving
  const tabIndex = checked || activeValue === value ? 0 : -1;

  function select() {
    if (disabled) return;
    setValue(value);
  }

  function onKeyDown(e) {
    if (disabled) return;
    const enabled = getEnabledItems();
    const idx = enabled.findIndex((i) => i.value === (groupValue ?? activeValue));
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = enabled[(idx + 1) % enabled.length];
      setValue(next.value); focusValue(next.value);
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = enabled[(idx - 1 + enabled.length) % enabled.length];
      setValue(prev.value); focusValue(prev.value);
    }
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={!!checked}
      aria-disabled={!!disabled}
      id={id}
      name={name}
      data-slot="radio-group-item"
      ref={ref}
      tabIndex={tabIndex}
      onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) select(); }}
      onKeyDown={(e) => { props.onKeyDown?.(e); onKeyDown(e); }}
      disabled={disabled}
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30",
        "aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        data-slot="radio-group-indicator"
        className="relative flex size-full items-center justify-center"
      >
        {checked ? (
          <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        ) : null}
      </span>
      {children}
    </button>
  );
}

/* =======================================================================
   Exports
======================================================================= */
export { RadioGroup, RadioGroupItem };