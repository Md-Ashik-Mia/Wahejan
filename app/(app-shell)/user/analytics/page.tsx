"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

const fakeData: Record<string, Record<string, AnalyticsData>> = {
  Today: {
    WhatsApp: {
      messagesReceived: 24,
      appointmentsBooked: 4,
      totalRevenue: 24,
      newCustomers: 4,
      unanswered: 4,
      channelDistribution: [
        { name: "WhatsApp", value: 45, color: "#FACC15" },
        { name: "Facebook", value: 25, color: "#3B82F6" },
        { name: "Instagram", value: 20, color: "#EC4899" },
        { name: "Webchat", value: 10, color: "#10B981" },
      ],
      financial: {
        totalPayments: 24580,
        avgOrder: 142,
        failedPayments: 3,
        pendingPayments: 640,
        growth: { payments: "+15%", avgOrder: "+8.2%", failed: "+1", pending: "-12%" },
      },
      topQuestions: [
        { question: "What are your business hours?", count: 142 },
        { question: "Do you offer refunds?", count: 98 },
        { question: "How do I schedule an appointment?", count: 100 },
        { question: "What payment methods do you accept?", count: 52 },
        { question: "Where is your location?", count: 132 },
      ],
    },
    Facebook: {
      messagesReceived: 18,
      appointmentsBooked: 2,
      totalRevenue: 12,
      newCustomers: 3,
      unanswered: 2,
      channelDistribution: [
        { name: "WhatsApp", value: 20, color: "#FACC15" },
        { name: "Facebook", value: 60, color: "#3B82F6" },
        { name: "Instagram", value: 10, color: "#EC4899" },
        { name: "Webchat", value: 10, color: "#10B981" },
      ],
      financial: {
        totalPayments: 16500,
        avgOrder: 108,
        failedPayments: 2,
        pendingPayments: 350,
        growth: { payments: "+9%", avgOrder: "+3.2%", failed: "-1", pending: "-5%" },
      },
      topQuestions: [
        { question: "Do you offer refunds?", count: 80 },
        { question: "How do I schedule an appointment?", count: 60 },
        { question: "What are your business hours?", count: 110 },
      ],
    },
  },
};

const channels = ["WhatsApp", "Facebook", "Instagram", "Webchat"];

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"Today" | "This Week" | "This Month">("Today");
  const [channel, setChannel] = useState("WhatsApp");
  const [data, setData] = useState<AnalyticsData>(fakeData.Today.WhatsApp);

  const handleApplyFilters = () => {
    const filtered = fakeData[timeRange]?.[channel];
    if (filtered) setData(filtered);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Business Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-sm text-gray-400 mb-1">Time Range</p>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-[#272727]  text-white p-2 rounded"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Channel</p>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="bg-[#272727]  text-white p-2 rounded"
          >
            {channels.map((ch) => (
              <option key={ch}>{ch}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 px-4 py-2 rounded h-fit"
        >
          Apply Filters
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
          {data.topQuestions.map((q, i) => (
            <div key={i}>
              <p className="text-white font-medium">{q.question}</p>
              <p className="text-gray-400 text-sm">Asked {q.count} times</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboard;
