"use client";
import { adminApi } from "@/lib/http/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

type ApiTeamMember = {
  id?: number;
  name?: string | null;
  image?: string | null;
  role?: string | null;
  email?: string | null;
  is_active?: boolean;
  last_login?: string | null;
  new_user_added?: number | null;
  invoices_download?: string | null;
  payments?: string | null;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
  newUsers: number;
  invoiceDownload: string;
  payments: string;
  avatarUrl: string | null;
};

function formatWhen(value: unknown): string {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function mapApiTeamMember(m: ApiTeamMember): TeamMember {
  const id = typeof m.id === "number" ? m.id : 0;
  const name = (m.name ?? "").toString() || "—";
  const email = (m.email ?? "").toString();
  const role = (m.role ?? "").toString();
  const status: "Active" | "Inactive" =
    m.is_active === true ? "Active" : "Inactive";
  const lastLogin = formatWhen(m.last_login);
  const invoiceDownload = formatWhen(m.invoices_download);
  const payments = formatWhen(m.payments);
  const newUsers = typeof m.new_user_added === "number" ? m.new_user_added : 0;
  const avatarUrl = typeof m.image === "string" && m.image ? m.image : null;

  return {
    id,
    name,
    email,
    role,
    status,
    lastLogin,
    newUsers,
    invoiceDownload,
    payments,
    avatarUrl,
  };
}

function getInitials(name: string, email: string): string {
  const base = name && name !== "—" ? name : email;
  const parts = base.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  const first = parts[0]?.[0] ?? "A";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

const passthroughLoader = ({ src }: { src: string }) => src;

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const token = getAccessToken(session);
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await adminApi.get("/admin/team-members/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = res.data as unknown;
        const list: ApiTeamMember[] = Array.isArray(payload)
          ? (payload as ApiTeamMember[])
          : Array.isArray((payload as { results?: unknown })?.results)
            ? (((payload as { results: ApiTeamMember[] }).results ??
                []) as ApiTeamMember[])
            : Array.isArray((payload as { data?: unknown })?.data)
              ? (((payload as { data: ApiTeamMember[] }).data ??
                  []) as ApiTeamMember[])
              : [];

        const mapped = list.map(mapApiTeamMember).filter((m) => m.id !== 0);

        // Show admins only (API already seems admin-only, but keep safe)
        const admins = mapped.filter((m) => m.role.toLowerCase() === "admin");

        // Active first, then name/email
        const sorted = [...admins].sort((a, b) => {
          const aRank = a.status === "Active" ? 0 : 1;
          const bRank = b.status === "Active" ? 0 : 1;
          if (aRank !== bRank) return aRank - bRank;
          const aKey = (a.name === "—" ? a.email : a.name).toLowerCase();
          const bKey = (b.name === "—" ? b.email : b.name).toLowerCase();
          return aKey.localeCompare(bKey);
        });

        setTeamMembers(sorted);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setError(
            code
              ? `Failed to load team members (${code}).`
              : "Failed to load team members.",
          );
        } else {
          setError("Failed to load team members.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [session, sessionStatus]);

  async function handleInviteAdmin() {
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail || !inviteEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    const token = getAccessToken(session);
    if (!token) {
      setInviteError("Missing access token.");
      return;
    }

    setInviteLoading(true);
    try {
      await adminApi.post(
        "/admin/create-admin/",
        { email: inviteEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setInviteSuccess("Invitation sent successfully.");
      setInviteEmail("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to send invitation.";
        setInviteError(msg);
      } else {
        setInviteError("Failed to send invitation.");
      }
    } finally {
      setInviteLoading(false);
    }
  }

  const hasData = useMemo(
    () => !loading && !error && teamMembers.length > 0,
    [error, loading, teamMembers.length],
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <h2 className="text-xl font-semibold">Admin Control Center</h2>
      <h3 className="text-lg font-medium">Team Members</h3>

      {/* Add Admin Section */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter admin email"
          className="bg-[#272727] border border-gray-700 rounded-md px-4 py-2 text-white w-72 focus:outline-none focus:border-blue-500"
          disabled={inviteLoading}
        />
        <button
          onClick={handleInviteAdmin}
          disabled={inviteLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-md font-semibold transition disabled:opacity-60"
        >
          {inviteLoading ? "Adding..." : "Add Admin"}
        </button>
        {inviteError && (
          <span className="text-red-400 text-sm ml-2">{inviteError}</span>
        )}
        {inviteSuccess && (
          <span className="text-green-400 text-sm ml-2">{inviteSuccess}</span>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading admins...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : null}

      <div className="grid md:grid-cols-1 gap-6">
        {hasData ? (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#272727]  p-5 rounded-xl shadow-md hover:bg-gray-750 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <Image
                      loader={passthroughLoader}
                      unoptimized
                      src={member.avatarUrl}
                      alt={member.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover border border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-gray-600 bg-black/30 flex items-center justify-center font-semibold text-gray-200">
                      {getInitials(member.name, member.email)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-base">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                    <p className="text-gray-500 text-xs">Role: {member.role}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    member.status === "Active"
                      ? "bg-green-900/40 text-green-400"
                      : "bg-red-900/40 text-red-400"
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="border-t border-gray-700 pt-3">
                <p className="text-sm font-medium mb-2">Activity</p>
                <div className="text-gray-300 text-sm space-y-1">
                  <div className="flex justify-between border-b border-gray-700 py-1">
                    <span>Last Login</span>
                    <span className="text-gray-400">{member.lastLogin}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 py-1">
                    <span>New User Add</span>
                    <span className="text-gray-400">{member.newUsers}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-700 py-1">
                    <span>Invoice Download</span>
                    <span className="text-gray-400">
                      {member.invoiceDownload}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Payments</span>
                    <span className="text-gray-400">{member.payments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : !loading && !error ? (
          <p className="text-gray-400">No admins found.</p>
        ) : null}
      </div>
    </div>
  );
}
