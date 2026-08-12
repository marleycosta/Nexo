import { FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  ColorPicker,
  Input,
  Modal,
  Pagination,
  Table,
  useToast,
  type TableColumn,
} from "@/design-system";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../services/categories";
import type { Category, TransactionType } from "../types";
import { ApiError } from "../services/api";

type FormState = {
  nome: string;
  cor: string;
  tipo: TransactionType;
};

const emptyForm: FormState = {
  nome: "",
  cor: "#df7d71",
  tipo: "despesa",
};

export function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageSize = 8;
  const total = categories.length;
  const paged = categories.slice((page - 1) * pageSize, page * pageSize);

  async function load() {
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Falha ao carregar categorias";
      toast.push(message, "error");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setOpen(true);
  }

  function openEdit(category: Category) {
    setEditing(category);
    setForm({ nome: category.nome, cor: category.cor, tipo: category.tipo });
    setErrors({});
    setOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const nome = form.nome.trim();

    if (!nome) nextErrors.nome = "Informe o nome";
    if (!/^#[0-9A-Fa-f]{6}$/.test(form.cor)) nextErrors.cor = "Selecione uma cor válida";

    const duplicated = categories.some(
      (item) =>
        item.nome.trim().toLowerCase() === nome.toLowerCase() &&
        item.id !== editing?.id
    );
    if (duplicated) nextErrors.nome = "Já existe uma categoria com este nome";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const payload = { ...form, nome };
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.push("Categoria atualizada", "success");
      } else {
        await createCategory(payload);
        toast.push("Categoria criada", "success");
      }
      setOpen(false);
      await load();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível salvar";
      toast.push(message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCategory(pendingDelete.id);
      toast.push("Categoria removida", "success");
      setCategories((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Não foi possível remover";
      toast.push(message, "error");
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns: TableColumn<Category>[] = [
    {
      key: "nome",
      header: "Nome",
      className: "w-[40%]",
      render: (row) => (
        <Badge category={row.nome} color={row.cor}>
          {row.nome}
        </Badge>
      ),
    },
    {
      key: "cor",
      header: "Cor",
      className: "w-[20%]",
      render: (row) => (
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="h-4 w-4 rounded-lg border border-neutral-200" style={{ backgroundColor: row.cor }} />
          {row.cor}
        </span>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      className: "w-[20%] text-center",
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
            aria-label="Editar categoria"
            title="Editar"
            onClick={() => openEdit(row)}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-danger-muted hover:text-danger"
            aria-label="Excluir categoria"
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
          <h1 className="section-title">Categorias</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gerencie categorias para organizar receitas e despesas.
          </p>
        </div>
        <Button onClick={openCreate}>Nova categoria</Button>
      </header>

      <Table
        columns={columns}
        data={paged}
        rowKey={(row) => row.id}
        emptyTitle="Nenhuma categoria"
        emptyDescription="Crie categorias para organizar suas transações."
      />

      <div className="flex justify-end">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button form="category-form" type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </>
        }
      >
        <form id="category-form" className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              value={form.nome}
              onChange={(e) => setForm((current) => ({ ...current, nome: e.target.value }))}
              error={errors.nome}
            />
            <Input
              type="select"
              label="Tipo"
              value={form.tipo}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  tipo: e.target.value as TransactionType,
                }))
              }
              options={[
                { value: "receita", label: "Receita" },
                { value: "despesa", label: "Despesa" },
              ]}
            />
          </div>
          <ColorPicker
            value={form.cor}
            onChange={(cor) => setForm((current) => ({ ...current, cor }))}
            error={errors.cor}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (!deleting ? setPendingDelete(null) : undefined)}
        title="Excluir categoria?"
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
        <p className="text-sm text-neutral-600">
          Confirma a exclusão da categoria{" "}
          <strong>{pendingDelete?.nome}</strong>? Essa ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
