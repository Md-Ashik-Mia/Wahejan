import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Return only safe fields (no access token) to avoid leaking credentials.
  const role =
    (token as any)?.role ??
    (token as any)?.user?.role ??
    null;

  return NextResponse.json({
    ok: true,
    role,
    email: (token as any)?.email ?? null,
    sub: (token as any)?.sub ?? null,
    hasPlan: (token as any)?.hasPlan ?? null,
    hasAccessTokenClaim: Boolean((token as any)?.accessToken),
    hasRefreshTokenClaim: Boolean((token as any)?.refreshToken),
    keys: token ? Object.keys(token) : [],
  });
}
