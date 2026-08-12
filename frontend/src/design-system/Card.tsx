import { HTMLAttributes, ReactNode } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "./utils";

type DefaultCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "default";
  children: ReactNode;
};

type KpiCardProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  variant: "kpi";
  label: string;
  value: number | string;
  trend?: number;
};

export type CardProps = DefaultCardProps | KpiCardProps;

export function Card(props: CardProps) {
  if (props.variant === "kpi") {
    const { label, value, trend, className, variant: _variant, ...rest } = props;
    const numericTrend = typeof trend === "number" ? trend : undefined;
    const positive = numericTrend !== undefined && numericTrend >= 0;

    return (
      <article
        className={cn(
          "animate-fade-up rounded-2xl border border-white/70 bg-[var(--surface)] p-4 shadow-soft backdrop-blur-sm md:p-5",
          className
        )}
        {...rest}
      >
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <p className="mt-2 font-display text-xl font-semibold text-neutral-900 md:text-2xl">
          {typeof value === "number" ? formatCurrency(value) : value}
        </p>
        {numericTrend !== undefined ? (
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
              positive ? "text-success" : "text-danger"
            )}
          >
            {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {positive ? "+" : ""}
            {numericTrend.toFixed(1)}%
          </p>
        ) : null}
      </article>
    );
  }

  const { children, className, variant: _variant, ...rest } = props;
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/70 bg-[var(--surface)] p-4 shadow-soft backdrop-blur-sm md:p-6",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
