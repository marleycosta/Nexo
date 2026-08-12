import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./utils";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  footerClassName?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
  footerClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button
        type="button"
        aria-label="Fechar modal"
        className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[81] flex items-end justify-center p-4 pointer-events-none sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn(
            "pointer-events-auto w-full max-w-lg animate-fade-up rounded-2xl border border-white/70 bg-[var(--surface-strong)] p-5 shadow-lift",
            className
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 id="modal-title" className="font-display text-lg font-semibold text-neutral-900">
              {title}
            </h2>
            <Button variant="ghost" size="sm" aria-label="Fechar" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          <div>{children}</div>
          {footer ? (
            <div className={cn("mt-5 flex justify-end gap-2", footerClassName)}>{footer}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
