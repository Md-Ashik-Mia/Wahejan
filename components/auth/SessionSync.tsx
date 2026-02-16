"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if ((session as any)?.error === "RefreshAccessTokenError") {
        if (typeof window !== "undefined") {
            const path = window.location.pathname;
            if (path !== "/login" && path !== "/policy") {
                window.location.href = "/api/auth/signout?callbackUrl=/login";
            }
        }
        return;
    }

    if (typeof window !== "undefined") {
      const accepted = localStorage.getItem("policy_accepted") === "true";
      if (accepted) {
        document.cookie = "policy_accepted=true; path=/; max-age=31536000; SameSite=Lax";
      }

      if (session?.accessToken) {
        localStorage.setItem("access_token", session.accessToken as string);
        if (session.refreshToken) {
            localStorage.setItem("refresh_token", session.refreshToken as string);
        }
      }
    }
  }, [session]);

  return null;
}
