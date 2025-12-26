"use client";
import React, { useState, useEffect, useRef } from "react";
// import { ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import { adminApi } from "@/lib/http/client";
import axios from "axios";

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  company: string;
  status: "Active" | "Deactive";
}

type ApiUser = {
  id?: number;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
  is_active?: boolean;
  company_name?: string | null;
  company?: { name?: string | null } | string | null;
};

function normalizeStatus(isActive: unknown): "Active" | "Deactive" {
  return isActive === true ? "Active" : "Deactive";
}

function getCompanyName(u: ApiUser): string {
  const companyName = (u.company_name ?? "").toString();
  if (companyName) return companyName;

  const company = u.company;
  if (!company) return "";
  if (typeof company === "string") return company;
  if (typeof company === "object" && typeof company.name === "string") return company.name;
  return "";
}

function mapApiUser(u: ApiUser): User {
  const id = typeof u.id === "number" ? u.id : 0;
  const name = (u.name ?? u.username ?? "").toString();
  const email = (u.email ?? "").toString();
  const role = (u.role ?? "").toString();
  const company = getCompanyName(u);
  const status = normalizeStatus(u.is_active);
  return { id, name, role, email, company, status };
}

const UsersPage: React.FC = () => {
  // =======================
  // 🔹 State Management
  // =======================
  const { data: session, status: sessionStatus } = useSession();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sortStatus, setSortStatus] = useState<"All" | "Active" | "Deactive">(
    "All"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =======================
  // 🔹 Fetch Users from Backend
  // =======================
  useEffect(() => {
    if (sessionStatus === "loading") return;

    const accessToken = (session as unknown as { accessToken?: string } | null)?.accessToken;
    if (!accessToken) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await adminApi.get("/admin/users/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = res.data;
        const list: ApiUser[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const mapped = list.map(mapApiUser).filter((u) => u.id !== 0);
        setAllUsers(mapped);

        // apply current filter
        if (sortStatus === "All") {
          setUsers(mapped);
        } else {
          setUsers(mapped.filter((u) => u.status === sortStatus));
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setError(code ? `Failed to load users (${code}).` : "Failed to load users.");
        } else {
          setError("Failed to load users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionStatus]);

  // =======================
  // 🔹 Sorting Handler
  // =======================
  const handleSortStatus = (status: "All" | "Active" | "Deactive") => {
    setSortStatus(status);
    setIsDropdownOpen(false); // auto close dropdown

    if (status === "All") {
      setUsers(allUsers);
    } else {
      const filtered = allUsers.filter((user) => user.status === status);
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

        {loading ? (
          <p className="text-gray-400 py-6">Loading users...</p>
        ) : error ? (
          <p className="text-red-400 py-6">{error}</p>
        ) : null}

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

          {!loading && !error && users.length === 0 && (
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
