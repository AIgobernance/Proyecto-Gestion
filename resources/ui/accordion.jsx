// resources/js/components/Accordion.jsx
import React, { createContext, useContext, useMemo, useState, useId, useRef, useEffect } from "react";

/** util simple para combinar clases */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** Icono chevron */
function ChevronDownIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/* ------------------- Contexto ------------------- */
const AccordionCtx = createContext(null);

/**
 * <Accordion type="single|multiple" defaultValue="item-1" ...>
 *  Compatible con la API mental de Radix (simplificada).
 */
function Accordion({
  type = "single", // "single" | "multiple"
  defaultValue,
  className,
  children,
  onValueChange,
  ...rest
}) {
  const isMultiple = type === "multiple";

  // estado interno: Set para "multiple", string|null para "single"
  const initial = useMemo(() => {
    if (isMultiple) {
      if (Array.isArray(defaultValue)) return new Set(defaultValue);
      if (typeof defaultValue === "string") return new Set([defaultValue]);
      return new Set();
    }
    return typeof defaultValue === "string" ? defaultValue : null;
  }, [isMultiple, defaultValue]);

  const [value, setValue] = useState(initial);

  const api = useMemo(
    () => ({
      type,
      isOpen: (val) =>
        isMultiple ? value.has && value.has(val) : value === val,
      toggle: (val) => {
        if (isMultiple) {
          setValue((prev) => {
            const next = new Set(prev);
            if (next.has(val)) next.delete(val);
            else next.add(val);
            onValueChange?.(Array.from(next));
            return next;
          });
        } else {
          setValue((prev) => {
            const next = prev === val ? null : val;
            onValueChange?.(next);
            return next;
          });
        }
      },
    }),
    [type, isMultiple, value, onValueChange]
  );

  return (
    <AccordionCtx.Provider value={api}>
      <div data-slot="accordion" className={className} {...rest}>
        {children}
      </div>
    </AccordionCtx.Provider>
  );
}

/* ------------------- Item ------------------- */
function AccordionItem({ className, value, children, ...rest }) {
  if (!value) {
    console.warn("AccordionItem requiere prop `value` única.");
  }
  const acc = useContext(AccordionCtx);
  const open = acc?.isOpen(value);

  return (
    <div
      data-slot="accordion-item"
      data-state={open ? "open" : "closed"}
      className={cn("border-b last:border-b-0", className)}
      {...rest}
    >
      {/* inyectamos value a descendientes vía prop oculta */}
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child, { __itemValue: value }) : child
      )}
    </div>
  );
}

/* ------------------- Trigger ------------------- */
function AccordionTrigger({ className, children, __itemValue, ...rest }) {
  const acc = useContext(AccordionCtx);
  const open = acc?.isOpen(__itemValue);
  const btnId = useId();
  const contentId = `${btnId}-content`;

  return (
    <div className="flex">
      <button
        id={btnId}
        aria-controls={contentId}
        aria-expanded={open ? "true" : "false"}
        onClick={() => acc?.toggle(__itemValue)}
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium",
          "transition-all outline-none hover:underline",
          "focus-visible:ring-[3px] focus-visible:ring-blue-500/50",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...rest}
      >
        <span>{children}</span>
        <ChevronDownIcon
          className={cn(
            "pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200",
            open && "rotate-180",
            "text-slate-500"
          )}
        />
      </button>
    </div>
  );
}

/* ------------------- Content ------------------- */
function AccordionContent({ className, children, __itemValue, ...rest }) {
  const acc = useContext(AccordionCtx);
  const open = acc?.isOpen(__itemValue);
  const btnId = useId();
  const contentId = `${btnId}-content`;
  const ref = useRef(null);

  // animación sencilla con height auto
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = el.scrollHeight;
    if (open) {
      el.style.height = h + "px";
      const tidy = () => (el.style.height = "auto");
      const t = setTimeout(tidy, 200);
      return () => clearTimeout(t);
    } else {
      // de auto a px para animar hacia arriba
      if (getComputedStyle(el).height === "auto") {
        el.style.height = h + "px";
        // reflow
        void el.offsetHeight;
      }
      el.style.height = "0px";
    }
  }, [open]);

  return (
    <div
      id={contentId}
      role="region"
      aria-hidden={open ? "false" : "true"}
      data-slot="accordion-content"
      data-state={open ? "open" : "closed"}
      className={cn(
        "overflow-hidden text-sm transition-[height] duration-200 ease-out",
        className
      )}
      style={{ height: open ? "auto" : 0 }}
      ref={ref}
      {...rest}
    >
      <div className="pt-0 pb-4">{children}</div>
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
