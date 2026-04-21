"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  X,
  FileText,
  Download,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, formatDate, generateInvoiceNumber } from "@/lib/utils";
import { TAX_RATES } from "@/lib/constants";
import type { Invoice, InvoiceItem } from "@/types";

const emptyItem = (): InvoiceItem => ({
  id: Math.random().toString(36).slice(2),
  description: "",
  quantity: 1,
  rate: 0,
  amount: 0,
});

const emptyForm = {
  clientName: "",
  clientEmail: "",
  dueDate: "",
  tax: 0,
  note: "",
  items: [emptyItem()],
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-600",
  PAID: "bg-green-50 text-green-600",
  OVERDUE: "bg-red-50 text-[#E8192C]",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function fetchInvoices() {
    setLoading(true);
    const res = await fetch("/api/invoices");
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    fetchInvoices();
  }, []);

  function updateItem(id: string, field: keyof InvoiceItem, value: string | number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.rate;
        return updated;
      }),
    }));
  }

  function addItem() {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  }

  function removeItem(id: string) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  }

  const subtotal = form.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * form.tax) / 100;
  const total = subtotal + taxAmount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          subtotal,
          total,
          items: form.items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setShowModal(false);
        setForm(emptyForm);
        fetchInvoices();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    setUpdatingId(id);
    try {
      await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchInvoices();
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      fetchInvoices();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDownload(invoice: Invoice) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(232, 25, 44);
    doc.text("FlowLedger", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("INVOICE", 20, 30);
    doc.text(`Invoice No: ${invoice.invoiceNo}`, 20, 36);
    doc.text(`Date: ${formatDate(invoice.createdAt)}`, 20, 42);
    doc.text(`Due: ${formatDate(invoice.dueDate)}`, 20, 48);

    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text("Bill To:", 20, 62);
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(invoice.clientName, 20, 68);
    doc.text(invoice.clientEmail, 20, 74);

    doc.setFillColor(245, 245, 245);
    doc.rect(20, 84, 170, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Description", 24, 89);
    doc.text("Qty", 110, 89);
    doc.text("Rate", 130, 89);
    doc.text("Amount", 160, 89);

    let y = 100;
    const items = invoice.items as InvoiceItem[];
    items.forEach((item) => {
      doc.setTextColor(30);
      doc.setFontSize(9);
      doc.text(item.description, 24, y);
      doc.text(item.quantity.toString(), 110, y);
      doc.text(formatCurrency(item.rate), 130, y);
      doc.text(formatCurrency(item.amount), 160, y);
      y += 10;
    });

    y += 6;
    doc.setDrawColor(230);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text("Subtotal:", 130, y);
    doc.text(formatCurrency(invoice.subtotal), 160, y);
    y += 8;
    doc.text(`Tax (${invoice.tax}%):`, 130, y);
    doc.text(formatCurrency((invoice.subtotal * invoice.tax) / 100), 160, y);
    y += 8;
    doc.setTextColor(232, 25, 44);
    doc.setFontSize(11);
    doc.text("Total:", 130, y);
    doc.text(formatCurrency(invoice.total), 160, y);

    if (invoice.note) {
      y += 16;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("Note:", 20, y);
      doc.text(invoice.note, 20, y + 6);
    }

    doc.save(`${invoice.invoiceNo}.pdf`);
  }

  const pendingCount = invoices.filter((i) => i.status === "PENDING").length;
  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const totalValue = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {invoices.length} total invoices
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
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, sub: "invoices", color: "text-amber-600" },
          { label: "Paid", value: paidCount, sub: "invoices", color: "text-green-600" },
          { label: "Total Value", value: formatCurrency(totalValue), sub: "all invoices", color: "text-gray-900" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Invoices list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#E8192C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <FileText className="w-8 h-8 text-gray-200" />
            <p className="text-sm text-gray-400">No invoices yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-sm text-[#E8192C] font-medium hover:underline"
            >
              Create your first invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Invoice", "Client", "Due Date", "Amount", "Status", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 px-6 py-4 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {inv.invoiceNo}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(inv.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {inv.clientName}
                      </p>
                      <p className="text-xs text-gray-400">{inv.clientEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inv.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={inv.status}
                        onChange={(e) =>
                          handleStatusUpdate(inv.id, e.target.value)
                        }
                        disabled={updatingId === inv.id}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${
                          STATUS_STYLES[inv.status]
                        }`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(inv)}
                          className="text-gray-300 hover:text-blue-500 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          disabled={deletingId === inv.id}
                          className="text-gray-300 hover:text-[#E8192C] transition-colors"
                          title="Delete"
                        >
                          {deletingId === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                New Invoice
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 p-6 overflow-y-auto"
            >
              {error && (
                <div className="bg-red-50 text-[#E8192C] text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) =>
                      setForm({ ...form, clientName: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) =>
                      setForm({ ...form, clientEmail: e.target.value })
                    }
                    placeholder="client@example.com"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Tax Rate
                  </label>
                  <select
                    value={form.tax}
                    onChange={(e) =>
                      setForm({ ...form, tax: Number(e.target.value) })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all bg-white"
                  >
                    {TAX_RATES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-[#E8192C] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add item
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="hidden sm:grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 px-1">
                    <span className="col-span-5">Description</span>
                    <span className="col-span-2">Qty</span>
                    <span className="col-span-3">Rate</span>
                    <span className="col-span-1">Amount</span>
                  </div>
                  {form.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(item.id, "description", e.target.value)
                        }
                        placeholder="Item description"
                        required
                        className="col-span-12 sm:col-span-5 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#E8192C] outline-none transition-all"
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, "quantity", Number(e.target.value))
                        }
                        min="1"
                        required
                        className="col-span-4 sm:col-span-2 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#E8192C] outline-none transition-all"
                      />
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(item.id, "rate", Number(e.target.value))
                        }
                        min="0"
                        step="0.01"
                        required
                        className="col-span-5 sm:col-span-3 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-[#E8192C] outline-none transition-all"
                      />
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 hidden sm:block">
                          ${item.amount.toFixed(0)}
                        </span>
                        {form.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-300 hover:text-[#E8192C] transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax ({form.tax}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[#E8192C]">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Note{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Payment terms, bank details, thank you note..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Create Invoice
                    </>
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