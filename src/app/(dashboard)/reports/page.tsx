"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Download,
  BarChart2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReportData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    net: number;
    transactionCount: number;
  };
  monthlyData: {
    month: string;
    income: number;
    expense: number;
    net: number;
    count: number;
  }[];
  categoryData: {
    category: string;
    income: number;
    expense: number;
  }[];
  transactions: {
    id: string;
    title: string;
    amount: number;
    type: string;
    category: string;
    date: string;
  }[];
}

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const years = [
    now.getFullYear() - 2,
    now.getFullYear() - 1,
    now.getFullYear(),
  ];

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/reports?year=${year}`, {
            signal: controller.signal,
          });
          const json = await res.json();
          if (!controller.signal.aborted) setData(json);
        } catch {
          if (!controller.signal.aborted) setData(null);
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      })();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [year]);

  function exportCSV() {
    if (!data?.transactions) return;

    const headers = ["Title", "Type", "Category", "Amount", "Date", "Description"];
    const rows = data.transactions.map((t) => [
      t.title,
      t.type,
      t.category,
      t.amount.toFixed(2),
      new Date(t.date).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `flowledger-report-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Financial summary for {year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => {
              setLoading(true);
              setYear(Number(e.target.value));
            }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Income",
            value: formatCurrency(summary?.totalIncome || 0),
            icon: TrendingUp,
            color: "bg-green-500",
            text: "text-green-600",
          },
          {
            label: "Total Expenses",
            value: formatCurrency(summary?.totalExpense || 0),
            icon: TrendingDown,
            color: "bg-[#E8192C]",
            text: "text-[#E8192C]",
          },
          {
            label: "Net Profit",
            value: formatCurrency(summary?.net || 0),
            icon: BarChart2,
            color: summary?.net && summary.net >= 0 ? "bg-blue-500" : "bg-orange-500",
            text: summary?.net && summary.net >= 0 ? "text-blue-600" : "text-orange-500",
          },
          {
            label: "Transactions",
            value: summary?.transactionCount || 0,
            icon: BarChart2,
            color: "bg-purple-500",
            text: "text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-medium">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 ${card.color} rounded-xl flex items-center justify-center`}
              >
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className={`text-xl font-bold ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Line chart — net per month */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            Monthly Net Profit
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Income minus expenses per month
          </p>
        </div>
        {data?.monthlyData && data.monthlyData.some((m) => m.net !== 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  fontSize: "13px",
                }}
                formatter={(value) =>
                  formatCurrency(Number.isFinite(Number(value)) ? Number(value) : 0)
                }
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#E8192C"
                strokeWidth={2.5}
                dot={{ fill: "#E8192C", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-gray-400">No data for {year}</p>
          </div>
        )}
      </div>

      {/* Bar chart — income vs expense */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Income vs Expenses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly comparison</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E8192C]" />
              <span className="text-xs text-gray-400">Expenses</span>
            </div>
          </div>
        </div>
        {data?.monthlyData && data.monthlyData.some((m) => m.income > 0 || m.expense > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyData} barSize={10} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                  fontSize: "13px",
                }}
                formatter={(value) =>
                  formatCurrency(Number.isFinite(Number(value)) ? Number(value) : 0)
                }
              />
              <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#E8192C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-gray-400">No data for {year}</p>
          </div>
        )}
      </div>

      {/* Category table */}
      {data?.categoryData && data.categoryData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">
              Breakdown by Category
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Category", "Income", "Expenses", "Net"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 px-6 py-3 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.categoryData.map((cat) => (
                  <tr
                    key={cat.category}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {cat.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      {cat.income > 0 ? formatCurrency(cat.income) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#E8192C] font-medium">
                      {cat.expense > 0 ? formatCurrency(cat.expense) : "—"}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold ${
                        cat.income - cat.expense >= 0
                          ? "text-green-600"
                          : "text-[#E8192C]"
                      }`}
                    >
                      {formatCurrency(cat.income - cat.expense)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}