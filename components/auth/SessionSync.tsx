"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
        if (typeof window !== "undefined") {
            window.location.href = "/api/auth/signout?callbackUrl=/login";
        }
        return;
    }

    if (session?.accessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", session.accessToken as string);
        if (session.refreshToken) {
            localStorage.setItem("refresh_token", session.refreshToken as string);
        }
      }
    }
  }, [session]);

  return null;
}
