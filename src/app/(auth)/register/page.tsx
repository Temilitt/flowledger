"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart2, Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currency: "USD",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const perks = [
    "Free forever — no credit card needed",
    "Track unlimited transactions",
    "Generate professional PDF invoices",
    "Real-time financial dashboard",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111111] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">FlowLedger</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Start managing<br />
            your money today.
          </h1>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Join thousands of business owners who use FlowLedger to stay on top of their finances.
          </p>

          <div className="flex flex-col gap-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#E8192C] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/70 text-sm">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-sm">
          © {new Date().getFullYear()} FlowLedger. All rights reserved.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-[#E8192C] rounded-lg flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">FlowLedger</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-500 text-sm">
              Get started for free — no credit card required
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-[#E8192C] text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                minLength={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 transition-all outline-none"
              >
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="CAD">Canadian Dollar (CAD)</option>
                <option value="AUD">Australian Dollar (AUD)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8192C] hover:bg-[#C0121F] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#E8192C] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}