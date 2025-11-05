"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // optional – helps during dev
  console.error(error);

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-400">{error.message}</p>
      <button
        onClick={() => reset()}       // re-render the route segment
        className="px-4 py-2 rounded bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
