"use client";

import { adminNav } from "@/components/nav/adminNav";
import { userNav } from "@/components/nav/userNav";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "admin" | "user" | null;

export default function SidebarClient({ role }: { role: Role }) {
  const router = useRouter();
  const items = role === "admin" ? adminNav : userNav;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-w)] z-50 bg-[#0b0d12] border-r border-white/10">
      <div className="h-[var(--header-h)] flex items-center px-4 text-lg font-semibold">Verse AI</div>
      <nav className="px-2 py-3 space-y-1">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className="block px-3 py-2 rounded text-sm text-gray-400 hover:text-white hover:bg-white/10"
          >
            <span className="mr-2">{i.icon}</span>{i.label}
          </Link>
        ))}

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button
            onClick={logout}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500"
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
