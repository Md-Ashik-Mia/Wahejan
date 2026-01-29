"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function SessionSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", session.accessToken as string);
        if (session.refreshToken) {
            localStorage.setItem("refresh_token", session.refreshToken as string);
        }
      }
    } else {
        // Option 1: Do nothing (preserve existing token?)
        // Option 2: Clear token if session is invalid?
        // Let's stick to setting it if present. Clearing might be aggressive during loading states.
    }
  }, [session]);

  return null;
}
