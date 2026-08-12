import { apiFetch } from "./api";
import type { Transaction, TransactionType } from "../types";

export type TransactionPayload = {
  valor: number | string;
  tipo: TransactionType;
  categoria: number;
  data: string;
  descricao?: string;
};

export type TransactionFilters = {
  category?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type PaginatedTransactions = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
};

export function listTransactions(filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.date_from) params.set("date_from", filters.date_from);
  if (filters.date_to) params.set("date_to", filters.date_to);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const query = params.toString();
  return apiFetch<PaginatedTransactions>(`/transactions/${query ? `?${query}` : ""}`);
}

export function getTransaction(id: number) {
  return apiFetch<Transaction>(`/transactions/${id}/`);
}

export function createTransaction(payload: TransactionPayload) {
  return apiFetch<Transaction>("/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(id: number, payload: Partial<TransactionPayload>) {
  return apiFetch<Transaction>(`/transactions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id: number) {
  return apiFetch<void>(`/transactions/${id}/`, { method: "DELETE" });
}
