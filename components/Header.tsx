"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  // Fallback to name or email prefix
  const userName = session?.user?.name || (session?.user?.email ? session.user.email.split("@")[0] : "User");
  const rawImage = session?.user?.image;

  // Resolve profile image URL
  const userImage = (() => {
    if (!rawImage) return "/profilepicture.svg";
    // Use absolute or base64 URLs directly
    if (rawImage.startsWith("http") || rawImage.startsWith("data:")) return rawImage;

    // Resolve relative backend paths
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const backendHost = apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const normalizedPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;

    return backendHost ? `${backendHost}${normalizedPath}` : normalizedPath;
  })();

  return (
    <header className="fixed top-0 left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#212121] flex items-center justify-end px-6 gap-3">
      <span className="text-[14px] text-white font-medium">
        {status === "loading" ? (
          <div className="w-16 h-4 bg-white/5 animate-pulse rounded" />
        ) : (
          userName
        )}
      </span>
      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-700 bg-[#2b2b2b]">
        <Image
          src={userImage}
          alt="Profile"
          fill
          unoptimized
          className="object-cover"
          priority
        />
      </div>
    </header>
  );
}
