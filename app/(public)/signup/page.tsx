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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Password Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      toast.error("Password must contain at least one number.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character.");
      toast.error("Password must contain at least one special character.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await api.post("/auth/users/", { name, email, password });
      if (res.status === 201 || res.status === 200) {
        // Save email for OTP step
        localStorage.setItem("signup_email", email);
        toast.success("Signup successful. OTP sent.");
        router.push("/verify");
      } else {
        toast.error(`Signup failed: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message =
        data?.message ||
        data?.detail ||
        data?.error ||
        err?.message ||
        "Signup failed";
      const display = status ? `${status}: ${message}` : message;
      setError(message);
      toast.error(display);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
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
        <div className="relative group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none pr-12 focus:ring-2 focus:ring-blue-500/50 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
        </div>
        <div className="relative group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none pr-12 focus:ring-2 focus:ring-blue-500/50 transition-all"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-white transition-colors z-10 cursor-pointer"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <FaEyeSlash size={20} />
            ) : (
              <FaEye size={20} />
            )}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
        >
          Sign Up
        </button>

        <p className="text-center text-sm text-white/80">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-white"
          >
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
