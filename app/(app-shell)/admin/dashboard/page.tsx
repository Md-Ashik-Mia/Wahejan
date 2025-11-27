// "use client";
// import { adminApi } from "@/lib/http/client";
// import React, { useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// import axios from "axios";

// const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY0ODc0MzEwLCJpYXQiOjE3NjQyNjk1MTAsImp0aSI6ImVlMzU5NmY2NzFjZTRmZjNhNjk3NDBkNWIzNjczNThhIiwidXNlcl9pZCI6MX0.0utZf7u5QXcvmFuAnCxuS3BervNNrZnFuk2BxvyS7Kw"


// const api = axios.create({
//   baseURL: "https://ape-in-eft.ngrok-free.app/api", // common base URL
//   headers: {
//     Authorization: `Bearer ${API_TOKEN}`,
//     "Content-Type": "application/json",
//     Accept: "application/json",
//   },
// });





// const AdminDashboard: React.FC = () => {
//   // ==============================
//   // 🔹 Fake Dashboard Data (Replace with API Later)
//   // ==============================
//   const [dashbaboardData, setDashboardData] = useState(null);
// useEffect(() => {
//   const fetchDashboard = async () => {
//     try {
//       const response = await api.get("/admin/dashboard/");
//       console.log("Dashboard data:", response.data);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           // Server responded with non 2xx
//           console.error("Error status:", error.response.status);
//           console.error("Error data:", error.response.data);
//         } else if (error.request) {
//           // No response received
//           console.error("No response received:", error.request);
//         } else {
//           // Something else (e.g. setup)
//           console.error("Request error:", error.message);
//         }
//       } else {
//         // Non-Axios/unknown error
//         console.error("Unexpected error:", error);
//       }
//     }
//   };



