import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updated = await db.invoice.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Invoice PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    await db.invoice.delete({ where: { id } });
    return NextResponse.json({ message: "Invoice deleted" });
  } catch (error) {
    console.error("Invoice DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}