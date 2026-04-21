"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Loader2,
  X,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TRANSACTION_CATEGORIES } from "@/lib/constants";
import type { Transaction } from "@/types";

interface TransactionForm {
  title: string;
  amount: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  description: string;
}

const emptyForm: TransactionForm = {
  title: "",
  amount: "",
  type: "EXPENSE",
  category: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<TransactionForm>(emptyForm);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
  });

  async function fetchTransactions(p = 1) {
    setLoading(true);
    const params = new URLSearchParams({
      page: p.toString(),
      limit: "10",
      ...(filters.type && { type: filters.type }),
      ...(filters.category && { category: filters.category }),
      ...(filters.search && { search: filters.search }),
    });

    const res = await fetch(`/api/transactions?${params}`);
    const data = await res.json();
    setTransactions(data.data || []);
    setTotal(data.total || 0);
    setTotalPages(data.totalPages || 1);
    setPage(p);
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions(1);
  }, [filters]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setShowModal(false);
        setForm(emptyForm);
        fetchTransactions(1);
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions(page);
    } finally {
      setDeletingId(null);
    }
  }

  const categories =
    form.type === "INCOME"
      ? TRANSACTION_CATEGORIES.INCOME
      : TRANSACTION_CATEGORIES.EXPENSE;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total transactions
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#C0121F] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
              className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="flex-1 sm:flex-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
            >
              <option value="">All Categories</option>
              {[
                ...TRANSACTION_CATEGORIES.INCOME,
                ...TRANSACTION_CATEGORIES.EXPENSE,
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Filter className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No transactions found</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-[#E8192C] font-medium hover:underline"
            >
              Add your first transaction
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wide">
                      Transaction
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-4 uppercase tracking-wide">
                      Category
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-400 px-4 py-4 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-400 px-4 py-4 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-6 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              tx.type === "INCOME"
                                ? "bg-green-50"
                                : "bg-red-50"
                            }`}
                          >
                            {tx.type === "INCOME" ? (
                              <ArrowUpRight className="w-4 h-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-[#E8192C]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {tx.title}
                            </p>
                            {tx.description && (
                              <p className="text-xs text-gray-400">
                                {tx.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`text-sm font-semibold ${
                            tx.type === "INCOME"
                              ? "text-green-600"
                              : "text-[#E8192C]"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="text-gray-300 hover:text-[#E8192C] transition-colors disabled:opacity-50"
                        >
                          {deletingId === tx.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === "INCOME" ? "bg-green-50" : "bg-red-50"
                      }`}
                    >
                      {tx.type === "INCOME" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-[#E8192C]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {tx.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.category} · {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === "INCOME"
                          ? "text-green-600"
                          : "text-[#E8192C]"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      disabled={deletingId === tx.id}
                      className="text-gray-300 hover:text-[#E8192C] transition-colors"
                    >
                      {deletingId === tx.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                <p className="text-sm text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchTransactions(page - 1)}
                    disabled={page === 1}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchTransactions(page + 1)}
                    disabled={page === totalPages}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Add Transaction
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 text-[#E8192C] text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Type toggle */}
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {(["EXPENSE", "INCOME"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setForm({ ...form, type: t, category: "" })
                    }
                    className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                      form.type === t
                        ? t === "INCOME"
                          ? "bg-green-500 text-white"
                          : "bg-[#E8192C] text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {t === "INCOME" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Freelance payment"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Description{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add a note..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#E8192C] hover:bg-[#C0121F] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Transaction"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}