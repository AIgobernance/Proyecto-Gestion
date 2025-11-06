"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* =======================================================================
   Iconos inline (reemplazo lucide)
======================================================================= */
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
function ChevronDownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function ChevronUpIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

/* =======================================================================
   Utils
======================================================================= */
function usePortalNode(id = "select-portal-root") {
  const [node, setNode] = React.useState(null);
  React.useEffect(() => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      document.body.appendChild(el);
    }
    setNode(el);
  }, [id]);
  return node;
}
function computePosition(trigger, panel, { sideOffset = 6 } = {}) {
  if (!trigger || !panel) return { top: 0, left: 0, width: 0 };
  const t = trigger.getBoundingClientRect();
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;
  return { top: t.bottom + sideOffset + sy, left: t.left + sx, width: t.width };
}

/* =======================================================================
   Contexto
======================================================================= */
const SelectCtx = React.createContext(null);
function useSelectCtx() {
  const ctx = React.useContext(SelectCtx);
  if (!ctx) throw new Error("Must be used within <Select>");
  return ctx;
}

/* =======================================================================
   Root
   Props clave soportadas:
   - open/defaultOpen/onOpenChange
   - value/defaultValue/onValueChange
   - disabled
======================================================================= */
function Select({ open: controlledOpen, defaultOpen = false, onOpenChange, value: controlled, defaultValue, onValueChange, disabled, children, ...props }) {
  const isControlledOpen = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const open = isControlledOpen ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((next) => {
    if (!isControlledOpen) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isControlledOpen, onOpenChange]);

  const isControlledValue = controlled !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? null);
  const value = isControlledValue ? controlled : uncontrolledValue;
  const setValue = React.useCallback((v) => {
    if (!isControlledValue) setUncontrolledValue(v);
    onValueChange?.(v);
  }, [isControlledValue, onValueChange]);

  const triggerRef = React.useRef(null);
  const viewportRef = React.useRef(null);
  const contentRef = React.useRef(null);

  // Registro de items para navegar
  const itemsRef = React.useRef([]); // [{value,label,ref,disabled}]
  const registerItem = React.useCallback((entry) => {
    itemsRef.current = [...itemsRef.current.filter((e) => e.value !== entry.value), entry];
    return () => { itemsRef.current = itemsRef.current.filter((e) => e.value !== entry.value); };
  }, []);

  // Etiqueta del valor seleccionado
  const [valueLabel, setValueLabel] = React.useState("");

  // active index para roving focus
  const [activeIndex, setActiveIndex] = React.useState(-1);
  React.useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, itemsRef.current.findIndex((i) => i.value === value && !i.disabled));
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, value]);

  const ctx = React.useMemo(() => ({
    open, setOpen, disabled, triggerRef, contentRef, viewportRef,
    value, setValue, valueLabel, setValueLabel,
    itemsRef, registerItem, activeIndex, setActiveIndex,
  }), [open, disabled, value, valueLabel, activeIndex, registerItem]);

  return (
    <SelectCtx.Provider value={ctx}>
      <div data-slot="select" {...props}>{children}</div>
    </SelectCtx.Provider>
  );
}

/* =======================================================================
   Trigger / Value
======================================================================= */
function SelectTrigger({ className, size = "default", children, ...props }) {
  const { open, setOpen, disabled, triggerRef } = useSelectCtx();
  return (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open || false}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(!open); }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
        if (e.key === "Escape") setOpen(false);
      }}
      {...props}
    >
      {children}
      <span aria-hidden className="ml-1 opacity-50"><ChevronDownIcon className="size-4" /></span>
    </button>
  );
}

function SelectValue(props) {
  const { valueLabel } = useSelectCtx();
  return (
    <span data-slot="select-value" {...props}>{valueLabel || props.placeholder}</span>
  );
}

