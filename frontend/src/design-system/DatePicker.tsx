import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDate } from "./utils";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIso(value?: string) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildCalendarDays(viewMonth: Date) {
  const first = startOfMonth(viewMonth);
  const startOffset = first.getDay();
  const days: Date[] = [];

  for (let i = 0; i < 42; i += 1) {
    const day = new Date(first.getFullYear(), first.getMonth(), i - startOffset + 1);
    days.push(day);
  }
  return days;
}

export type DatePickerProps = {
  label: string;
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  name?: string;
};

export function DatePicker({
  label,
  value = "",
  onChange,
  error,
  helperText,
  className,
  id,
  min,
  max,
  disabled,
  name,
}: DatePickerProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error ? `${fieldId}-error` : helperText ? `${fieldId}-help` : undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = parseIso(value);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => selected ?? today);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (selected) setViewMonth(startOfMonth(selected));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = 252;
      const left = Math.min(rect.left, window.innerWidth - panelWidth - 12);
      const top = Math.min(rect.bottom + 6, window.innerHeight - 12);
      setCoords({ top, left: Math.max(12, left) });
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
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
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

  const minDate = parseIso(min);
  const maxDate = parseIso(max);
  const days = buildCalendarDays(viewMonth);

  function emit(next: string) {
    onChange?.({ target: { value: next } });
  }

  function isDisabled(day: Date) {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  }

  function selectDay(day: Date) {
    if (isDisabled(day)) return;
    emit(toIso(day));
    setOpen(false);
  }

  function selectToday() {
    if (isDisabled(today)) return;
    emit(toIso(today));
    setViewMonth(startOfMonth(today));
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
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "field-control flex items-center justify-between gap-2 text-left",
          error && "field-control-error",
          !value && "text-neutral-400"
        )}
      >
        <span>{value ? formatDate(value) : "Selecionar data"}</span>
        <CalendarDays size={16} className="shrink-0 text-primary" />
      </button>
      {name ? <input type="hidden" name={name} value={value} readOnly /> : null}

      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Calendário"
              className="fixed z-[95] w-[252px] animate-fade-up rounded-2xl border border-neutral-200 p-2.5 shadow-lift"
              style={{
                top: coords.top,
                left: coords.left,
                backgroundColor: "#ffffff",
              }}
            >
              <div className="mb-2 flex items-center justify-between gap-1 px-0.5">
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-primary-muted hover:text-primary"
                  onClick={() => setViewMonth((current) => addMonths(current, -1))}
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <p className="font-display text-xs font-semibold text-neutral-900">
                  {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </p>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-primary-muted hover:text-primary"
                  onClick={() => setViewMonth((current) => addMonths(current, 1))}
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="mb-0.5 grid grid-cols-7 gap-0.5 px-0.5">
                {WEEKDAYS.map((day, index) => (
                  <span
                    key={`${day}-${index}`}
                    className="py-0.5 text-center text-[10px] font-semibold text-neutral-400"
                  >
                    {day}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days.map((day) => {
                  const inMonth = day.getMonth() === viewMonth.getMonth();
                  const selectedDay = selected ? isSameDay(day, selected) : false;
                  const isToday = isSameDay(day, today);
                  const disabledDay = isDisabled(day);

                  return (
                    <button
                      key={toIso(day)}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => selectDay(day)}
                      className={cn(
                        "h-7 rounded-xl text-xs font-medium transition",
                        !inMonth && "text-neutral-300",
                        inMonth &&
                          !selectedDay &&
                          "text-neutral-800 hover:bg-primary-muted hover:text-primary",
                        isToday && !selectedDay && "ring-1 ring-primary/40",
                        selectedDay &&
                          "bg-primary text-primary-foreground shadow-soft hover:bg-primary",
                        disabledDay &&
                          "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-inherit"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-neutral-100 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
                  onClick={() => {
                    emit("");
                    setOpen(false);
                  }}
                >
                  Limpar
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary-muted px-2 py-1 text-[11px] font-semibold text-primary transition hover:brightness-95 disabled:opacity-40"
                  onClick={selectToday}
                  disabled={isDisabled(today)}
                >
                  Hoje
                </button>
              </div>
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
