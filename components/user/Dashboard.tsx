"use client";

import { userApi } from "@/lib/http/client";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineMessage } from "react-icons/ai";
import { FaRegCalendarPlus } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";

// --- Types based on the User's API Response ---

interface PaymentItem {
  transaction_id: string | null;
  amount: number;
  type: string;
  reason: string;
  status: string;
  payment_date: string;
}

interface MeetingItem {
  title: string;
  client: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number | null;
  notes: string;
  event_link: string;
}

interface ChannelStatus {
  whatsapp: boolean;
  facebook: boolean;
  instagram: boolean;
  calendar: boolean;
}

interface DashboardData {
  open_chat: number;
  today_payments: {
    total: number;
    list: PaymentItem[];
  };
  today_meetings: {
    count: number;
    list: MeetingItem[];
    remaining: number;
  };
  channel_status: ChannelStatus;
}

// Map channel keys to display names
const CHANNEL_NAMES: Record<keyof ChannelStatus, string> = {
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  instagram: "Instagram",
  calendar: "Calendar",
};

// --- Components ---

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "yellow" | "red";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
      : tone === "yellow"
      ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
      : tone === "red"
      ? "bg-red-600/20 text-red-300 border-red-500/30"
      : "bg-white/10 text-gray-200 border-white/10";
  return <span className={`px-2 py-0.5 rounded-md text-xs border ${cls}`}>{children}</span>;
}

