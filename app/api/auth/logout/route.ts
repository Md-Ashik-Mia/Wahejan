// import { NextResponse } from "next/server";

// export async function POST() {
//   const res = NextResponse.json({ ok: true });
//   res.cookies.set("role", "", { path: "/", maxAge: 0 });
//   return res;
// }



import { NextResponse } from "next/server";

export async function POST() {
  // Create a response that redirects to /login
  const res = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));

  // Clear the cookie
  res.cookies.set("role", "", { path: "/", maxAge: 0 });

  return res;
}
