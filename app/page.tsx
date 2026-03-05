// app/page.tsx
export default function HomePage() {
  // Redirection is now handled by middleware.ts for better performance and to prevent server crashes.
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-gray-700 animate-spin"></div>
        <p className="text-gray-400 font-medium tracking-wide">Connecting...</p>
      </div>
    </div>
  );
}
