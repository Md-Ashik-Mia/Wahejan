"use client";
import { userapi } from "@/lib/http/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Header() {
  const { data: session, status, update } = useSession();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    name: string | null;
    image: string | null;
    version: number;
  }>({ name: null, image: null, version: 0 });

  // Strictly use session values without fallbacks
  const userName = session?.user?.name ?? null;
  const rawImage = session?.user?.image ?? null;
  const displayName = profile.name ?? userName ?? null;
  const displayImage = profile.image ?? rawImage ?? null;

  const parseProfile = (payload: unknown) => {
    const data = payload as {
      name?: string | null;
      image?: string | null;
      avatar?: string | null;
    } | null;
    return {
      name: data?.name ?? null,
      image: data?.image ?? data?.avatar ?? null,
    };
  };

  // Create a unique cache key based on the logged-in user to prevent "ghosting" between logins (Admin vs User)
  const userIdentifier = session?.user?.email || (session?.user as any)?.id || "guest";
  const CACHE_KEY = `profile_cache_${userIdentifier}`;

  useEffect(() => {
    if (status !== "authenticated" || !userIdentifier || userIdentifier === "guest") return;

    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          name?: string;
          image?: string;
          version?: number;
        };
        setProfile({
          name: parsed.name ?? null,
          image: parsed.image ?? null,
          version: typeof parsed.version === "number" ? parsed.version : 0,
        });
      } else {
        // If no cache for THIS user, clear any old generic caches
        setProfile({ name: null, image: null, version: 0 });
      }
    } catch {
      // ignore storage errors
    }
  }, [userIdentifier, status]);

  const persistProfile = (next: {
    name: string | null;
    image: string | null;
    version: number;
  }) => {
    if (next.image?.startsWith("blob:") || userIdentifier === "guest") return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  // No automatic fetch here to avoid loops.
  // NextAuth background verification (lib/auth.ts) handles session freshness.

  useEffect(() => {
    setNameInput(displayName ?? "");
  }, [displayName]);

  // Resolve profile image URL only if it exists
  const userImage = (() => {
    if (!displayImage) return null;
    if (
      displayImage.startsWith("http") ||
      displayImage.startsWith("data:") ||
      displayImage.startsWith("blob:")
    ) {
      if (profile.version && !displayImage.startsWith("blob:")) {
        const joiner = displayImage.includes("?") ? "&" : "?";
        return `${displayImage}${joiner}v=${profile.version}`;
      }
      return displayImage;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    const backendHost = apiBase.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const normalizedPath = displayImage.startsWith("/")
      ? displayImage
      : `/${displayImage}`;

    const url = backendHost
      ? `${backendHost}${normalizedPath}`
      : normalizedPath;
    if (profile.version) {
      const joiner = url.includes("?") ? "&" : "?";
      return `${url}${joiner}v=${profile.version}`;
    }
    return url;
  })();

  const handleSave = async () => {
    setSaveError(null);
    if (!nameInput.trim() && !imageFile) {
      setSaveError("Please provide a name or image.");
      return;
    }

    try {
      setSaving(true);
      const form = new FormData();
      if (nameInput.trim()) form.append("name", nameInput.trim());
      if (imageFile) form.append("image", imageFile);

      const res = await userapi.patch("/auth/users/me/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const patched = parseProfile(res.data);
      const nextName = patched.name ?? nameInput.trim() ?? userName ?? null;
      const nextImage = patched.image ?? rawImage ?? null;
      const fallbackImage =
        !nextImage && imageFile ? URL.createObjectURL(imageFile) : null;

      const next = {
        name: nextName,
        image: nextImage ?? fallbackImage,
        version: Date.now(),
      };
      setProfile(next);
      persistProfile(next);

      await update({
        user: {
          ...(session?.user ?? {}),
          name: nextName ?? undefined,
          image: nextImage ?? fallbackImage ?? undefined,
        },
      });

      setIsEditOpen(false);
      setImageFile(null);
      toast.success("Profile updated successfully!");
    } catch {
      setSaveError("Failed to update profile.");
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 md:left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#212121] flex items-center justify-between md:justify-end px-4 md:px-6 gap-3 border-b border-white/5">
      {/* Mobile-only logo space/trigger (optional, helps balance the bar) */}
      <div className="flex md:hidden items-center">
         <span className="text-white font-bold text-lg tracking-tight">Verse<span className="text-blue-500">AI</span></span>
      </div>

      {status === "loading" ? (
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-16 h-4 bg-white/5 animate-pulse rounded" />
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white/5 animate-pulse" />
        </div>
      ) : (
        <div className="relative flex items-center gap-2 md:gap-3">
          {displayName && (
            <span className="hidden sm:block text-[14px] text-white font-medium truncate max-w-[100px] md:max-w-none">
              {displayName}
            </span>
          )}
          {userImage && (
            <div className="relative w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border border-gray-700 bg-[#2b2b2b]">
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

          <button
            type="button"
            onClick={() => setIsEditOpen((v) => !v)}
            className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
          >
            Edit
          </button>

          {isEditOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-[#1f1f1f] border border-gray-700 rounded-lg p-4 shadow-2xl z-50">
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-md bg-[#2b2b2b] border border-gray-700 text-white text-sm px-3 py-2 focus:border-blue-500 transition-colors outline-none"
                placeholder="Enter name"
              />

              <label className="block text-xs text-gray-400 mt-4 mb-1.5 font-medium uppercase tracking-wider">
                Profile Image
              </label>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 file:cursor-pointer"
                />
              </div>

              {saveError ? (
                <p className="text-[11px] text-red-500 mt-3 font-medium">{saveError}</p>
              ) : null}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="text-xs px-4 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-900/20"
                >
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
