// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";

// export default function Signup() {
//   const [name, setName] = useState("");
//   const [role, setRole] = useState<"user" | "admin">("user");
//   const router = useRouter();

//   const submit = () => {
//     document.cookie = `role=${role}; path=/`;
//     router.push(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
//   };

//   return (
//     <div className="min-h-screen grid place-items-center">
//       <div className="w-full max-w-md space-y-3">
//         <h1 className="text-2xl font-semibold text-center">Welcome!</h1>
//         <input
//           className="w-full bg-gray-800 px-3 py-2 rounded"
//           placeholder="Enter your name"
//           value={name}
//           onChange={e => setName(e.target.value)}
//         />
//         <select
//           className="w-full bg-gray-800 px-3 py-2 rounded"
//           value={role}
//           onChange={e => setRole(e.target.value as any)}
//         >
//           <option value="user">User</option>
//           <option value="admin">Admin</option>
//         </select>
//         <button onClick={submit} className="w-full bg-blue-600 py-2 rounded">Signup</button>
//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/http/client";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/users/", { email, password });
      if (res.status === 201 || res.status === 200) {
        // Save email for OTP step
        localStorage.setItem("signup_email", email);
        router.push("/verify");
      } else {
        alert(`Signup failed: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      alert("Signup failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-2xl font-bold mb-6">Create Account</h1>
      <form onSubmit={handleSignup} className="w-[350px] space-y-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
