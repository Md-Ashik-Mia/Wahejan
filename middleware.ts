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





import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any;
    const role = token?.role;
    const hasPlan = token?.hasPlan;
    const path = req.nextUrl.pathname;

    // Admin-only area
    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // User section must have user role
    if (path.startsWith("/user") && !role) {
      return NextResponse.redirect(new URL("/login", req.url));
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
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // must be logged in at all
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/user/:path*"],
};
