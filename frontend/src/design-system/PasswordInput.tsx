import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "./utils";

export type PasswordInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  label: string;
  error?: string;
  helperText?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const fieldId = id ?? label.replace(/\s+/g, "-").toLowerCase();
    const describedBy = error
      ? `${fieldId}-error`
      : helperText
        ? `${fieldId}-help`
        : undefined;

    return (
      <label className={cn("flex w-full flex-col gap-1.5", className)} htmlFor={fieldId}>
        <span className="text-sm font-medium text-neutral-700">{label}</span>
        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            type={visible ? "text" : "password"}
            className={cn(
              "w-full rounded-2xl border border-neutral-200 bg-white/95 px-3.5 py-2.5 pr-11 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60",
              error && "border-danger focus:ring-danger/30"
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            {...props}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
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

PasswordInput.displayName = "PasswordInput";
