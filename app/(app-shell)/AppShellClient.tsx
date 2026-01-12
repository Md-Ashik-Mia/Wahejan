"use client";

import Header from "@/components/Header";
import SidebarClient from "@/components/SidebarClient";
import QueryProvider from "@/components/providers/QueryProvider";
import { usePathname } from "next/navigation";

const NO_SHELL_PREFIXES = ["/user/chat-profile"] as const;

function shouldHideShell(pathname: string): boolean {
  return NO_SHELL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function AppShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideShell = shouldHideShell(pathname);

  if (hideShell) {
    return <QueryProvider>{children}</QueryProvider>;
  }

  return (
    <>
      <Header />
      <SidebarClient />
      <div className="min-h-screen pt-[var(--header-h)] pl-[var(--sidebar-w)]">
        <QueryProvider>{children}</QueryProvider>
      </div>
    </>
  );
}
