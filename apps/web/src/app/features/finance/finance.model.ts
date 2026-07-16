export type ExpenseCategory =
  | "SALARY"
  | "RENT"
  | "INTERNET"
  | "ELECTRICITY"
  | "MAINTENANCE"
  | "TAX"
  | "EQUIPMENT"
  | "SUPPLIES"
  | "OTHER";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "SALARY",
  "RENT",
  "INTERNET",
  "ELECTRICITY",
  "MAINTENANCE",
  "TAX",
  "EQUIPMENT",
  "SUPPLIES",
  "OTHER",
];

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: string | number;
  currency: string;
  incurredAt: string;
  notes: string | null;
}

export interface ExpenseListResponse {
  items: Expense[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateExpenseValue {
  label: string;
  category: ExpenseCategory;
  amount: number;
  incurredAt?: string;
  notes?: string | null;
}

export interface Treasury {
  inflow: number;
  outflow: number;
  balance: number;
  expectedInflow: number;
  cashflowByMonth: { month: string; inflow: number; outflow: number }[];
  expensesByCategory: { category: ExpenseCategory; amount: number }[];
}
