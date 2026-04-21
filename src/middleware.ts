import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!session?.user;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/budgets") ||
    pathname.startsWith("/reports");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};