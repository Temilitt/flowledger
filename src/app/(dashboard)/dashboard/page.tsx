"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    monthIncome: number;
    monthExpense: number;
    transactionCount: number;
    pendingInvoices: number;
    paidInvoices: number;
  };
  monthlyData: { month: string; income: number; expense: number }[];
  categoryData: { category: string; amount: number; percentage: number }[];
  recentTransactions: {
    id: string;
    title: string;
    amount: number;
    type: string;
    category: string;
    date: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;
  const currency = "USD";

  const statCards = [
    {
      label: "Total Balance",
      value: formatCurrency(stats?.balance || 0, currency),
      sub: `${stats?.transactionCount || 0} transactions`,
      icon: Wallet,
      color: "bg-[#E8192C]",
      trend: null,
    },
    {
      label: "Total Income",
      value: formatCurrency(stats?.totalIncome || 0, currency),
      sub: `This month: ${formatCurrency(stats?.monthIncome || 0, currency)}`,
      icon: TrendingUp,
      color: "bg-green-500",
      trend: "up",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(stats?.totalExpense || 0, currency),
      sub: `This month: ${formatCurrency(stats?.monthExpense || 0, currency)}`,
      icon: TrendingDown,
      color: "bg-orange-500",
      trend: "down",
    },
    {
      label: "Invoices",
      value: `${stats?.pendingInvoices || 0} Pending`,
      sub: `${stats?.paidInvoices || 0} paid invoices`,
      icon: FileText,
      color: "bg-blue-500",
      trend: null,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here is your financial overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                {card.label}
              </span>
              <div
                className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center`}
              >
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {card.trend === "up" && (
                  <ArrowUpRight className="w-3 h-3 text-green-500" />
                )}
                {card.trend === "down" && (
                  <ArrowDownRight className="w-3 h-3 text-orange-500" />
                )}
                <p className="text-xs text-gray-400">{card.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Cash Flow
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Last 6 months overview
              </p>
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
          {data?.monthlyData && data.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.monthlyData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8192C" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E8192C" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                  formatter={(value) => formatCurrency(Number(value), currency)}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#E8192C"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-sm text-gray-400">
                No data yet. Add transactions to see your cash flow.
              </p>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Top Expenses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">By category</p>
          </div>
          {data?.categoryData && data.categoryData.length > 0 ? (
            <div className="flex flex-col gap-4">
              {data.categoryData.map((cat, i) => (
                <div key={cat.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600 font-medium">
                      {cat.category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {cat.percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor:
                          i === 0
                            ? "#E8192C"
                            : i === 1
                              ? "#f97316"
                              : i === 2
                                ? "#eab308"
                                : i === 3
                                  ? "#3b82f6"
                                  : "#8b5cf6",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatCurrency(cat.amount, currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-gray-400 text-center">
                No expense data yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly bar chart + recent transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Monthly Comparison
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Income vs expenses per month
            </p>
          </div>
          {data?.monthlyData && data.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyData} barSize={12} barGap={4}>
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
                  formatter={(value: number) =>
                    formatCurrency(value, currency)
                  }
                />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#E8192C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400">No data yet.</p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 5 entries</p>
            </div>
          </div>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {data.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === "INCOME"
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
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {tx.title}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${tx.type === "INCOME"
                        ? "text-green-600"
                        : "text-[#E8192C]"
                      }`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-gray-400 text-center">
                No transactions yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}