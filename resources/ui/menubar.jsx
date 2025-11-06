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
function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function CircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/* =======================================================================
   Portal util
======================================================================= */
function usePortalNode(id = "menubar-portal-root") {
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

/* =======================================================================
   Position helpers
======================================================================= */
function computePosition(trigger, content, { side = "bottom", align = "start", sideOffset = 8, alignOffset = -4 } = {}) {
  if (!trigger || !content) return { top: 0, left: 0 };
  const t = trigger.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const sx = window.scrollX || window.pageXOffset;
  const sy = window.scrollY || window.pageYOffset;

  let top = 0, left = 0;
  if (side === "bottom") {
    top = t.bottom + sideOffset;
    if (align === "start") left = t.left + alignOffset; else if (align === "end") left = t.right - c.width - alignOffset; else left = t.left + (t.width - c.width) / 2;
  } else if (side === "top") {
    top = t.top - c.height - sideOffset;
    if (align === "start") left = t.left + alignOffset; else if (align === "end") left = t.right - c.width - alignOffset; else left = t.left + (t.width - c.width) / 2;
  } else if (side === "right") {
    left = t.right + sideOffset;
    if (align === "start") top = t.top; else if (align === "end") top = t.bottom - c.height; else top = t.top + (t.height - c.height) / 2;
  } else if (side === "left") {
    left = t.left - c.width - sideOffset;
    if (align === "start") top = t.top; else if (align === "end") top = t.bottom - c.height; else top = t.top + (t.height - c.height) / 2;
  }

  return { top: top + sy, left: left + sx };
}

/* =======================================================================
   Root (Menubar) + contexto para navegación entre menús
======================================================================= */
const MenubarRootCtx = React.createContext(null);

function Menubar({ className, children, ...props }) {
  const [triggers, setTriggers] = React.useState([]); // array de refs
  const registerTrigger = React.useCallback((ref) => {
    setTriggers((arr) => (arr.includes(ref) ? arr : [...arr, ref]));
  }, []);

  const value = React.useMemo(() => ({ triggers, registerTrigger }), [triggers, registerTrigger]);

  return (
    <MenubarRootCtx.Provider value={value}>
      <div
        role="menubar"
        data-slot="menubar"
        className={cn("bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs", className)}
        {...props}
      >
        {children}
      </div>
    </MenubarRootCtx.Provider>
  );
}

/* =======================================================================
   Menú individual: contexto y estado open
======================================================================= */
const MenuCtx = React.createContext(null);

function MenubarMenu({ children, ...props }) {
  const [open, setOpen] = React.useState(false);
  const [triggerEl, setTriggerEl] = React.useState(null);
  const value = React.useMemo(() => ({ open, setOpen, triggerEl, setTriggerEl }), [open, triggerEl]);
  return (
    <MenuCtx.Provider value={value}>
      <div data-slot="menubar-menu" {...props}>{children}</div>
    </MenuCtx.Provider>
  );
}

/* =======================================================================
   Trigger con navegación horizontal (←/→) y apertura (↓/Enter/Espacio)
======================================================================= */
function MenubarTrigger({ className, children, ...props }) {
  const root = React.useContext(MenubarRootCtx);
  const { open, setOpen, setTriggerEl } = React.useContext(MenuCtx);
  const ref = React.useRef(null);

  React.useEffect(() => { if (ref.current) { setTriggerEl(ref.current); root?.registerTrigger(ref.current); } }, [root, setTriggerEl]);

  function focusSibling(delta) {
    const arr = root?.triggers || [];
    const idx = arr.indexOf(ref.current);
    const next = arr[(idx + delta + arr.length) % arr.length];
    next?.focus();
  }

  return (
    <button
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={open || false}
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className
      )}
      data-state={open ? "open" : "closed"}
      onClick={(e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen((v) => !v); }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); }
        if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); focusSibling(-1); }
        if (e.key === "ArrowRight") { e.preventDefault(); focusSibling(1); }
        if (e.key === "Escape") { setOpen(false); }
      }}
      onBlur={(e) => {
        // Cerrar si el blur se va fuera de menubar y panel
        const related = e.relatedTarget;
        const panel = document.querySelector('[data-slot="menubar-content"]');
        if (panel && panel.contains(related)) return;
        setOpen(false);
      }}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
}

