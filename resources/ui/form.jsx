"use client";

import * as React from "react";
import { cn } from "./utils";
import { Label } from "./label";

/* =======================================================================
   Slot mínimo (reemplazo de @radix-ui/react-slot)
======================================================================= */
const Slot = React.forwardRef(function Slot({ children, className, ...rest }, ref) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...rest,
      ref,
      className: cn(children.props.className, className),
    });
  }
  return <div ref={ref} className={className} {...rest} />;
});

/* =======================================================================
   FormContext: valores + errores mínimos
======================================================================= */
const FormCtx = React.createContext(null);

function Form({ children, initialValues = {}, initialErrors = {}, ...props }) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState(initialErrors);

  const setValue = React.useCallback((name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
  }, []);

  const setError = React.useCallback((name, error) => {
    setErrors((e) => ({ ...e, [name]: error }));
  }, []);

  const clearError = React.useCallback((name) => {
    setErrors((e) => {
      const { [name]: _, ...rest } = e || {};
      return rest;
    });
  }, []);

  const getFieldState = React.useCallback(
    (name) => {
      const message = errors?.[name];
      return { invalid: !!message, error: message ? { message } : undefined };
    },
    [errors]
  );

  const formState = React.useMemo(() => ({ values, errors }), [values, errors]);

  const api = React.useMemo(
    () => ({ values, errors, setValue, setError, clearError, getFieldState, formState }),
    [values, errors, setValue, setError, clearError, getFieldState]
  );

  return (
    <FormCtx.Provider value={api}>
      <div data-slot="form" {...props}>{children}</div>
    </FormCtx.Provider>
  );
}

function useFormContext() {
  const ctx = React.useContext(FormCtx);
  if (!ctx) throw new Error("useFormContext must be used within <Form>");
  return ctx;
}

function useFormState(/*opts*/) {
  const { formState } = useFormContext();
  return formState;
}

/* =======================================================================
   FormField context (nombre del campo)
======================================================================= */
const FormFieldContext = React.createContext({ name: undefined });

function FormField({ name, defaultValue, rules, render, ...rest }) {
  const { values, setValue, getFieldState, setError, clearError } = useFormContext();

  React.useEffect(() => {
    if (defaultValue !== undefined && values[name] === undefined) {
      setValue(name, defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  function validate(value) {
    if (!rules) return;
    if (rules?.required && (value === undefined || value === null || value === "")) {
      const message = typeof rules.required === "string" ? rules.required : "Este campo es requerido";
      setError(name, message);
      return;
    }
    clearError(name);
  }

  const field = {
    name,
    value: values[name],
    onChange: (e) => {
      const next = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
      setValue(name, next);
    },
    onBlur: () => validate(values[name]),
    ref: () => {},
  };

  const fieldState = getFieldState(name);

  const content = render ? render({ field, fieldState, formState: useFormState() }) : null;

  return (
    <FormFieldContext.Provider value={{ name }}>
      {content}
    </FormFieldContext.Provider>
  );
}

/* =======================================================================
   Hook useFormField (como en tu TSX)
======================================================================= */
function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext || !fieldContext.name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
}

/* =======================================================================
   Item / Label / Control / Description / Message
======================================================================= */
const FormItemContext = React.createContext({ id: "" });

function FormItem({ className, ...props }) {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({ className, ...props }) {
  const { error, formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl(props) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();
  return (
    <p data-slot="form-description" id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

function FormMessage({ className, children, ...props }) {
  const { formMessageId, error } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p data-slot="form-message" id={formMessageId} className={cn("text-destructive text-sm", className)} {...props}>
      {body}
    </p>
  );
}

/* =======================================================================
   Exports
======================================================================= */
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};