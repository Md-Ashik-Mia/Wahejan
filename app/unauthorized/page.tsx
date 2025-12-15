// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-gray-400">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    </div>
  );
}
