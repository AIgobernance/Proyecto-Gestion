"use client";

import * as React from "react";

/** tiny helper */
const cx = (...s) => s.filter(Boolean).join(" ");

const CollapsibleContext = React.createContext(null);
function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error("useCollapsible must be used within <Collapsible />");
  return ctx;
}

/**
 * <Collapsible open defaultOpen onOpenChange>
 */
export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(!!defaultOpen);
  const open = isControlled ? !!controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const value = React.useMemo(
    () => ({ open, setOpen }),
    [open, setOpen]
  );

  return (
    <CollapsibleContext.Provider value={value}>
      <div data-slot="collapsible" className={className} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

/**
 * Slot mínimo para soportar asChild (inyecta props/cls/ref en el hijo)
 */
const Slot = React.forwardRef(function Slot({ children, className, ...rest }, ref) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...rest,
      ref,
      className: cx(children.props.className, className),
    });
  }
  return (
    <button ref={ref} className={className} {...rest} />
  );
});

/**
 * <CollapsibleTrigger asChild>
 * - Renderiza un <button> por defecto
 * - Gestiona aria-expanded/controls y teclado (Enter/Espacio)
 */
export const CollapsibleTrigger = React.forwardRef(function CollapsibleTrigger(
  { asChild = false, className, onClick, ...props },
  ref
) {
  const { open, setOpen } = useCollapsible();
  const Comp = asChild ? Slot : "button";
  const id = React.useId();
  const controlsId = `${id}-collapsible-content`;

  const handleClick = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    setOpen(!open);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(!open);
    }
  };

  return (
    <Comp
      data-slot="collapsible-trigger"
      aria-expanded={open}
      aria-controls={controlsId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={className}
      ref={ref}
      {...props}
    />
  );
});

/**
 * <CollapsibleContent>
 * - Animación de altura con CSS transition
 * - data-state="open|closed"
 */
export const CollapsibleContent = React.forwardRef(function CollapsibleContent(
  { className, style, children, ...props },
  ref
) {
  const { open } = useCollapsible();
  const innerRef = React.useRef(null);
  const combinedRef = React.useCallback((node) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  // animación de altura
  React.useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const run = () => {
      const h = el.scrollHeight;
      if (open) {
        el.style.height = h + "px";
        // al terminar, deja auto para contenido variable
        const t = setTimeout(() => {
          if (el.style.height === `${h}px`) el.style.height = "auto";
        }, 200);
        return () => clearTimeout(t);
      } else {
        // de auto a px para permitir transición hacia 0
        const current = getComputedStyle(el).height;
        el.style.height = current;
        // reflow
        void el.offsetHeight;
        el.style.height = "0px";
      }
    };

    run();
  }, [open]);

  const id = React.useId();
  const contentId = `${id}-collapsible-content`;

  return (
    <div
      id={contentId}
      data-slot="collapsible-content"
      data-state={open ? "open" : "closed"}
      ref={combinedRef}
      className={cx("overflow-hidden transition-[height] duration-200 ease-out", className)}
      style={{ height: open ? "auto" : 0, ...style }}
      {...props}
    >
      {children}
    </div>
  );
});
