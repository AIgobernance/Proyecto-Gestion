"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

/* -------------------- Icons inline (reemplazos) -------------------- */
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <polyline points="20 6 9 17 4 12" />
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
    <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" fill="currentColor" strokeWidth="0" {...props}>
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

/* -------------------- Contextos -------------------- */
const MenuCtx = React.createContext(null);
const RadioGroupCtx = React.createContext(null);
const SubmenuCtx = React.createContext(null);

/* -------------------- Util: Portal -------------------- */
function Portal({ children }) {
  const [node, setNode] = React.useState(null);
  React.useEffect(() => {
    let el = document.getElementById("context-menu-portal");
    if (!el) {
      el = document.createElement("div");
      el.id = "context-menu-portal";
      document.body.appendChild(el);
    }
    setNode(el);
  }, []);
  if (!node) return null;
  return createPortal(children, node);
}

/* -------------------- Root -------------------- */
function ContextMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const close = React.useCallback(() => setOpen(false), []);
  const openAt = React.useCallback((x, y) => {
    setCoords({ x, y });
    setOpen(true);
  }, []);

  const value = React.useMemo(
    () => ({ open, setOpen, openAt, close, coords }),
    [open, openAt, close, coords]
  );

  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && close();
    const onClick = (e) => {
      // si clic fuera de cualquier menu content => cerrar
      if (!(e.target.closest && e.target.closest("[data-slot='context-menu-content']"))) {
        close();
      }
    };
    document.addEventListener("keydown", onEsc);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}

/* -------------------- Trigger -------------------- */
function ContextMenuTrigger({ asChild, children, ...rest }) {
  const menu = React.useContext(MenuCtx);
  if (!menu) throw new Error("ContextMenuTrigger must be used within ContextMenu");

  const onContextMenu = (e) => {
    e.preventDefault();
    menu.openAt(e.clientX, e.clientY);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onContextMenu, ...rest });
  }
  return (
    <div data-slot="context-menu-trigger" onContextMenu={onContextMenu} {...rest}>
      {children}
    </div>
  );
}

/* -------------------- Content (portal + posicionamiento) -------------------- */
function useRovingFocus(open) {
  const containerRef = React.useRef(null);
  const focusablesRef = React.useRef([]);
  React.useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    if (!root) return;
    focusablesRef.current = Array.from(
      root.querySelectorAll('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]')
    );
    // enfocar primer ítem
    focusablesRef.current[0]?.focus();

    const onKeyDown = (e) => {
      const list = focusablesRef.current;
      if (!list.length) return;
      const idx = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = list[(idx + 1 + list.length) % list.length];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = list[(idx - 1 + list.length) % list.length];
        prev?.focus();
      }
    };
    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [open]);
  return containerRef;
}

function ContextMenuContent({ className, ...props }) {
  const menu = React.useContext(MenuCtx);
  if (!menu) throw new Error("ContextMenuContent must be used within ContextMenu");

  if (!menu.open) return null;

  const ref = useRovingFocus(menu.open);

  // posicionamiento simple evitando overflow
  const [style, setStyle] = React.useState({});
  React.useEffect(() => {
    const padding = 8;
    const estimate = { width: 200, height: 200 };
    const x = Math.min(
      Math.max(padding, menu.coords.x),
      window.innerWidth - estimate.width - padding
    );
    const y = Math.min(
      Math.max(padding, menu.coords.y),
      window.innerHeight - estimate.height - padding
    );
    setStyle({ left: x, top: y, position: "fixed" });
  }, [menu.coords]);

  return (
    <Portal>
      <div
        ref={ref}
        tabIndex={-1}
        data-slot="context-menu-content"
        role="menu"
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] max-h-[75vh] overflow-y-auto overflow-x-hidden rounded-md border p-1 shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out", // compat con tus clases
          className
        )}
        style={style}
        {...props}
      />
    </Portal>
  );
}

/* -------------------- Group -------------------- */
function ContextMenuGroup(props) {
  return <div data-slot="context-menu-group" role="group" {...props} />;
}

/* -------------------- Item base -------------------- */
function BaseItem({ className, inset, variant = "default", role = "menuitem", ...rest }) {
  return (
    <div
      tabIndex={-1}
      role={role}
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive",
        "[&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[inset]:pl-8",
        className
      )}
      {...rest}
    />
  );
}

function ContextMenuItem({ className, inset, variant = "default", onSelect, ...props }) {
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect?.(e);
    }
  };
  return (
    <BaseItem
      className={className}
      inset={inset}
      data-slot="context-menu-item"
      onKeyDown={onKeyDown}
      onClick={onSelect}
      {...props}
    />
  );
}

