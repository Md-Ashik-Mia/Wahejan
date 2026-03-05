import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // We return a simple JSON response instead of a Server Redirect.
  // This allows the Client to handle the redirect using window.location,
  // which is 100% reliable for staying on the correct domain (Amplify vs Local).
  const res = NextResponse.json({ success: true, redirect: "/login" });

  // Clear all relevant auth cookies
  const cookieOptions = { path: "/", maxAge: 0 };
  res.cookies.set("role", "", cookieOptions);
  res.cookies.set("policy_accepted", "", cookieOptions);
  res.cookies.set("next-auth.session-token", "", cookieOptions);
  res.cookies.set("__Secure-next-auth.session-token", "", cookieOptions);

  return res;
}
