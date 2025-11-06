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
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  );
}
function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M9 6l6 6-6 6"/>
    </svg>
  );
}
function CircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  );
}

/* =======================================================================
   Contextos
======================================================================= */
const MenuCtx = React.createContext(null);
const RadioGroupCtx = React.createContext(null);
const SubmenuCtx = React.createContext(null);

function useMenuCtx() {
  const ctx = React.useContext(MenuCtx);
  if (!ctx) throw new Error("Must be used within <DropdownMenu>");
  return ctx;
}

/* =======================================================================
   Portal util
======================================================================= */
function usePortalNode(id = "dropdown-portal-root") {
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
   Root / Trigger
======================================================================= */
function DropdownMenu({ open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState(null);

  const open = isControlled ? !!controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback((next) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const value = React.useMemo(() => ({ open, setOpen, triggerEl, setTriggerEl }), [open, triggerEl]);

  return (
    <MenuCtx.Provider value={value}>
      <div data-slot="dropdown-menu" {...props}>{children}</div>
    </MenuCtx.Provider>
  );
}

function DropdownMenuTrigger({ asChild = false, ...props }) {
  const { setOpen, setTriggerEl, open } = useMenuCtx();
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) setTriggerEl(ref.current); }, [setTriggerEl]);
  const Comp = asChild ? React.forwardRef((p, r) => React.cloneElement(p.children, { ...p, ref: r })) : "button";
  const triggerProps = {
    "data-slot": "dropdown-menu-trigger",
    "aria-haspopup": "menu",
    "aria-expanded": open || false,
    onClick: (e) => { props.onClick?.(e); if (!e.defaultPrevented) setOpen(!open); },
    onKeyDown: (e) => {
      props.onKeyDown?.(e);
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault(); setOpen(true);
      }
    },
    ref,
    ...props,
  };
  return asChild ? (
    <Comp {...triggerProps} />
  ) : (
    <button {...triggerProps} />
  );
}

/* =======================================================================
   Portal
======================================================================= */
function DropdownMenuPortal({ children, ...props }) {
  const node = usePortalNode();
  if (!node) return null;
  return createPortal(
    <div data-slot="dropdown-menu-portal" {...props}>{children}</div>,
    node
  );
}

