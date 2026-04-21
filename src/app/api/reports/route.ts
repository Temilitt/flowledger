import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(
      searchParams.get("year") || String(new Date().getFullYear())
    );

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startOfYear, lte: endOfYear },
      },
      orderBy: { date: "desc" },
    });

    // Monthly breakdown
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthTx = transactions.filter((t) => {
        return new Date(t.date).getMonth() === i;
      });

      const income = monthTx
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTx
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: new Date(year, i, 1).toLocaleString("default", {
          month: "short",
        }),
        income,
        expense,
        net: income - expense,
        count: monthTx.length,
      };
    });

    // Category breakdown
    const categoryMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (!categoryMap[t.category]) {
        categoryMap[t.category] = { income: 0, expense: 0 };
      }
      if (t.type === "INCOME") {
        categoryMap[t.category].income += t.amount;
      } else {
        categoryMap[t.category].expense += t.amount;
      }
    });

    const categoryData = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.expense - a.expense);

    // Summary
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        transactionCount: transactions.length,
      },
      monthlyData,
      categoryData,
      transactions,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}