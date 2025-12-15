"use client";
import React, { useState, useEffect, useRef } from "react";
// import { ChevronDown } from "lucide-react";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  company: string;
  status: "Active" | "Deactive";
}

const UsersPage: React.FC = () => {
  // =======================
  // 🔹 Fake Data (Simulated Backend)
  // =======================
  const fakeUsers: User[] = [
    {
      id: 1,
      name: "Jane Cooper",
      role: "Owner",
      email: "felicia.reid@example.com",
      company: "Louis Vuitton",
      status: "Active",
    },
    {
      id: 2,
      name: "Wade Warren",
      role: "Admin",
      email: "sara.cruz@example.com",
      company: "The Walt Disney Company",
      status: "Active",
    },
    {
      id: 3,
      name: "Jenny Wilson",
      role: "Agent",
      email: "nathan.roberts@example.com",
      company: "Bank of America",
      status: "Deactive",
    },
    {
      id: 4,
      name: "Guy Hawkins",
      role: "Owner",
      email: "jackson.graham@example.com",
      company: "The Walt Disney Company",
      status: "Active",
    },
    {
      id: 5,
      name: "Cody Fisher",
      role: "Admin",
      email: "cody.fisher@example.com",
      company: "Meta Platforms",
      status: "Deactive",
    },
  ];

  // =======================
  // 🔹 State Management
  // =======================
  const [users, setUsers] = useState<User[]>(fakeUsers);
  const [sortStatus, setSortStatus] = useState<"All" | "Active" | "Deactive">(
    "All"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // =======================
  // 🔹 Sorting Handler
  // =======================
  const handleSortStatus = (status: "All" | "Active" | "Deactive") => {
    setSortStatus(status);
    setIsDropdownOpen(false); // auto close dropdown

    if (status === "All") {
      setUsers(fakeUsers);
    } else {
      const filtered = fakeUsers.filter((user) => user.status === status);
      setUsers(filtered);
    }
  };

  // =======================
  // 🔹 Close Dropdown on Outside Click
  // =======================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =======================
  // 🔹 UI Layout
  // =======================
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="bg-[#272727] rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4 relative">
          <h2 className="text-lg font-semibold">Admin control center</h2>

          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Sort by: <span className="font-medium">{sortStatus}</span>
              {/* <ChevronDown
                className={}
              /> */}
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg border border-gray-700 shadow-lg w-36 z-10 animate-fadeIn">
                {["All", "Active", "Deactive"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      handleSortStatus(status as "All" | "Active" | "Deactive")
                    }
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm ${
                      sortStatus === status ? "text-blue-400" : "text-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================== Table ================== */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Email</th>
                <th className="p-3">Company</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-gray-300">{user.role}</td>
                  <td className="p-3 text-gray-300">{user.email}</td>
                  <td className="p-3 text-gray-300">{user.company}</td>
                  <td className="p-3 text-right font-semibold">
                    <span
                      className={
                        user.status === "Active"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="text-center text-gray-400 py-6">
              No users found for selected filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
