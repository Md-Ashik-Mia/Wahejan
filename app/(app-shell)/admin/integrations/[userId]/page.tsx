"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye } from "lucide-react";

const UserIntegrationPage = () => {
  const { userId } = useParams();
  const router = useRouter();

  // Fake user data (replace with API data later)
  const user = {
    id: userId,
    name: "Jane Cooper",
    email: "felicia.reid@example.com",
    company: "Louis Vuitton",
  };

  // Fake integration data (status = Active | Inactive | Pending)
  const integrations = [
    { id: 1, name: "Facebook API", desc: "Approve or manage access keys", status: "Pending" },
    { id: 2, name: "WhatsApp API", desc: "Approve or manage access keys", status: "Inactive" },
    { id: 3, name: "Instagram API", desc: "Approve or manage access keys", status: "Pending" },
    { id: 4, name: "Calendar", desc: "Connect to automate Booking", status: "Inactive" },
  ];

  const handleApprove = (apiId: number) => {
    alert(`Approved ${integrations.find((i) => i.id === apiId)?.name}`);
  };

  const handleReject = (apiId: number) => {
    alert(`Rejected ${integrations.find((i) => i.id === apiId)?.name}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-[#272727] rounded-xl p-6 shadow-lg border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <div className="flex gap-8 text-sm font-medium">
            <span className="text-white">{user.name}</span>
            <span className="text-gray-400">{user.email}</span>
            <span className="text-gray-400">{user.company}</span>
          </div>
          <button
            onClick={() => router.push("/admin/integration")}
            className="flex items-center gap-2 border border-blue-600 text-blue-500 hover:bg-blue-600/10 px-4 py-2 rounded-lg active:scale-95 transition-all"
          >
            <Eye className="w-4 h-4" /> View Integrations
          </button>
        </div>

        {/* Integration Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {integrations.map((api) => {
            const inactive = api.status === "Inactive";
            return (
              <div
                key={api.id}
                className={`rounded-xl p-5 border border-gray-700 transition-all duration-200 ${
                  inactive
                    ? "bg-gray-700/40 opacity-60 cursor-not-allowed"
                    : "bg-black/40 hover:scale-[1.02] hover:shadow-md"
                }`}
              >
                <h3 className="text-white font-semibold text-sm mb-1">{api.name}</h3>
                <p className="text-gray-400 text-xs mb-4">{api.desc}</p>
                <div className="flex justify-start gap-3">
                  <button
                    disabled={inactive}
                    onClick={() => handleApprove(api.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      inactive
                        ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 active:scale-95 focus:ring-2 focus:ring-blue-400 text-white"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    disabled={inactive}
                    onClick={() => handleReject(api.id)}
                    className={`px-4 py-1.5 rounded-lg text-sm border font-medium transition-all ${
                      inactive
                        ? "border-gray-600 text-gray-400 cursor-not-allowed"
                        : "border-gray-400 text-gray-300 hover:bg-gray-700/30 active:scale-95 focus:ring-2 focus:ring-gray-500"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserIntegrationPage;
