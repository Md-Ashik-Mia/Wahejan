"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Header() {
  const { data: session, status } = useSession();

  // Strictly use session values without fallbacks
  const userName = session?.user?.name;
  const rawImage = session?.user?.image;

  // Resolve profile image URL only if it exists
  const userImage = (() => {
    if (!rawImage) return null;
    if (rawImage.startsWith("http") || rawImage.startsWith("data:")) return rawImage;

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const backendHost = apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const normalizedPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;

    return backendHost ? `${backendHost}${normalizedPath}` : normalizedPath;
  })();

  return (
    <header className="fixed top-0 left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#212121] flex items-center justify-end px-6 gap-3">
      {status === "loading" ? (
        <>
          <div className="w-16 h-4 bg-white/5 animate-pulse rounded" />
          <div className="w-11 h-11 rounded-full bg-white/5 animate-pulse" />
        </>
      ) : (
        <>
          {userName && (
            <span className="text-[14px] text-white font-medium">
              {userName}
            </span>
          )}
          {userImage && (
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
          )}
        </>
      )}
    </header>
  );
}
