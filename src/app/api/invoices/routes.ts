import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { generateInvoiceNumber } from "@/lib/utils";

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  rate: z.number().positive(),
  amount: z.number(),
});

const invoiceSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Invalid email"),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  subtotal: z.number(),
  tax: z.number().min(0),
  total: z.number(),
  dueDate: z.string().min(1, "Due date is required"),
  note: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await db.invoice.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Invoices GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
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
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const invoice = await db.invoice.create({
      data: {
        ...parsed.data,
        invoiceNo: generateInvoiceNumber(),
        dueDate: new Date(parsed.data.dueDate),
        userId: session.user.id,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Invoices POST error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}