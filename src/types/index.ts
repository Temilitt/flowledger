export type TransactionType = "INCOME" | "EXPENSE";

export type InvoiceStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: Date | string;
  description?: string;
  createdAt: Date;
  userId: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  dueDate: Date | string;
  note?: string;
  createdAt: Date;
  userId: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  userId: string;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}