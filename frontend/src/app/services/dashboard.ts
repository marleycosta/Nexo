import { apiFetch } from "./api";
import type { DashboardSummary } from "../types";

export function getDashboardSummary(month?: string) {
  const query = month ? `?month=${month}` : "";
  return apiFetch<DashboardSummary>(`/dashboard/summary/${query}`);
}
