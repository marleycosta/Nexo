import { ReactNode, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./utils";

export type TooltipProps = {
  content: string;
  children: ReactNode;
  className?: string;
};

type TooltipCoords = {
  top: number;
  left: number;
  maxWidth: number;
  placeAbove: boolean;
};

export function Tooltip({ content, children, className }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const maxWidth = Math.min(520, window.innerWidth - 24);
      const left = Math.min(
        Math.max(12, rect.left),
        window.innerWidth - maxWidth - 12
      );
      const placeAbove = rect.top > 120;
      const top = placeAbove
        ? Math.max(8, rect.top - 8)
        : Math.min(window.innerHeight - 8, rect.bottom + 8);

      setCoords({ top, left, maxWidth, placeAbove });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, content]);

  useLayoutEffect(() => {
    if (!open || !coords || !tooltipRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    if (coords.placeAbove && tip.top < 8) {
      setCoords((current) =>
        current
          ? {
              ...current,
              placeAbove: false,
              top: Math.min(
                window.innerHeight - 8,
                (triggerRef.current?.getBoundingClientRect().bottom ?? 0) + 8
              ),
            }
          : current
      );
    }
  }, [open, coords]);

  if (!content) return <>{children}</>;

  return (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex max-w-full", className)}
      aria-describedby={open ? tooltipId : undefined}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && coords
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              className={cn(
                "pointer-events-none fixed z-[90] max-h-[min(50vh,320px)] overflow-y-auto whitespace-normal break-words rounded-xl border border-neutral-200 bg-[var(--surface-strong)] px-3 py-2 text-xs font-medium leading-snug text-neutral-900 shadow-lift",
                coords.placeAbove ? "-translate-y-full" : "translate-y-0"
              )}
              style={{
                top: coords.top,
                left: coords.left,
                width: "max-content",
                maxWidth: coords.maxWidth,
              }}
            >
              {content}
            </span>,
            document.body
          )
        : null}
    </span>
  );
}
