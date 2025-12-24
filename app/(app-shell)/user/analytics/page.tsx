"use client";
import { userapi } from "@/lib/http/client";
import axios, { type AxiosResponse } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function getErrorMessage(error: unknown, fallback: string): string {
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

type NormalizedAnalytics = {
  message_count: {
    total: number;
    platforms: Record<string, number>;
  };
  booking_count: number;
  total_revenue: number;
  new_customers: number;
  unanswered_messages: number;
  channel_messages: Record<string, number>;
};

function normalizeApiAnalytics(raw: unknown): NormalizedAnalytics {
  const r: UnknownRecord = isRecord(raw) ? raw : {};

  const messageCount = isRecord(r.message_count) ? r.message_count : {};
  const platforms = isRecord(messageCount.platforms) ? messageCount.platforms : {};

  const channelMessages = isRecord(r.channel_messages) ? r.channel_messages : {};

  return {
    message_count: {
      total: toNumber(messageCount.total, 0),
      platforms: Object.fromEntries(
        Object.entries(platforms).map(([k, v]) => [k.toLowerCase(), toNumber(v, 0)])
      ),
    },
    booking_count: toNumber(r.booking_count, 0),
    total_revenue: toNumber(r.total_revenue, 0),
    new_customers: toNumber(r.new_customers, 0),
    unanswered_messages: toNumber(r.unanswered_messages, 0),
    channel_messages: Object.fromEntries(
      Object.entries(channelMessages).map(([k, v]) => [k.toLowerCase(), toNumber(v, 0)])
    ),
  };
}

const TIME_RANGES = ["Today", "This Week", "This Month"] as const;
type TimeRange = (typeof TIME_RANGES)[number];

interface AnalyticsData {
  messagesReceived: number;
  appointmentsBooked: number;
  totalRevenue: number;
  newCustomers: number;
  unanswered: number;
  channelDistribution: { name: string; value: number; color: string }[];
  financial: {
    totalPayments: number;
    avgOrder: number;
    failedPayments: number;
    pendingPayments: number;
    growth: { payments: string; avgOrder: string; failed: string; pending: string };
  };
  topQuestions: { question: string; count: number }[];
}

function normalizeQuestionLeaderboard(payload: unknown): Array<{ question: string; count: number }> {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map((raw: unknown) => {
      const r: UnknownRecord = isRecord(raw) ? raw : {};
      const text = typeof r.text === "string" ? r.text.trim() : "";
      const count = toNumber(r.count, 0);
      return { question: text, count };
    })
    .filter((q) => Boolean(q.question));
}

const channels = ["All Channels", "WhatsApp", "Facebook", "Instagram"] as const;
type ChannelFilter = (typeof channels)[number];

const COLORS: Record<string, string> = {
  WhatsApp: "#FACC15",
  Facebook: "#3B82F6",
  Instagram: "#EC4899",
};

const EMPTY_DATA: AnalyticsData = {
  messagesReceived: 0,
  appointmentsBooked: 0,
  totalRevenue: 0,
  newCustomers: 0,
  unanswered: 0,
  channelDistribution: channels
    .filter((name) => name !== "All Channels")
    .map((name) => ({ name, value: 0, color: COLORS[name] })),
  financial: {
    totalPayments: 0,
    avgOrder: 0,
    failedPayments: 0,
    pendingPayments: 0,
    growth: { payments: "—", avgOrder: "—", failed: "—", pending: "—" },
  },
  topQuestions: [],
};

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("Today");
  const [channel, setChannel] = useState<ChannelFilter>("All Channels");
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [topLoading, setTopLoading] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  const timezone = useMemo(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof tz === "string" && tz.trim() ? tz : "Asia/Dhaka";
  }, []);

  const fetchAnalytics = useCallback(async (range: string, ch: ChannelFilter) => {
    setLoading(true);
    setError(null);

    const timeMap: Record<string, string> = {
      Today: "today",
      "This Week": "this_week",
      "This Month": "this_month",
    };

    const time = timeMap[range] ?? "this_year";
    const channelParam = ch === "All Channels" ? "" : String(ch).trim().toLowerCase();

    // NOTE: in some environments NEXT_PUBLIC_API_BASE_URL already ends with `/api`
    // (see other pages like user/integrations). In that case endpoints must NOT
    // start with `/api`, otherwise we hit `/api/api/...` and get 404.
    const baseParams: Record<string, string> = {
      time,
      type: "all",
      timezone,
      ...(channelParam ? { channel: channelParam } : {}),
    };

    const candidates: Array<{ endpoint: string; params: Record<string, string> }> = [
      // baseURL ends with `/api`
      { endpoint: "/analytics/", params: baseParams },
      { endpoint: "/analytics", params: baseParams },

      // baseURL does NOT end with `/api`
      { endpoint: "/api/analytics/", params: baseParams },
      { endpoint: "/api/analytics", params: baseParams },

      // fallback if backend doesn't support chosen time range
      { endpoint: "/analytics/", params: { ...baseParams, time: "this_year" } },
      { endpoint: "/api/analytics/", params: { ...baseParams, time: "this_year" } },
    ];

    let lastError: unknown = null;

    try {
      let res: AxiosResponse<unknown> | null = null;

      for (const c of candidates) {
        try {
          // Backend expects no body for "all channels", but may accept a body for filtering.
          // Some browsers strip GET bodies; we send BOTH query params + body when filtering.
          if (!channelParam) {
            res = await userapi.get(c.endpoint, { params: c.params });
          } else {
            res = await userapi.request({
              url: c.endpoint,
              method: "GET",
              params: c.params,
              data: { time: c.params.time, channel: channelParam },
            });
          }
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            // still try fallbacks for 400/422/etc (common when params differ), but stop on 401
            if (e.response.status === 401) throw e;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to load analytics");

      const api = normalizeApiAnalytics(res.data);
      const totalRevenue = api.total_revenue;
      const appointmentsBooked = api.booking_count;
      const avgOrder = appointmentsBooked > 0 ? totalRevenue / appointmentsBooked : 0;

      const platforms = api.message_count.platforms;
      const channelDistribution = channels.filter((n) => n !== "All Channels").map((name) => {
        const key = name.toLowerCase();
        const value = typeof platforms[key] === "number" ? platforms[key] : 0;
        return { name, value, color: COLORS[name] };
      });

      setData((prev) => ({
        ...prev,
        messagesReceived: api.message_count.total,
        appointmentsBooked,
        totalRevenue,
        newCustomers: api.new_customers,
        unanswered: api.unanswered_messages,
        channelDistribution,
        financial: {
          // API currently provides total_revenue; the rest are not present
          totalPayments: totalRevenue,
          avgOrder: Math.round(avgOrder * 100) / 100,
          failedPayments: 0,
          pendingPayments: 0,
          growth: { payments: "—", avgOrder: "—", failed: "—", pending: "—" },
        },
      }));
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Failed to load analytics"));
      setData((prev) => ({ ...EMPTY_DATA, topQuestions: prev.topQuestions }));
    } finally {
      setLoading(false);
    }
  }, [timezone]);

  const fetchTopQuestions = useCallback(async () => {
    setTopLoading(true);
    setTopError(null);

    // NOTE: baseURL may already include `/api`, so prefer endpoints WITHOUT `/api` first.
    const candidates = [
      "/chat/question-leaderboard/",
      "/chat/question-leaderboard",
      "/api/chat/question-leaderboard/",
      "/api/chat/question-leaderboard",
    ];

    let lastError: unknown = null;

    try {
      let res: AxiosResponse<unknown> | null = null;

      for (const endpoint of candidates) {
        try {
          res = await userapi.get(endpoint);
          break;
        } catch (e: unknown) {
          lastError = e;
          if (axios.isAxiosError(e) && e.response && e.response.status !== 404) {
            if (e.response.status === 401) throw e;
          }
        }
      }

      if (!res) throw lastError ?? new Error("Failed to load top questions");

      const list = normalizeQuestionLeaderboard(res.data);
      setData((prev) => ({ ...prev, topQuestions: list }));
    } catch (e: unknown) {
      setTopError(getErrorMessage(e, "Failed to load top questions"));
      setData((prev) => ({ ...prev, topQuestions: [] }));
    } finally {
      setTopLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnalytics(timeRange, channel);
  }, [fetchAnalytics, timeRange, channel]);

  useEffect(() => {
    void fetchTopQuestions();
  }, [fetchTopQuestions]);

  const handleApplyFilters = () => {
    void fetchAnalytics(timeRange, channel);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Business Analytics</h1>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : loading ? (
        <p className="text-sm text-gray-400">Loading analytics...</p>
      ) : null}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-sm text-gray-400 mb-1">Time Range</p>
          <select
            value={timeRange}
            onChange={(e) => {
              const v = e.target.value;
              if (TIME_RANGES.includes(v as TimeRange)) setTimeRange(v as TimeRange);
            }}
            className="bg-[#272727]  text-white p-2 rounded"
          >
            {TIME_RANGES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Channel</p>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value as ChannelFilter)}
            className="bg-[#272727]  text-white p-2 rounded"
          >
            {channels.map((ch) => (
              <option key={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 px-4 py-2 rounded h-fit disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Apply Filters"}
        </button>
      </div>

      {/* Business KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Messages Received", value: data.messagesReceived },
          { label: "Appointments booked", value: data.appointmentsBooked },
          { label: "Total Revenue", value: `$${data.totalRevenue}` },
          { label: "New Customers", value: data.newCustomers },
          { label: "Unanswered Message", value: data.unanswered },
        ].map((card, i) => (
          <div key={i} className="bg-[#272727]  rounded-lg p-4 text-center shadow-lg">
            <p className="text-3xl font-bold mb-1">{card.value}</p>
            <p className="text-gray-400 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Channel Distribution */}
      <section>
        <div className="flex justify-between items-center bg-blue-600 rounded-t-lg px-4 py-2">
          <h2 className="font-semibold">Channel Distribution</h2>
          <p className="text-sm text-gray-200">Message sources</p>
        </div>
        <div className="bg-[#272727]  p-6 rounded-b-lg">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.channelDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.channelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Financial Insights */}
      <section>
        <div className="flex justify-between items-center bg-blue-600 rounded-t-lg px-4 py-2">
          <h2 className="font-semibold">Financial Insights</h2>
          <p className="text-sm text-gray-200">This month</p>
        </div>
        <div className="bg-[#272727]  p-6 rounded-b-lg grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-xl font-semibold">${data.financial.totalPayments.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Payments</p>
            <p className="text-green-400 text-xs">{data.financial.growth.payments} from last month</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-xl font-semibold">${data.financial.avgOrder}</p>
            <p className="text-gray-400 text-sm">Average Order Value</p>
            <p className="text-green-400 text-xs">{data.financial.growth.avgOrder} from last month</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-xl font-semibold">{data.financial.failedPayments}</p>
            <p className="text-gray-400 text-sm">Failed Payments</p>
            <p className="text-red-400 text-xs">{data.financial.growth.failed} from last month</p>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <p className="text-xl font-semibold">${data.financial.pendingPayments}</p>
            <p className="text-gray-400 text-sm">Pending Payments</p>
            <p className="text-green-400 text-xs">{data.financial.growth.pending} from last month</p>
          </div>
        </div>
      </section>

      {/* Top AI Questions */}
      <section>
        <div className="flex justify-between items-center bg-blue-600 rounded-t-lg px-4 py-2">
          <h2 className="font-semibold">Top AI Questions</h2>
          <p className="text-sm text-gray-200">Most common queries</p>
        </div>
        <div className="bg-[#272727]  p-6 rounded-b-lg space-y-2">
          {topError ? (
            <p className="text-sm text-red-400">{topError}</p>
          ) : topLoading ? (
            <p className="text-gray-400 text-sm">Loading...</p>
          ) : data.topQuestions.length === 0 ? (
            <p className="text-gray-400 text-sm">No data available.</p>
          ) : (
            data.topQuestions.map((q, i) => (
              <div key={i}>
                <p className="text-white font-medium">{q.question}</p>
                <p className="text-gray-400 text-sm">Asked {q.count} times</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
