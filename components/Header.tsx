"use client";
import { userapi } from "@/lib/http/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

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

  const persistProfile = (next: {
    name: string | null;
    image: string | null;
    version: number;
  }) => {
    if (next.image?.startsWith("blob:")) return;
    try {
      localStorage.setItem("profile_cache", JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("profile_cache");
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
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchProfile = async () => {
      try {
        const res = await userapi.get("/auth/users/me/");
        const latest = parseProfile(res.data);
        if (!latest.name && !latest.image) return;
        const next = {
          name: latest.name ?? displayName,
          image: latest.image ?? displayImage,
          version: Date.now(),
        };
        setProfile(next);
        persistProfile(next);
        await update({
          user: {
            ...(session?.user ?? {}),
            name: next.name ?? undefined,
            image: next.image ?? undefined,
          },
        });
      } catch {
        // ignore refresh errors
      }
    };

    void fetchProfile();
  }, [status, update]);

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
    } catch {
      setSaveError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="fixed top-0 left-[var(--sidebar-w)] right-0 h-[var(--header-h)] z-40 bg-[#212121] flex items-center justify-end px-6 gap-3">
      {status === "loading" ? (
        <>
          <div className="w-16 h-4 bg-white/5 animate-pulse rounded" />
          <div className="w-11 h-11 rounded-full bg-white/5 animate-pulse" />
        </>
      ) : (
        <div className="relative flex items-center gap-3">
          {displayName && (
            <span className="text-[14px] text-white font-medium">
              {displayName}
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

          <button
            type="button"
            onClick={() => setIsEditOpen((v) => !v)}
            className="text-xs px-3 py-1.5 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition"
          >
            Edit
          </button>

          {isEditOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-[#1f1f1f] border border-gray-700 rounded-lg p-3 shadow-lg z-50">
              <label className="block text-xs text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-md bg-[#2b2b2b] border border-gray-700 text-white text-sm px-3 py-2"
                placeholder="Enter name"
              />

              <label className="block text-xs text-gray-300 mt-3 mb-1">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-gray-300"
              />

              {saveError ? (
                <p className="text-xs text-red-400 mt-2">{saveError}</p>
              ) : null}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
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
