import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, useToast } from "@/design-system";
import { listCategories } from "../services/categories";
import { createTransaction, getTransaction, updateTransaction } from "../services/transactions";
import type { Category, TransactionType } from "../types";
import { ApiError } from "../services/api";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export type TransactionFormModalProps = {
  open: boolean;
  onClose: () => void;
  transactionId?: number | null;
  onSuccess?: () => void;
};

export function TransactionFormModal({
  open,
  onClose,
  transactionId,
  onSuccess,
}: TransactionFormModalProps) {
  const isEdit = Boolean(transactionId);
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<TransactionType>("despesa");
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState(todayIso());
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  function resetForm(items: Category[] = categories) {
    setValor("");
    setTipo("despesa");
    setData(todayIso());
    setDescricao("");
    setErrors({});
    const firstExpense = items.find((item) => item.tipo === "despesa") ?? items[0];
    setCategoria(firstExpense ? String(firstExpense.id) : "");
  }

  useEffect(() => {
    if (!open) return;

    listCategories()
      .then((items) => {
        setCategories(items);
        if (!transactionId) resetForm(items);
      })
      .catch(() => toast.push("Falha ao carregar categorias", "error"));
  }, [open, transactionId, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || !transactionId) return;

    setLoadingData(true);
    getTransaction(transactionId)
      .then((tx) => {
        setValor(String(tx.valor));
        setTipo(tx.tipo);
        setCategoria(String(tx.categoria));
        setData(tx.data);
        setDescricao(tx.descricao || "");
        setErrors({});
      })
      .catch(() => {
        toast.push("Transação não encontrada", "error");
        onClose();
      })
      .finally(() => setLoadingData(false));
  }, [open, transactionId, onClose, toast]);

  const filteredCategories = useMemo(
    () => categories.filter((item) => item.tipo === tipo),
    [categories, tipo]
  );

  useEffect(() => {
    if (!open || loadingData) return;
    if (!filteredCategories.length) {
      setCategoria("");
      return;
    }
    if (!filteredCategories.some((item) => String(item.id) === categoria)) {
      setCategoria(String(filteredCategories[0].id));
    }
  }, [filteredCategories, categoria, open, loadingData]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const amount = Number(valor);
    if (!(amount > 0)) nextErrors.valor = "Valor deve ser maior que zero";
    if (!categoria) nextErrors.categoria = "Selecione uma categoria";
    if (!data) nextErrors.data = "Informe a data";
    if (data && data > todayIso()) nextErrors.data = "Data não pode ser futura";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const payload = {
      valor: amount,
      tipo,
      categoria: Number(categoria),
      data,
      descricao: descricao.trim() || undefined,
    };

    try {
      if (isEdit && transactionId) {
        await updateTransaction(transactionId, payload);
        toast.push("Transação atualizada", "success");
      } else {
        await createTransaction(payload);
        toast.push("Transação criada", "success");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Não foi possível salvar";
      toast.push(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => (!loading ? onClose() : undefined)}
      title={isEdit ? "Editar transação" : "Nova transação"}
      className="max-w-xl"
      footer={
        <>
          <Button size="sm" variant="secondary" disabled={loading} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            form="transaction-form"
            type="submit"
            disabled={loading || loadingData}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      {loadingData ? (
        <p className="text-sm text-neutral-500">Carregando transação...</p>
      ) : (
        <form id="transaction-form" className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Valor"
              type="number"
              min="0.01"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              error={errors.valor}
            />
            <Input
              type="select"
              label="Tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TransactionType)}
              options={[
                { value: "receita", label: "Receita" },
                { value: "despesa", label: "Despesa" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="select"
              label="Categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              error={errors.categoria}
              options={
                filteredCategories.length
                  ? filteredCategories.map((item) => ({
                      value: String(item.id),
                      label: item.nome,
                    }))
                  : [{ value: "", label: "Nenhuma categoria deste tipo" }]
              }
            />
            <Input
              label="Data"
              type="date"
              value={data}
              max={todayIso()}
              onChange={(e) => setData(e.target.value)}
              error={errors.data}
            />
          </div>

          <Input
            type="textarea"
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            optional
            rows={3}
          />
        </form>
      )}
    </Modal>
  );
}
