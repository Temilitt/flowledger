import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    const budgets = await db.budget.findMany({
      where: { userId: session.user.id, month, year },
    });

    // Get actual spending per category for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    const spendingMap: Record<string, number> = {};
    transactions.forEach((t) => {
      spendingMap[t.category] = (spendingMap[t.category] || 0) + t.amount;
    });

    const budgetsWithSpent = budgets.map((b) => ({
      ...b,
      spent: spendingMap[b.category] || 0,
      remaining: b.amount - (spendingMap[b.category] || 0),
      percentage: Math.min(
        Math.round(((spendingMap[b.category] || 0) / b.amount) * 100),
        100
      ),
    }));

    return NextResponse.json(budgetsWithSpent);
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await db.budget.findUnique({
      where: {
        userId_category_month_year: {
          userId: session.user.id,
          category: parsed.data.category,
          month: parsed.data.month,
          year: parsed.data.year,
        },
      },
    });

    if (existing) {
      const updated = await db.budget.update({
        where: { id: existing.id },
        data: { amount: parsed.data.amount },
      });
      return NextResponse.json(updated);
    }

    const budget = await db.budget.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await db.budget.delete({ where: { id } });
    return NextResponse.json({ message: "Budget deleted" });
  } catch (error) {
    console.error("Budgets DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 }
    );
  }
}