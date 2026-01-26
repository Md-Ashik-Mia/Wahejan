"use client";
import { adminApi } from "@/lib/http/client";
import axios from "axios";
import { BarChart3, DollarSign, MessageCircle, Send } from "lucide-react";
import { useSession } from "next-auth/react";
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

type MetricDelta = {
  current: number;
  previous: number;
};

type PerformanceAnalyticsResponse = {
  total_message_sent?: Partial<MetricDelta>;
  total_message_received?: Partial<MetricDelta>;
  monthly_revenue?: Partial<MetricDelta>;
  total_revenue?: number;
  time_scope?: string;
};

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}

function formatDelta(current: number, previous: number): string {
  if (previous === 0) {
    if (current === 0) return "0% from previous";
    return "+— from previous";
  }
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% from previous`;
}

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

  // Use correct API param mapping
  const timeScopeParam = useMemo(
    () => TIME_SCOPE_MAP[timeFilter],
    [timeFilter],
  );

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

  const messagesSent = numberOrZero(stats?.total_message_sent?.current);
  const messagesSentPrev = numberOrZero(stats?.total_message_sent?.previous);
  const messagesReceived = numberOrZero(stats?.total_message_received?.current);
  const messagesReceivedPrev = numberOrZero(
    stats?.total_message_received?.previous,
  );
  const monthlyRevenue = numberOrZero(stats?.monthly_revenue?.current);
  const monthlyRevenuePrev = numberOrZero(stats?.monthly_revenue?.previous);
  const totalRevenue = numberOrZero(stats?.total_revenue);

  const cards = useMemo(
    () => [
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
        change: "Total",
      },
    ],
    [
      messagesReceived,
      messagesReceivedPrev,
      messagesSent,
      messagesSentPrev,
      monthlyRevenue,
      monthlyRevenuePrev,
      totalRevenue,
    ],
  );

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
