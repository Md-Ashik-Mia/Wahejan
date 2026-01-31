import { DefaultSession, DefaultUser } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      role?: string;
      hasPlan?: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
  }

  interface User extends DefaultUser {
    role?: string;
    hasPlan?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    hasPlan?: boolean;
    accessToken?: string;
    refreshToken?: string;
    image?: string;
  }
}
