
// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import AppleProvider from "next-auth/providers/apple";
// import { api } from "./http/client";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     // 1) Email + password
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         try {
//           const { data } = await api.post("/api/login/", {
//             email: credentials.email,
//             password: credentials.password,
//           });

//           const user = data.user;
//           const access = data.access;
//           const refresh = data.refresh;

//           if (!user || !access) return null;

//           return {
//             id: String(user.id),
//             name: user.name,
//             email: user.email,
//             role: user.role,          // "admin" | "user"
//             hasPlan: user.has_plan,   // backend should send this
//             accessToken: access,
//             refreshToken: refresh,
//           } as any;
//         } catch (err) {
//           console.error("Credentials login failed", err);
//           return null;
//         }
//       },
//     }),

//     // 2) Google OAuth -> you must add matching endpoint in backend
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     // 3) Apple OAuth -> same note as above
//     AppleProvider({
//       clientId: process.env.APPLE_CLIENT_ID!,
//       clientSecret: process.env.APPLE_CLIENT_SECRET!,
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     // Called whenever a JWT is created or updated
//     async jwt({ token, user, account }) {
//       // first login with credentials
//       if (user) {
//         token.role = (user as any).role;
//         token.hasPlan = (user as any).hasPlan;
//         token.accessToken = (user as any).accessToken;
//         token.refreshToken = (user as any).refreshToken;
//       }

//       // TODO if you want: for Google/Apple, call your Python backend here
//       // if (account?.provider === "google" && account.access_token) {
//       //   const { data } = await api.post("/social/google-login/", {
//       //     access_token: account.access_token,
//       //   });
//       //   token.role = data.user.role;
//       //   token.hasPlan = data.user.has_plan;
//       //   token.accessToken = data.access;
//       // }

//       return token;
//     },

//     // Expose fields to the client
//     async session({ session, token }) {
//       session.user = {
//         ...session.user,
//         role: token.role,
//         hasPlan: token.hasPlan,
//       } as any;

//       // custom field for websocket, axios, etc.
//       (session as any).accessToken = token.accessToken;
//       return session;
//     },

//      async redirect({ baseUrl, token }) {
//       const role = (token as any)?.role;
//       if (role === "admin") return `${baseUrl}/admin/dashboard`;
//       if (role === "user") return `${baseUrl}/user/dashboard`;
//       return baseUrl;
//     }

//   },

//   pages: {
//     signIn: "/login",
//   },
// };




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
  role: string;
  hasPlan: boolean;
  accessToken: string;
  refreshToken?: string;
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

  // Prefer explicit role strings.
  const rawRole = normalizeRole(u.role);
  if (rawRole) {
    // Common synonyms
    if (rawRole === "administrator" || rawRole === "superadmin" || rawRole === "super_admin") return "admin";
    return rawRole;
  }

  // Fallback to common Django/DRF style flags.
  if (isTrue(u.is_admin) || isTrue(u.is_staff) || isTrue(u.is_superuser)) return "admin";

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

export const authOptions: NextAuthOptions = {
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

          // Forward the REAL browser User-Agent to backend (Node axios default is axios/x.y.z)
          const uaFromReq = readHeader(req, "user-agent");
          const uaFromClientInfo = raw.trim().length > 0 ? tryParseClientUserAgent(raw) : null;
          const ua = uaFromReq ?? uaFromClientInfo;
          if (ua) headers["User-Agent"] = ua;

          // Forward IP hints if present (useful when backend sits behind proxies)
          const xff = readHeader(req, "x-forwarded-for");
          if (xff) headers["X-Forwarded-For"] = xff;
          const xRealIp = readHeader(req, "x-real-ip");
          if (xRealIp) headers["X-Real-IP"] = xRealIp;
          const cfIp = readHeader(req, "cf-connecting-ip");
          if (cfIp) headers["CF-Connecting-IP"] = cfIp;

          // IMPORTANT: baseURL in api is NEXT_PUBLIC_API_BASE_URL
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

          // Backend response shape assumed:
          // { user: { id, name, email, role, has_plan }, access, refresh }
          const user = data.user;
          const access = data.access;
          const refresh = data.refresh;

          if (!user || !access) return null;

          const appUser: AppUser = {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: deriveRoleFromBackendUser(user) || "user",
            hasPlan: Boolean((user as any).has_plan),
            accessToken: access,
            refreshToken: refresh,
          };

          // Helpful during debugging (prints in server terminal only)
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

    // 2) Google OAuth — backend must support it for real use
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 3) Apple OAuth — same note as above
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Called whenever JWT is created/updated
    async jwt({ token, user }) {
      // First login with credentials
      if (user) {
        const u = user as unknown as Partial<AppUser>;
        token.role = normalizeRole(u.role);
        token.hasPlan = Boolean(u.hasPlan);
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
      }

      // Keep role normalized even on subsequent calls.
      if (typeof token.role === "string") {
        token.role = normalizeRole(token.role);
      }

      // Later you can handle Google/Apple by calling your Python backend here
      // if (account?.provider === "google" && account.access_token) {
      //   const { data } = await api.post("/social/google-login/", {
      //     access_token: account.access_token,
      //   });
      //   token.role = data.user.role;
      //   token.hasPlan = data.user.has_plan;
      //   token.accessToken = data.access;
      //   token.refreshToken = data.refresh;
      // }

      return token;
    },

    // What goes to client side
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: typeof token.role === "string" ? token.role : undefined,
        hasPlan: Boolean(token.hasPlan),
      } as unknown as typeof session.user;

      (session as unknown as { accessToken?: unknown }).accessToken = token.accessToken;
      return session;
    },

    // Where to go after signIn (if you let NextAuth redirect)
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },
};


