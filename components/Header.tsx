"use client";

export default function Header() {
  return (
    <header className="fixed top-0 left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#121620] border-b border-white/10 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <input
        className="bg-[#1a1f29] border border-white/10 rounded px-3 py-1.5 w-72 outline-none"
        placeholder="Search..."
      />
    </header>
  );
}
