"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile nav drawer */}
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuClick={() => setMobileNavOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}