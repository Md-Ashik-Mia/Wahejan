import type { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

type AppJWT = JWT & {
  role?: string;
  hasPlan?: boolean;
};

// Use the same secret for both App and Middleware
const SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-for-prod";

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

/**
 * Next.js Middleware with explicit support for AWS Amplify Edge environment.
 * We manually handle getToken to ensure decryption works even when environment
 * variables are strictly scoped.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Identify valid session using getToken (more reliable on AWS Amplify than withAuth wrapper)
  // Secure cookies are used only on HTTPS. Localhost uses standard cookies.
  const isSecure = req.nextUrl.protocol === "https:";
  const token = (await getToken({
    req,
    secret: SECRET,
    secureCookie: isSecure,
  })) as AppJWT | null;

  const rawRole = (token as any)?.role ?? (token as any)?.user?.role;
  const role = normalizeRole(rawRole);
  const hasPlan = token?.hasPlan;

  // 2. Admin Protection
  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    if (role !== "admin") return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // 3. User Protection (/user/* routes)
  if (pathname.startsWith("/user")) {
    // If no token, redirect to login
    if (!token) {
      console.log("[Middleware] No token found for user path, redirecting to /login");
      return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url));
    }

    // A. Role check (Internal protection)
    // If we have a token but role hasn't synced yet, allow it (let client-side handle it)
    // to avoid the infinite login loop on Amplify.
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // B. Privacy Policy Check (The "Gate")
    // Note: Cookies on Amplify might need 'SameSite=Lax'.
    const accepted = req.cookies.get("policy_accepted")?.value === "true";

    // Force Privacy Policy check on ALL user pages.
    if (!accepted && !pathname.startsWith("/policy")) {
      console.log("[Middleware] Policy not accepted, forcing redirect to /policy");
      return NextResponse.redirect(new URL("/policy", req.url));
    }
  }

  // 4. Handle Root Path (/) Smart Redirect
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  // 5. Billing/Plan protection (Optional based on your logic)
  const requiresPlan = ["/user/subscription/active"]; // Add paths here if needed
  if (!hasPlan && requiresPlan.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/user/subscription", req.url));
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on.
 */
export const config = {
  matcher: ["/", "/admin/:path*", "/user/:path*"],
};
