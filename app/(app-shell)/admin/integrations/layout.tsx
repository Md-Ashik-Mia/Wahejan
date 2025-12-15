// app/admin/integration/layout.tsx
import React from "react";

export default function IntegrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Integration Management</h1>
      <div className="space-y-6">{children}</div>
    </div>
  );
}
