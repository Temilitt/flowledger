"use client";

import { Menu, Bell } from "lucide-react";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const name = session?.user?.name || "User";
  const email = session?.user?.email || "";

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      {/* Left — mobile menu + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#E8192C] rounded-full hidden sm:block" />
          <span className="text-sm font-semibold text-gray-900 hidden sm:block">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-50">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E8192C] rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-gray-100">
          <div className="w-8 h-8 bg-[#E8192C] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {getInitials(name)}
            </span>
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {name}
            </span>
            <span className="text-xs text-gray-400 leading-tight">{email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}