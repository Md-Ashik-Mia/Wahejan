"use client";

import { useState } from "react";

type Props = {
  initialAccepted?: boolean;
};

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  // Lax is fine for first-party auth-like gating.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export default function PolicyAcceptance({ initialAccepted }: Props) {
  const [accepted, setAccepted] = useState(() => {
    if (typeof window === "undefined") return initialAccepted ?? false;

    const cookieAccepted = getCookieValue("policy_accepted") === "true";
    let storageAccepted = false;
    try {
      storageAccepted = localStorage.getItem("policy_accepted") === "true";
    } catch {
      // ignore
    }

    if (initialAccepted !== undefined) return initialAccepted;
    return cookieAccepted || storageAccepted;
  });

  return (
    <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-blue-600"
          checked={accepted}
          onChange={(e) => {
            const next = e.target.checked;
            setAccepted(next);

            if (next) {
              setCookie("policy_accepted", "true", 60 * 60 * 24 * 365);
              try {
                localStorage.setItem("policy_accepted", "true");
              } catch {
                // ignore
              }
            } else {
              setCookie("policy_accepted", "", 0);
              try {
                localStorage.removeItem("policy_accepted");
              } catch {
                // ignore
              }
            }
          }}
        />

        <div>
          <div className="font-medium">I agree to this Privacy Policy</div>
          <div className="mt-1 text-sm text-white/70">
            You must agree before visiting other pages.
          </div>
        </div>
      </label>

      <div className="mt-4 text-sm">
        <span className={accepted ? "text-emerald-400" : "text-white/60"}>
          {accepted ? "Accepted. You can continue browsing." : "Not accepted yet."}
        </span>
      </div>
    </section>
  );
}
