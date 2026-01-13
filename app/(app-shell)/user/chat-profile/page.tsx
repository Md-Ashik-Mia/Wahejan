"use client";

import { userapi } from "@/lib/http/client";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type UnknownRecord = Record<string, unknown>;
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

type Platform = "facebook" | "whatsapp" | "instagram" | string;

type ChatProfileItem = {
  id: number;
  name: string;
  platform: Platform;
  profile_id?: string;
};

// NOTE: NEXT_PUBLIC_API_BASE_URL already ends with `/api` (per existing code),
// so endpoints here must NOT start with `/api`.
const CHAT_PROFILE_LIST_ENDPOINTS = [
  "/chat/chat-profile-list/",
  "/chat/chat-profile-list",
];

function subscribeEndpointsForPlatform(platform: string): string[] {
  const suffix = `subscribe-${platform}-page`;
  return [`/chat/${suffix}/`, `/chat/${suffix}`, `/api/chat/${suffix}/`, `/api/chat/${suffix}`];
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (isRecord(data) && typeof data.detail === "string" && data.detail.trim()) {
      return data.detail;
    }
    if (typeof error.message === "string" && error.message.trim()) return error.message;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

async function requestWithSlashFallback<T>(
  fn: (endpoint: string) => Promise<T>,
  endpoints: string[]
): Promise<T> {
  let lastErr: unknown = null;
  for (const ep of endpoints) {
    try {
      return await fn(ep);
    } catch (e: unknown) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Request failed");
}

function normalizeProfiles(payload: unknown): ChatProfileItem[] {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((p) => isRecord(p))
    .map((p) => {
      const id = typeof p.id === "number" ? p.id : Number(p.id);
      const profileIdRaw = (p as UnknownRecord).profile_id;
      const profile_id =
        typeof profileIdRaw === "string"
          ? profileIdRaw
          : typeof profileIdRaw === "number"
            ? String(profileIdRaw)
            : undefined;
      return {
        id: Number.isFinite(id) ? id : -1,
        name: typeof p.name === "string" ? p.name : String(p.name ?? ""),
        platform:
          typeof p.platform === "string" && p.platform.trim()
            ? p.platform
            : "unknown",
        profile_id,
      };
    })
    .filter((p) => p.id !== -1);
}

function isSubscribeSuccess(payload: unknown): boolean {
  if (!isRecord(payload)) return false;
  if (typeof payload.success === "string") {
    return payload.success.toLowerCase().includes("subscribed");
  }
  if (typeof payload.message === "string") {
    return payload.message.toLowerCase().includes("subscribed");
  }
  return false;
}

async function fetchChatProfilesForPlatform(platform: Platform): Promise<ChatProfileItem[]> {
  const res = await requestWithSlashFallback(
    (ep) => userapi.get(ep, { params: { platform } }),
    CHAT_PROFILE_LIST_ENDPOINTS
  );
  return normalizeProfiles((res as any).data);
}

function titleCasePlatform(p: string): string {
  if (!p) return "";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

export default function ChatProfilePage() {
  const platforms = useMemo(
    () => ["facebook", "whatsapp", "instagram"] as const,
    []
  );

  const router = useRouter();

  const queryClient = useQueryClient();
  const [subscribingByKey, setSubscribingByKey] = useState<Record<string, boolean>>({});
  const [subscribeMessageByKey, setSubscribeMessageByKey] = useState<Record<string, string>>({});

  const queries = useQueries({
    queries: platforms.map((platform) => ({
      queryKey: ["chatProfiles", platform],
      queryFn: () => fetchChatProfilesForPlatform(platform),
      staleTime: 30_000,
      retry: 1,
    })),
  });

  async function handleSubscribe(platform: string, mainProfileId: number) {
    const key = `${platform}:${mainProfileId}`;
    setSubscribingByKey((s) => ({ ...s, [key]: true }));
    setSubscribeMessageByKey((s) => {
      const next = { ...s };
      delete next[key];
      return next;
    });

    try {
      const res = await requestWithSlashFallback(
        (ep) =>
          userapi.post(ep, undefined, {
            params: {
              // IMPORTANT: backend expects the *main profile id* from chat-profile-list `id`
              // even though the parameter is named `profile_id`.
              profile_id: mainProfileId,
            },
          }),
        subscribeEndpointsForPlatform(platform)
      );

      const payload = (res as any)?.data;
      if (isSubscribeSuccess(payload)) {
        setSubscribeMessageByKey((s) => ({ ...s, [key]: "Subscribed" }));
        router.push("/user/integrations");
        return;
      }

      setSubscribeMessageByKey((s) => ({ ...s, [key]: "Subscribed" }));
      await queryClient.invalidateQueries({ queryKey: ["chatProfiles", platform] });
    } catch (e: unknown) {
      setSubscribeMessageByKey((s) => ({ ...s, [key]: getApiErrorMessage(e, "Subscribe failed") }));
    } finally {
      setSubscribingByKey((s) => ({ ...s, [key]: false }));
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-bold">Chat Profiles</h1>
        <p className="text-sm text-gray-400 mt-1">
          Connected profiles across all platforms.
        </p>

        <div className="mt-8 space-y-6">
          {platforms.map((platform, idx) => {
            const q = queries[idx];
            const loading = q.isLoading;
            const error = q.isError ? getApiErrorMessage(q.error, "Failed to load") : null;
            const items = (q.data ?? []) as ChatProfileItem[];

            return (
              <section key={platform} className="rounded-2xl bg-[#121212] border border-gray-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                  <div>
                    <h2 className="text-lg font-semibold">{titleCasePlatform(platform)}</h2>
                    <p className="text-xs text-gray-400">
                      {loading
                        ? "Loading…"
                        : error
                          ? error
                          : items.length
                            ? `${items.length} profile(s)`
                            : "No profiles found"}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  {loading ? (
                    <div className="text-sm text-gray-400">Fetching profiles…</div>
                  ) : error ? (
                    <div className="text-sm text-red-400">{error}</div>
                  ) : items.length === 0 ? (
                    <div className="text-sm text-gray-400">
                      Nothing connected yet for {titleCasePlatform(platform)}.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                        <div
                          key={`${platform}-${p.id}`}
                          className="rounded-xl bg-[#1b1b1b] border border-gray-800 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold leading-tight">{p.name || "(Unnamed)"}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                Profile ID: <span className="text-gray-200">{p.profile_id || "—"}</span>
                              </div>
                            </div>
                            {(() => {
                              const key = `${platform}:${p.id}`;
                              const subscribing = Boolean(subscribingByKey[key]);
                              const message = subscribeMessageByKey[key];
                              const subscribed = message === "Subscribed";

                              return (
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    type="button"
                                    disabled={subscribing || subscribed}
                                    className={
                                      "px-3 py-1.5 text-xs rounded-md font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed " +
                                      (subscribed
                                        ? "bg-green-600/20 text-green-200 border border-green-600/30"
                                        : "bg-blue-600 hover:bg-blue-700 text-white")
                                    }
                                    onClick={() => handleSubscribe(platform, p.id)}
                                  >
                                    {subscribed ? "Subscribed" : subscribing ? "Subscribing…" : "Subscribe"}
                                  </button>
                                  {message && message !== "Subscribed" ? (
                                    <div className="text-[11px] text-red-400 max-w-[180px] text-right">
                                      {message}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
