import { Button } from "./Button";
import { cn } from "./utils";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm",
        className
      )}
    >
      <p className="whitespace-nowrap text-xs font-medium text-neutral-500">
        Página {page} de {totalPages} · {total} itens
      </p>
      <div className="flex gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
