"use client";

import { SessionSync } from "@/components/auth/SessionSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <SessionSync />
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
