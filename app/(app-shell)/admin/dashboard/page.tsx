"use client";

import { adminApi } from "@/lib/http/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Types matching your backend response
interface Ticket {
  id: number;
  user: string;
  ticket_id: string;
  time_since_created: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChartPoint {
  month: string; // "January", "February", ...
  users: number;
  revenue: number;
  cost: number;
}

interface DashboardData {
  totalUsers: number;
  activeIntegrations: number;
  newCompanies: number;
  addIncome: number;
  netProfit: number;
  costs: number;
  openTickets: Ticket[];
  chartData: ChartPoint[];
}

const STATUS_CHOICES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const AdminDashboard: React.FC = () => {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch admin dashboard only when this page renders
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }

    const accessToken = (session as unknown as { accessToken?: string })
      .accessToken;
    if (!accessToken) {
      setError("Missing access token in session.");
      setLoading(false);
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await adminApi.get<DashboardData>(
          "/admin/dashboard/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        console.log("Dashboard data:", response.data);
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("Error status:", err.response.status);
            console.error("Error data:", err.response.data);
            setError(
              `Failed to load dashboard (${err.response.status}). Check auth/token.`,
            );
          } else if (err.request) {
            console.error("No response received:", err.request);
            setError("No response from server.");
          } else {
            console.error("Request error:", err.message);
            setError(err.message);
          }
        } else {
          console.error("Unexpected error:", err);
          setError("Unexpected error while loading dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [session, status]);

  const updateTicketStatus = async (ticketId: number, nextStatus: string) => {
    try {
      const response = await adminApi.patch(
        `/admin/change-ticket-status/?ticket=${ticketId}&status=${encodeURIComponent(nextStatus)}`,
      );
      console.log("Status updated successfully:", response.data);
      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          openTickets: prev.openTickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: nextStatus } : ticket,
          ),
        };
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-300">Loading admin dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#272727] p-6 rounded-xl max-w-md text-center space-y-2">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <p className="text-red-400 text-sm">{error ?? "No data found."}</p>
        </div>
      </div>
    );
  }

  // 🔹 Map backend numbers into UI
  const summaryStats = {
    totalUsers: data.totalUsers,
    activeIntegrations: data.activeIntegrations,
    addIncome: data.addIncome,
    netProfit: data.netProfit,
    newCompanies: data.newCompanies,
    costs: data.costs,
  };

  const chartData = data.chartData; // directly from backend
  const openTickets = data.openTickets;

  const Badge = ({ text }: { text: string }) => {
    // you can style based on status if you want
    const base =
      text.toLowerCase() === "open"
        ? "bg-blue-700 text-blue-100"
        : "bg-gray-700 text-gray-100";

    return (
      <span className={`px-3 py-1 text-xs rounded-lg font-medium ${base}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h1 className="text-xl font-semibold">Admin control center</h1>

      {/* ======================= Summary Cards ======================= */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-blue-400">
            {summaryStats.totalUsers}
          </p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Active Integrations</p>
          <p className="text-2xl font-semibold text-blue-400">
            {summaryStats.activeIntegrations}
          </p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Add Income</p>
          <p className="text-2xl font-semibold text-blue-400">
            ${summaryStats.addIncome}
          </p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Net Profit this month</p>
          <p className="text-2xl font-semibold text-blue-400">
            ${summaryStats.netProfit}
          </p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">New Companies</p>
          <p className="text-2xl font-semibold text-blue-400">
            {summaryStats.newCompanies}
          </p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Costs</p>
          <p className="text-2xl font-semibold text-blue-400">
            ${summaryStats.costs}
          </p>
        </div>
      </div>

      {/* ======================= Analytics Chart ======================= */}
      <div className="bg-[#272727] p-6 rounded-xl shadow-lg">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: 8 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#38bdf8"
              strokeWidth={2}
              name="Users"
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#facc15"
              strokeWidth={2}
              name="Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ======================= Support Tickets ======================= */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Open Support Tickets</h2>
        <div className="bg-[#272727] rounded-xl p-6 shadow-lg overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Description</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-4 text-center text-gray-400 italic"
                  >
                    No open tickets
                  </td>
                </tr>
              )}

              {openTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="p-3 font-medium">{ticket.ticket_id}</td>
                  <td className="p-3 text-gray-300">{ticket.user}</td>
                  <td className="p-3 text-gray-300">{ticket.subject}</td>
                  <td className="p-3 text-gray-300 max-h-20 overflow-y-auto">
                    {ticket.description}
                  </td>
                  <td className="p-3">
                    <select
                      className="bg-[#272727] text-white p-2 rounded-lg"
                      value={ticket.status}
                      onChange={(e) =>
                        updateTicketStatus(ticket.id, e.target.value)
                      }
                    >
                      {STATUS_CHOICES.map((choice) => (
                        <option key={choice.value} value={choice.value}>
                          {choice.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right text-gray-400">
                    {ticket.time_since_created}
                    {/* or new Date(ticket.created_at).toLocaleString() */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
