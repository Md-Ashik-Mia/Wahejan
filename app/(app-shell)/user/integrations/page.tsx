"use client";
import { userapi } from "@/lib/http/client";
import axios from "axios";
import { useEffect, useState } from "react";

const integrations = [
  {
    platform: "facebook",
    name: "Facebook Messenger",
    desc: "Connect to automate replies",
  },
  {
    platform: "whatsapp",
    name: "WhatsApp Business",
    desc: "Connect to automate replies",
  },
  {
    platform: "instagram",
    name: "Instagram DM",
    desc: "Connect to automate replies",
  },
];

const endpoints = {
  facebook: [
    "/connect/fb/",
    "/connect/fb",
    "/api/connect/fb/",
    "/api/connect/fb",
  ],
  instagram: [
    "/connect/ig/",
    "/connect/ig",
    "/api/connect/ig/",
    "/api/connect/ig",
  ],
  whatsapp: [
    "/connect/wa/",
    "/connect/wa",
    "/api/connect/wa/",
    "/api/connect/wa",
  ],
};

const chatProfileEndpoints = ["/chat/chat-profile/", "/chat/chat-profile"];

function getApiError(error, fallback) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (!data) return error.message || fallback;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail)) return data.detail.join(" ");
    if (typeof error.message === "string" && error.message.trim())
      return error.message;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

async function tryEndpoints(fn, eps) {
  let lastErr = null;
  for (const ep of eps) {
    try {
      return await fn(ep);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Request failed");
}

const IntegrationPage = () => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  // Fetch status for all integrations
  useEffect(() => {
    integrations.forEach(({ platform }) => {
      setLoading((s) => ({ ...s, [platform]: true }));
      setError((s) => ({ ...s, [platform]: null }));
      tryEndpoints(
        (ep) => userapi.get(ep, { params: { platform } }),
        chatProfileEndpoints,
      )
        .then((res) => {
          // Save full profile info for each platform
          setStatus((s) => ({
            ...s,
            [platform]: {
              bot_active: !!res.data?.bot_active,
              profile_id: res.data?.profile_id || "",
            },
          }));
        })
        .catch((e) => {
          // If 404 or empty, treat as not connected
          setStatus((s) => ({
            ...s,
            [platform]: { bot_active: false, profile_id: "" },
          }));
          setError((s) => ({ ...s, [platform]: "Platform is not connected" }));
        })
        .finally(() => setLoading((s) => ({ ...s, [platform]: false })));
    });
  }, []);

  // Toggle bot active
  const handleToggle = async (platform, nextValue) => {
    setLoading((s) => ({ ...s, [platform]: true }));
    setError((s) => ({ ...s, [platform]: null }));
    try {
      const res = await tryEndpoints(
        (ep) => userapi.patch(ep, { platform, bot_active: nextValue }),
        chatProfileEndpoints,
      );
      setStatus((s) => ({
        ...s,
        [platform]: {
          ...s[platform],
          bot_active: !!res.data?.bot_active,
        },
      }));
    } catch (e) {
      setError((s) => ({
        ...s,
        [platform]: getApiError(e, "Failed to update"),
      }));
    } finally {
      setLoading((s) => ({ ...s, [platform]: false }));
    }
  };

  // Connect and redirect
  const handleConnect = async (platform) => {
    setLoading((s) => ({ ...s, [platform]: true }));
    setError((s) => ({ ...s, [platform]: null }));
    try {
      const res = await tryEndpoints(
        (ep) => userapi.get(ep, { params: { from: "web" } }),
        endpoints[platform],
      );
      const url = res.data?.redirect_url;
      if (typeof url === "string") window.location.assign(url);
      else throw new Error("No redirect_url");
    } catch (e) {
      setError((s) => ({
        ...s,
        [platform]: getApiError(e, "Failed to connect"),
      }));
    } finally {
      setLoading((s) => ({ ...s, [platform]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {integrations.map(({ platform, name, desc }) => {
          const info = status[platform] || {
            bot_active: false,
            profile_id: "",
          };
          const isConnected = !!info.profile_id;
          const isActive = !!info.bot_active;
          const isLoading = !!loading[platform];
          const err = error[platform];
          return (
            <div
              key={platform}
              className="bg-[#272727] rounded-xl p-5 flex flex-col justify-between shadow-lg hover:bg-gray-700 transition"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1">{name}</h2>
                <p className="text-gray-400 text-sm mb-4">{desc}</p>
                {!isConnected && (
                  <p className="text-xs mb-3 text-red-400">
                    Platform is not connected
                  </p>
                )}
                {err && isConnected && (
                  <p className="text-xs mb-3 text-red-400">{err}</p>
                )}
                <button
                  type="button"
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm rounded-md font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed ${isLoading ? "bg-gray-700 text-gray-300" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                  onClick={() => handleConnect(platform)}
                >
                  {isLoading
                    ? "Working..."
                    : isConnected
                      ? "Update"
                      : "Connect"}
                </button>
              </div>
              {isConnected && (
                <div className="flex justify-end mt-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      disabled={isLoading}
                      onChange={() => handleToggle(platform, !isActive)}
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
