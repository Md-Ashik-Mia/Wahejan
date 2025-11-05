"use client";

import { FAKE_USER_DASHBOARD, type UserDashboardData } from "@/lib/user-dashboard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "green" | "yellow" }) {
  const cls =
    tone === "green"
      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30"
      : tone === "yellow"
      ? "bg-yellow-600/20 text-yellow-300 border-yellow-500/30"
      : "bg-white/10 text-gray-200 border-white/10";
  return <span className={`px-2 py-0.5 rounded-md text-xs border ${cls}`}>{children}</span>;
}

function Card({ title, value, hint }: { title: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-[#171b24] border border-white/10 rounded-xl p-4">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user-dashboard"],
    queryFn: async () => {
      const res = await axios.get<UserDashboardData | Record<string, never>>("/api/user/dashboard", { timeout: 8000 });
      // If backend returns nothing or wrong shape -> fallback to fake
      if (!res.data || !("cards" in res.data)) return FAKE_USER_DASHBOARD;
      return res.data as UserDashboardData;
    },
    staleTime: 60_000, // 1 min
    retry: 1,
  });

  const d = data ?? FAKE_USER_DASHBOARD;

  return (
    <div className="space-y-6 p-4">
      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Open Chats" value={d.cards.openChats} hint="All caught up" />
        <Card title="Appointments Today" value={d.cards.appointmentsToday} hint="2 more than yesterday" />
        <Card title="New Appointments" value={d.cards.newAppointments} hint="1 more than yesterday" />
        <Card title="Payments Today" value={`$${d.cards.paymentsAmount.toLocaleString()}`} hint="All successful" />
      </div>

      {/* Appointments Today */}
      <section className="bg-[#121620] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-blue-600/20 border-b border-blue-500/40">
          <div className="font-medium">Appointments Today</div>
          <div className="text-xs">
            <Badge>{d.appointmentsToday.length} appointments</Badge>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {d.appointmentsToday.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2">
              <div className="w-24 text-gray-400 text-sm">{a.time}</div>
              <div className="flex-1">{a.name}</div>
              <div>
                <Badge tone={a.status === "confirm" ? "green" : a.status === "pending" ? "yellow" : "default"}>
                  {a.status === "confirm" ? "Confirm" : a.status === "pending" ? "Pending" : "Done"}
                </Badge>
              </div>
            </div>
          ))}
          {(isLoading || isError) && (
            <div className="px-4 py-2 text-xs text-gray-400">
              {isLoading ? "Loading live data…" : "Showing cached/fake data due to error."}
            </div>
          )}
        </div>
      </section>

      {/* Payments Today */}
      <section className="bg-[#121620] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-blue-600/20 border-b border-blue-500/40">
          <div className="font-medium">Payments Today</div>
          <div className="text-xs">
            <Badge>{d.paymentsToday.filter(p => p.status === "paid").length} Paid</Badge>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {d.paymentsToday.map((p, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 px-4 py-2 items-center">
              <div className="truncate">{p.name}</div>
              <div className="text-gray-400 text-sm truncate">{p.service}</div>
              <div className="flex items-center justify-end gap-2">
                <div className="text-right w-20">${p.amount.toFixed(2)}</div>
                <Badge tone={p.status === "paid" ? "green" : "yellow"}>
                  {p.status === "paid" ? "Paid" : "Pending"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Channel Status */}
      <section className="bg-[#121620] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-medium">Channel Status</div>
          <Badge>{d.channels.filter(c => c.status === "online").length} Online</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {d.channels.map((c, i) => (
            <div key={i} className="bg-[#171b24] border border-white/10 rounded-xl p-4">
              <div className="font-medium">{c.name}</div>
              <div className="mt-2">
                <Badge tone={c.status === "online" ? "green" : "yellow"}>
                  {c.status === "online" ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-[#121620] border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-blue-600/20 border-b border-blue-500/40">
          <div className="font-medium">Notifications/Alerts</div>
          <Badge>All systems normal</Badge>
        </div>
        <ul className="px-4 py-3 text-sm text-gray-300 list-disc list-inside space-y-1">
          {d.notifications.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
