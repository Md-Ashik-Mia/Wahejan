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

import { api } from "@/lib/http/client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/users/", { name, email, password });
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
          type="text"
          placeholder="Enter your name"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none"
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none pr-10"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-white/80">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-white">
            Log in
          </Link>
        </p>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/login" })}
          className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full"
        >
          <FaGoogle className="text-lg" aria-hidden="true" />
          Continue with Google
        </button>
      </form>
    </div>
  );
}
