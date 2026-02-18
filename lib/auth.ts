
// lib/auth.ts
import type { NextAuthOptions, User } from "next-auth";
import AppleProvider from "next-auth/providers/apple";
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
  if (typeof role === "string") return role.trim().toLowerCase();
  if (Array.isArray(role) && role.length > 0 && typeof role[0] === "string") {
    return role[0].trim().toLowerCase();
  }
  return "";
}

function isTrue(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function deriveRoleFromBackendUser(user: unknown): string {
  if (!user || typeof user !== "object") {
    console.log("[auth] deriveRoleFromBackendUser: invalid user object", user);
    return "";
  }
  const u = user as Record<string, unknown>;

  // Check 'role' (string or array) or 'roles' (array)
  const rawRole = normalizeRole(u.role) || normalizeRole(u.roles);
  if (rawRole) {
    if (rawRole === "administrator" || rawRole === "superadmin" || rawRole === "super_admin") return "admin";
    return rawRole;
  }

  // Fallback to common Django/DRF style flags.
  if (isTrue(u.is_admin) || isTrue(u.is_staff) || isTrue(u.is_superuser)) return "admin";
  if (isTrue(u.is_employee)) return "employee";

  console.log("[auth] deriveRoleFromBackendUser: no role found in", Object.keys(u));
  return "";
}

function readHeader(req: unknown, headerName: string): string | null {
  if (!req || typeof req !== "object") return null;
  const reqObj = req as Record<string, unknown>;
  const headers = reqObj["headers"];
  if (!headers) return null;

  const nameLower = headerName.toLowerCase();

  // Next/Fetch Headers
  if (typeof headers === "object" && headers !== null) {
    const maybeHeaders = headers as { get?: (key: string) => string | null };
    if (typeof maybeHeaders.get === "function") {
      return maybeHeaders.get(headerName) ?? maybeHeaders.get(nameLower);
    }
  }

  // Plain object headers
  if (typeof headers === "object" && headers !== null) {
    const map = headers as Record<string, unknown>;
    const value = map[headerName] ?? map[nameLower];
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      const first = value[0];
      return typeof first === "string" ? first : null;
    }
  }

  return null;
}

function tryParseClientUserAgent(rawClientInfo: string): string | null {
  try {
    const parsed = JSON.parse(rawClientInfo) as Record<string, unknown>;
    const ua = parsed?.userAgent;
    return typeof ua === "string" && ua.trim().length > 0 ? ua : null;
  } catch {
    return null;
  }
}

function deriveNEXTAUTH_URL(): string | undefined {
  if (typeof window !== "undefined") return undefined; // Server only
  return process.env.NEXTAUTH_URL;
}

const finalNextAuthUrl = deriveNEXTAUTH_URL();