/* =======================================================================
   Portal
======================================================================= */
function MenubarPortal({ children, ...props }) {
  const node = usePortalNode();
  if (!node) return null;
  return createPortal(
    <div data-slot="menubar-portal" {...props}>{children}</div>,
    node
  );
}

/* =======================================================================
   Navigation helpers
======================================================================= */
function getItems(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'));
}
function useMenuKeyboardNavigation(ref, { onRequestClose, onRequestSubmenu }) {
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onKeyDown(e) {
      const items = getItems(el);
      const currentIndex = items.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); onRequestClose?.(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); (items[currentIndex + 1] || items[0])?.focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); (items[currentIndex - 1] || items[items.length - 1])?.focus(); }
      if (e.key === "ArrowRight") { onRequestSubmenu?.(); }
      if (e.key === "Tab") { e.preventDefault(); }
    }
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [ref, onRequestClose, onRequestSubmenu]);
}
function useClickOutside(refs, handler) {
  React.useEffect(() => {
    function onDown(e) {
      const target = e.target;
      const isInside = refs.some(r => r.current && r.current.contains(target));
      if (!isInside) handler();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [refs, handler]);
}

/* =======================================================================
   Content
======================================================================= */
function MenubarContent({ className, align = "start", alignOffset = -4, sideOffset = 8, children, ...props }) {
  const { open, setOpen, triggerEl } = React.useContext(MenuCtx);
  const ref = React.useRef(null);

  useMenuKeyboardNavigation(ref, { onRequestClose: () => setOpen(false) });
  useClickOutside([ref, { current: triggerEl }], () => setOpen(false));

  React.useEffect(() => {
    if (!open) return;
    const el = ref.current; if (!el || !triggerEl) return;
    const pos = computePosition(triggerEl, el, { side: "bottom", align, sideOffset, alignOffset });
    Object.assign(el.style, { position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` });
    el.dataset.side = "bottom";
    requestAnimationFrame(() => el.setAttribute("data-state", "open"));
    return () => el.setAttribute("data-state", "closed");
  }, [open, triggerEl, align, sideOffset, alignOffset]);

  React.useEffect(() => {
    if (!open) return;
    const el = ref.current; if (!el) return;
    (getItems(el)[0] || el).focus();
  }, [open]);

  if (!open) return null;

  return (
    <MenubarPortal>
      <div
        ref={ref}
        role="menu"
        tabIndex={-1}
        data-slot="menubar-content"
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[12rem] overflow-hidden rounded-md border p-1 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MenubarPortal>
  );
}

/* =======================================================================
   Group / Label / Separator / Shortcut
======================================================================= */
function MenubarGroup(props) { return <div role="group" data-slot="menubar-group" {...props} />; }
function MenubarLabel({ className, inset, ...props }) {
  return <div data-slot="menubar-label" data-inset={inset} className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)} {...props} />;
}
function MenubarSeparator({ className, ...props }) { return <div role="separator" data-slot="menubar-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />; }
function MenubarShortcut({ className, ...props }) { return <span data-slot="menubar-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />; }

/* =======================================================================
   BaseItem + variantes
======================================================================= */
const BaseItem = React.forwardRef(function BaseItem({ className, inset, disabled, role = "menuitem", onSelect, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      role={role}
      tabIndex={disabled ? undefined : -1}
      aria-disabled={!!disabled}
      data-inset={inset}
      data-slot="menubar-item"
      onClick={(e) => { if (disabled) return; props.onClick?.(e); if (!e.defaultPrevented) onSelect?.(e); }}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

function MenubarItem({ className, inset, variant = "default", disabled, ...props }) {
  return (
    <BaseItem
      role="menuitem"
      inset={inset}
      disabled={disabled}
      data-variant={variant}
      className={cn(
        variant === "destructive" && "data-[variant=destructive]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

/* =======================================================================
   Checkbox / Radio
======================================================================= */
function MenubarCheckboxItem({ className, children, checked: controlled, defaultChecked = false, onCheckedChange, disabled, ...props }) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const checked = isControlled ? !!controlled : uncontrolled;
  const setChecked = (next) => { if (!isControlled) setUncontrolled(next); onCheckedChange?.(next); };
  return (
    <BaseItem
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      className={cn("pl-8", className)}
      onSelect={() => setChecked(!checked)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked ? <CheckIcon className="size-4" /> : null}
      </span>
      {children}
    </BaseItem>
  );
}

const RadioGroupCtx = React.createContext(null);
function MenubarRadioGroup({ value: controlled, defaultValue, onValueChange, children, ...props }) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? controlled : uncontrolled;
  const setValue = (v) => { if (!isControlled) setUncontrolled(v); onValueChange?.(v); };
  const ctx = React.useMemo(() => ({ value, setValue }), [value]);
  return (
    <RadioGroupCtx.Provider value={ctx}>
      <div role="group" data-slot="menubar-radio-group" {...props}>{children}</div>
    </RadioGroupCtx.Provider>
  );
}
function MenubarRadioItem({ className, children, value, disabled, ...props }) {
  const ctx = React.useContext(RadioGroupCtx);
  if (!ctx) throw new Error("RadioItem must be inside MenubarRadioGroup");
  const checked = ctx.value === value;
  return (
    <BaseItem
      role="menuitemradio"
      aria-checked={checked}
      disabled={disabled}
      className={cn("pl-8", className)}
      onSelect={() => ctx.setValue(value)}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked ? <CircleIcon className="size-2 fill-current" /> : null}
      </span>
      {children}
    </BaseItem>
  );
}

/* =======================================================================
   Submenus
======================================================================= */
const SubmenuCtx = React.createContext(null);
function MenubarSub({ children }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <SubmenuCtx.Provider value={value}>{children}</SubmenuCtx.Provider>;
}
function MenubarSubTrigger({ className, inset, children, disabled, ...props }) {
  const ctx = React.useContext(SubmenuCtx);
  const triggerRef = React.useRef(null);
  return (
    <BaseItem
      ref={triggerRef}
      role="menuitem"
      aria-haspopup="menu"
      aria-expanded={ctx.open}
      inset={inset}
      disabled={disabled}
      data-slot="menubar-sub-trigger"
      className={cn("px-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground", className)}
      onMouseEnter={() => ctx.setOpen(true)}
      onMouseLeave={() => ctx.setOpen(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); ctx.setOpen(true); } if (e.key === "ArrowLeft") { ctx.setOpen(false); } }}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </BaseItem>
  );
}
function MenubarSubContent({ className, side = "right", sideOffset = 8, children, ...props }) {
  const sub = React.useContext(SubmenuCtx);
  const ref = React.useRef(null);
  const parentItem = React.useRef(null);

  React.useEffect(() => { parentItem.current = ref.current?.parentElement || null; }, []);

  useClickOutside([ref, { current: parentItem.current }], () => sub.setOpen(false));
  useMenuKeyboardNavigation(ref, { onRequestClose: () => sub.setOpen(false) });

  React.useEffect(() => {
    if (!sub.open) return;
    const el = ref.current; if (!el) return;
    const anchor = parentItem.current;
    const pos = computePosition(anchor, el, { side, sideOffset });
    Object.assign(el.style, { position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` });
    el.dataset.side = side; el.setAttribute("data-state", "open");
    return () => el.setAttribute("data-state", "closed");
  }, [sub.open, side, sideOffset]);

  if (!sub.open) return null;
  return (
    <div
      ref={ref}
      role="menu"
      tabIndex={-1}
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* =======================================================================
   Exports
======================================================================= */
export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  // Portal export opcional por compatibilidad
  usePortalNode as MenubarPortal,
};