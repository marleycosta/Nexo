import { useEffect, useMemo, useState } from "react";
import ExcelJS from "exceljs";
import { Download, Filter, Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  MonthPicker,
  Pagination,
  Table,
  formatCurrency,
  formatDate,
  currentMonthValue,
  parseIsoDate,
  MONTH_NAMES,
  useToast,
  Tooltip,
  type TableColumn,
} from "@/design-system";
import { listCategories } from "../services/categories";
import { deleteTransaction, listTransactions } from "../services/transactions";
import type { Category, Transaction } from "../types";
import { ApiError } from "../services/api";
import { TransactionFormModal } from "./TransactionFormModal";

const BRAND_ARGB = "FFDF7D71";
const HEADER_ARGB = "FFE5E7EB";
const FILTER_BG_ARGB = "FFF8FAFC";
const STRIPE_ARGB = "FFF7F8FA";

const PAGE_SIZE = 8;

type PeriodMode = "current_month" | "range" | "all";

type Filters = {
  period: PeriodMode;
  month: string;
  category: string;
  dateFrom: string;
  dateTo: string;
};

function monthBounds(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    dateFrom: `${monthValue}-01`,
    dateTo: `${monthValue}-${String(lastDay).padStart(2, "0")}`,
  };
}

function defaultFilters(): Filters {
  const month = currentMonthValue();
  return {
    period: "current_month",
    month,
    category: "",
    dateFrom: "",
    dateTo: "",
  };
}

function resolveDateRange(filters: Filters) {
  if (filters.period === "all") {
    return { dateFrom: undefined as string | undefined, dateTo: undefined as string | undefined };
  }
  if (filters.period === "current_month") {
    const bounds = monthBounds(filters.month);
    return { dateFrom: bounds.dateFrom, dateTo: bounds.dateTo };
  }
  return {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  };
}

