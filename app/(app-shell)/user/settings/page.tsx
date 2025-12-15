"use client";
import React, { useState, useEffect } from "react";

const SettingsPage: React.FC = () => {
  // ============================================
  // 🔹 FAKE DATA (Simulating API responses)
  // ============================================
  const fakeUserSettings = {
    notifications: {
      chat: true,
      booking: true,
      payment: true,
      system: true,
      email: true,
    },
    subscriptionPlans: [
      { id: 1, name: "Basic", price: 29, features: ["Up to 10 users", "50GB storage", "Basic analytics", "Email support", "API access", "Custom branding"] },
      { id: 2, name: "Business", price: 59, features: ["Up to 20 users", "100GB storage", "Advanced analytics", "Priority support", "API access", "Custom branding"] },
      { id: 3, name: "Premium", price: 99, features: ["Unlimited users", "1TB storage", "Full analytics", "24/7 support", "API access", "Custom branding"] },
    ],
    activePlan: "Business",
    canceledPlans: [],
    twoFactor: true,
    aiTraining: false,
    sessions: [
      { device: "MacBook Pro • Chrome", ip: "192.168.1.100", location: "San Francisco, CA", time: "Current session", active: true },
      { device: "iPhone • Safari", ip: "192.168.1.101", location: "San Francisco, CA", time: "2 hours ago", active: false },
    ],
  };

  // ============================================
  // 🔹 STATE (Loaded from API normally)
  // ============================================
  const [notifications, setNotifications] = useState(fakeUserSettings.notifications);
  const [plans, setPlans] = useState(fakeUserSettings.subscriptionPlans);
  const [activePlan, setActivePlan] = useState(fakeUserSettings.activePlan);
  const [canceledPlans, setCanceledPlans] = useState<string[]>(fakeUserSettings.canceledPlans);
  const [twoFactor, setTwoFactor] = useState(fakeUserSettings.twoFactor);
  const [aiTraining, setAiTraining] = useState(fakeUserSettings.aiTraining);
  const [sessions, setSessions] = useState(fakeUserSettings.sessions);

  // ============================================
  // 🔹 Fetch user data (commented for now)
  // ============================================
  /*
  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/settings", { method: "GET" });
      const data = await res.json();
      setNotifications(data.notifications);
      setPlans(data.subscriptionPlans);
      setActivePlan(data.activePlan);
      setCanceledPlans(data.canceledPlans);
      setTwoFactor(data.twoFactor);
      setAiTraining(data.aiTraining);
      setSessions(data.sessions);
    }
    fetchSettings();
  }, []);
  */

  // ============================================
  // 🔹 Handlers
  // ============================================
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    // TODO: PATCH /api/settings/notifications
  };

  const handleCancelPlan = (plan: string) => {
    if (canceledPlans.includes(plan)) {
      setCanceledPlans((prev) => prev.filter((p) => p !== plan));
    } else {
      setCanceledPlans((prev) => [...prev, plan]);
    }
    // TODO: PATCH /api/subscription/cancel
  };

  const handleUpgradePlan = (plan: string) => {
    setActivePlan(plan);
    setCanceledPlans((prev) => prev.filter((p) => p !== plan));
    // TODO: POST /api/subscription/upgrade
  };

  // ============================================
  // 🔹 RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      {/* ================= NOTIFICATIONS ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="bg-[#272727]  rounded-xl p-6 grid md:grid-cols-2 gap-6 shadow-lg">
          <div>
            <h3 className="font-semibold mb-3">Language Settings</h3>
            {[
              { label: "New Chat Messages", key: "chat" },
              { label: "New Booking / Appointment", key: "booking" },
              { label: "Payment Confirmation", key: "payment" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-gray-700/50 rounded-lg transition-all"
              >
                <span>{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                  />
                  <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                  <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
                </label>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-gray-700/50 rounded-lg transition-all">
              <span>Integration or System Issues</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.system}
                  onChange={() => toggleNotification("system")}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
              </label>
            </div>
            <h3 className="font-semibold mt-4 mb-2">Channel Preferences</h3>
            <div className="flex justify-between items-center py-2 border-b border-gray-700 hover:bg-gray-700/50 rounded-lg transition-all">
              <span className="flex items-center gap-2">📧 Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications.email}
                  onChange={() => toggleNotification("email")}
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
                <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUBSCRIPTION ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isActive = plan.name === activePlan;
            const isCanceled = canceledPlans.includes(plan.name);

            return (
              <div
                key={plan.id}
                className={`bg-[#272727] p-6 rounded-xl border transition-all ${
                  isActive && !isCanceled
                    ? "border-blue-500 shadow-lg scale-[1.02]"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-blue-400 font-semibold">
                    ${plan.price}/<span className="text-sm">month</span>
                  </p>
                </div>

                <p className="text-gray-400 text-sm mb-3">
                  {plan.name === "Basic"
                    ? "Perfect for small teams"
                    : plan.name === "Business"
                    ? "Ideal for growing businesses"
                    : "For enterprises with advanced needs"}
                </p>

                <ul className="text-gray-300 text-sm space-y-1 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>

                {/* Conditional Button Logic */}
                {isActive && !isCanceled ? (
                  <>
                    <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition">
                      Active Plan
                    </button>
                    <button
                      onClick={() => handleCancelPlan(plan.name)}
                      className="w-full mt-2 py-2 rounded-lg bg-red-700 hover:bg-red-800 active:scale-95 transition"
                    >
                      Cancel Plan
                    </button>
                  </>
                ) : isActive && isCanceled ? (
                  <button
                    onClick={() => handleCancelPlan(plan.name)}
                    className="w-full py-2 rounded-lg bg-gray-700 hover:bg-blue-700 active:scale-95 transition"
                  >
                    Upgrade Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgradePlan(plan.name)}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition"
                  >
                    Upgrade Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Security</h2>
        <div className="bg-[#272727] rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div>
              <h4 className="font-semibold">Change Password</h4>
              <p className="text-gray-400 text-sm">Update your password</p>
            </div>
            <button className="bg-blue-600 px-4 py-1 rounded-lg text-sm hover:bg-blue-700 active:scale-95 transition">
              Change
            </button>
          </div>

          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div>
              <h4 className="font-semibold">Two-Factor Authentication</h4>
              <p className="text-gray-400 text-sm">Add extra security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={twoFactor}
                onChange={() => setTwoFactor(!twoFactor)}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
            </label>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Active Sessions</h4>
            <div className="space-y-2 text-sm">
              {sessions.map((s, i) => (
                <div key={i} className="flex justify-between bg-gray-700 p-3 rounded-lg hover:bg-gray-600/70 transition">
                  <div>
                    <p>{s.device}</p>
                    <p className="text-gray-400">
                      {s.ip} • {s.location} • {s.time}
                    </p>
                  </div>
                  {s.active ? (
                    <span className="text-green-400 text-xs self-center">Active</span>
                  ) : (
                    <button className="text-red-400 text-xs hover:text-red-300 transition">Logout</button>
                  )}
                </div>
              ))}
              <button className="mt-3 bg-red-700 px-4 py-2 rounded-lg text-sm hover:bg-red-800 active:scale-95 transition">
                Logout from all devices
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DATA & PRIVACY ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Data & Privacy</h2>
        <div className="bg-gray-800 rounded-xl p-6 space-y-4 shadow-lg">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div>
              <h4 className="font-semibold">Export My Data</h4>
              <p className="text-gray-400 text-sm">Download all your data</p>
            </div>
            <button className="bg-blue-600 px-4 py-1 rounded-lg text-sm hover:bg-blue-700 active:scale-95 transition">
              Export
            </button>
          </div>

          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <div>
              <h4 className="font-semibold">AI Training Data</h4>
              <p className="text-gray-400 text-sm">Allow anonymized data for AI</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={aiTraining}
                onChange={() => setAiTraining(!aiTraining)}
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
              <div className="absolute left-[2px] top-[2px] h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
            </label>
          </div>

          <div className="flex justify-between items-center bg-red-950 border border-red-700 p-3 rounded-lg hover:bg-red-900/70 transition">
            <div>
              <h4 className="font-semibold text-red-400">Delete Account</h4>
              <p className="text-gray-400 text-sm">Permanently delete your account</p>
            </div>
            <button className="bg-red-700 px-4 py-1 rounded-lg text-sm hover:bg-red-800 active:scale-95 transition">
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