// const fetchDashboardAdminApi = async () => {
//     try {
//       const response = await adminApi.get("/admin/dashboard/");
//       console.log("Dashboard data:", response.data);
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         if (error.response) {
//           // Server responded with non 2xx
//           console.error("Error status:", error.response.status);
//           console.error("Error data:", error.response.data);
//         } else if (error.request) {
//           // No response received
//           console.error("No response received:", error.request);
//         } else {
//           // Something else (e.g. setup)
//           console.error("Request error:", error.message);
//         }
//       } else {
//         // Non-Axios/unknown error
//         console.error("Unexpected error:", error);
//       }
//     }
//   };




//   fetchDashboard();
//   fetchDashboardAdminApi();

// }, []);




//   const summaryStats = {
//     totalUsers: "1,023",
//     activeIntegrations: 20,
//     addIncome: "$10,230",
//     netProfit: "$99.99",
//     newCompanies: 513,
//     costs: "$952",
//   };

//   const chartData = [
//     { month: "Jan", users: 2000, revenue: 2400, cost: 1500 },
//     { month: "Feb", users: 4000, revenue: 4200, cost: 2500 },
//     { month: "Mar", users: 7000, revenue: 6800, cost: 3900 },
//     { month: "Apr", users: 9000, revenue: 7600, cost: 4200 },
//     { month: "May", users: 10500, revenue: 8900, cost: 5000 },
//     { month: "Jun", users: 12000, revenue: 11000, cost: 6200 },
//     { month: "Jul", users: 13500, revenue: 12500, cost: 7000 },
//   ];

//   const openTickets = [
//     {
//       id: "#TK-4821",
//       subject: "Payment gateway not processing transactions",
//       priority: "High",
//       status: "In Process",
//       time: "2 hours ago",
//     },
//     {
//       id: "#TK-4819",
//       subject: "User login issues after system update",
//       priority: "Medium",
//       status: "In Process",
//       time: "4 hours ago",
//     },
//     {
//       id: "#TK-4820",
//       subject: "Dashboard charts not loading correctly",
//       priority: "Low",
//       status: "Open",
//       time: "6 hours ago",
//     },
//     {
//       id: "#TK-4822",
//       subject: "Email notifications delayed",
//       priority: "Low",
//       status: "Open",
//       time: "6 hours ago",
//     },
//   ];

//   // ==============================
//   // 🔹 Utility Components
//   // ==============================
//   const Badge = ({ text, type }: { text: string; type: string }) => {
//     const colors: Record<string, string> = {
//       High: "bg-red-700 text-red-100",
//       Medium: "bg-yellow-600 text-yellow-100",
//       Low: "bg-blue-700 text-blue-100",
//       Open: "bg-blue-700 text-blue-100",
//       "In Process": "bg-orange-700 text-orange-100",
//     };
//     return (
//       <span className={`px-3 py-1 text-xs rounded-lg font-medium ${colors[type] || "bg-gray-600"}`}>
//         {text}
//       </span>
//     );
//   };

//   // ==============================
//   // 🔹 Main Layout
//   // ==============================
//   return (
//     <div className="min-h-screen bg-black text-white p-6 space-y-10">
//       <h1 className="text-xl font-semibold">Admin control center</h1>

//       {/* ======================= Summary Cards ======================= */}
//       <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">Total Users</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.totalUsers}</p>
//         </div>
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">Active Integrations</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.activeIntegrations}</p>
//         </div>
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">Add Income</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.addIncome}</p>
//         </div>
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">Net Profit this month</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.netProfit}</p>
//         </div>
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">New Companies</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.newCompanies}</p>
//         </div>
//         <div className="bg-[#272727] p-5 rounded-xl shadow-lg">
//           <p className="text-gray-400 text-sm mb-1">Costs</p>
//           <p className="text-2xl font-semibold text-blue-400">{summaryStats.costs}</p>
//         </div>
//       </div>

//       {/* ======================= Analytics Chart ======================= */}
//       <div className="bg-[#272727] p-6 rounded-xl shadow-lg">
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={chartData}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#444" />
//             <XAxis dataKey="month" stroke="#ccc" />
//             <YAxis stroke="#ccc" />
//             <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px" }} />
//             <Legend />
//             <Line type="monotone" dataKey="users" stroke="#38bdf8" strokeWidth={2} name="Users" />
//             <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} name="Revenue" />
//             <Line type="monotone" dataKey="cost" stroke="#facc15" strokeWidth={2} name="Cost" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* ======================= Support Tickets ======================= */}
//       <div>
//         <h2 className="text-lg font-semibold mb-3">Open Support Tickets</h2>
//         <div className="bg-[#272727] rounded-xl p-6 shadow-lg overflow-x-auto">
//           <table className="w-full text-sm text-left border-collapse">
//             <thead className="text-gray-400 border-b border-gray-700">
//               <tr>
//                 <th className="p-3">ID</th>
//                 <th className="p-3">Subject</th>
//                 <th className="p-3">Priority</th>
//                 <th className="p-3">Status</th>
//                 <th className="p-3 text-right">Created</th>
//               </tr>
//             </thead>
//             <tbody>
//               {openTickets.map((ticket) => (
//                 <tr
//                   key={ticket.id}
//                   className="border-b border-gray-700 hover:bg-gray-700/50 transition"
//                 >
//                   <td className="p-3 font-medium">{ticket.id}</td>
//                   <td className="p-3 text-gray-300">{ticket.subject}</td>
//                   <td className="p-3">
//                     <Badge text={ticket.priority} type={ticket.priority} />
//                   </td>
//                   <td className="p-3">
//                     <Badge text={ticket.status} type={ticket.status} />
//                   </td>
//                   <td className="p-3 text-right text-gray-400">{ticket.time}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;






























"use client";

import { adminApi } from "@/lib/http/client";
import React, { useEffect, useState } from "react";
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
import axios from "axios";

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
  month: string;   // "January", "February", ...
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

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Fetch admin dashboard only when this page renders
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminApi.get<DashboardData>("/admin/dashboard/");
        console.log("Dashboard data:", response.data);
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response) {
            console.error("Error status:", err.response.status);
            console.error("Error data:", err.response.data);
            setError(
              `Failed to load dashboard (${err.response.status}). Check auth/token.`
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
  }, []);

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
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Created</th>
              </tr>
            </thead>
            <tbody>
              {openTickets.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
                  <td className="p-3">
                    <Badge text={ticket.status} />
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
