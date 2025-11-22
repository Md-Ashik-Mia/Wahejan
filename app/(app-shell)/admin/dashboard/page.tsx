"use client";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AdminDashboard: React.FC = () => {
  // ==============================
  // 🔹 Fake Dashboard Data (Replace with API Later)
  // ==============================
  const summaryStats = {
    totalUsers: "1,023",
    activeIntegrations: 20,
    addIncome: "$10,230",
    netProfit: "$99.99",
    newCompanies: 513,
    costs: "$952",
  };

  const chartData = [
    { month: "Jan", users: 2000, revenue: 2400, cost: 1500 },
    { month: "Feb", users: 4000, revenue: 4200, cost: 2500 },
    { month: "Mar", users: 7000, revenue: 6800, cost: 3900 },
    { month: "Apr", users: 9000, revenue: 7600, cost: 4200 },
    { month: "May", users: 10500, revenue: 8900, cost: 5000 },
    { month: "Jun", users: 12000, revenue: 11000, cost: 6200 },
    { month: "Jul", users: 13500, revenue: 12500, cost: 7000 },
  ];

  const openTickets = [
    {
      id: "#TK-4821",
      subject: "Payment gateway not processing transactions",
      priority: "High",
      status: "In Process",
      time: "2 hours ago",
    },
    {
      id: "#TK-4819",
      subject: "User login issues after system update",
      priority: "Medium",
      status: "In Process",
      time: "4 hours ago",
    },
    {
      id: "#TK-4820",
      subject: "Dashboard charts not loading correctly",
      priority: "Low",
      status: "Open",
      time: "6 hours ago",
    },
    {
      id: "#TK-4822",
      subject: "Email notifications delayed",
      priority: "Low",
      status: "Open",
      time: "6 hours ago",
    },
  ];

  // ==============================
  // 🔹 Utility Components
  // ==============================
  const Badge = ({ text, type }: { text: string; type: string }) => {
    const colors: Record<string, string> = {
      High: "bg-red-700 text-red-100",
      Medium: "bg-yellow-600 text-yellow-100",
      Low: "bg-blue-700 text-blue-100",
      Open: "bg-blue-700 text-blue-100",
      "In Process": "bg-orange-700 text-orange-100",
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-lg font-medium ${colors[type] || "bg-gray-600"}`}>
        {text}
      </span>
    );
  };

  // ==============================
  // 🔹 Main Layout
  // ==============================
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h1 className="text-xl font-semibold">Admin control center</h1>

      {/* ======================= Summary Cards ======================= */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Total Users</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.totalUsers}</p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Active Integrations</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.activeIntegrations}</p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Add Income</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.addIncome}</p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Net Profit this month</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.netProfit}</p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">New Companies</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.newCompanies}</p>
        </div>
        <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Costs</p>
          <p className="text-2xl font-semibold text-blue-400">{summaryStats.costs}</p>
        </div>
      </div>

      {/* ======================= Analytics Chart ======================= */}
      <div className="bg-[#272727] p-6 rounded-xl shadow-lg">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }} />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#38bdf8" strokeWidth={2} name="Users" />
            <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="cost" stroke="#facc15" strokeWidth={2} name="Cost" />
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
                <th className="p-3">ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="p-3 font-medium">{ticket.id}</td>
                  <td className="p-3 text-gray-300">{ticket.subject}</td>
                  <td className="p-3">
                    <Badge text={ticket.priority} type={ticket.priority} />
                  </td>
                  <td className="p-3">
                    <Badge text={ticket.status} type={ticket.status} />
                  </td>
                  <td className="p-3 text-right text-gray-400">{ticket.time}</td>
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
