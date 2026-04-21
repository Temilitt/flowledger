"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  PieChart,
  BarChart2,
  LogOut,
  X,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Invoices", href: "/invoices", icon: FileText },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Reports", href: "/reports", icon: BarChart2 },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-64">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E8192C] rounded-lg flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">FlowLedger</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#E8192C] text-white"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-[#E8192C] transition-all duration-150 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}