"use client";
import { userApi } from "@/lib/http/client";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface User {
  id: number;
  email: string;
  roles: string[];
  permissions?: string[];
  name?: string; // Fallback or derived
  company?: string; // Fallback or derived
}

const TeamPage: React.FC = () => {
  const roles = ["owner", "finance", "support", "analyst", "read_only"];

  // ===========================
  // 🔹 STATE
  // ===========================
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("finance");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // ===========================
  // 🔹 Fetch Employees
  // ===========================
  const fetchTeam = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await userApi.get("/auth/company/employee/");
      if (res.data && res.data.employees) {
        setUsers(res.data.employees);
      }
    } catch (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team members.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  // ===========================
  // 🔹 Invite Handler
  // ===========================
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setInviteLoading(true);
    const toastId = toast.loading("Sending invitation...");

    try {
      await userApi.post("/auth/company/employee/", {
        email: inviteEmail.trim(),
        roles: [inviteRole],
      });

      toast.success("Invitation sent successfully!", { id: toastId });
      setInviteEmail("");
      setInviteRole("finance");
      fetchTeam(true); // Refresh list
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send invitation.";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setInviteLoading(false);
    }
  };

  // ===========================
  // 🔹 Role Update Handler
  // ===========================
  const handleRoleUpdate = async (id: number, newRole: string) => {
    const toastId = toast.loading("Updating permissions...");
    try {
      await userApi.post(`/auth/company/employee/update-permissions/${id}/`, {
        roles: [newRole],
      });
      toast.success("Permissions updated successfully!", { id: toastId });
      fetchTeam(true); // Refresh list
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error("Failed to update permissions.", { id: toastId });
    }
  };

  // ===========================
  // 🔹 Delete User Handlers
  // ===========================
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    const toastId = toast.loading("Deleting employee...");
    try {
      await userApi.delete(`/auth/company/employee/update-permissions/${userToDelete.id}/`);
      toast.success("Employee deleted successfully!", { id: toastId });
      fetchTeam(true); // Refresh list
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee.", { id: toastId });
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // ===========================
  // 🔹 RBAC Table Data
  // ===========================
  const permissions = [
    { name: "View Dashboard", roles: ["owner", "finance", "support", "analyst", "read_only"] },
    { name: "Manage Users", roles: ["owner"] },
    { name: "Financial Data", roles: ["owner", "finance", "analyst", "read_only"] },
    { name: "Customer Support", roles: ["support"] },
    { name: "Billing & Invoices", roles: ["owner", "finance", "support", "read_only"] },
    { name: "Analytics & Reports", roles: ["analyst", "read_only"] },
    { name: "System Settings", roles: ["owner", "finance"] },
    { name: "API Management", roles: ["owner", "support"] },
  ];

const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-white">Loading...</p>;
  }

  const permission = session?.user?.permissions?.[0]?.toLowerCase();

  const blockedRoles = ["support", "finance", "read_only","analyst"];

  if (blockedRoles.includes(permission)) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-6">
      <div className="max-w-md w-full bg-[#1f1f1f]/80 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-2xl p-8 text-center">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-500/20">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white mb-2">
          Access Restricted
        </h1>

        {/* Description */}
        <p className="text-gray-400 mb-6">
          You don’t have permission to view this page. Please contact your administrator if you believe this is a mistake.
        </p>

        {/* Button */}
        <button
          onClick={() => window.history.back()}
          className="w-full bg-blue-600 hover:bg-blue-700 transition px-5 py-3 rounded-lg font-medium"
        >
          Go Back
        </button>

      </div>
    </div>;
  }
return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      {/* ================= Team & Permissions ================= */}
      <section className="bg-[#272727] rounded-xl p-6 shadow-lg space-y-4">
        <h2 className="text-lg font-semibold">Team & Permissions</h2>
        <p className="text-gray-400 text-sm">Invite teammates and assign roles</p>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            placeholder="Email address here"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={inviteLoading}
            className="flex-1 bg-gray-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            disabled={inviteLoading}
            className="bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="capitalize">{r.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            onClick={handleInvite}
            disabled={inviteLoading}
            className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {inviteLoading ? "Sending..." : "Invite"}
          </button>
        </div>
      </section>

      {/* ================= Role-Based Access Control (Static Table) ================= */}
      <section className="bg-[#272727] rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Role-Based Access Control (RBAC)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="p-3 text-center capitalize">
                    {role.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm.name} className="border-b border-gray-700 hover:bg-gray-700/40">
                  <td className="p-3">{perm.name}</td>
                  {roles.map((role) => (
                    <td key={role} className="p-3 text-center">
                      {perm.roles.includes(role) ? (
                        <span className="text-green-400 text-lg">✓</span>
                      ) : (
                        <span className="text-red-500 text-lg">✗</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= Role-based Admin ================= */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Set Role-based Admin</h3>
        <div className="bg-[#272727] rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Company</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">Loading team members...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">No team members found.</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition">
                    <td className="p-3 capitalize">{user.name || user.email.split("@")[0].replace(/\./g, " ")}</td>
                    <td className="p-3 text-gray-300">{user.email}</td>
                    <td className="p-3 text-gray-300">{user.company || "VerseAI Inc"}</td>
                    <td className="p-3">
                      <select
                        value={user.roles[0]}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        className="bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 capitalize"
                      >
                        {roles.map((r) => (
                          <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => confirmDelete(user)}
                        className="bg-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-700 active:scale-95 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ================= Delete Confirmation Modal ================= */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-80 text-center">
            <h4 className="text-lg font-semibold mb-2">Confirm Delete</h4>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete <span className="text-white font-medium">{userToDelete.name}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;


// "use client";
// import { useSession } from "next-auth/react";

// export default function MyProfilePage() {
//   const { data: session, status } = useSession();
//   console.log(session);
//   if (status === "loading") return <p>Loading...</p>;
//   if (!session) return <p>You are not logged in.</p>;

//   return (
//     <div>
//       <h1>Welcome, {session.user?.name}</h1>
//       <p>Email: {session.user?.email}</p>
//       <p>Role: {session.user?.role}</p>
//       <p>Active Plan: {session.user?.hasPlan ? "Yes" : "No"}</p>
//       <p>Permissions: {session.user?.permissions[0]}</p>

//       {/* The Access Token for API calls */}
//       <p>Token: {(session as any).accessToken}</p>
//     </div>
//   );
// }

