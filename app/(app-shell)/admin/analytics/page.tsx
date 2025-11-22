"use client";
import React, { useState, useEffect } from "react";
import { DollarSign, MessageCircle, Send, BarChart3, FileText, User } from "lucide-react";

const AnalyticsDashboard = () => {
  const [timeFilter, setTimeFilter] = useState<"today" | "month" | "year">("month");
  const [stats, setStats] = useState<any>({});

  // Fake backend data simulation
  const fakeData = {
    today: {
      messagesSent: 450,
      messagesReceived: 389,
      payments: 14,
      monthlyRevenue: 720,
      totalRevenue: 9000,
      totalCosts: 4200,
      grossProfit: 4800,
      arpu: 2.45,
    },
    month: {
      messagesSent: 12450,
      messagesReceived: 10890,
      payments: 245,
      monthlyRevenue: 12450,
      totalRevenue: 124580,
      totalCosts: 74580,
      grossProfit: 24580,
      arpu: 80.99,
    },
    year: {
      messagesSent: 140000,
      messagesReceived: 132000,
      payments: 3100,
      monthlyRevenue: 210000,
      totalRevenue: 1400000,
      totalCosts: 840000,
      grossProfit: 560000,
      arpu: 94.5,
    },
  };

  // Load fake data based on filter (later replace with API)
  useEffect(() => {
    // Example backend call placeholder:
    // fetch(`/api/analytics?period=${timeFilter}`)
    //   .then(res => res.json())
    //   .then(data => setStats(data));
    setStats(fakeData[timeFilter]);
  }, [timeFilter]);

  const cards = [
    {
      label: "Messages Sent",
      value: stats.messagesSent,
      color: "text-yellow-400",
      icon: <Send className="w-6 h-6 text-yellow-400" />,
      change: "+12% from last month",
    },
    {
      label: "Messages Received",
      value: stats.messagesReceived,
      color: "text-green-400",
      icon: <MessageCircle className="w-6 h-6 text-green-400" />,
      change: "+8% from last month",
    },
    {
      label: "Payments via Chat",
      value: stats.payments,
      color: "text-green-500",
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      change: "+22% from last month",
    },
    {
      label: "Monthly Revenue",
      value: `$${stats.monthlyRevenue}`,
      color: "text-pink-500",
      icon: <BarChart3 className="w-6 h-6 text-pink-500" />,
      change: "+18% from last month",
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue}`,
      color: "text-yellow-400",
      icon: <DollarSign className="w-6 h-6 text-yellow-400" />,
      change: "+12.5% from last month",
    },
    {
      label: "Total Costs",
      value: `$${stats.totalCosts}`,
      color: "text-green-400",
      icon: <FileText className="w-6 h-6 text-green-400" />,
      change: "-8.2% from last month",
    },
    {
      label: "Gross Profit",
      value: `$${stats.grossProfit}`,
      color: "text-blue-400",
      icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
      change: "+15.3% from last month",
    },
    {
      label: "ARPU",
      value: `$${stats.arpu}`,
      color: "text-cyan-400",
      icon: <User className="w-6 h-6 text-cyan-400" />,
      change: "+4.7% from last month",
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
            Last Months
          </button>
          <button
            onClick={() => setTimeFilter("year")}
            className={`px-4 py-1.5 rounded-md border border-gray-600 transition-all ${
              timeFilter === "year"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            Last Years
          </button>
        </div>
      </div>

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
              {card.value?.toLocaleString?.() || card.value}
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

