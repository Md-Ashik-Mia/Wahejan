"use client";

import { api } from "@/lib/http/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function VerifyPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("signup_email");
    if (!saved) {
      router.push("/signup");
    } else {
      setEmail(saved);
    }
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/verify-otp/", {
        email,
        otp,
      });
      if (res.status === 200) {
        localStorage.removeItem("signup_email");
        toast.success("Email verified. Please review policy before login.");
        router.push("/policy");
      } else {
        toast.error("Invalid code");
      }
    } catch (err: any) {
      console.error("Verify error:", err.response?.data || err.message);
      toast.error("Verification failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <ToastContainer position="top-right" autoClose={2500} theme="dark" />
      <h1 className="text-2xl font-bold mb-6">Verify Your Account</h1>
      <form onSubmit={handleVerify} className="w-[300px] space-y-3">
        <p className="text-sm text-gray-400">
          We sent a code to <span className="text-blue-400">{email}</span>
        </p>
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full bg-[#1e2837] px-4 py-3 rounded-md outline-none text-center tracking-[0.3em]"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-[#0B57D0] hover:bg-[#0843a8] py-3 rounded-md font-semibold"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
