import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";

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

const MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

function parseMonth(value?: string) {
  if (!value) return null;
  const [y, m] = value.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return null;
  return { year: y, month: m };
}

function formatMonthLabel(value: string) {
  const parsed = parseMonth(value);
  if (!parsed) return "Selecionar mês";
  return `${MONTHS[parsed.month - 1]} ${parsed.year}`;
}

function toMonthValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export type MonthPickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
  inlineLabel?: boolean;
};

export function MonthPicker({
  label = "Mês",
  value,
  onChange,
  className,
  id,
  inlineLabel = false,
}: MonthPickerProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const parsed = parseMonth(value);
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.year ?? now.getFullYear());
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (parsed) setViewYear(parsed.year);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = 240;
      const left = Math.min(Math.max(12, rect.right - panelWidth), window.innerWidth - panelWidth - 12);
      setCoords({ top: rect.bottom + 6, left });
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

  function selectMonth(monthIndex: number) {
    onChange(toMonthValue(viewYear, monthIndex + 1));
    setOpen(false);
  }

  function selectCurrent() {
    onChange(toMonthValue(now.getFullYear(), now.getMonth() + 1));
    setViewYear(now.getFullYear());
    setOpen(false);
  }

  return (
    <div
      className={cn(
        "relative",
        inlineLabel ? "flex items-center gap-2" : "flex flex-col gap-1.5",
        className
      )}
      ref={rootRef}
    >
      {label ? (
        <label htmlFor={fieldId} className="shrink-0 text-sm font-medium text-neutral-700">
          {label}
        </label>
      ) : null}
      <button
        ref={buttonRef}
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="field-control flex min-w-[200px] items-center justify-between gap-2 text-left"
      >
        <span className="truncate">{formatMonthLabel(value)}</span>
        <CalendarDays size={16} className="shrink-0 text-primary" />
      </button>

      {open && coords
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Selecionar mês e ano"
              className="fixed z-[95] w-[240px] animate-fade-up rounded-2xl border border-neutral-200 p-2.5 shadow-lift"
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
                  onClick={() => setViewYear((year) => year - 1)}
                  aria-label="Ano anterior"
                >
                  <ChevronLeft size={14} />
                </button>
                <p className="font-display text-xs font-semibold text-neutral-900">{viewYear}</p>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-primary-muted hover:text-primary"
                  onClick={() => setViewYear((year) => year + 1)}
                  aria-label="Próximo ano"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {MONTHS_SHORT.map((monthLabel, index) => {
                  const selected =
                    parsed?.year === viewYear && parsed.month === index + 1;
                  const isCurrent =
                    now.getFullYear() === viewYear && now.getMonth() === index;

                  return (
                    <button
                      key={monthLabel}
                      type="button"
                      onClick={() => selectMonth(index)}
                      className={cn(
                        "rounded-xl px-1.5 py-1.5 text-xs font-semibold transition",
                        selected
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-neutral-700 hover:bg-primary-muted hover:text-primary",
                        isCurrent && !selected && "ring-1 ring-primary/40"
                      )}
                    >
                      {monthLabel}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-end border-t border-neutral-100 pt-2">
                <button
                  type="button"
                  className="rounded-lg bg-primary-muted px-2 py-1 text-[11px] font-semibold text-primary transition hover:brightness-95"
                  onClick={selectCurrent}
                >
                  Mês atual
                </button>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
