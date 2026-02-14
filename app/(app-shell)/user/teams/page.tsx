"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react"

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
}

const TeamPage: React.FC = () => {
  // ===========================
  // 🔹 FAKE DATA (Simulating API Response)
  // ===========================
  const fakeUsers: User[] = [
    { id: 1, name: "Jane Cooper", email: "felicia.reid@example.com", company: "TechVerse Inc", role: "Owner" },
    { id: 2, name: "Wade Warren", email: "sara.cruz@example.com", company: "TechVerse Inc", role: "Support" },
    { id: 3, name: "Jenny Wilson", email: "nathan.roberts@example.com", company: "TechVerse Inc", role: "Owner" },
    { id: 4, name: "Guy Hawkins", email: "jackson.graham@example.com", company: "TechVerse Inc", role: "Finance" },
  ];

  const roles = ["Owner", "Finance", "Support", "Analyst", "Read-only"];

  // ===========================
  // 🔹 STATE
  // ===========================
  const [users, setUsers] = useState<User[]>(fakeUsers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Owner");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // ===========================
  // 🔹 Simulated Data Fetch (Replace with API)
  // ===========================
  /*
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch("/api/team", { method: "GET" });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          setUsers(fakeUsers); // fallback
        }
      } catch {
        setUsers(fakeUsers); // fallback
      }
    }
    fetchTeam();
  }, []);
  */

  // ===========================
  // 🔹 Invite Handler
  // ===========================
  const handleInvite = () => {
    if (!inviteEmail.trim()) return alert("Please enter an email address.");

    const newUser: User = {
      id: Date.now(),
      name: inviteEmail.split("@")[0].replace(/\./g, " "),
      email: inviteEmail,
      company: "TechVerse Inc",
      role: inviteRole,
    };

    setUsers((prev) => [...prev, newUser]);
    setInviteEmail("");

    // TODO: POST /api/team/invite
  };

  // ===========================
  // 🔹 Role Update Handler
  // ===========================
  const handleRoleUpdate = (id: number, newRole: string) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role: newRole } : user)));
    // TODO: PATCH /api/team/update-role
  };

  // ===========================
  // 🔹 Delete User Handlers
  // ===========================
  const confirmDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (userToDelete) {
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      // TODO: DELETE /api/team/:id
    }
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // ===========================
  // 🔹 RBAC Table Data
  // ===========================
  const permissions = [
    { name: "View Dashboard", roles: ["Owner", "Finance", "Support", "Analyst", "Read-only"] },
    { name: "Manage Users", roles: ["Owner"] },
    { name: "Financial Data", roles: ["Owner", "Finance"] },
    { name: "Customer Support", roles: ["Support"] },
    { name: "Billing & Invoices", roles: ["Owner", "Finance"] },
    { name: "Analytics & Reports", roles: ["Owner", "Analyst"] },
    { name: "System Settings", roles: ["Owner"] },
    { name: "API Management", roles: ["Owner"] },
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
            className="flex-1 bg-gray-700 p-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="bg-gray-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {roles.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={handleInvite}
            className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition"
          >
            Invite
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
                  <th key={role} className="p-3 text-center">
                    {role}
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
                <th className="p-3 text-center">Action</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3 text-gray-300">{user.email}</td>
                  <td className="p-3 text-gray-300">{user.company}</td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center">
                    <button className="bg-blue-600 px-4 py-1 rounded-lg text-sm hover:bg-blue-700 active:scale-95 transition">
                      Update
                    </button>
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
              ))}
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