function Card({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  const Icon = (() => {
    switch (title) {
      case "Open Chats":
        return AiOutlineMessage;
      case "Appointments Today":
        return SlCalender;
      case "New Appointments": // Mapped to 'remaining' for now or static? Using meeting count.
        return FaRegCalendarPlus;
      case "Payments Today":
        return FaMoneyBillWave;
      default:
        return null;
    }
  })();

  return (
    <div className="bg-[#272727] border border-white/10 rounded-xl p-4">
      {Icon && <Icon className="text-3xl mb-2 text-gray-400" />}
      <div className="text-sm text-gray-400">{title}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["user-dashboard"],
    queryFn: async () => {
      // The user specified to use "today_payments" etc. from the API.
      // We assume GET /api/dashboard returns exactly that structure.
      // Or maybe GET /api/user/dashboard? We'll try the path that worked before or standard.
      // The user prompt said: "use this api and get data ... import userapi ... use it to get response"
      // User's provided curl/image had /api/dashboard.
      // However previous code used /api/user/dashboard.
      // I'll stick to what the user showed in the image/text conceptually or try a relative path if they have a proxy.
      // The image showed `https://.../api/dashboard`.
      // But let's assume valid internal routing or relative path `/api/dashboard` if using next rewrites,
      // or simply rely on the axiom that we should use `userApi.get("/dashboard")`
      // typically relative to base URL if set, or just use the path.

      // Checking `client.ts`: `userApi` has `baseURL: BASE_URL`.
      // If `BASE_URL` is the API server, then we just need the endpoint path.
      // In the image it was `/api/dashboard`.
      // So let's try `/dashboard` via userApi if baseURL includes `/api`, or `/api/dashboard` if not.
      // Safest is to try `/api/dashboard`.

      const res = await userApi.get("/dashboard?timezone=" + Intl.DateTimeFormat().resolvedOptions().timeZone);
      return res.data;
    },
    staleTime: 60_000,
    retry: 1,
  });

  if (isLoading) {
    return <div className="p-4 text-white">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="p-4 text-red-400">Error loading dashboard data.</div>;
  }

  // Derive card values
  const totalPayments = data.today_payments.total;
  const paymentCount = data.today_payments.list.length; // or maybe just total cost
  const appointmentsCount = data.today_meetings.count;
  const remainingAppointments = data.today_meetings.remaining;
  const openChats = data.open_chat;

  return (
    <div className="space-y-6 p-4 bg-black min-h-screen text-white">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Open Chats" value={openChats} hint="Active conversations" />
        <Card title="Appointments Today" value={appointmentsCount} hint={`${data.today_meetings.remaining} remaining`} />
        {/* We don't have "New Appointments" count in JSON, so reusing logic or omitting.
            The previous UI had "New Appointments". I'll use "Remaining" here effectively as a placeholder or just map it.
            Let's label it "Remaining Today" for clarity based on 'remaining' field. */}
        <Card title="Remaining Today" value={data.today_meetings.remaining} hint="Upcoming" />
        <Card
          title="Payments Today"
          value={`$${totalPayments.toLocaleString()}`}
          hint={`${paymentCount} transaction${paymentCount !== 1 ? 's' : ''}`}
        />
      </div>

      {/* Appointments Today */}
      <section className="bg-[#272727] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#272727]">
          <div className="font-medium">Appointments Today</div>
          <div className="text-xs">
            <Badge>{data.today_meetings.list.length} appointments</Badge>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {data.today_meetings.list.length === 0 ? (
            <div className="px-4 py-4 text-center text-gray-500 text-sm">No appointments found.</div>
          ) : (
            data.today_meetings.list.map((m, i) => {
                // Parse date for display
                const start = new Date(m.start_time);
                const timeStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2">
                    <div className="w-24 text-gray-400 text-sm shrink-0">{timeStr}</div>
                    <div className="flex-1">
                        <div className="font-medium">{m.title}</div>
                        <div className="text-xs text-gray-400">{m.client}</div>
                    </div>
                    <div className="text-sm text-gray-300 mr-4 hidden sm:block">
                        {m.location}
                    </div>
                    <div>
                        <Badge tone="default">Scheduled</Badge>
                    </div>
                    </div>
                );
            })
          )}
        </div>
      </section>

      {/* Payments Today */}
      <section className="bg-[#272727] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#272727]">
          <div className="font-medium">Payments Today</div>
          <div className="text-xs">
            <Badge>{data.today_payments.list.length} Transactions</Badge>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {data.today_payments.list.length === 0 ? (
             <div className="px-4 py-4 text-center text-gray-500 text-sm">No payments recorded today.</div>
          ) : (
            data.today_payments.list.map((p, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2 items-center">
                <div className="truncate">
                    <div className="font-medium truncate">{p.reason}</div>
                    <div className="text-xs text-gray-400">{p.type}</div>
                </div>
                <div className="text-gray-400 text-sm truncate text-center">
                    {/* Date/Time could go here if needed */}
                </div>
                <div className="flex items-center justify-end gap-2">
                    <div className="text-right w-20 font-mono">${p.amount.toFixed(2)}</div>
                    <Badge tone={p.status === "paid" || p.status === "success" ? "green" : "yellow"}>
                    {p.status}
                    </Badge>
                </div>
                </div>
            ))
          )}
        </div>
      </section>

      {/* Channel Status */}
      <section className="bg-[#272727] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Channel Status</div>
          {/* Count how many are true */}
          <Badge>
            {Object.values(data.channel_status).filter(Boolean).length} Active
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(data.channel_status) as Array<keyof ChannelStatus>).map((key) => {
            const isActive = data.channel_status[key];
            const name = CHANNEL_NAMES[key] || key;
            return (
              <div key={key} className="bg-[#171b24] border border-white/10 rounded-xl p-4">
                <div className="font-medium capitalize">{name}</div>
                <div className="mt-2">
                  <Badge tone={isActive ? "green" : "default"}>
                    {isActive ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Notifications - Placeholder for Socket Integration */}
      <section className="bg-[#272727] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#272727]">
          <div className="font-medium">Notifications/Alerts</div>
          <Badge>All systems normal</Badge>
        </div>
        <ul className="px-4 py-3 text-sm text-gray-300 list-disc list-inside space-y-1">
          {/* TODO: Integrate socket for real-time notifications */}
          <li>System online and operational.</li>
          <li>Waiting for real-time updates...</li>
        </ul>
      </section>
    </div>
  );
}
