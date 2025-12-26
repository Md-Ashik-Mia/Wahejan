"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import axios from "axios";
import { adminApi } from "@/lib/http/client";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type SessionWithAccessToken = { accessToken?: string };

function getAccessToken(session: unknown): string | null {
  const fromSession = (session as SessionWithAccessToken | null)?.accessToken;
  if (typeof fromSession === "string" && fromSession) return fromSession;
  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem("access_token");
    if (fromStorage) return fromStorage;
  }
  return null;
}

type ApiUser = {
  id?: number;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  company_name?: string | null;
  company?: { name?: string | null } | string | null;
};

type UserHeader = {
  id: number;
  name: string;
  email: string;
  company: string;
};

function getCompanyName(u: ApiUser): string {
  const companyName = (u.company_name ?? "").toString();
  if (companyName) return companyName;

  const company = u.company;
  if (!company) return "";
  if (typeof company === "string") return company;
  if (typeof company === "object" && typeof company.name === "string") return company.name;
  return "";
}

type UserChannelsResponse = {
  user_id?: number;
  channels?: unknown;
};

type Channel = {
  id: number; // used as chat_profile_id for approve/reject
  platform: string;
  profile_id: string;
  bot_active: boolean;
  is_approved: boolean;
  created_at?: string;
};

function normalizePlatformLabel(platform: string): string {
  const p = platform.toLowerCase();
  if (p === "facebook") return "Facebook";
  if (p === "whatsapp") return "WhatsApp";
  if (p === "instagram") return "Instagram";
  if (p === "calendar") return "Calendar";
  return platform;
}

type ChannelStatus = "Active" | "Inactive" | "Pending" | "Not connected";

function getChannelStatus(c: Channel | null): ChannelStatus {
  if (!c) return "Not connected";
  if (!c.is_approved) return "Pending";
  return c.bot_active ? "Active" : "Inactive";
}

function statusClasses(status: ChannelStatus) {
  switch (status) {
    case "Active":
      return {
        card: "ring-1 ring-green-500/30",
        text: "text-green-400",
      };
    case "Pending":
      return {
        card: "ring-1 ring-yellow-500/25",
        text: "text-yellow-300",
      };
    case "Inactive":
      return {
        card: "ring-1 ring-gray-500/25 opacity-80",
        text: "text-gray-300",
      };
    case "Not connected":
    default:
      return {
        card: "opacity-70",
        text: "text-gray-400",
      };
  }
}