function hexToArgb(hex?: string) {
  if (!hex) return "FF94A3B8";
  const clean = hex.replace("#", "").trim();
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    const expanded = clean
      .split("")
      .map((c) => c + c)
      .join("");
    return `FF${expanded.toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `FF${clean.toUpperCase()}`;
  return "FF94A3B8";
}

function contrastTextArgb(hex?: string) {
  const argb = hexToArgb(hex);
  const r = parseInt(argb.slice(2, 4), 16);
  const g = parseInt(argb.slice(4, 6), 16);
  const b = parseInt(argb.slice(6, 8), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "FF1F2937" : "FFFFFFFF";
}

function describeFilters(filters: Filters, categoryMap: Record<number, Category>) {
  let period = "Todas as datas";
  if (filters.period === "current_month") {
    const [year, month] = (filters.month || currentMonthValue()).split("-").map(Number);
    period = `Por mês (${MONTH_NAMES[(month || 1) - 1]} ${year})`;
  } else if (filters.period === "range") {
    const from = filters.dateFrom ? formatDate(filters.dateFrom) : "—";
    const to = filters.dateTo ? formatDate(filters.dateTo) : "—";
    period = `Intervalo (${from} até ${to})`;
  }

  const category = filters.category
    ? categoryMap[Number(filters.category)]?.nome || filters.category
    : "Todas";

  return {
    period,
    category,
    exportedAt: formatDate(new Date().toISOString().slice(0, 10)),
  };
}

async function downloadExcel(
  rows: Transaction[],
  categoryMap: Record<number, Category>,
  filters: Filters
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nexo";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Transações", {
    views: [{ state: "frozen", ySplit: 6 }],
  });

  sheet.columns = [
    { key: "valor", width: 14 },
    { key: "descricao", width: 42 },
    { key: "categoria", width: 22 },
    { key: "data", width: 14 },
    { key: "tipo", width: 12 },
  ];

  sheet.mergeCells("A1:E1");
  const title = sheet.getCell("A1");
  title.value = "Nexo — Transações";
  title.font = { name: "Calibri", size: 18, bold: true, color: { argb: BRAND_ARGB } };
  title.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 26;

  const filterInfo = describeFilters(filters, categoryMap);
  const filterRows: Array<[string, string]> = [
    ["Período", filterInfo.period],
    ["Categoria", filterInfo.category],
    ["Exportado em", filterInfo.exportedAt],
  ];

  filterRows.forEach(([label, value], index) => {
    const rowNumber = 2 + index;
    const row = sheet.getRow(rowNumber);
    row.getCell(1).value = label;
    sheet.mergeCells(`B${rowNumber}:E${rowNumber}`);
    row.getCell(2).value = value;
    row.getCell(1).font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FF334155" },
    };
    row.getCell(2).font = { name: "Calibri", size: 11, color: { argb: "FF1E293B" } };
    [1, 2, 3, 4, 5].forEach((col) => {
      row.getCell(col).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: FILTER_BG_ARGB },
      };
    });
    row.height = 16;
  });

  const headerRow = sheet.getRow(6);
  ["Valor", "Descrição", "Categoria", "Data", "Tipo"].forEach((label, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = label;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF334155" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_ARGB },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: index === 0 || index === 3 || index === 4 ? "center" : "left",
    };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });
  headerRow.height = 20;

  rows.forEach((row, index) => {
    const cat = row.categoria_detail || categoryMap[row.categoria];
    const excelRow = sheet.getRow(7 + index);
    const amount = Number(row.valor);
    const isIncome = row.tipo === "receita";
    const categoryColor = hexToArgb(cat?.cor);

    excelRow.getCell(1).value = Number.isFinite(amount) ? amount : 0;
    excelRow.getCell(1).numFmt = '"R$"#,##0.00';
    excelRow.getCell(1).font = {
      name: "Calibri",
      size: 11,
      color: { argb: "FF1E293B" },
    };
    excelRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };

    excelRow.getCell(2).value = row.descricao || "—";
    excelRow.getCell(2).font = { name: "Calibri", size: 11, color: { argb: "FF1E293B" } };
    excelRow.getCell(2).alignment = { vertical: "middle" };

    excelRow.getCell(3).value = cat?.nome || "—";
    excelRow.getCell(3).font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: contrastTextArgb(cat?.cor) },
    };
    excelRow.getCell(3).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: categoryColor },
    };
    excelRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

    excelRow.getCell(4).value = parseIsoDate(row.data);
    excelRow.getCell(4).numFmt = "dd/mm/yyyy";
    excelRow.getCell(4).font = { name: "Calibri", size: 11, color: { argb: "FF334155" } };
    excelRow.getCell(4).alignment = { horizontal: "center", vertical: "middle" };

    excelRow.getCell(5).value = isIncome ? "Receita" : "Despesa";
    excelRow.getCell(5).font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: isIncome ? "FFDF7D71" : "FFC24B4B" },
    };
    excelRow.getCell(5).alignment = { horizontal: "center", vertical: "middle" };

    if (index % 2 === 1) {
      [1, 2, 4, 5].forEach((col) => {
        excelRow.getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: STRIPE_ARGB },
        };
      });
    }

    excelRow.height = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `nexo-transacoes-${new Date().toISOString().slice(0, 10)}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TransactionsPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [applied, setApplied] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => toast.push("Falha ao carregar categorias", "error"));
  }, [toast]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const range = resolveDateRange(applied);
    listTransactions({
      category: applied.category || undefined,
      date_from: range.dateFrom,
      date_to: range.dateTo,
      page,
      page_size: PAGE_SIZE,
    })
      .then((data) => {
        if (!active) return;
        setRows(data.results);
        setTotal(data.count);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Falha ao carregar transações";
        toast.push(message, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applied, page, toast, reloadKey]);

  function openCreateModal() {
    setEditingId(null);
    setFormOpen(true);
  }

  function openEditModal(id: number) {
    setEditingId(id);
    setFormOpen(true);
  }

  function closeFormModal() {
    setFormOpen(false);
    setEditingId(null);
  }
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((item) => [item.id, item])),
    [categories]
  );

  function applyFilters() {
    if (draft.period === "range" && draft.dateFrom && draft.dateTo && draft.dateFrom > draft.dateTo) {
      toast.push("A data inicial não pode ser maior que a final", "warning");
      return;
    }
    setPage(1);
    setApplied(draft);
  }

  function clearFilters() {
    const next = defaultFilters();
    setDraft(next);
    setApplied(next);
    setPage(1);
  }

  async function exportVisibleTable() {
    setExporting(true);
    try {
      const range = resolveDateRange(applied);
      const data = await listTransactions({
        category: applied.category || undefined,
        date_from: range.dateFrom,
        date_to: range.dateTo,
        page: 1,
        page_size: Math.max(total, PAGE_SIZE),
      });
      if (!data.results.length) {
        toast.push("Não há transações para exportar", "warning");
        return;
      }
      await downloadExcel(data.results, categoryMap, applied);
      toast.push("Planilha gerada com sucesso", "success");
    } catch {
      toast.push("Não foi possível exportar", "error");
    } finally {
      setExporting(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteTransaction(pendingDelete.id);
      toast.push("Transação removida", "success");
      setRows((current) => current.filter((row) => row.id !== pendingDelete.id));
      setTotal((current) => Math.max(0, current - 1));
      setPendingDelete(null);
    } catch {
      toast.push("Não foi possível remover", "error");
    } finally {
      setDeleting(false);
    }
  }

  const columns: TableColumn<Transaction>[] = [
    {
      key: "valor",
      header: "Valor",
      className: "w-[100px] whitespace-nowrap",
      render: (row) => (
        <span className="text-xs font-semibold tabular-nums text-neutral-800">
          {formatCurrency(row.valor)}
        </span>
      ),
    },
    {
      key: "descricao",
      header: "Descrição",
      className: "min-w-[160px] max-w-[280px] w-[34%]",
      render: (row) => {
        const text = row.descricao?.trim() || "—";
        const cell = (
          <span className="block truncate font-medium text-neutral-800">
            {text}
          </span>
        );
        if (text === "—") return cell;
        return <Tooltip content={text}>{cell}</Tooltip>;
      },
    },
    {
      key: "categoria",
      header: "Categoria",
      className: "w-[16%] text-center",
      render: (row) => {
        const cat = row.categoria_detail || categoryMap[row.categoria];
        return (
          <div className="flex justify-center">
            <Badge category={cat?.nome} color={cat?.cor}>
              {cat?.nome || "—"}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "data",
      header: "Data",
      className: "w-[12%] whitespace-nowrap text-center",
      render: (row) => formatDate(row.data),
    },
    {
      key: "tipo",
      header: "Tipo",
      className: "w-[12%] text-center",
      render: (row) => (
        <span
          className={
            row.tipo === "receita"
              ? "font-semibold text-success"
              : "font-semibold text-danger"
          }
        >
          {row.tipo}
        </span>
      ),
    },
    {
      key: "acoes",
      header: "Ações",
      className: "w-[96px] text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-primary-muted hover:text-primary"
            aria-label="Editar transação"
            title="Editar"
            onClick={() => openEditModal(row.id)}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-danger-muted hover:text-danger"
            aria-label="Excluir transação"
            title="Excluir"
            onClick={() => setPendingDelete(row)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-shell space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Transações</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Filtre por período e categoria, depois exporte se quiser.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportVisibleTable} disabled={exporting || loading}>
            <Download size={16} />
            {exporting ? "Exportando..." : "Baixar Excel"}
          </Button>
          <Button onClick={openCreateModal}>Nova transação</Button>
        </div>
      </header>

      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
          <div className="w-full max-w-[180px]">
            <Input
              type="select"
              label="Período"
              value={draft.period}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  period: e.target.value as PeriodMode,
                  month: e.target.value === "current_month" ? currentMonthValue() : current.month,
                }))
              }
              options={[
                { value: "current_month", label: "Por mês" },
                { value: "range", label: "Intervalo" },
                { value: "all", label: "Todas" },
              ]}
            />
          </div>

          {draft.period === "current_month" ? (
            <div className="w-full max-w-[200px]">
              <MonthPicker
                label="Mês"
                value={draft.month || currentMonthValue()}
                onChange={(month) => setDraft((current) => ({ ...current, month }))}
              />
            </div>
          ) : null}

          {draft.period === "range" ? (
            <>
              <div className="w-full max-w-[170px]">
                <Input
                  type="date"
                  label="De"
                  value={draft.dateFrom}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, dateFrom: e.target.value }))
                  }
                />
              </div>
              <div className="w-full max-w-[170px]">
                <Input
                  type="date"
                  label="Até"
                  value={draft.dateTo}
                  onChange={(e) =>
                    setDraft((current) => ({ ...current, dateTo: e.target.value }))
                  }
                />
              </div>
            </>
          ) : null}

          <div className="w-full max-w-[180px]">
            <Input
              type="select"
              label="Categoria"
              value={draft.category}
              onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
              options={[
                { value: "", label: "Todas" },
                ...categories.map((item) => ({ value: String(item.id), label: item.nome })),
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-2 pb-0.5 lg:ml-auto">
            <Button size="sm" onClick={applyFilters}>
              <Filter size={14} />
              Filtrar
            </Button>
            <Button size="sm" variant="secondary" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        emptyTitle={loading ? "Carregando..." : "Nenhuma transação"}
        emptyDescription="Cadastre uma nova transação ou ajuste os filtros."
      />

      <div className="flex justify-end">
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (!deleting ? setPendingDelete(null) : undefined)}
        title="Excluir transação?"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancelar
            </Button>
            <Button variant="danger" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Excluindo..." : "Excluir"}
            </Button>
          </>
        }
      >
        <div className="min-w-0 space-y-2 text-sm text-neutral-600">
          <p>Essa ação não pode ser desfeita. Confirma a exclusão?</p>
          {pendingDelete?.descricao?.trim() ? (
            <p className="break-words rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 font-semibold text-neutral-800">
              {pendingDelete.descricao.trim()}
            </p>
          ) : null}
        </div>
      </Modal>

      <TransactionFormModal
        open={formOpen}
        transactionId={editingId}
        onClose={closeFormModal}
        onSuccess={() => setReloadKey((current) => current + 1)}
      />
    </div>
  );
}
