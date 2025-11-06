"use client";

import * as React from "react";
import { cn } from "./utils";
import { toggleVariants } from "./toggle";

/* Contexto para heredar variant/size y coordinar estado/registro */
const ToggleGroupContext = React.createContext(null);
function useToggleGroup() {
  const ctx = React.useContext(ToggleGroupContext);
  if (!ctx) throw new Error("ToggleGroupItem debe usarse dentro de <ToggleGroup>");
  return ctx;
}

function ToggleGroup({
  className,
  variant,
  size,
  type = "single",              // "single" | "multiple"
  value,                        // string | string[]
  defaultValue,                 // string | string[]
  onValueChange,
  orientation = "horizontal",   // "horizontal" | "vertical"
  disabled,
  children,
  ...props
}) {
  const isSingle = type !== "multiple";

  const initial = React.useMemo(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return isSingle ? "" : [];
  }, [value, defaultValue, isSingle]);

  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(initial);
  const current = isControlled ? value : internal;

  const setCurrent = React.useCallback(
    (next) => {
      if (!isControlled) setInternal(next);
      if (onValueChange) onValueChange(next);
    },
    [isControlled, onValueChange]
  );

  // Registro para roving focus
  const itemsRef = React.useRef([]); // [{value, ref}]
  const register = React.useCallback((val, ref) => {
    itemsRef.current = [
      ...itemsRef.current.filter((x) => x.value !== val),
      { value: val, ref },
    ];
  }, []);
  const unregister = React.useCallback((val) => {
    itemsRef.current = itemsRef.current.filter((x) => x.value !== val);
  }, []);

  const focusByDelta = React.useCallback((fromVal, delta) => {
    const list = itemsRef.current.sort((a, b) =>
      // mantener orden de inserción; ya están en orden de render
      0
    );
    if (!list.length) return;
    const idx = Math.max(0, list.findIndex((x) => x.value === fromVal));
    const next = (idx + delta + list.length) % list.length;
    list[next]?.ref?.current?.focus();
    if (isSingle) setCurrent(list[next].value);
  }, [isSingle, setCurrent]);

  const focusEdge = React.useCallback((edge) => {
    const list = itemsRef.current;
    if (!list.length) return;
    const target = edge === "start" ? list[0] : list[list.length - 1];
    target?.ref?.current?.focus();
    if (isSingle) setCurrent(target.value);
  }, [isSingle, setCurrent]);

  const isPressed = React.useCallback(
    (val) => (isSingle ? current === val : Array.isArray(current) && current.includes(val)),
    [current, isSingle]
  );

  const toggleValue = React.useCallback(
    (val) => {
      if (disabled) return;
      if (isSingle) {
        setCurrent(current === val ? "" : val);
      } else {
        const arr = Array.isArray(current) ? current.slice() : [];
        const i = arr.indexOf(val);
        if (i >= 0) arr.splice(i, 1);
        else arr.push(val);
        setCurrent(arr);
      }
    },
    [current, isSingle, setCurrent, disabled]
  );

  const ctx = React.useMemo(
    () => ({
      variant,
      size,
      type,
      orientation,
      disabled,
      isPressed,
      toggleValue,
      register,
      unregister,
      focusByDelta,
      focusEdge,
    }),
    [
      variant,
      size,
      type,
      orientation,
      disabled,
      isPressed,
      toggleValue,
      register,
      unregister,
      focusByDelta,
      focusEdge,
    ]
  );

  return (
    <div
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      role="group"
      aria-disabled={disabled || undefined}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={ctx}>
        {children}
      </ToggleGroupContext.Provider>
    </div>
  );
}

function ToggleGroupItem({
  className,
  children,
  value,
  variant,
  size,
  disabled,
  ...props
}) {
  const {
    variant: vCtx,
    size: sCtx,
    orientation,
    disabled: gDisabled,
    isPressed,
    toggleValue,
    register,
    unregister,
    focusByDelta,
    focusEdge,
  } = useToggleGroup();

  const ref = React.useRef(null);
  const pressed = isPressed(value);
  const isDisabled = gDisabled || disabled;

  React.useEffect(() => {
    if (value == null) return;
    register(value, ref);
    return () => unregister(value);
  }, [value, register, unregister]);

  const onKeyDown = (e) => {
    props.onKeyDown?.(e);
    if (isDisabled) return;
    const horiz = orientation === "horizontal";
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleValue(value);
      return;
    }
    if (e.key === "ArrowRight" && horiz) {
      e.preventDefault(); focusByDelta(value, +1);
    } else if (e.key === "ArrowLeft" && horiz) {
      e.preventDefault(); focusByDelta(value, -1);
    } else if (e.key === "ArrowDown" && !horiz) {
      e.preventDefault(); focusByDelta(value, +1);
    } else if (e.key === "ArrowUp" && !horiz) {
      e.preventDefault(); focusByDelta(value, -1);
    } else if (e.key === "Home") {
      e.preventDefault(); focusEdge("start");
    } else if (e.key === "End") {
      e.preventDefault(); focusEdge("end");
    }
  };

  const resolvedVariant = vCtx || variant;
  const resolvedSize = sCtx || size;

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      aria-pressed={pressed}
      disabled={isDisabled}
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-state={pressed ? "on" : "off"}
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) toggleValue(value);
      }}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
