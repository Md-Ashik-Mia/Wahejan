// import { NextResponse } from "next/server";

// export async function POST() {
//   const res = NextResponse.json({ ok: true });
//   res.cookies.set("role", "", { path: "/", maxAge: 0 });
//   return res;
// }



import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Use a relative URL for the redirect.
  // Next.js NextResponse.redirect requires an absolute URL,
  // so we build it dynamically from the request headers.
  const origin = req.headers.get("origin") || req.headers.get("referer") || new URL(req.url).origin;
  const loginUrl = new URL("/login", origin);

  const res = NextResponse.redirect(loginUrl);

  // Clear all relevant cookies
  res.cookies.set("role", "", { path: "/", maxAge: 0 });
  res.cookies.set("next-auth.session-token", "", { path: "/", maxAge: 0 });
  res.cookies.set("__Secure-next-auth.session-token", "", { path: "/", maxAge: 0 });

  return res;
}
