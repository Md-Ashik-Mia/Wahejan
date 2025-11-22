// import { cookies } from "next/headers";
// import "server-only";

// export type Role = "admin" | "user" | null;

// /** Read role from cookie (demo auth). Replace with NextAuth later. */
// export async function getRole(): Promise<Role> {
//   const jar = await cookies(); // Next 16: async
//   const v = jar.get("role")?.value;
//   return v === "admin" || v === "user" ? v : null;
// }



import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { api } from "./http/client";

export const authOptions: NextAuthOptions = {
  providers: [
    // 1) Email + password
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const { data } = await api.post("/api/login/", {
            email: credentials.email,
            password: credentials.password,
          });

          const user = data.user;
          const access = data.access;
          const refresh = data.refresh;

          if (!user || !access) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,          // "admin" | "user"
            hasPlan: user.has_plan,   // backend should send this
            accessToken: access,
            refreshToken: refresh,
          } as any;
        } catch (err) {
          console.error("Credentials login failed", err);
          return null;
        }
      },
    }),

    // 2) Google OAuth -> you must add matching endpoint in backend
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 3) Apple OAuth -> same note as above
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Called whenever a JWT is created or updated
    async jwt({ token, user, account }) {
      // first login with credentials
      if (user) {
        token.role = (user as any).role;
        token.hasPlan = (user as any).hasPlan;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }

      // TODO if you want: for Google/Apple, call your Python backend here
      // if (account?.provider === "google" && account.access_token) {
      //   const { data } = await api.post("/social/google-login/", {
      //     access_token: account.access_token,
      //   });
      //   token.role = data.user.role;
      //   token.hasPlan = data.user.has_plan;
      //   token.accessToken = data.access;
      // }

      return token;
    },

    // Expose fields to the client
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: token.role,
        hasPlan: token.hasPlan,
      } as any;

      // custom field for websocket, axios, etc.
      (session as any).accessToken = token.accessToken;
      return session;
    },

     async redirect({ baseUrl, token }) {
      const role = (token as any)?.role;
      if (role === "admin") return `${baseUrl}/admin/dashboard`;
      if (role === "user") return `${baseUrl}/user/dashboard`;
      return baseUrl;
    }

  },

  pages: {
    signIn: "/login",
  },
};
