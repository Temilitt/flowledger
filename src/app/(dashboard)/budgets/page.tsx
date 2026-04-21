"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, X, PieChart } from "lucide-react";
import { formatCurrency, formatMonth } from "@/lib/utils";
import { TRANSACTION_CATEGORIES, MONTHS } from "@/lib/constants";
import type { BudgetWithSpent } from "@/types";

interface BudgetForm {
  category: string;
  amount: string;
  month: number;
  year: number;
}

export default function BudgetsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<BudgetForm>({
    category: "",
    amount: "",
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  async function fetchBudgets() {
    setLoading(true);
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`);
    const data = await res.json();
    setBudgets(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/budgets", {
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
        setForm({
          category: "",
          amount: "",
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        });
        fetchBudgets();
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
      await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
      fetchBudgets();
    } finally {
      setDeletingId(null);
    }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  function getBarColor(percentage: number) {
    if (percentage >= 100) return "bg-[#E8192C]";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-green-500";
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {formatMonth(month, year)}
          </p>
        </div>
        <button
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#E8192C] hover:bg-[#C0121F] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Set Budget</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Month/Year selector */}
      <div className="flex items-center gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Budget",
              value: formatCurrency(totalBudget),
              color: "text-gray-900",
            },
            {
              label: "Total Spent",
              value: formatCurrency(totalSpent),
              color: totalSpent > totalBudget ? "text-[#E8192C]" : "text-orange-500",
            },
            {
              label: "Remaining",
              value: formatCurrency(totalRemaining),
              color: totalRemaining < 0 ? "text-[#E8192C]" : "text-green-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-5"
            >
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Overall progress */}
      {budgets.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">
              Overall Budget Usage
            </p>
            <span
              className={`text-sm font-bold ${
                overallPercentage >= 100
                  ? "text-[#E8192C]"
                  : overallPercentage >= 80
                  ? "text-orange-500"
                  : "text-green-600"
              }`}
            >
              {overallPercentage}%
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                overallPercentage
              )}`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)}{" "}
            budget
          </p>
        </div>
      )}

      {/* Budget list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <PieChart className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">
              No budgets set for this month
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-[#E8192C] font-medium hover:underline"
            >
              Set your first budget
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {budgets.map((budget) => (
              <div key={budget.id} className="px-6 py-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {budget.category}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(budget.spent)} of{" "}
                        {formatCurrency(budget.amount)} spent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-bold ${
                        budget.percentage >= 100
                          ? "text-[#E8192C]"
                          : budget.percentage >= 80
                          ? "text-orange-500"
                          : "text-green-600"
                      }`}
                    >
                      {budget.percentage}%
                    </span>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      disabled={deletingId === budget.id}
                      className="text-gray-300 hover:text-[#E8192C] transition-colors"
                    >
                      {deletingId === budget.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                      budget.percentage
                    )}`}
                    style={{ width: `${budget.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {budget.remaining >= 0
                      ? `${formatCurrency(budget.remaining)} remaining`
                      : `${formatCurrency(Math.abs(budget.remaining))} over budget`}
                  </span>
                  <span className="text-xs text-gray-400">
                    Budget: {formatCurrency(budget.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Set Budget
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {TRANSACTION_CATEGORIES.EXPENSE.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Budget Amount
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: e.target.value })
                  }
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Month
                  </label>
                  <select
                    value={form.month}
                    onChange={(e) =>
                      setForm({ ...form, month: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Year
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
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
                    "Save Budget"
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
