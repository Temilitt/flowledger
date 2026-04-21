"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart2, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#E8192C] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">FlowLedger</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Your finances,<br />
            always in focus.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-12">
            Track every transaction, generate invoices, and understand your cash flow — all from one dashboard.
          </p>

          <div className="flex flex-col gap-4">
            {[
              { value: "$2.4M+", label: "Transactions tracked" },
              { value: "12K+", label: "Active users" },
              { value: "99.9%", label: "Uptime guaranteed" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stat.value}</span>
                </div>
                <span className="text-white/70 text-sm">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-sm">
          © {new Date().getFullYear()} FlowLedger. All rights reserved.
        </p>
      </div>

      {/* Right panel - form */}
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
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to your account to continue
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
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:border-[#E8192C] focus:ring-4 focus:ring-red-50 transition-all outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-[#E8192C] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8192C] hover:bg-[#C0121F] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#E8192C] font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}