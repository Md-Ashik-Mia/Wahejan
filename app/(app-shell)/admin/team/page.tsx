"use client";
import React, { useEffect, useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: string;
  lastLogin: string;
  newUsers: number;
  invoiceDownload: string;
  payments: string;
  avatar: string;
}

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Simulated backend fetch (comment out when integrating real API)
  useEffect(() => {
    const fakeData: TeamMember[] = [
      {
        id: 1,
        name: "John Doe",
        role: "Owner & CEO",
        status: "Active",
        lastLogin: "Today, 09:24 AM",
        newUsers: 5,
        invoiceDownload: "Tuesday, 09:24 AM",
        payments: "Monday, 09:24 AM",
        avatar: "https://i.pravatar.cc/100?img=1",
      },
      {
        id: 2,
        name: "Jane Smith",
        role: "Admin & HR",
        status: "Active",
        lastLogin: "Today, 08:45 AM",
        newUsers: 3,
        invoiceDownload: "Monday, 11:30 AM",
        payments: "Sunday, 09:00 AM",
        avatar: "https://i.pravatar.cc/100?img=2",
      },
      {
        id: 3,
        name: "Robert Brown",
        role: "Finance Head",
        status: "Inactive",
        lastLogin: "Yesterday, 05:10 PM",
        newUsers: 2,
        invoiceDownload: "Friday, 02:00 PM",
        payments: "Friday, 10:00 AM",
        avatar: "https://i.pravatar.cc/100?img=3",
      },
    ];

    setTeamMembers(fakeData);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <h2 className="text-xl font-semibold">Admin Control Center</h2>
      <h3 className="text-lg font-medium">Team Members</h3>

      <div className="grid md:grid-cols-1 gap-6">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="bg-[#272727]  p-5 rounded-xl shadow-md hover:bg-gray-750 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-600"
                />
                <div>
                  <p className="font-semibold text-base">{member.name}</p>
                  <p className="text-gray-400 text-sm">{member.role}</p>
                </div>
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  member.status === "Active"
                    ? "bg-green-900/40 text-green-400"
                    : "bg-red-900/40 text-red-400"
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <p className="text-sm font-medium mb-2">Activity</p>
              <div className="text-gray-300 text-sm space-y-1">
                <div className="flex justify-between border-b border-gray-700 py-1">
                  <span>Last Login</span>
                  <span className="text-gray-400">{member.lastLogin}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 py-1">
                  <span>New User Add</span>
                  <span className="text-gray-400">{member.newUsers}</span>
                </div>
                <div className="flex justify-between border-b border-gray-700 py-1">
                  <span>Invoice Download</span>
                  <span className="text-gray-400">{member.invoiceDownload}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Payments</span>
                  <span className="text-gray-400">{member.payments}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
