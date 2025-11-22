"use client";
import React, { useState } from "react";

const SupportPage: React.FC = () => {
  const [issue, setIssue] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async () => {
    if (!issue.trim()) return alert("Please describe your issue.");

    try {
      setStatus("loading");

      // Simulate sending support ticket (replace with API call)
      await new Promise((res) => setTimeout(res, 1200));

      // Example real API call:
      // await fetch("/api/support", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ issue }),
      // });

      setStatus("success");
      setIssue("");
      setTimeout(() => setStatus("idle"), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black  text-white p-6">
      {/* Page Title */}
      <h1 className="text-xl font-semibold mb-6">Support</h1>

      {/* Support Box (Top Middle Alignment) */}
      <div className="max-w-8xl mx-auto bg-[#272727]  p-6 rounded-xl shadow-lg space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Support</h2>
          <p className="text-gray-400 text-sm">Start a chat or create a ticket</p>
        </div>

        {/* Input and Button */}
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Describe the issue"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="flex-1 bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={status === "loading"}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              status === "loading"
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {status === "loading" ? "Sending..." : "Invite"}
          </button>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <p className="text-green-400 text-sm mt-1">
            ✅ Ticket sent successfully! Our support team will reach out soon.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 text-sm mt-1">
            ❌ Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default SupportPage;

