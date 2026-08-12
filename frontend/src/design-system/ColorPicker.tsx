import { cn } from "./utils";

const PRESET_COLORS = [
  "#df7d71",
  "#f3907b",
  "#0e2a4f",
  "#1b3456",
  "#304260",
  "#2f8f6b",
  "#c24b4b",
  "#c4893a",
  "#2563eb",
  "#7c3aed",
  "#0e7490",
  "#db2777",
] as const;

export type ColorPickerProps = {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  error?: string;
  className?: string;
};

export function ColorPicker({
  label = "Cor",
  value,
  onChange,
  error,
  className,
}: ColorPickerProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {PRESET_COLORS.map((color) => {
          const selected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              aria-label={`Selecionar cor ${color}`}
              aria-pressed={selected}
              onClick={() => onChange(color)}
              className={cn(
                "h-9 w-9 rounded-xl border-2 transition active:scale-95",
                selected
                  ? "border-neutral-900 ring-2 ring-primary/40 ring-offset-2"
                  : "border-white/80 hover:scale-105"
              )}
              style={{ backgroundColor: color }}
            />
          );
        })}
        <label className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-primary">
          <span className="text-[10px] font-bold text-neutral-500">+</span>
          <input
            type="color"
            value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : "#df7d71"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Cor personalizada"
          />
        </label>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
        <span
          className="inline-block h-3 w-3 rounded-full border border-neutral-200"
          style={{ backgroundColor: value }}
        />
        {value}
      </div>
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </div>
  );
}

export { PRESET_COLORS };
