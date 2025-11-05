export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // No header/sidebar here, and no special padding
  return <div className="min-h-screen bg-black text-white">{children}</div>;
}