/* =======================================================================
   Content + Viewport + Scroll buttons
======================================================================= */
function SelectContent({ className, children, position = "popper", ...props }) {
  const { open, setOpen, triggerRef, contentRef, viewportRef, itemsRef, activeIndex, setActiveIndex, value, setValue } = useSelectCtx();
  const portal = usePortalNode();
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 });

  React.useEffect(() => {
    if (!open) return;
    const trig = triggerRef.current; const panel = contentRef.current; if (!trig || !panel) return;
    const p = computePosition(trig, panel, { sideOffset: 6 });
    setPos(p);
    const r = () => setPos(computePosition(trig, panel, { sideOffset: 6 }));
    window.addEventListener("resize", r);
    window.addEventListener("scroll", r, true);
    return () => { window.removeEventListener("resize", r); window.removeEventListener("scroll", r, true); };
  }, [open, triggerRef, contentRef]);

  // Navegación por teclado dentro del listbox
  React.useEffect(() => {
    if (!open) return;
    const el = contentRef.current; if (!el) return;
    function onKey(e) {
      const items = itemsRef.current.filter(i => !i.disabled);
      if (!items.length) return;
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "Enter") { e.preventDefault(); const it = items[activeIndex] || items[0]; it?.ref.current?.click(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, items.length - 1)); scrollIntoView(activeIndex + 1); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); scrollIntoView(activeIndex - 1); }
      if (e.key === "Home") { e.preventDefault(); setActiveIndex(0); scrollIntoView(0); }
      if (e.key === "End") { e.preventDefault(); setActiveIndex(items.length - 1); scrollIntoView(items.length - 1); }
    }
    function scrollIntoView(idx) {
      const vp = viewportRef.current; const it = itemsRef.current[idx]; if (!vp || !it) return;
      const n = it.ref.current; if (!n) return;
      const r = n.getBoundingClientRect(); const vr = vp.getBoundingClientRect();
      if (r.top < vr.top) vp.scrollTop -= (vr.top - r.top);
      if (r.bottom > vr.bottom) vp.scrollTop += (r.bottom - vr.bottom);
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [open, activeIndex, itemsRef, setActiveIndex, viewportRef, setOpen]);

  if (!open || !portal) return null;

  const style = position === "popper" ? { position: "absolute", top: pos.top, left: pos.left, minWidth: pos.width } : undefined;

  return createPortal(
    <div
      ref={contentRef}
      data-slot="select-content"
      tabIndex={-1}
      style={style}
      className={cn(
        "bg-popover text-popover-foreground relative z-50 max-h-[260px] min-w-[8rem] overflow-hidden rounded-md border shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" && "translate-y-1",
        className
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <div ref={viewportRef} className={cn("max-h-[240px] overflow-auto p-1", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]")}
        role="listbox"
        aria-activedescendant={itemsRef.current[activeIndex]?.id}
      >
        {children}
      </div>
      <SelectScrollDownButton />
    </div>,
    portal
  );
}

/* =======================================================================
   Item / Group / Label / Separator
======================================================================= */
let _uid = 0; function uid() { return `sel-item-${++_uid}`; }

function SelectItem({ className, children, value, disabled, ...props }) {
  const { value: sel, setValue, setOpen, registerItem, setValueLabel, activeIndex, itemsRef } = useSelectCtx();
  const ref = React.useRef(null);
  const idRef = React.useRef(uid());

  React.useEffect(() => {
    const entry = { value, label: getText(children), ref, disabled, id: idRef.current };
    return registerItem(entry);
  }, [value, children, disabled, registerItem]);

  const selected = sel === value;

  function onSelect(e) {
    props.onClick?.(e);
    if (disabled) return;
    setValue(value);
    setValueLabel(getText(children));
    setOpen(false);
  }

  // activedescendant styling
  const idx = itemsRef.current.findIndex((i) => i.value === value);
  const active = idx >= 0 && idx === activeIndex;

  return (
    <div
      id={idRef.current}
      ref={ref}
      role="option"
      aria-selected={selected}
      aria-disabled={!!disabled}
      data-slot="select-item"
      tabIndex={-1}
      onClick={onSelect}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        active && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        {selected ? <CheckIcon className="size-4" /> : null}
      </span>
      <span>{children}</span>
    </div>
  );
}

function SelectGroup(props) { return <div data-slot="select-group" role="group" {...props} />; }
function SelectLabel({ className, ...props }) { return <div data-slot="select-label" className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)} {...props} />; }
function SelectSeparator({ className, ...props }) { return <div data-slot="select-separator" className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)} {...props} />; }

/* =======================================================================
   Scroll buttons
======================================================================= */
function SelectScrollUpButton({ className, ...props }) {
  const { viewportRef } = useSelectCtx();
  if (!viewportRef.current) return null;
  const canScroll = viewportRef.current.scrollTop > 0;
  if (!canScroll) return null;
  return (
    <button
      type="button"
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1 w-full", className)}
      onMouseDown={(e) => { e.preventDefault(); viewportRef.current.scrollTop -= 40; }}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </button>
  );
}
function SelectScrollDownButton({ className, ...props }) {
  const { viewportRef } = useSelectCtx();
  if (!viewportRef.current) return null;
  const vp = viewportRef.current;
  const canScroll = vp.scrollTop + vp.clientHeight < vp.scrollHeight - 1;
  if (!canScroll) return null;
  return (
    <button
      type="button"
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1 w-full", className)}
      onMouseDown={(e) => { e.preventDefault(); viewportRef.current.scrollTop += 40; }}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </button>
  );
}

/* =======================================================================
   Helpers
======================================================================= */
function getText(node) {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (React.isValidElement(node)) return getText(node.props.children);
  return "";
}

/* =======================================================================
   Exports
======================================================================= */
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};