import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { api } from "./http/client";

type AppUser = {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  role: string;
  hasPlan: boolean;
  accessToken: string;
  refreshToken?: string;
  permissions?: any;
  company?: any;
};

function normalizeRole(role: unknown): string {
  return typeof role === "string" ? role.trim().toLowerCase() : "";
}

function isTrue(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function deriveRoleFromBackendUser(user: unknown): string {
  if (!user || typeof user !== "object") return "";
  const u = user as Record<string, unknown>;
  const rawRole = normalizeRole(u.role);
  if (rawRole) {
    if (rawRole === "administrator" || rawRole === "superadmin") return "admin";
    return rawRole;
  }
  if (isTrue(u.is_admin) || isTrue(u.is_staff)) return "admin";
  return "";
}

function readHeader(req: any, headerName: string): string | null {
  const headers = req?.headers;
  if (!headers) return null;
  const nameLower = headerName.toLowerCase();
  if (typeof headers.get === "function") return headers.get(headerName) || headers.get(nameLower);
  return headers[headerName] || headers[nameLower] || null;
}

export const authOptions: NextAuthOptions = {
  // Defensive secret to prevent "Server Components render" crash if Amplify env vars fail to load
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-for-amplify-prod",
  useSecureCookies: process.env.NODE_ENV === "production",
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        client_info: { label: "Client Info", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const headers: Record<string, string> = { "ngrok-skip-browser-warning": "true" };
          const ua = readHeader(req, "user-agent");
          if (ua) headers["User-Agent"] = ua;

          const { data } = await api.post("/login/", {
            email: credentials.email,
            password: credentials.password,
          }, { headers });

          const user = data.user;
          if (!user || !data.access) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: deriveRoleFromBackendUser(user) || "user",
            hasPlan: Boolean(user.has_plan || data.plan),
            accessToken: data.access,
            refreshToken: data.refresh,
            permissions: data.permissions,
            company: user.company,
          } as any;
        } catch (err) {
          console.error("Credentials login failed", err);
          return null;
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const u = user as any;
        token.role = normalizeRole(u.role);
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.hasPlan = u.hasPlan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).hasPlan = token.hasPlan;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
