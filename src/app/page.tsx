import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  FileText,
  PieChart,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E8192C] rounded-lg flex items-center justify-center">
                <BarChart2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">FlowLedger</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-[#E8192C] hover:bg-[#C0121F] text-white px-4 py-4 rounded-lg transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 text-[#E8192C] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Smart financial management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Take control of your{" "}
            <span className="text-[#E8192C]">business finances</span>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            Track income and expenses, generate professional invoices, manage
            budgets, and get real-time insights — all in one clean dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E8192C] hover:bg-[#C0121F] text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center border border-gray-200 bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-base"
            >
              Sign in to your account
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:p-4 shadow-sm">
          <div className="rounded-xl bg-white border border-gray-100 overflow-hidden">
            {/* Browser bar */}
            <div className="bg-gray-900 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="flex-1 mx-3 bg-white/10 rounded-md h-6 flex items-center px-3">
                <span className="text-white/40 text-xs">flowledger.vercel.app/dashboard</span>
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-4 sm:p-6 bg-gray-50">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Balance", value: "$24,563.00", color: "text-gray-900" },
                  { label: "Total Income", value: "$38,200.00", color: "text-green-600" },
                  { label: "Total Expenses", value: "$13,637.00", color: "text-[#E8192C]" },
                  { label: "Active Invoices", value: "12 Active", color: "text-blue-600" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4"
                  >
                    <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                    <p className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
              {/* Charts area */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Cash Flow Overview</p>
                  <div className="flex items-end gap-1.5 h-28">
                    {[60, 80, 45, 90, 70, 85, 55, 95, 65, 75, 88, 72].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col gap-0.5 items-center">
                        <div className="w-full bg-red-100 rounded-sm" style={{ height: `${h * 0.55}%` }} />
                        <div className="w-full bg-[#E8192C] rounded-sm opacity-70" style={{ height: `${h * 0.35}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-red-100" />
                      <span className="text-xs text-gray-400">Income</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#E8192C] opacity-70" />
                      <span className="text-xs text-gray-400">Expenses</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Top Categories</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Housing", pct: 35 },
                      { label: "Food & Dining", pct: 22 },
                      { label: "Transport", pct: 18 },
                      { label: "Shopping", pct: 14 },
                    ].map((c) => (
                      <div key={c.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{c.label}</span>
                          <span className="font-semibold text-gray-700">{c.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#E8192C] rounded-full"
                            style={{ width: `${c.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
              Built for small business owners, freelancers, and entrepreneurs
              who want clarity over their money.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart2,
                title: "Real-time dashboard",
                desc: "See your income, expenses, and balance at a glance with beautiful charts and live data.",
              },
              {
                icon: ArrowLeftRight,
                title: "Transaction tracking",
                desc: "Log and categorize every transaction. Filter by date, category, or type instantly.",
              },
              {
                icon: FileText,
                title: "Invoice generator",
                desc: "Create professional invoices in seconds and export them as PDF to send to clients.",
              },
              {
                icon: PieChart,
                title: "Budget management",
                desc: "Set monthly budgets per category and track how much you have left to spend.",
              },
              {
                icon: BarChart2,
                title: "Financial reports",
                desc: "Get monthly and yearly summaries. Export your transaction history as CSV anytime.",
              },
              {
                icon: ShieldCheck,
                title: "Secure & private",
                desc: "Your data is encrypted and protected. Only you have access to your financial information.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-[#E8192C]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="bg-[#E8192C] rounded-2xl px-8 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto text-base">
              Join thousands of business owners who use FlowLedger to manage
              their money smarter.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-[#E8192C] font-semibold px-8 py-3.5 rounded-xl hover:bg-red-50 transition-colors duration-200 text-base"
            >
              Get started for free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#E8192C] rounded-md flex items-center justify-center">
              <BarChart2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">FlowLedger</span>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} FlowLedger. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}