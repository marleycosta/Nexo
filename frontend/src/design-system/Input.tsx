import {
  ChangeEvent,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "./utils";
import { DatePicker } from "./DatePicker";
import { Select, type SelectOption } from "./Select";

type BaseProps = {
  label: string;
  error?: string;
  helperText?: string;
  optional?: boolean;
  className?: string;
};

type TextLikeProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
    type?: "text" | "number" | "date" | "password" | "email";
  };

type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "type"> & {
    type: "textarea";
    rows?: number;
  };

type SelectProps = BaseProps & {
  type: "select";
  value?: string;
  options: SelectOption[];
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
};

export type InputProps = TextLikeProps | TextareaProps | SelectProps;

function LabelRow({
  label,
  optional,
}: {
  label: string;
  optional?: boolean;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 text-sm font-medium text-neutral-700">
      {label}
      {optional ? (
        <span className="text-[11px] font-normal text-neutral-400">Opcional</span>
      ) : null}
    </span>
  );
}

function sanitizeNumber(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const { label, error, helperText, className, optional } = props;

    if (props.type === "date") {
      return (
        <DatePicker
          label={label}
          value={typeof props.value === "string" ? props.value : ""}
          onChange={(event) => {
            props.onChange?.(event as ChangeEvent<HTMLInputElement>);
          }}
          error={error}
          helperText={helperText}
          className={className}
          id={props.id}
          min={props.min != null ? String(props.min) : undefined}
          max={props.max != null ? String(props.max) : undefined}
          disabled={props.disabled}
          name={props.name}
        />
      );
    }

    if (props.type === "select") {
      return (
        <Select
          label={label}
          value={props.value ?? ""}
          options={props.options}
          onChange={props.onChange}
          error={error}
          helperText={helperText}
          className={className}
          id={props.id}
          disabled={props.disabled}
          name={props.name}
          placeholder={props.placeholder}
        />
      );
    }

    const fieldId = props.id ?? label.replace(/\s+/g, "-").toLowerCase();
    const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined;
    const controlClass = cn("field-control", error && "field-control-error");

    if (props.type === "textarea") {
      const {
        error: _e,
        helperText: _h,
        label: _l,
        className: _c,
        optional: _o,
        type: _t,
        rows = 3,
        ...textareaProps
      } = props;

      return (
        <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={fieldId}>
          <LabelRow label={label} optional={optional} />
          <textarea
            id={fieldId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={cn(controlClass, "min-h-[4.75rem] resize-y leading-5")}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            {...textareaProps}
          />
          {error ? (
            <span id={describedBy} className="text-xs text-danger">
              {error}
            </span>
          ) : helperText ? (
            <span id={describedBy} className="text-xs text-neutral-500">
              {helperText}
            </span>
          ) : null}
        </label>
      );
    }

    const {
      error: _e,
      helperText: _h,
      label: _l,
      className: _c,
      optional: _o,
      onChange,
      ...inputProps
    } = props;

    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={fieldId}>
        <LabelRow label={label} optional={optional} />
        <input
          id={fieldId}
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(controlClass, props.type === "number" && "field-control-number")}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          inputMode={props.type === "number" ? "decimal" : undefined}
          {...inputProps}
          onChange={(event) => {
            if (props.type === "number") {
              const next = sanitizeNumber(event.target.value);
              event.target.value = next;
            }
            onChange?.(event);
          }}
          onKeyDown={(event) => {
            if (props.type === "number") {
              const allowed = [
                "Backspace",
                "Delete",
                "Tab",
                "Escape",
                "Enter",
                "ArrowLeft",
                "ArrowRight",
                "Home",
                "End",
              ];
              if (allowed.includes(event.key)) return;
              if ((event.ctrlKey || event.metaKey) && ["a", "c", "v", "x"].includes(event.key.toLowerCase())) {
                return;
              }
              if (!/[\d.,]/.test(event.key)) {
                event.preventDefault();
              }
            }
            props.onKeyDown?.(event);
          }}
        />
        {error ? (
          <span id={describedBy} className="text-xs text-danger">
            {error}
          </span>
        ) : helperText ? (
          <span id={describedBy} className="text-xs text-neutral-500">
            {helperText}
          </span>
        ) : null}
      </label>
    );
  }
);

Input.displayName = "Input";
