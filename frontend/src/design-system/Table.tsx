import { ReactNode } from "react";
import { cn } from "./utils";

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

export type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function Table<T>({
  columns,
  data,
  rowKey,
  emptyTitle = "Nada por aqui",
  emptyDescription = "Não há registros para exibir com os filtros atuais.",
  className,
}: TableProps<T>) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-neutral-200 bg-white/80", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-50/90 text-neutral-800">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={cn("px-4 py-3 font-bold", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="font-display text-lg text-neutral-800">{emptyTitle}</p>
                  <p className="mt-1 text-sm text-neutral-500">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-t border-neutral-100 transition hover:bg-primary-muted/40"
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn("px-4 py-3 text-neutral-800", column.className)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
