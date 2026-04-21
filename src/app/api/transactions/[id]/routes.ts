import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const updated = await db.transaction.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        ...(parsed.data.date && { date: new Date(parsed.data.date) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Transaction PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transaction = await db.transaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction || transaction.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    await db.transaction.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}