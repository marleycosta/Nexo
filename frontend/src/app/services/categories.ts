import { apiFetch } from "./api";
import type { Category, TransactionType } from "../types";

export type CategoryPayload = {
  nome: string;
  cor: string;
  tipo: TransactionType;
};

export function listCategories() {
  return apiFetch<Category[]>("/categories/");
}

export function createCategory(payload: CategoryPayload) {
  return apiFetch<Category>("/categories/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id: number, payload: Partial<CategoryPayload>) {
  return apiFetch<Category>(`/categories/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: number) {
  return apiFetch<void>(`/categories/${id}/`, { method: "DELETE" });
}
