"use client";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { BsCheckCircleFill, BsExclamationCircleFill, BsXCircleFill } from "react-icons/bs";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useSession } from "next-auth/react";
import axios from "axios";
import { adminApi } from "@/lib/http/client";

interface Channel {
  name: string;
  icon: React.ReactNode;
  status: "Online" | "Offline" | "Warning";
  lastUsage: string;
  messagesToday: number;
}

interface Company {
  id: number;
  name: string;
  alert: string;
  channels: Channel[];
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type ApiChannel = {
  id?: number;
  status?: string | null;
  last_used?: string | null;
  messages_today?: number | null;
};

type ApiCompany = {
  id?: number;
  name?: string | null;
  status_message?: string | null;
  whatsapp?: ApiChannel | null;
  facebook?: ApiChannel | null;
  instagram?: ApiChannel | null;
};

type CompanyOverviewResponse = {
  total_channels?: unknown;
  online_channels?: unknown;
  offline_channels?: unknown;
  warning_channels?: unknown;
  companies?: unknown;
};

function firstNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (Array.isArray(value) && typeof value[0] === "number" && Number.isFinite(value[0])) {
    return value[0];
  }
  return 0;
}

function normalizeStatus(raw: unknown): "Online" | "Offline" | "Warning" {
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  if (s.includes("warn")) return "Warning";
  if (s.includes("off")) return "Offline";
  if (s.includes("on")) return "Online";
  // fallback when backend sends custom strings like "sample status"
  return "Online";
}

function formatLastUsed(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString();
}

function mapApiChannel(kind: "whatsapp" | "facebook" | "instagram", ch: ApiChannel): Channel {
  const messagesToday = typeof ch.messages_today === "number" ? ch.messages_today : 0;
  const lastUsage = formatLastUsed(ch.last_used);
  const status = normalizeStatus(ch.status);

  if (kind === "whatsapp") {
    return {
      name: "WhatsApp Business",
      icon: <FaWhatsapp className="text-green-500 text-lg" />,
      status,
      lastUsage,
      messagesToday,
    };
  }

  if (kind === "instagram") {
    return {
      name: "Instagram",
      icon: <FaInstagram className="text-pink-500 text-lg" />,
      status,
      lastUsage,
      messagesToday,
    };
  }

  return {
    name: "Facebook",
    icon: <FaFacebook className="text-blue-500 text-lg" />,
    status,
    lastUsage,
    messagesToday,
  };
}

export default function ChannelDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ online: 0, offline: 0, warning: 0, total: 0 });

  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const token = getAccessToken(session);
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await adminApi.get<CompanyOverviewResponse>(
          "/admin/company-overview/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data: CompanyOverviewResponse = res.data ?? {};
        const nextCounts = {
          total: firstNumber(data.total_channels),
          online: firstNumber(data.online_channels),
          offline: firstNumber(data.offline_channels),
          warning: firstNumber(data.warning_channels),
        };
        setCounts(nextCounts);

        const rawCompanies = data.companies;
        const list: ApiCompany[] = Array.isArray(rawCompanies)
          ? (rawCompanies as ApiCompany[])
          : [];

        const mapped: Company[] = list
          .map((c): Company | null => {
            const id = typeof c.id === "number" ? c.id : 0;
            if (!id) return null;
            const name = (c.name ?? "").toString().trim() || `Company #${id}`;
            const alert = (c.status_message ?? "").toString();

            const channels: Channel[] = [];
            if (c.whatsapp && isRecord(c.whatsapp)) {
              channels.push(mapApiChannel("whatsapp", c.whatsapp));
            }
            if (c.instagram && isRecord(c.instagram)) {
              channels.push(mapApiChannel("instagram", c.instagram));
            }
            if (c.facebook && isRecord(c.facebook)) {
              channels.push(mapApiChannel("facebook", c.facebook));
            }

            return { id, name, alert, channels };
          })
          .filter((x): x is Company => x !== null);

        setCompanies(mapped);
        setFilteredCompanies(mapped);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setError(code ? `Failed to load overview (${code}).` : "Failed to load overview.");
        } else {
          setError("Failed to load overview.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [session, sessionStatus]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((c) =>
        c.name.toLowerCase().includes(value)
      );
      setFilteredCompanies(filtered);
    }
  };

  const stats = counts;

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Admin Control Center</h2>

      {loading ? (
        <p className="text-gray-400">Loading overview...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : null}

      {/* Search */}
      <div className="flex items-center bg-[#272727] rounded-md p-2 w-full max-w-sm">
        <Search className="text-gray-400 w-5 h-5 ml-2" />
        <input
          type="text"
          placeholder="Search company"
          value={searchTerm}
          onChange={handleSearch}
          className="bg-transparent w-full px-3 py-1 outline-none text-sm text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#272727]  p-5 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <BsCheckCircleFill className="text-pink-500 text-xl" />
          </div>
          <p className="bg-[#272727]  text-white text-2xl font-semibold">{stats.online}</p>
          <p className="text-gray-400 text-sm">Online Channels</p>
        </div>

        <div className="bg-[#272727]  p-5 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <BsExclamationCircleFill className="text-blue-400 text-xl" />
          </div>
          <p className="text-white text-2xl font-semibold">{stats.offline}</p>
          <p className="text-gray-400 text-sm">Offline Channels</p>
        </div>

        <div className="bg-[#272727]  p-5 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <BsXCircleFill className="text-red-500 text-xl" />
          </div>
          <p className="text-white text-2xl font-semibold">{stats.warning}</p>
          <p className="text-gray-400 text-sm">Warning Channels</p>
        </div>

        <div className="bg-[#272727]  p-5 rounded-lg text-center">
          <div className="flex justify-center mb-2">
            <BsCheckCircleFill className="text-green-400 text-xl" />
          </div>
          <p className="text-white text-2xl font-semibold">{stats.total}</p>
          <p className="text-gray-400 text-sm">Total Channels</p>
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-6">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="bg-[#272727]  p-5 rounded-lg shadow-md hover:bg-gray-750 transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 className="font-semibold text-lg">{company.name}</h4>
              </div>
              <span className="text-xs px-3 py-1 bg-orange-700/40 text-orange-400 rounded-full">
                {company.alert}
              </span>
            </div>

            {/* Channel Info */}
            <div className="space-y-3">
              {company.channels.length === 0 ? (
                <p className="text-gray-400 text-sm">No channels connected.</p>
              ) : (
                company.channels.map((ch, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center border-b border-gray-700 pb-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {ch.icon}
                        <span>{ch.name}</span>
                      </div>
                      <p className="text-gray-400 text-xs">Last Usage: {ch.lastUsage}</p>
                      <p className="text-gray-400 text-xs">Messages Today: {ch.messagesToday}</p>
                    </div>

                    <p
                      className={`text-sm font-medium ${
                        ch.status === "Online"
                          ? "text-green-400"
                          : ch.status === "Warning"
                          ? "text-orange-400"
                          : "text-red-400"
                      }`}
                    >
                      {ch.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}

        {!loading && !error && filteredCompanies.length === 0 && (
          <p className="text-gray-400">No companies found.</p>
        )}
      </div>
    </div>
  );
}