const UserIntegrationPage = () => {
  const { userId } = useParams();
  const router = useRouter();

  const { data: session, status: sessionStatus } = useSession();
  const [userHeader, setUserHeader] = useState<UserHeader | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyChatProfileId, setBusyChatProfileId] = useState<number | null>(null);

  const platforms = useMemo(() => ["facebook", "whatsapp", "instagram"], []);

  const cards = useMemo(() => {
    const byPlatform = new Map<string, Channel>();
    for (const c of channels) {
      const key = c.platform.toLowerCase();
      if (!byPlatform.has(key)) byPlatform.set(key, c);
    }

    const base = platforms.map((p) => ({
      platform: p,
      channel: byPlatform.get(p) ?? null,
    }));

    const extras = channels
      .filter((c) => !platforms.includes(c.platform.toLowerCase()))
      .map((c) => ({ platform: c.platform.toLowerCase(), channel: c }));

    return [...base, ...extras];
  }, [channels, platforms]);

  const numericUserId = useMemo(() => {
    const raw = Array.isArray(userId) ? userId[0] : userId;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [userId]);

  async function fetchData() {
    if (sessionStatus === "loading") return;
    if (numericUserId == null) {
      setError("Invalid user id.");
      setLoading(false);
      return;
    }

    const token = getAccessToken(session);
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1) Fetch user list and pick the current user (for header info)
      const usersRes = await adminApi.get("/admin/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersPayload = usersRes.data;
      const list: ApiUser[] = Array.isArray(usersPayload)
        ? usersPayload
        : Array.isArray((usersPayload as { results?: unknown })?.results)
        ? ((usersPayload as { results: ApiUser[] }).results ?? [])
        : Array.isArray((usersPayload as { data?: unknown })?.data)
        ? ((usersPayload as { data: ApiUser[] }).data ?? [])
        : [];

      const found = list.find((u) => u.id === numericUserId);
      setUserHeader(
        found
          ? {
              id: numericUserId,
              name: (found.name ?? found.username ?? `User #${numericUserId}`).toString(),
              email: (found.email ?? "").toString(),
              company: getCompanyName(found),
            }
          : {
              id: numericUserId,
              name: `User #${numericUserId}`,
              email: "",
              company: "",
            }
      );

      // 2) Fetch user channels
      const channelsRes = await adminApi.get(`/admin/user-channels/${numericUserId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload: unknown = channelsRes.data;
      const channelsRaw = isRecord(payload)
        ? (payload as UserChannelsResponse).channels
        : undefined;

      const arr = Array.isArray(channelsRaw) ? channelsRaw : [];
      const mapped: Channel[] = arr
        .map((c): Channel | null => {
          if (!isRecord(c)) return null;
          const id = typeof c.id === "number" ? c.id : null;
          const platform = typeof c.platform === "string" ? c.platform : "";
          const profile_id = typeof c.profile_id === "string" ? c.profile_id : "";
          const bot_active = c.bot_active === true;
          const is_approved = c.is_approved === true;
          const created_at = typeof c.created_at === "string" ? c.created_at : undefined;
          if (id == null) return null;
          return { id, platform, profile_id, bot_active, is_approved, created_at };
        })
        .filter((x): x is Channel => x !== null);

      setChannels(mapped);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        setError(code ? `Failed to load data (${code}).` : "Failed to load data.");
      } else {
        setError("Failed to load data.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericUserId, sessionStatus]);

  async function actOnChannel(opts: {
    action: "approve" | "reject";
    chat_profile_id: number;
    platformLabel: string;
  }) {
    const { action, chat_profile_id, platformLabel } = opts;
    const token = getAccessToken(session);
    if (!token) {
      await Swal.fire({
        icon: "error",
        title: "Not logged in",
        text: "Access token is missing. Please login again.",
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: action === "reject" ? "warning" : "question",
      title:
        action === "approve"
          ? `Enable ${platformLabel} for this user?`
          : `Disable ${platformLabel} for this user?`,
      showCancelButton: true,
      confirmButtonText: action === "approve" ? "Yes, enable" : "Yes, disable",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    try {
      setBusyChatProfileId(chat_profile_id);
      Swal.fire({
        title: action === "approve" ? "Enabling..." : "Disabling...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const endpoint =
        action === "approve" ? "/admin/approve-channel/" : "/admin/reject-channel/";
      const res = await adminApi.post(
        endpoint,
        { chat_profile_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const message =
        (res.data && typeof res.data.status === "string" && res.data.status) ||
        "Success.";

      await Swal.fire({ icon: "success", title: "Done", text: message });
      await fetchData();
    } catch (err) {
      let message = "Request failed.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const responseData: unknown = err.response?.data;
        const detail = isRecord(responseData) ? responseData["detail"] : undefined;
        const apiMessage = isRecord(responseData) ? responseData["message"] : undefined;
        const apiStatus = isRecord(responseData) ? responseData["status"] : undefined;

        const best =
          (typeof detail === "string" && detail.trim() ? detail : "") ||
          (typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : "") ||
          (typeof apiStatus === "string" && apiStatus.trim() ? apiStatus : "");

        if (best) message = best;
        else if (typeof status === "number") message = `Request failed (${status}).`;
      }

      await Swal.fire({ icon: "error", title: "Error", text: message });
    } finally {
      setBusyChatProfileId(null);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-[#272727] rounded-xl p-6 shadow-lg border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <div className="flex gap-8 text-sm font-medium">
            <span className="text-white">{userHeader?.name ?? "User"}</span>
            <span className="text-gray-400">{userHeader?.email ?? ""}</span>
            <span className="text-gray-400">{userHeader?.company ?? ""}</span>
          </div>
          <button
            onClick={() => router.push("/admin/integrations")}
            className="flex items-center gap-2 border border-blue-600 text-blue-500 hover:bg-blue-600/10 px-4 py-2 rounded-lg active:scale-95 transition-all"
          >
            Back
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 py-6">Loading integrations...</p>
        ) : error ? (
          <p className="text-red-400 py-6">{error}</p>
        ) : null}

        {/* Integration Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {!loading && !error && cards.length === 0 ? (
            <p className="text-gray-400">No channels found for this user.</p>
          ) : null}

          {cards.map(({ platform, channel }) => {
            const status = getChannelStatus(channel);
            const styles = statusClasses(status);
            const label = normalizePlatformLabel(platform);
            const chatProfileId = channel?.id ?? null;
            const busy = chatProfileId != null && busyChatProfileId === chatProfileId;
            const canApprove = chatProfileId != null && (status === "Pending" || status === "Inactive");
            const canReject = chatProfileId != null && (status === "Pending" || status === "Active");
            return (
              <div
                key={platform}
                className={
                  "rounded-xl p-5 border border-gray-700 bg-black/40 transition-all duration-200 hover:shadow-md " +
                  styles.card
                }
              >
                <h3 className="text-white font-semibold text-sm mb-1">
                  {label}
                </h3>
                <p className="text-gray-400 text-xs mb-2">
                  Profile ID: {channel?.profile_id ? channel.profile_id : "—"}
                </p>
                <p className={"text-xs mb-4 " + styles.text}>Status: {status}</p>
                <div className="flex justify-start gap-3">
                  <button
                    disabled={!canApprove || busy}
                    onClick={() =>
                      chatProfileId != null &&
                      actOnChannel({
                        action: "approve",
                        chat_profile_id: chatProfileId,
                        platformLabel: label,
                      })
                    }
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      !canApprove || busy
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 active:scale-95 focus:ring-2 focus:ring-blue-400 text-white"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    disabled={!canReject || busy}
                    onClick={() =>
                      chatProfileId != null &&
                      actOnChannel({
                        action: "reject",
                        chat_profile_id: chatProfileId,
                        platformLabel: label,
                      })
                    }
                    className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                      !canReject || busy
                        ? "border-gray-600 text-gray-400 cursor-not-allowed"
                        : "border-gray-400 text-gray-300 hover:bg-gray-700/30 active:scale-95 focus:ring-2 focus:ring-gray-500"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserIntegrationPage;
