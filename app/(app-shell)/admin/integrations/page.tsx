"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  is_active?: boolean;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  status: "Active" | "Deactive";
};

function normalizeStatus(isActive: unknown): "Active" | "Deactive" {
  return isActive === true ? "Active" : "Deactive";
}

function getCompanyName(u: ApiUser): string {
  const companyName = (u.company_name ?? "").toString();
  if (companyName) return companyName;

  const company = u.company;
  if (!company) return "";
  if (typeof company === "string") return company;
  if (typeof company === "object" && typeof company.name === "string") return company.name;
  return "";
}

function mapApiUser(u: ApiUser): UserRow {
  const id = typeof u.id === "number" ? u.id : 0;
  const name = (u.name ?? u.username ?? "").toString();
  const email = (u.email ?? "").toString();
  const company = getCompanyName(u);
  const status = normalizeStatus(u.is_active);
  return { id, name, email, company, status };
}

const AdminIntegrationPage = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [busyChannel, setBusyChannel] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const apis = useMemo(
    () => [
      {
        id: 1,
        name: "Facebook API",
        description: "Approve or manage access keys",
        channel_name: "facebook",
      },
      {
        id: 2,
        name: "WhatsApp API",
        description: "Approve or manage access keys",
        channel_name: "whatsapp",
      },
      {
        id: 3,
        name: "Instagram API",
        description: "Approve or manage access keys",
        channel_name: "instagram",
      },
      {
        id: 4,
        name: "Calendar",
        description: "Connect to automate Booking",
        channel_name: "calendar",
      },
    ],
    []
  );

  async function toggleAllChannels(opts: {
    action: "enable" | "disable";
    channel_name: string;
    label: string;
  }) {
    const { action, channel_name, label } = opts;

    const token = getAccessToken(session);
    if (!token) {
      await Swal.fire({
        icon: "error",
        title: "Not logged in",
        text: "Access token is missing. Please login again.",
      });
      return;
    }

    const confirmText =
      action === "enable" ? "Yes, enable" : "Yes, disable";
    const confirm = await Swal.fire({
      icon: action === "disable" ? "warning" : "question",
      title:
        action === "enable"
          ? `Enable all ${label} channels?`
          : `Disable all ${label} channels?`,
      text:
        action === "enable"
          ? "This will enable the channel for all users."
          : "This will disable the channel for all users.",
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const endpoint =
      action === "enable" ? "/admin/enable-channels/" : "/admin/disable-channels/";

    try {
      setBusyChannel(channel_name);
      Swal.fire({
        title: action === "enable" ? "Enabling..." : "Disabling...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await adminApi.post(
        endpoint,
        { channel_name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const message =
        (res.data && typeof res.data.status === "string" && res.data.status) ||
        "Success.";

      await Swal.fire({
        icon: "success",
        title: "Done",
        text: message,
      });
    } catch (err) {
      let message = "Request failed.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        const responseData: unknown = err.response?.data;
        const detail = isRecord(responseData) ? responseData["detail"] : undefined;
        const apiMessage = isRecord(responseData)
          ? responseData["message"]
          : undefined;
        const apiStatus = isRecord(responseData) ? responseData["status"] : undefined;

        const best =
          (typeof detail === "string" && detail.trim() ? detail : "") ||
          (typeof apiMessage === "string" && apiMessage.trim() ? apiMessage : "") ||
          (typeof apiStatus === "string" && apiStatus.trim() ? apiStatus : "");

        if (best) {
          message = best;
        } else if (typeof status === "number") {
          message = `Request failed (${status}).`;
        }
      }

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
      });
    } finally {
      setBusyChannel(null);
    }
  }

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const token = getAccessToken(session);
    if (!token) {
      setUsersError("Missing access token.");
      setLoadingUsers(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);

        const res = await adminApi.get("/admin/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = res.data;
        const list: ApiUser[] = Array.isArray(payload)
          ? payload
          : Array.isArray((payload as { results?: unknown })?.results)
          ? ((payload as { results: ApiUser[] }).results ?? [])
          : Array.isArray((payload as { data?: unknown })?.data)
          ? ((payload as { data: ApiUser[] }).data ?? [])
          : [];

        const mapped = list.map(mapApiUser).filter((u) => u.id !== 0);

        // Sort Active users first (then by name)
        const sorted = [...mapped].sort((a, b) => {
          const aRank = a.status === "Active" ? 0 : 1;
          const bRank = b.status === "Active" ? 0 : 1;
          if (aRank !== bRank) return aRank - bRank;
          return a.name.localeCompare(b.name);
        });

        setUsers(sorted);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setUsersError(
            code ? `Failed to load users (${code}).` : "Failed to load users."
          );
        } else {
          setUsersError("Failed to load users.");
        }
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [session, sessionStatus]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <div className="bg-[#272727] rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Admin control center</h2>

        {/* ===== API MANAGEMENT ===== */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {apis.map((api) => (
            <div
              key={api.id}
              className="bg-black/40 p-5 rounded-xl transition transform hover:scale-[1.02] hover:shadow-md"
            >
              <h3 className="text-white font-medium">{api.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{api.description}</p>
              <div className="flex justify-between">
                <button
                  onClick={() =>
                    toggleAllChannels({
                      action: "enable",
                      channel_name: api.channel_name,
                      label: api.name.replace(" API", ""),
                    })
                  }
                  disabled={busyChannel === api.channel_name}
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 focus:ring-2 focus:ring-blue-400 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                >
                  All Enable
                </button>
                <button
                  onClick={() =>
                    toggleAllChannels({
                      action: "disable",
                      channel_name: api.channel_name,
                      label: api.name.replace(" API", ""),
                    })
                  }
                  disabled={busyChannel === api.channel_name}
                  className="border border-red-600 text-red-500 hover:bg-red-600/10 active:scale-95 focus:ring-2 focus:ring-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-all"
                >
                  All Disable
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ===== USER LIST ===== */}
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Company</th>
              <th className="p-3">Status</th>
              <th className="p-3 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers ? (
              <tr>
                <td className="p-3 text-gray-400" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : usersError ? (
              <tr>
                <td className="p-3 text-red-400" colSpan={5}>
                  {usersError}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="p-3 text-gray-400" colSpan={5}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.company}</td>
                <td className="p-3 font-semibold">
                  <span
                    className={
                      user.status === "Active" ? "text-green-400" : "text-red-400"
                    }
                  >
                    {user.status}
                  </span>
                </td>
                <td className="p-3 ">
                  <button
                    onClick={() => router.push(`/admin/integrations/${user.id}`)}
                    className="flex items-center justify-center gap-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 active:scale-95 focus:ring-2 focus:ring-gray-400 px-4 py-1 rounded-lg transition-all"
                  >
                    👁️ View Integrations
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIntegrationPage;
