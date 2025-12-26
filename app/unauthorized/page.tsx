import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// app/unauthorized/page.tsx
export default async function UnauthorizedPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-400">
          You don&apos;t have permission to view this page.
        </p>
        {process.env.NODE_ENV !== "production" ? (
          <p className="text-xs text-gray-500">
            Debug: session role = {role ? String(role) : "(none)"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
