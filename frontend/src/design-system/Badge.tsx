import { HTMLAttributes } from "react";
import { cn } from "./utils";

const CATEGORY_COLOR_MAP: Record<string, string> = {
  alimentação: "#df7d71",
  alimentacao: "#df7d71",
  transporte: "#1b3456",
  moradia: "#304260",
  lazer: "#f3907b",
  saúde: "#2f8f6b",
  saude: "#2f8f6b",
  educação: "#c4893a",
  educacao: "#c4893a",
  salário: "#0e2a4f",
  salario: "#0e2a4f",
  freelance: "#df7d71",
  investimentos: "#2f8f6b",
  outros: "#5a6a7e",
};

function resolveColor(category?: string, color?: string) {
  if (color) return color;
  if (!category) return "#667269";
  const key = category.trim().toLowerCase();
  return CATEGORY_COLOR_MAP[key] ?? "#5a6a7e";
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: string;
  color?: string;
}

export function Badge({ category, color, className, children, style, ...props }: BadgeProps) {
  const resolved = resolveColor(category, color);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        className
      )}
      style={{
        backgroundColor: `${resolved}22`,
        color: "#171717",
        ...style,
      }}
      {...props}
    >
      {children ?? category}
    </span>
  );
}

export { CATEGORY_COLOR_MAP };
