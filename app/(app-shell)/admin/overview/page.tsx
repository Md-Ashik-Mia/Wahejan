"use client";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import { BsCheckCircleFill, BsExclamationCircleFill, BsXCircleFill } from "react-icons/bs";

interface Channel {
  name: string;
  icon: JSX.Element;
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

export default function ChannelDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate backend data fetching
    const fakeData: Company[] = [
      {
        id: 1,
        name: "TechCorp Inc.",
        alert: "All Channels Online",
        channels: [
          {
            name: "WhatsApp Business",
            icon: <FaWhatsapp className="text-green-500 text-lg" />,
            status: "Online",
            lastUsage: "Just now",
            messagesToday: 147,
          },
          {
            name: "Instagram",
            icon: <FaInstagram className="text-pink-500 text-lg" />,
            status: "Online",
            lastUsage: "Just now",
            messagesToday: 230,
          },
          {
            name: "Facebook",
            icon: <FaFacebook className="text-blue-500 text-lg" />,
            status: "Online",
            lastUsage: "Just now",
            messagesToday: 185,
          },
        ],
      },
      {
        id: 2,
        name: "AlfaCorp Inc.",
        alert: "2 Channel Warning",
        channels: [
          {
            name: "WhatsApp Business",
            icon: <FaWhatsapp className="text-green-500 text-lg" />,
            status: "Online",
            lastUsage: "Just now",
            messagesToday: 147,
          },
          {
            name: "Instagram",
            icon: <FaInstagram className="text-pink-500 text-lg" />,
            status: "Warning",
            lastUsage: "2 hrs ago",
            messagesToday: 120,
          },
          {
            name: "Facebook",
            icon: <FaFacebook className="text-blue-500 text-lg" />,
            status: "Offline",
            lastUsage: "1 hr ago",
            messagesToday: 98,
          },
        ],
      },
    ];

    setCompanies(fakeData);
    setFilteredCompanies(fakeData);
  }, []);

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

  const stats = {
    online: filteredCompanies.reduce(
      (acc, c) => acc + c.channels.filter((ch) => ch.status === "Online").length,
      0
    ),
    offline: filteredCompanies.reduce(
      (acc, c) => acc + c.channels.filter((ch) => ch.status === "Offline").length,
      0
    ),
    warning: filteredCompanies.reduce(
      (acc, c) => acc + c.channels.filter((ch) => ch.status === "Warning").length,
      0
    ),
    total: filteredCompanies.reduce((acc, c) => acc + c.channels.length, 0),
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Admin Control Center</h2>

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
              {company.channels.map((ch, idx) => (
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
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
