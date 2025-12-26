// import type { NextRequest } from "next/server";
// import { NextResponse } from "next/server";

// export function middleware(req: NextRequest) {
//   const role = req.cookies.get("role")?.value;
//   const { pathname } = req.nextUrl;

//   // Home → smart redirect
//   if (pathname === "/") {
//     if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//     if (role === "user")  return NextResponse.redirect(new URL("/user/dashboard",  req.url));
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // Public pages
//   if (pathname === "/login" || pathname === "/signup") {
//     if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//     if (role === "user")  return NextResponse.redirect(new URL("/user/dashboard",  req.url));
//     return NextResponse.next();
//   }

//   // Zones
//   if (pathname.startsWith("/admin") && role !== "admin") {
//     return NextResponse.redirect(new URL("/user/dashboard", req.url));
//   }
//   if (pathname.startsWith("/user") && !role) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/login", "/signup", "/admin/:path*", "/user/:path*"],
// };





import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";
import type { JWT } from "next-auth/jwt";
import { NextResponse } from "next/server";

type AppJWT = JWT & {
  role?: string;
  hasPlan?: boolean;
};

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token as AppJWT | null;
    // Some setups may nest custom fields differently; be defensive.
    const role = normalizeRole(
      (token as unknown as { role?: unknown })?.role ??
        (token as unknown as { user?: { role?: unknown } })?.user?.role
    );
    const hasPlan = token?.hasPlan;
    const path = req.nextUrl.pathname;

    // Admin-only area
    if (path.startsWith("/admin") && role !== "admin") {
      // Sometimes right after sign-in the token exists but custom fields
      // (like role) haven't propagated yet on the first edge request.
      // In that case, bounce through home which server-redirects by session.
      if (!role) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (process.env.NODE_ENV !== "production") {
        // Avoid logging secrets; just enough to debug role mismatches.
        console.log("[middleware] deny admin route", {
          path,
          role,
          tokenKeys: token ? Object.keys(token) : [],
        });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // User section must be a real "user" (not admin).
    if (path.startsWith("/user") && role !== "user") {
      if (!role) return NextResponse.redirect(new URL("/login", req.url));
      if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (process.env.NODE_ENV !== "production") {
        console.log("[middleware] deny user route", {
          path,
          role,
          tokenKeys: token ? Object.keys(token) : [],
        });
      }
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Block some user pages if no subscription
    const requiresPlan = [
      "dddd",
      // "/user/dashboard",
      // "/user/ai-assistant",
      // "/user/integrations",
      // "/user/analytics",
    ];
    if (
      !hasPlan &&
      requiresPlan.some((p) => path.startsWith(p)) &&
      !path.startsWith("/user/subscription")
    ) {
      return NextResponse.redirect(new URL("/user/subscription", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // if there is NO token → redirect to signIn page (/login)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
