"use client";

import * as React from "react";
import { cn } from "./utils";

/* =======================================================================
   Icono inline (reemplazo de lucide MinusIcon)
======================================================================= */
function MinusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
      <path d="M5 12h14"/>
    </svg>
  );
}

/* =======================================================================
   Contexto público (API espejo de input-otp)
======================================================================= */
const OTPInputContext = React.createContext(null);

/* =======================================================================
   Helpers
======================================================================= */
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

function normalizeValue(v = "", len) {
  return (String(v).slice(0, len) || "").padEnd(len, "");
}

/* =======================================================================
   Root
   Props compatibles clave:
   - length (número de casillas)
   - value / defaultValue (string)
   - onChange(next: string)
   - disabled, autoFocus, inputMode, pattern
   - containerClassName (clases para el contenedor visual)
   - className (clases para el input oculto)
======================================================================= */
function OTPInput({
  length = 6,
  value: controlled,
  defaultValue = "",
  onChange,
  disabled,
  autoFocus,
  inputMode = "numeric",
  pattern,
  containerClassName,
  className,
  children,
  ...rest
}) {
  const isControlled = controlled !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(String(defaultValue).slice(0, length));
  const value = isControlled ? String(controlled).slice(0, length) : uncontrolled;

  const inputRef = React.useRef(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const setValue = React.useCallback((next) => {
    const trimmed = String(next).slice(0, length);
    if (!isControlled) setUncontrolled(trimmed);
    onChange?.(trimmed);
  }, [isControlled, length, onChange]);

  const setCharAt = React.useCallback((idx, ch) => {
    const chars = normalizeValue(value, length).split("");
    chars[idx] = ch;
    setValue(chars.join("").trimEnd());
  }, [value, length, setValue]);

  // Validación de caracteres: si inputMode numeric, aceptar 0-9; si hay pattern, usarlo.
  const acceptChar = React.useCallback((ch) => {
    if (!ch) return false;
    if (pattern) {
      try { return new RegExp(pattern).test(ch); } catch { /* ignore */ }
    }
    if (inputMode === "numeric") return /[0-9]/.test(ch);
    return ch.trim().length === 1; // un solo carácter visible
  }, [inputMode, pattern]);

  const handleKeyDown = React.useCallback((e) => {
    if (disabled) return;
    const key = e.key;
    if (key === "ArrowLeft") { e.preventDefault(); setActiveIndex((i) => clamp(i - 1, 0, length - 1)); return; }
    if (key === "ArrowRight") { e.preventDefault(); setActiveIndex((i) => clamp(i + 1, 0, length - 1)); return; }
    if (key === "Backspace") {
      e.preventDefault();
      const chars = normalizeValue(value, length).split("");
      const i = activeIndex;
      if (chars[i]) { setCharAt(i, ""); }
      else { const j = clamp(i - 1, 0, length - 1); setActiveIndex(j); setCharAt(j, ""); }
      return;
    }
    if (key.length === 1 && acceptChar(key)) {
      e.preventDefault();
      const i = activeIndex;
      setCharAt(i, key);
      setActiveIndex((x) => clamp(x + 1, 0, length - 1));
    }
  }, [disabled, length, value, activeIndex, setCharAt, acceptChar]);

  const handlePaste = React.useCallback((e) => {
    if (disabled) return;
    const text = (e.clipboardData?.getData("text") || "").replace(/\s+/g, "");
    if (!text) return;
    e.preventDefault();
    const chars = normalizeValue(value, length).split("");
    let i = activeIndex;
    for (const ch of text) {
      if (!acceptChar(ch)) continue;
      chars[i] = ch;
      i = clamp(i + 1, 0, length - 1);
      if (i === length - 1 && chars[i]) break;
    }
    setValue(chars.join("").trimEnd());
    setActiveIndex(i);
  }, [disabled, value, length, activeIndex, setValue, acceptChar]);

  const focusInput = () => inputRef.current?.focus();

  // Slots expuestos en el contexto
  const slots = React.useMemo(() => {
    const filled = normalizeValue(value, length);
    return Array.from({ length }, (_, i) => ({
      char: filled[i]?.trim() || "",
      isActive: isFocused && activeIndex === i,
      hasFakeCaret: isFocused && activeIndex === i && !filled[i]?.trim(),
    }));
  }, [value, length, isFocused, activeIndex]);

  const ctx = React.useMemo(() => ({
    slots,
    activeIndex,
    setActiveIndex: (i) => setActiveIndex(clamp(i, 0, length - 1)),
    focusInput,
  }), [slots, length]);

  return (
    <OTPInputContext.Provider value={ctx}>
      <div
        data-slot="input-otp"
        className={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
        onClick={() => focusInput()}
      >
        {/* Input real oculto para eventos de teclado/paste */}
        <input
          {...rest}
          ref={inputRef}
          value={value}
          onChange={() => {/* manejo manual: noop */}}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          inputMode={inputMode}
          aria-hidden
          className={cn("sr-only disabled:cursor-not-allowed", className)}
          autoFocus={autoFocus}
        />
        {children}
      </div>
    </OTPInputContext.Provider>
  );
}

/* =======================================================================
   Grupo visual (solo layout)
======================================================================= */
function InputOTPGroup({ className, ...props }) {
  return (
    <div data-slot="input-otp-group" className={cn("flex items-center gap-1", className)} {...props} />
  );
}

/* =======================================================================
   Slot visual: lee del contexto y pinta caret
======================================================================= */
function InputOTPSlot({ index, className, ...props }) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};
  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r bg-input-background text-sm transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md",
        "data-[active=true]:z-10 data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:border-ring",
        "aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        inputOTPContext?.setActiveIndex?.(index);
        inputOTPContext?.focusInput?.();
      }}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

/* =======================================================================
   Separador
======================================================================= */
function InputOTPSeparator(props) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

/* =======================================================================
   Exports
======================================================================= */
export { OTPInput, OTPInputContext, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

/* =======================================================================
   Wrapper API idéntica a la de tu TSX
======================================================================= */
function InputOTP({ className, containerClassName, ...props }) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

export { InputOTP };