/* =======================================================================
   Posicionamiento y navegación
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
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(currentIndex + 1) % items.length] || items[0];
        next?.focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[(currentIndex - 1 + items.length) % items.length] || items[items.length - 1];
        prev?.focus();
      }
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

function computePosition(trigger, content, { side = "bottom", sideOffset = 4 } = {}) {
  if (!trigger || !content) return { top: 0, left: 0, transform: "" };
  const t = trigger.getBoundingClientRect();
  const c = content.getBoundingClientRect();
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  let top = 0, left = 0;
  if (side === "bottom") { top = t.bottom + sideOffset; left = t.left; }
  if (side === "top") { top = t.top - c.height - sideOffset; left = t.left; }
  if (side === "right") { top = t.top; left = t.right + sideOffset; }
  if (side === "left") { top = t.top; left = t.left - c.width - sideOffset; }
  return { top: top + scrollY, left: left + scrollX };
}

/* =======================================================================
   Content
======================================================================= */
function DropdownMenuContent({ className, side = "bottom", sideOffset = 4, children, ...props }) {
  const { open, setOpen, triggerEl } = useMenuCtx();
  const contentRef = React.useRef(null);
  const portalNode = usePortalNode();

  useClickOutside([contentRef, { current: triggerEl }], () => setOpen(false));
  useMenuKeyboardNavigation(contentRef, { onRequestClose: () => setOpen(false) });

  React.useEffect(() => {
    if (!open) return;
    const el = contentRef.current; if (!el || !triggerEl) return;
    const pos = computePosition(triggerEl, el, { side, sideOffset });
    Object.assign(el.style, { position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` });
    el.dataset.side = side;
    requestAnimationFrame(() => el.setAttribute("data-state", "open"));
    return () => { el.setAttribute("data-state", "closed"); };
  }, [open, triggerEl, side, sideOffset]);

  React.useEffect(() => {
    if (!open) return;
    const el = contentRef.current; if (!el) return;
    const first = getItems(el)[0] || el;
    first.focus();
  }, [open]);

  if (!open || !portalNode) return null;

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      tabIndex={-1}
      data-slot="dropdown-menu-content"
      className={cn(
        "bg-popover text-popover-foreground z-50 min-w-[8rem] max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-md border p-1 shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    portalNode
  );
}

/* =======================================================================
   Group / Label / Separator / Shortcut
======================================================================= */
function DropdownMenuGroup(props) {
  return <div data-slot="dropdown-menu-group" role="group" {...props} />;
}
function DropdownMenuLabel({ className, inset, ...props }) {
  return (
    <div
      data-slot="dropdown-menu-label"
      className={cn("px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  );
}
function DropdownMenuSeparator({ className, ...props }) {
  return <div role="separator" data-slot="dropdown-menu-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}
function DropdownMenuShortcut({ className, ...props }) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

/* =======================================================================
   Item base
======================================================================= */
const BaseItem = React.forwardRef(function BaseItem({ className, inset, disabled, onSelect, role = "menuitem", children, ...props }, ref) {
  return (
    <div
      ref={ref}
      role={role}
      tabIndex={disabled ? undefined : -1}
      aria-disabled={!!disabled}
      data-inset={inset}
      data-slot="dropdown-menu-item"
      onClick={(e) => {
        if (disabled) return;
        props.onClick?.(e);
        if (!e.defaultPrevented) onSelect?.(e);
      }}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

function DropdownMenuItem({ className, inset, variant = "default", disabled, ...props }) {
  return (
    <BaseItem
      role="menuitem"
      inset={inset}
      disabled={disabled}
      data-variant={variant}
      className={cn(
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variant === "destructive" && "data-[variant=destructive]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

/* =======================================================================
   Checkbox items
======================================================================= */
function DropdownMenuCheckboxItem({ className, children, checked: controlled, defaultChecked = false, onCheckedChange, disabled, ...props }) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const checked = isControlled ? !!controlled : uncontrolled;
  const setChecked = (next) => { if (!isControlled) setUncontrolled(next); onCheckedChange?.(next); };
  return (
    <BaseItem
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      className={cn("pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
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

/* =======================================================================
   Radio group / items
======================================================================= */
function DropdownMenuRadioGroup({ value: controlled, defaultValue, onValueChange, children, ...props }) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? controlled : uncontrolled;
  const setValue = (v) => { if (!isControlled) setUncontrolled(v); onValueChange?.(v); };
  const ctx = React.useMemo(() => ({ value, setValue }), [value]);
  return (
    <RadioGroupCtx.Provider value={ctx}>
      <div role="group" data-slot="dropdown-menu-radio-group" {...props}>{children}</div>
    </RadioGroupCtx.Provider>
  );
}

function DropdownMenuRadioItem({ className, children, value, disabled, ...props }) {
  const ctx = React.useContext(RadioGroupCtx);
  if (!ctx) throw new Error("RadioItem must be inside RadioGroup");
  const checked = ctx.value === value;
  return (
    <BaseItem
      role="menuitemradio"
      aria-checked={checked}
      disabled={disabled}
      className={cn("pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
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
function DropdownMenuSub({ children }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <SubmenuCtx.Provider value={value}>{children}</SubmenuCtx.Provider>;
}

function DropdownMenuSubTrigger({ className, inset, children, disabled, ...props }) {
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
      data-slot="dropdown-menu-sub-trigger"
      className={cn("data-[state=open]:bg-accent data-[state=open]:text-accent-foreground px-2", className)}
      onMouseEnter={() => ctx.setOpen(true)}
      onMouseLeave={() => ctx.setOpen(false)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); ctx.setOpen(true); } if (e.key === "ArrowLeft") { ctx.setOpen(false); } }}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </BaseItem>
  );
}

function DropdownMenuSubContent({ className, side = "right", sideOffset = 8, children, ...props }) {
  const { triggerEl } = useMenuCtx(); // for outside click with root trigger as well
  const sub = React.useContext(SubmenuCtx);
  const ref = React.useRef(null);
  const parentItem = React.useRef(null);

  React.useEffect(() => {
    // parent item is previous sibling (SubTrigger wrapper)
    parentItem.current = ref.current?.parentElement || null;
  }, []);

  useClickOutside([ref, { current: parentItem.current }, { current: triggerEl }], () => sub.setOpen(false));
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
      data-slot="dropdown-menu-sub-content"
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
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
