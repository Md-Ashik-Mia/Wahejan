"use client";
import React from "react";
import { useRouter } from "next/navigation";

const AdminIntegrationPage = () => {
  const router = useRouter();

  const apis = [
    { id: 1, name: "Facebook API", description: "Approve or manage access keys" },
    { id: 2, name: "WhatsApp API", description: "Approve or manage access keys" },
    { id: 3, name: "Instagram API", description: "Approve or manage access keys" },
    { id: 4, name: "Calendar", description: "Connect to automate Booking" },
  ];

  const users = [
    { id: 1, name: "Jane Cooper", email: "felicia.reid@example.com", company: "Louis Vuitton" },
    { id: 2, name: "Wade Warren", email: "sara.cruz@example.com", company: "The Walt Disney Company" },
    { id: 3, name: "Jenny Wilson", email: "nathan.roberts@example.com", company: "Bank of America" },
    { id: 4, name: "Guy Hawkins", email: "jackson.graham@example.com", company: "The Walt Disney Company" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-8">
      <div className="bg-[#272727] rounded-xl p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Admin control center</h2>

        {/* ===== API MANAGEMENT ===== */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-10">
          {apis.map((api) => (
            <div
              key={api.id}
              className="bg-black/40 p-5 rounded-xl transition transform hover:scale-[1.02] hover:shadow-md"
            >
              <h3 className="text-white font-medium">{api.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{api.description}</p>
              <div className="flex justify-between">
                <button
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 focus:ring-2 focus:ring-blue-400 text-white px-3 py-1 rounded-lg text-sm font-medium transition-all"
                >
                  All Enable
                </button>
                <button
                  className="border border-red-600 text-red-500 hover:bg-red-600/10 active:scale-95 focus:ring-2 focus:ring-red-400 px-3 py-1 rounded-lg text-sm font-medium transition-all"
                >
                  All Disable
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ===== USER LIST ===== */}
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Company</th>
              <th className="p-3 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-700 hover:bg-gray-700/50 transition"
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.company}</td>
                <td className="p-3 ">
                  <button
                    onClick={() => router.push(`/admin/integrations/${user.id}`)}
                    className="flex items-center justify-center gap-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 active:scale-95 focus:ring-2 focus:ring-gray-400 px-4 py-1 rounded-lg transition-all"
                  >
                    👁️ View Integrations
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminIntegrationPage;
