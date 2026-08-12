import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "./utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  label: string;
  value?: string;
  options: SelectOption[];
  onChange?: (event: { target: { value: string } }) => void;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  disabled?: boolean;
  name?: string;
  placeholder?: string;
};

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function Select({
  label,
  value = "",
  options,
  onChange,
  error,
  helperText,
  className,
  id,
  disabled,
  name,
  placeholder = "Selecionar",
}: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);

  const selected = options.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom - 12;
      const spaceAbove = rect.top - 12;
      const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
      const maxHeight = Math.min(224, Math.max(120, preferBelow ? spaceBelow : spaceAbove));
      const top = preferBelow ? rect.bottom + 6 : Math.max(8, rect.top - maxHeight - 6);

      setCoords({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
      });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: string) {
    onChange?.({ target: { value: next } });
    setOpen(false);
  }

  return (
    <div className={cn("relative flex w-full flex-col gap-1.5", className)} ref={rootRef}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <button
        ref={buttonRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "field-control flex items-center justify-between gap-2 text-left",
          error && "field-control-error",
          !selected && "text-neutral-400"
        )}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-primary transition", open && "rotate-180")}
        />
      </button>
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

      {open && coords
        ? createPortal(
            <div
              ref={menuRef}
              role="listbox"
              aria-label={label}
              className="fixed z-[95] overflow-auto rounded-2xl border border-neutral-200 p-1.5 shadow-lift"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
                maxHeight: coords.maxHeight,
                backgroundColor: "#ffffff",
              }}
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value || "__empty"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium transition",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <Check size={13} className="shrink-0" /> : null}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}

      {error ? (
        <span id={describedBy} className="text-xs text-danger">
          {error}
        </span>
      ) : helperText ? (
        <span id={describedBy} className="text-xs text-neutral-500">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