export const authOptions: NextAuthOptions = {
  // Restore your original secret logic but with a safe fallback to prevent crashes
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback-secret-for-prod",
  useSecureCookies: process.env.NODE_ENV === "production",
  providers: [
    // 1) Email + password (Python backend)
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
          const headers: Record<string, string> = {};
          const creds = credentials as Record<string, string | undefined>;
          const raw = typeof creds.client_info === "string" ? creds.client_info : "";
          if (raw.trim().length > 0) headers["X-Client-Info"] = raw;

          const uaFromReq = readHeader(req, "user-agent");
          const uaFromClientInfo = raw.trim().length > 0 ? tryParseClientUserAgent(raw) : null;
          const ua = uaFromReq ?? uaFromClientInfo;
          if (ua) headers["User-Agent"] = ua;

          const xff = readHeader(req, "x-forwarded-for");
          if (xff) headers["X-Forwarded-For"] = xff;
          const xRealIp = readHeader(req, "x-real-ip");
          if (xRealIp) headers["X-Real-IP"] = xRealIp;
          const cfIp = readHeader(req, "cf-connecting-ip");
          if (cfIp) headers["CF-Connecting-IP"] = cfIp;

          headers["ngrok-skip-browser-warning"] = "true";

          const { data } = await api.post(
            "/login/",
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers,
            }
          );

          const user = data.user;
          const access = data.access;
          const refresh = data.refresh;

          if (!user || !access) return null;

          const appUser: AppUser = {
            id: String(user.id),
            name: user.name,
            email: user.email,
            image: user.image || user.profile_image || user.profile_picture || user.avatar || undefined,
            role: deriveRoleFromBackendUser(user) || "user",
            hasPlan: Boolean((user as any).has_plan || data.plan),
            accessToken: access,
            refreshToken: refresh,
            permissions: data.permissions,
            company: user.company,
          };

          console.log("[auth] credentials login ok", {
            email: appUser.email,
            role: appUser.role,
          });

          return appUser as unknown as User;
        } catch (err) {
          console.error("Credentials login failed", err);
          return null;
        }
      },
    }),

    // 2) Google OAuth -> exchange Google access_token with your backend
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorization: {
            params: {
              prompt: "consent",
              access_type: "offline",
              response_type: "code",
            },
          },
        }),
      ]
      : []),

    // 3) Apple OAuth (optional)
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? [
        AppleProvider({
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
        }),
      ]
      : []),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // RESTORED: Your original JWT callback with all custom fields and refresh logic
    async jwt({ token, user, account }) {
      if (user) {
        console.log("[auth] JWT callback: initial sign in", { email: user.email });
        const u = user as unknown as Partial<AppUser>;
        token.role = normalizeRole(u.role);
        token.hasPlan = Boolean(u.hasPlan);
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.image = u.image;
        token.permissions = u.permissions;
        token.company = u.company;
        token.lastVerified = Date.now();
      }

      if (account?.provider === "google" && account.access_token) {
        try {
          const { data } = await api.post(
            "/auth/google/login/",
            { access_token: account.access_token },
            { headers: { "ngrok-skip-browser-warning": "true" } }
          );

          const backendUser = (data as any)?.user;
          const access = (data as any)?.access ?? (data as any)?.access_token;
          const refresh = (data as any)?.refresh ?? (data as any)?.refresh_token;

          if (access) token.accessToken = access;
          if (refresh) token.refreshToken = refresh;

          const roleFromBackend = deriveRoleFromBackendUser(backendUser);
          token.role = normalizeRole(roleFromBackend || (token as any).role || "user");
          token.hasPlan = Boolean((backendUser as any)?.has_plan || (data as any)?.plan);
          token.image = (backendUser as any)?.image || (backendUser as any)?.profile_image || (backendUser as any)?.profile_picture || (backendUser as any)?.avatar || undefined;
          token.permissions = (data as any)?.permissions;
          token.company = backendUser?.company;
          token.lastVerified = Date.now();
        } catch (err) {
          console.error("[auth] google token exchange failed", err);
        }
      }

      // RESTORED: Your Background Token Validation Logic
      const isInitialLoad = !token.lastVerified;
      const isStale = (token.lastVerified as number) && (Date.now() - (token.lastVerified as number)) > 1000 * 60 * 5;
      const shouldVerify = isInitialLoad || isStale;

      if (token.accessToken && token.refreshToken && shouldVerify) {
        try {
          const { data } = await api.post("/validate-token/", {
            access: token.accessToken,
            refresh: token.refreshToken,
          });

          if (data.valid && data.access) {
            token.accessToken = data.access;
            if (data.refresh) token.refreshToken = data.refresh;

            if (data.user) {
              token.name = data.user.name || token.name;
              token.role = normalizeRole(deriveRoleFromBackendUser(data.user) || token.role);
              token.hasPlan = Boolean(data.user.has_plan || data.plan);
              token.image = data.user.image || data.user.profile_image || token.image;
              token.permissions = data.permissions || token.permissions;
              token.company = data.user.company || token.company;
            }
            token.lastVerified = Date.now();
          } else {
            return { ...token, error: "RefreshAccessTokenError" };
          }
        } catch (error) {
          console.error("[auth] Background validation failed", error);
          return { ...token, error: "RefreshAccessTokenError" };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).name = token.name || session.user.name;
        (session.user as any).email = token.email || session.user.email;
        (session.user as any).role = (token as any).role;
        (session.user as any).hasPlan = (token as any).hasPlan;
        (session.user as any).image = (token as any).image || (token as any).picture;
        (session.user as any).permissions = (token as any).permissions;
        (session.user as any).company = (token as any).company;
      }
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = (token as any).refreshToken;
      return session;
    },

    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },
};
