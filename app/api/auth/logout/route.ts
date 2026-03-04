// import { NextResponse } from "next/server";

// export async function POST() {
//   const res = NextResponse.json({ ok: true });
//   res.cookies.set("role", "", { path: "/", maxAge: 0 });
//   return res;
// }



import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Use the request origin to stay on the same domain (Amplify vs Localhost)
  const url = new URL(req.url);
  const origin = url.origin;

  const res = NextResponse.redirect(new URL("/login", origin));

  // Clear the cookie
  res.cookies.set("role", "", { path: "/", maxAge: 0 });

  return res;
}
