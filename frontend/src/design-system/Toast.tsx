import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "./utils";

const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lift animate-toast-in",
  {
    variants: {
      variant: {
        success: "border-success/30 bg-success-muted text-success",
        error: "border-danger/30 bg-danger-muted text-danger",
        warning: "border-warning/30 bg-warning-muted text-warning",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
);

type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  push: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastView({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const Icon =
    item.variant === "success" ? CheckCircle2 : item.variant === "warning" ? AlertTriangle : XCircle;

  return (
    <div className={cn(toastVariants({ variant: item.variant }))} role="status">
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm font-medium text-neutral-800">{item.message}</p>
      <button
        type="button"
        className="text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        onClick={() => onDismiss(item.id)}
      >
        Fechar
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = crypto.randomUUID();
      setItems((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-20 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:bottom-6">
        {items.map((item) => (
          <ToastView key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}

export type { ToastVariant };
