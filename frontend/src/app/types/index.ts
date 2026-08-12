export type TransactionType = "receita" | "despesa";

export type Category = {
  id: number;
  nome: string;
  cor: string;
  tipo: TransactionType;
};

export type Transaction = {
  id: number;
  valor: string;
  tipo: TransactionType;
  categoria: number;
  categoria_detail?: Category;
  data: string;
  descricao?: string;
  created_at: string;
};

export type DashboardSummary = {
  balance: number;
  income: number;
  expenses: number;
  by_category: Array<{
    category_id: number;
    name: string;
    color: string;
    total: number;
  }>;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
};
