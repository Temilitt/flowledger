import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "MMM dd");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatMonth(month: number, year: number): string {
  return format(new Date(year, month - 1), "MMMM yyyy");
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function generateInvoiceNumber(): string {
  const prefix = "INV";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `${prefix}-${timestamp}-${random}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}