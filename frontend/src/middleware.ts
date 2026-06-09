import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register"];

const protectedPrefixes = [
  "/dashboard",
  "/projects",
  "/clients",
  "/documents",
  "/deadlines",
  "/renders",
  "/cps-bpu",
  "/tenders",
  "/devis",
  "/invoices",
  "/payments",
  "/notifications",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/projects/:path*",
    "/clients/:path*",
    "/documents/:path*",
    "/deadlines/:path*",
    "/renders/:path*",
    "/cps-bpu/:path*",
    "/tenders/:path*",
    "/devis/:path*",
    "/invoices/:path*",
    "/payments/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
