"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const router = useRouter();

  const submit = async () => {
    // demo auth: set a cookie
    document.cookie = `role=${role}; path=/`;
    router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md space-y-3">
        <h1 className="text-2xl font-semibold text-center">Welcome Back!</h1>
        <input
          className="w-full bg-gray-800 px-3 py-2 rounded"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <select
          className="w-full bg-gray-800 px-3 py-2 rounded"
          value={role}
          onChange={e => setRole(e.target.value as any)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={submit} className="w-full bg-blue-600 py-2 rounded">Log in</button>
      </div>
    </div>
  );
}
