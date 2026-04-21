import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    // All transactions
    const allTransactions = await db.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // This month transactions
    const monthTransactions = allTransactions.filter((t) => {
      const d = new Date(t.date);
      return d >= startOfMonth && d <= endOfMonth;
    });

    const totalIncome = allTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = allTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthIncome = monthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpense = monthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    // Monthly data for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const end = new Date(currentYear, currentMonth - i, 0);
      const label = d.toLocaleString("default", { month: "short" });

      const income = allTransactions
        .filter((t) => {
          const td = new Date(t.date);
          return t.type === "INCOME" && td >= d && td <= end;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = allTransactions
        .filter((t) => {
          const td = new Date(t.date);
          return t.type === "EXPENSE" && td >= d && td <= end;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({ month: label, income, expense });
    }

    // Category breakdown (expenses)
    const categoryMap: Record<string, number> = {};
    allTransactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const categoryData = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Recent transactions
    const recentTransactions = allTransactions.slice(0, 5);

    // Invoice stats
    const invoices = await db.invoice.findMany({ where: { userId } });
    const pendingInvoices = invoices.filter((i) => i.status === "PENDING").length;
    const paidInvoices = invoices.filter((i) => i.status === "PAID").length;

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        monthIncome,
        monthExpense,
        transactionCount: allTransactions.length,
        pendingInvoices,
        paidInvoices,
      },
      monthlyData,
      categoryData,
      recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}