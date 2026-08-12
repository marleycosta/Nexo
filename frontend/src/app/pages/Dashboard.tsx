import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, MonthPicker, formatCurrency, currentMonthValue, useToast } from "@/design-system";
import { getDashboardSummary } from "../services/dashboard";
import type { DashboardSummary } from "../types";
import { ApiError } from "../services/api";

type ChartRow = {
  name: string;
  total: number;
  fill: string;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-2xl border border-neutral-200 px-3 py-2 shadow-soft"
      style={{ backgroundColor: "#ffffff" }}
    >
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-neutral-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonthValue());
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboardSummary(month)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((error) => {
        const message =
          error instanceof ApiError ? error.message : "Falha ao carregar dashboard";
        toast.push(message, "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [month, toast]);

  const chartData = useMemo<ChartRow[]>(
    () =>
      (summary?.by_category || []).map((item) => ({
        name: item.name,
        total: Number(item.total),
        fill: item.color,
      })),
    [summary]
  );

  return (
    <div className="page-shell space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="section-title">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Visão do mês com saldo, receitas e despesas.
          </p>
        </div>
        <MonthPicker label="Mês" value={month} onChange={setMonth} inlineLabel />
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card variant="kpi" label="Saldo do mês" value={loading ? "—" : summary?.balance ?? 0} />
        <Card variant="kpi" label="Receitas" value={loading ? "—" : summary?.income ?? 0} />
        <Card variant="kpi" label="Despesas" value={loading ? "—" : summary?.expenses ?? 0} />
      </section>

      <Card className="animate-fade-up">
        <h2 className="font-display text-lg font-semibold text-neutral-900">
          Gastos por categoria
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Distribuição do período selecionado.</p>
        <div className="mt-6 h-72 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">
              {loading ? "Carregando gráfico..." : "Sem dados de categoria neste mês."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#304260", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#304260", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltip />}
                  wrapperStyle={{ outline: "none" }}
                />
                <Bar
                  dataKey="total"
                  radius={[12, 12, 0, 0]}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {chartData.map((entry, index) => {
                    const isHovered = hoveredIndex === index;
                    const dimmed = hoveredIndex !== null && !isHovered;
                    return (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        fillOpacity={dimmed ? 0.35 : 1}
                        stroke={isHovered ? "var(--primary)" : "transparent"}
                        strokeWidth={isHovered ? 2 : 0}
                        style={{
                          transition: "fill-opacity 0.15s ease, filter 0.15s ease",
                          filter: isHovered ? "brightness(1.08)" : undefined,
                          cursor: "pointer",
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
