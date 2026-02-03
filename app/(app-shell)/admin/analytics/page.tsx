"use client";
import { adminApi } from "@/lib/http/client";
import axios from "axios";
import { BarChart3, DollarSign, MessageCircle, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type SessionWithAccessToken = { accessToken?: string };

function getAccessToken(session: unknown): string | null {
  const token = (session as SessionWithAccessToken | null)?.accessToken;
  if (typeof token === "string" && token) return token;
  return typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null;
}

type MetricDelta = { current: number; previous: number };

type PerformanceAnalyticsResponse = {
  total_message_sent?: Partial<MetricDelta>;
  total_message_received?: Partial<MetricDelta>;
  monthly_revenue?: Partial<MetricDelta>;
  total_revenue?: number;
  total_revenue_previous?: number;
  time_scope?: string;
};

const toNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const formatMoney = (value: number) => `$${value.toLocaleString()}`;

const formatDelta = (current: number, previous: number) => {
  if (!previous) {
    if (!current) return "0% from last period";
    const pct = current * 100;
    return `+${pct.toFixed(1)}% from last period`;
  }
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from last period`;
};

const TIME_SCOPE_MAP: Record<"today" | "month" | "year", string> = {
  today: "today",
  month: "last_month",
  year: "last_year",
};

const AnalyticsDashboard = () => {
  const [timeFilter, setTimeFilter] = useState<"today" | "month" | "year">(
    "month",
  );
  const { data: session, status: sessionStatus } = useSession();
  const [stats, setStats] = useState<PerformanceAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeScopeParam = TIME_SCOPE_MAP[timeFilter];

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const token = getAccessToken(session);
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use correct API endpoint and params
        const res = await adminApi.get<PerformanceAnalyticsResponse>(
          "/admin/performance-analytics/",
          {
            params: {
              time_scope: timeScopeParam,
              timezone: "Asia/Dhaka",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setStats(res.data ?? null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setError(
            code
              ? `Failed to load analytics (${code}).`
              : "Failed to load analytics.",
          );
        } else {
          setError("Failed to load analytics.");
        }
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [session, sessionStatus, timeScopeParam]);

  const messagesSent = toNumber(stats?.total_message_sent?.current);
  const messagesSentPrev = toNumber(stats?.total_message_sent?.previous);
  const messagesReceived = toNumber(stats?.total_message_received?.current);
  const messagesReceivedPrev = toNumber(
    stats?.total_message_received?.previous,
  );
  const monthlyRevenue = toNumber(stats?.monthly_revenue?.current);
  const monthlyRevenuePrev = toNumber(stats?.monthly_revenue?.previous);
  const totalRevenue = toNumber(stats?.total_revenue);
  const totalRevenuePrev = toNumber(stats?.total_revenue_previous);

  const cards = [
    {
      label: "Messages Sent",
      value: messagesSent,
      color: "text-yellow-400",
      icon: <Send className="w-6 h-6 text-yellow-400" />,
      change: formatDelta(messagesSent, messagesSentPrev),
    },
    {
      label: "Messages Received",
      value: messagesReceived,
      color: "text-green-400",
      icon: <MessageCircle className="w-6 h-6 text-green-400" />,
      change: formatDelta(messagesReceived, messagesReceivedPrev),
    },
    {
      label: "Monthly Revenue",
      value: formatMoney(monthlyRevenue),
      color: "text-pink-500",
      icon: <BarChart3 className="w-6 h-6 text-pink-500" />,
      change: formatDelta(monthlyRevenue, monthlyRevenuePrev),
    },
    {
      label: "Total Revenue",
      value: formatMoney(totalRevenue),
      color: "text-yellow-400",
      icon: <DollarSign className="w-6 h-6 text-yellow-400" />,
      change: formatDelta(totalRevenue, totalRevenuePrev),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Admin control center</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setTimeFilter("today")}
            className={`px-4 py-1.5 rounded-md border border-gray-600 transition-all ${
              timeFilter === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeFilter("month")}
            className={`px-4 py-1.5 rounded-md border border-gray-600 transition-all ${
              timeFilter === "month"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeFilter("year")}
            className={`px-4 py-1.5 rounded-md border border-gray-600 transition-all ${
              timeFilter === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Last Year
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading analytics...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : null}

      {/* Statistic Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="bg-[#272727] rounded-xl p-5 hover:bg-gray-700 transition-all active:scale-95"
          >
            <div className="flex justify-between items-center mb-3">
              <span className={card.color}>{card.icon}</span>
            </div>
            <p className="text-2xl font-semibold mb-1">
              {typeof card.value === "number"
                ? card.value.toLocaleString()
                : card.value}
            </p>
            <p className="text-gray-300 text-sm">{card.label}</p>
            <p
              className={`text-xs mt-1 ${
                card.change.startsWith("+") ? "text-green-400" : "text-red-400"
              }`}
            >
              {card.change}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
