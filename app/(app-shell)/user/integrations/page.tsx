"use client";

import { userapi } from "@/lib/http/client";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type UnknownRecord = Record<string, unknown>;
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

type Platform = "facebook" | "instagram" | "whatsapp" | "calendar" | "crm";

// NOTE: NEXT_PUBLIC_API_BASE_URL already ends with `/api` (per .env.local),
// so endpoints here must NOT start with `/api`.
const CHAT_PROFILE_ENDPOINTS = ["/chat/chat-profile/", "/chat/chat-profile"];

const CONNECT_ENDPOINTS_BY_PLATFORM: Partial<Record<Platform, string[]>> = {
  // Backend examples show /api/connect/...; include both forms to be safe.
  facebook: ["/connect/fb/", "/connect/fb", "/api/connect/fb/", "/api/connect/fb"],
  instagram: ["/connect/ig/", "/connect/ig", "/api/connect/ig/", "/api/connect/ig"],
  whatsapp: ["/connect/wa/", "/connect/wa", "/api/connect/wa/", "/api/connect/wa"],
};

const NOT_ACTIVE_SENTINEL = "__NOT_ACTIVE__";

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) return error.message || fallback;

    if (Array.isArray(data)) {
      return data.join(" ") || fallback;
    }

    if (isRecord(data)) {
      if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
      }
      if (Array.isArray(data.detail)) {
        return data.detail.join(" ");
      }

      // Handle simple key-value errors or validation errors
      const firstValue = Object.values(data)[0];
      if (typeof firstValue === "string") return firstValue;
      if (Array.isArray(firstValue) && typeof firstValue[0] === "string") return firstValue[0];
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

function parseBotActive(payload: unknown): boolean | null {
  if (!isRecord(payload)) return null;
  if (typeof payload.bot_active === "boolean") return payload.bot_active;
  return null;
}

function parseRedirectUrl(payload: unknown): string {
  if (!isRecord(payload)) return "";
  const url = payload.redirect_url;
  return typeof url === "string" ? url : "";
}

