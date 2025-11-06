"use client";

import * as React from "react";
import { cn } from "./utils";

/* =========================================================================
   Contexto interno
========================================================================= */
const TabsCtx = React.createContext(null);
function useTabsCtx() {
  const ctx = React.useContext(TabsCtx);
  if (!ctx) throw new Error("Must be used within <Tabs>");
  return ctx;
}

/* =========================================================================
   Root
   Props compatibles: value, defaultValue, onValueChange, orientation
========================================================================= */
function Tabs({
  className,
  value: controlledValue,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  ...props
}) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? null
  );
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = React.useCallback(
    (v) => {
      if (!isControlled) setUncontrolledValue(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  // Registro de orden de tabs para teclado
  const tabsRef = React.useRef([]); // [{value, id, ref}]
  const registerTab = React.useCallback((item) => {
    tabsRef.current = [
      ...tabsRef.current.filter((t) => t.value !== item.value),
      item,
    ];
  }, []);
  const unregisterTab = React.useCallback((val) => {
    tabsRef.current = tabsRef.current.filter((t) => t.value !== val);
  }, []);

  const focusByDelta = React.useCallback((currentValue, delta) => {
    const list = tabsRef.current;
    if (!list.length) return;
    const idx = Math.max(
      0,
      list.findIndex((t) => t.value === currentValue)
    );
    const next = (idx + delta + list.length) % list.length;
    list[next]?.ref?.current?.focus();
    setValue(list[next]?.value);
  }, [setValue]);

  const focusEdge = React.useCallback((edge) => {
    const list = tabsRef.current;
    if (!list.length) return;
    const target = edge === "start" ? list[0] : list[list.length - 1];
    target?.ref?.current?.focus();
    setValue(target?.value);
  }, [setValue]);

  const ctx = React.useMemo(
    () => ({
      value,
      setValue,
      orientation,
      registerTab,
      unregisterTab,
      focusByDelta,
      focusEdge,
    }),
    [value, setValue, orientation, registerTab, unregisterTab, focusByDelta, focusEdge]
  );

  return (
    <TabsCtx.Provider value={ctx}>
      <div
        data-slot="tabs"
        className={cn("flex flex-col gap-2", className)}
        {...props}
      />
    </TabsCtx.Provider>
  );
}

/* =========================================================================
   List
========================================================================= */
function TabsList({ className, ...props }) {
  const { orientation } = useTabsCtx();
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className
      )}
      {...props}
    />
  );
}

/* =========================================================================
   Trigger
   Props: value (requerido), disabled
========================================================================= */
function TabsTrigger({ className, value, disabled, ...props }) {
  const {
    value: active,
    setValue,
    orientation,
    registerTab,
    unregisterTab,
    focusByDelta,
    focusEdge,
  } = useTabsCtx();

  const ref = React.useRef(null);
  const id = React.useId();
  const selected = active === value;

  React.useEffect(() => {
    if (!value) return;
    registerTab({ value, id, ref });
    return () => unregisterTab(value);
  }, [value, id, registerTab, unregisterTab]);

  const onKeyDown = (e) => {
    props.onKeyDown?.(e);
    if (disabled) return;
    const isHorizontal = orientation === "horizontal";
    if (e.key === "ArrowRight" && isHorizontal) {
      e.preventDefault(); focusByDelta(value, +1);
    } else if (e.key === "ArrowLeft" && isHorizontal) {
      e.preventDefault(); focusByDelta(value, -1);
    } else if (e.key === "ArrowDown" && !isHorizontal) {
      e.preventDefault(); focusByDelta(value, +1);
    } else if (e.key === "ArrowUp" && !isHorizontal) {
      e.preventDefault(); focusByDelta(value, -1);
    } else if (e.key === "Home") {
      e.preventDefault(); focusEdge("start");
    } else if (e.key === "End") {
      e.preventDefault(); focusEdge("end");
    }
  };

  return (
    <button
      ref={ref}
      role="tab"
      id={id}
      type="button"
      aria-selected={selected}
      aria-controls={selected ? `${id}-panel` : undefined}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      data-slot="tabs-trigger"
      data-state={selected ? "active" : "inactive"}
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented && !disabled) setValue(value);
      }}
      onKeyDown={onKeyDown}
      {...props}
    />
  );
}

/* =========================================================================
   Content
   Props: value (requerido)
========================================================================= */
function TabsContent({ className, value, ...props }) {
  const { value: active } = useTabsCtx();
  const id = React.useId();
  const hidden = active !== value;

  return (
    <div
      role="tabpanel"
      id={`${id}-panel`}
      aria-labelledby={id}
      hidden={hidden}
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