/* -------------------- Checkbox item -------------------- */
function ContextMenuCheckboxItem({
  className,
  children,
  checked = false,
  onCheckedChange,
  ...props
}) {
  const toggle = (next) => onCheckedChange?.(next);
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle(!checked);
    }
  };
  return (
    <BaseItem
      role="menuitemcheckbox"
      aria-checked={checked}
      className={cn("py-1.5 pr-2 pl-8", className)}
      onClick={() => toggle(!checked)}
      onKeyDown={onKeyDown}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked ? <CheckIcon className="size-4" /> : null}
      </span>
      {children}
    </BaseItem>
  );
}

/* -------------------- Radio group / item -------------------- */
function ContextMenuRadioGroup({ value, onValueChange, children, ...rest }) {
  const ctx = React.useMemo(() => ({ value, onValueChange }), [value, onValueChange]);
  return (
    <RadioGroupCtx.Provider value={ctx}>
      <div data-slot="context-menu-radio-group" role="group" {...rest}>
        {children}
      </div>
    </RadioGroupCtx.Provider>
  );
}

function ContextMenuRadioItem({ className, children, value, ...props }) {
  const rg = React.useContext(RadioGroupCtx);
  if (!rg) throw new Error("ContextMenuRadioItem must be inside ContextMenuRadioGroup");
  const checked = rg.value === value;

  const choose = () => rg.onValueChange?.(value);
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose();
    }
  };

  return (
    <BaseItem
      role="menuitemradio"
      aria-checked={checked}
      className={cn("py-1.5 pr-2 pl-8", className)}
      onClick={choose}
      onKeyDown={onKeyDown}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked ? <CircleIcon className="size-2 fill-current" /> : null}
      </span>
      {children}
    </BaseItem>
  );
}

/* -------------------- Label / Separator / Shortcut -------------------- */
function ContextMenuLabel({ className, inset, ...props }) {
  return (
    <div
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("text-foreground px-2 py-1.5 text-sm font-medium", inset && "pl-8", className)}
      {...props}
    />
  );
}

function ContextMenuSeparator({ className, ...props }) {
  return (
    <div
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
}

/* -------------------- Submenu -------------------- */
function ContextMenuSub({ children }) {
  const [open, setOpen] = React.useState(false);
  const [anchorRect, setAnchorRect] = React.useState(null);
  const value = React.useMemo(() => ({ open, setOpen, anchorRect, setAnchorRect }), [open, anchorRect]);
  return <SubmenuCtx.Provider value={value}>{children}</SubmenuCtx.Provider>;
}

function ContextMenuSubTrigger({ className, inset, children, ...props }) {
  const sub = React.useContext(SubmenuCtx);
  if (!sub) throw new Error("ContextMenuSubTrigger must be inside ContextMenuSub");

  const ref = React.useRef(null);

  const openSub = () => {
    if (ref.current) {
      sub.setAnchorRect(ref.current.getBoundingClientRect());
    }
    sub.setOpen(true);
  };
  const closeSub = () => sub.setOpen(false);

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      openSub();
    } else if (e.key === "ArrowLeft" || e.key === "Escape") {
      e.preventDefault();
      closeSub();
    }
  };

  return (
    <BaseItem
      ref={ref}
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn("px-2 py-1.5", inset && "pl-8", className)}
      onMouseEnter={openSub}
      onMouseLeave={closeSub}
      onKeyDown={onKeyDown}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </BaseItem>
  );
}

function ContextMenuSubContent({ className, ...props }) {
  const sub = React.useContext(SubmenuCtx);
  if (!sub) throw new Error("ContextMenuSubContent must be inside ContextMenuSub");
  if (!sub.open || !sub.anchorRect) return null;

  const [style, setStyle] = React.useState({});
  React.useEffect(() => {
    const padding = 8;
    const estimate = { width: 200, height: 200 };
    const x = Math.min(
      Math.max(padding, sub.anchorRect.right + 4),
      window.innerWidth - estimate.width - padding
    );
    const y = Math.min(
      Math.max(padding, sub.anchorRect.top),
      window.innerHeight - estimate.height - padding
    );
    setStyle({ left: x, top: y, position: "fixed" });
  }, [sub.anchorRect]);

  return (
    <Portal>
      <div
        data-slot="context-menu-sub-content"
        role="menu"
        className={cn(
          "bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          className
        )}
        style={style}
        onMouseLeave={() => sub.setOpen(false)}
        {...props}
      />
    </Portal>
  );
}

/* -------------------- Exports API -------------------- */
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  // Alias/compat
  Portal as ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