const IntegrationPage: React.FC = () => {
  const integrations = useMemo(
    () =>
      [
        {
          platform: "facebook" as const,
          name: "Facebook Messenger",
          desc: "Connect to automate replies",
        },
        {
          platform: "whatsapp" as const,
          name: "WhatsApp Business",
          desc: "Connect to automate replies",
        },
        {
          platform: "instagram" as const,
          name: "Instagram DM",
          desc: "Connect to automate replies",
        },
      ] satisfies Array<{ platform: Platform; name: string; desc: string }>,
    []
  );

  const [activeByPlatform, setActiveByPlatform] = useState<Partial<Record<Platform, boolean>>>({});
  const [loadingByPlatform, setLoadingByPlatform] = useState<Partial<Record<Platform, boolean>>>({});
  const [errorByPlatform, setErrorByPlatform] = useState<Partial<Record<Platform, string>>>({});

  const setPlatformLoading = (platform: Platform, value: boolean) => {
    setLoadingByPlatform((s) => ({ ...s, [platform]: value }));
  };

  const setPlatformError = (platform: Platform, message: string | null) => {
    setErrorByPlatform((s) => {
      const next = { ...s };
      if (!message) {
        delete next[platform];
        return next;
      }
      next[platform] = message;
      return next;
    });
  };

  const fetchChatProfile = useCallback(async (platform: Platform) => {
    if (platform === "calendar" || platform === "crm") return;

    setPlatformLoading(platform, true);
    setPlatformError(platform, null);

    try {
      const res = await requestWithSlashFallback(
        async (ep) => {
          try {
            // In browsers, GET bodies may be stripped. Send platform as BOTH query param + body.
            return await userapi.request({
              url: ep,
              method: "GET",
              params: { platform },
              data: { platform },
            });
          } catch (e: unknown) {
            // Fallback in case an intermediary strips GET bodies.
            if (
              axios.isAxiosError(e) &&
              e.response &&
              [400, 405, 411, 412, 415].includes(e.response.status)
            ) {
              return await userapi.get(ep, { params: { platform } });
            }
            throw e;
          }
        },
        CHAT_PROFILE_ENDPOINTS
      );

      const active = parseBotActive(res.data);
      if (active === null) {
        throw new Error("Unexpected chat profile response");
      }

      setActiveByPlatform((s) => ({ ...s, [platform]: active }));
    } catch (e: unknown) {
      // Backend returns 404 when a chat profile doesn't exist yet for that platform.
      // Treat it as a clean "Not active" state instead of an error.
      if (axios.isAxiosError(e) && e.response?.status === 404) {
        setActiveByPlatform((s) => ({ ...s, [platform]: false }));
        setPlatformError(platform, NOT_ACTIVE_SENTINEL);
      } else {
        setPlatformError(platform, getApiErrorMessage(e, "Failed to load status"));
      }
    } finally {
      setPlatformLoading(platform, false);
    }
  }, []);

  useEffect(() => {
    void fetchChatProfile("facebook");
    void fetchChatProfile("whatsapp");
    void fetchChatProfile("instagram");
  }, [fetchChatProfile]);

  const patchBotActive = useCallback(async (platform: Platform, botActive: boolean) => {
    const payload = { platform, bot_active: botActive };
    const res = await requestWithSlashFallback(
      (ep) => userapi.patch(ep, payload),
      CHAT_PROFILE_ENDPOINTS
    );
    const nextActive = parseBotActive(res.data);
    if (nextActive === null) return botActive;
    return nextActive;
  }, []);

  const connectAndRedirect = useCallback(async (platform: Platform) => {
    const endpoints = CONNECT_ENDPOINTS_BY_PLATFORM[platform];
    if (!endpoints?.length) throw new Error("Connect API not available for this platform");

    const res = await requestWithSlashFallback(
      (ep) => {
        // Force the web OAuth flow.
        const params =
          platform === "facebook" || platform === "instagram" || platform === "whatsapp"
            ? { from: "web" }
            : undefined;
        return userapi.get(ep, { params });
      },
      endpoints
    );

    const redirectUrl = parseRedirectUrl(res.data);
    if (!redirectUrl) throw new Error("Backend did not return redirect_url");

    window.location.assign(redirectUrl);
  }, []);

  const handleToggle = useCallback(
    async (platform: Platform, nextValue: boolean) => {
      // No backend APIs yet
      if (platform === "calendar" || platform === "crm") return;

      setPlatformLoading(platform, true);
      setPlatformError(platform, null);
      try {
        const next = await patchBotActive(platform, nextValue);
        setActiveByPlatform((s) => ({ ...s, [platform]: next }));
      } catch (e: unknown) {
        setPlatformError(platform, getApiErrorMessage(e, "Failed to update"));
      } finally {
        setPlatformLoading(platform, false);
      }
    },
    [patchBotActive]
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const active = Boolean(activeByPlatform[integration.platform]);
          const loading = Boolean(loadingByPlatform[integration.platform]);
          const err = errorByPlatform[integration.platform] ?? null;
          const connectDisabled = false;
          const toggleDisabled = false;

          const showNotActive = err === NOT_ACTIVE_SENTINEL;
          const statusText = showNotActive
            ? "Disconnected"
            : err
              ? err
              : active
                ? "Connected"
                : "Disconnected";

          return (
          <div key={integration.platform} className="bg-[#272727] rounded-xl p-5 flex flex-col justify-between shadow-lg hover:bg-gray-700 transition">
            <div>
              <h2 className="text-lg font-semibold mb-1">{integration.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{integration.desc}</p>
              {statusText ? (
                <p className={`${showNotActive ? "text-gray-400" : "text-red-400"} text-xs mb-3`}>
                  {statusText}
                </p>
              ) : null}
              <button
                type="button"
                disabled={connectDisabled || loading}
                className={`px-4 py-2 text-sm rounded-md font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${
                  connectDisabled
                    ? "bg-gray-700 text-gray-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
                onClick={() => {
                  if (connectDisabled) return;
                  // Always allow opening the OAuth flow.
                  // When already connected, this acts as "Update".
                  setPlatformLoading(integration.platform, true);
                  setPlatformError(integration.platform, null);
                  void connectAndRedirect(integration.platform)
                    .catch((e: unknown) => {
                      setPlatformError(
                        integration.platform,
                        getApiErrorMessage(e, "Failed to connect")
                      );
                    })
                    .finally(() => setPlatformLoading(integration.platform, false));
                }}
              >
                {loading ? "Working..." : active ? "Update" : "Connect"}
              </button>
            </div>

            {/* Toggle Switch */}
            {active && (
              <div className="flex justify-end mt-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    disabled={toggleDisabled || loading}
                    onChange={() => void handleToggle(integration.platform, !active)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default IntegrationPage;

