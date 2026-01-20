"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  // Lax is fine for first-party auth-like gating.
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

export default function PolicyAcceptance() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleReturn = () => {
    setCookie("policy_accepted", "true", 60 * 60 * 24 * 365);
    try {
      localStorage.setItem("policy_accepted", "true");
    } catch {
      // ignore
    }

    const rawRole = session?.user?.role;
    const role =
      typeof rawRole === "string" ? rawRole.trim().toLowerCase() : "";

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (role === "user" || session?.user) {
      router.replace("/user/dashboard");
      return;
    }

    router.replace("/login");
  };

  const isLoggedIn = Boolean(session?.user);
  const buttonLabel = isLoggedIn ? "Return to Dashboard" : "Return to Login";

  return (
    <section className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-medium">Privacy Policy</div>
        <button
          type="button"
          onClick={handleReturn}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}
