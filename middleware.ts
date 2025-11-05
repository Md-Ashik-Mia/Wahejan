import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const { pathname } = req.nextUrl;

  // Home → smart redirect
  if (pathname === "/") {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "user")  return NextResponse.redirect(new URL("/user/dashboard",  req.url));
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Public pages
  if (pathname === "/login" || pathname === "/signup") {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    if (role === "user")  return NextResponse.redirect(new URL("/user/dashboard",  req.url));
    return NextResponse.next();
  }

  // Zones
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }
  if (pathname.startsWith("/user") && !role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/admin/:path*", "/user/:path*"],
};
