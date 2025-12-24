"use client";
import { userApi } from "@/lib/http/client";
import React, { useCallback, useEffect, useState } from "react";

type ApiPlan = {
  id: number;
  name: string;
  duration: string;
  price: string | number;
  msg_limit: number;
  user_limit: number;
  token_limit: number;
};

type ApiActiveSubscription = {
  id: number;
  company: number;
  plan: number;
  plan_name: string;
  plan_duration: string;
  plan_price: string | number;
  start: string;
  end: string;
  auto_renew: boolean;
  active: boolean;
};

type CreateSubscriptionResponse = {
  redirect_url?: string;
};

const SettingsPage: React.FC = () => {
  const getStatusCode = useCallback((error: unknown): number | null => {
    if (!error || typeof error !== "object") return null;
    const errObj = error as Record<string, unknown>;
    const response = errObj["response"];
    if (!response || typeof response !== "object") return null;
    const respObj = response as Record<string, unknown>;
    const status = respObj["status"];
    return typeof status === "number" ? status : null;
  }, []);

  const getErrorMessage = useCallback((error: unknown): string => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      const errObj = error as Record<string, unknown>;
      const response = errObj["response"];
      if (response && typeof response === "object") {
        const respObj = response as Record<string, unknown>;
        const status = respObj["status"];
        const data = respObj["data"];
        // Common API shapes
        if (typeof data === "string" && data.trim().length > 0) {
          return typeof status === "number" ? `${status}: ${data}` : data;
        }
        if (data && typeof data === "object") {
          const dataObj = data as Record<string, unknown>;
          const detail = dataObj["detail"] ?? dataObj["message"];
          if (typeof detail === "string" && detail.trim().length > 0) {
            return typeof status === "number" ? `${status}: ${detail}` : detail;
          }

          // DRF-style field errors (e.g. { plan_id: ["..."] })
          try {
            const json = JSON.stringify(dataObj);
            if (json && json !== "{}") {
              return typeof status === "number" ? `${status}: ${json}` : json;
            }
          } catch {
            // ignore
          }
        }
      }
      const message = errObj["message"];
      if (typeof message === "string" && message.trim().length > 0) return message;
    }
    return "Failed to load subscription plans";
  }, []);

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
    activePlan: null as string | null,
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
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState(fakeUserSettings.activePlan);
  const [activeSubscription, setActiveSubscription] = useState<ApiActiveSubscription | null>(null);
  const [activeSubscriptionLoading, setActiveSubscriptionLoading] = useState(true);
  const [activeSubscriptionError, setActiveSubscriptionError] = useState<string | null>(null);
  const [upgradeLoadingPlanId, setUpgradeLoadingPlanId] = useState<number | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [canceledPlans, setCanceledPlans] = useState<string[]>(fakeUserSettings.canceledPlans);
  const [twoFactor, setTwoFactor] = useState(fakeUserSettings.twoFactor);
  const [aiTraining, setAiTraining] = useState(fakeUserSettings.aiTraining);
  const [sessions] = useState(fakeUserSettings.sessions);

  const loadActiveSubscription = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) {
      setActiveSubscriptionLoading(true);
      setActiveSubscriptionError(null);
    }
    try {
      let res;
      try {
        res = await userApi.get<ApiActiveSubscription[]>("/finance/check-plan/");
      } catch (error: unknown) {
        if (getStatusCode(error) === 404) {
          res = await userApi.get<ApiActiveSubscription[]>("/api/finance/check-plan/");
        } else {
          throw error;
        }
      }

      const list = Array.isArray(res.data) ? res.data : [];
      const active = list.find((x) => x?.active) ?? null;
      setActiveSubscription(active);
      setActivePlan(active?.plan_name ?? null);
    } catch (error: unknown) {
      setActiveSubscriptionError(getErrorMessage(error));
    } finally {
      if (!silent) setActiveSubscriptionLoading(false);
    }
  }, [getErrorMessage, getStatusCode]);

  // ============================================
  // 🔹 Fetch subscription plans
  // ============================================
  useEffect(() => {
    let cancelled = false;

    async function fetchPlans() {
      setPlansLoading(true);
      setPlansError(null);
      try {
        // Some environments set NEXT_PUBLIC_API_BASE_URL with or without the trailing `/api`.
        // Try both paths so this page works in either configuration.
        let res;
        try {
          res = await userApi.get<ApiPlan[]>("/finance/plans/");
        } catch (error: unknown) {
          if (getStatusCode(error) === 404) {
            res = await userApi.get<ApiPlan[]>("/api/finance/plans/");
          } else {
            throw error;
          }
        }

        const data = res.data;
        if (!cancelled) setPlans(Array.isArray(data) ? data : []);
      } catch (error: unknown) {
        if (!cancelled) setPlansError(getErrorMessage(error));
      } finally {
        if (!cancelled) setPlansLoading(false);
      }
    }

    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, [getErrorMessage, getStatusCode]);

  // ============================================
  // 🔹 Fetch active subscription
  // ============================================
  useEffect(() => {
    let cancelled = false;

    async function fetchActiveSubscription() {
      if (cancelled) return;
      await loadActiveSubscription();
    }

    fetchActiveSubscription();
    return () => {
      cancelled = true;
    };
  }, [loadActiveSubscription]);

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

  const handleUpgradePlan = async (plan: ApiPlan) => {
    setUpgradeError(null);
    setUpgradeLoadingPlanId(plan.id);
    try {
      const payload = {
        plan_id: plan.id,
        auto_renew: true,
      };

      try {
        const res = await userApi.post<CreateSubscriptionResponse>(
          "/finance/create-subscriptions/",
          payload,
          {
            validateStatus: (status) => status >= 200 && status < 400,
          }
        );
        const redirectUrl = res.data?.redirect_url;
        if (typeof redirectUrl === "string" && redirectUrl.trim().length > 0) {
          window.location.assign(redirectUrl);
          return;
        }
      } catch (error: unknown) {
        if (getStatusCode(error) === 404) {
          const res = await userApi.post<CreateSubscriptionResponse>(
            "/api/finance/create-subscriptions/",
            payload,
            {
              validateStatus: (status) => status >= 200 && status < 400,
            }
          );
          const redirectUrl = res.data?.redirect_url;
          if (typeof redirectUrl === "string" && redirectUrl.trim().length > 0) {
            window.location.assign(redirectUrl);
            return;
          }
        } else {
          throw error;
        }
      }

      setCanceledPlans((prev) => prev.filter((p) => p !== plan.name));
      await loadActiveSubscription({ silent: true });
    } catch (error: unknown) {
      setUpgradeError(getErrorMessage(error));
    } finally {
      setUpgradeLoadingPlanId(null);
    }
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
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
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
                <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
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
                <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUBSCRIPTION ================= */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>

        {upgradeError ? (
          <div className="bg-[#272727] rounded-xl p-4 shadow-lg mb-6">
            <p className="text-red-400 font-semibold text-sm">Upgrade failed</p>
            <p className="text-gray-400 text-sm mt-1">{upgradeError}</p>
          </div>
        ) : null}

        {activeSubscriptionLoading ? (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg text-gray-300 mb-6">
            Checking active subscription...
          </div>
        ) : activeSubscriptionError ? (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg mb-6">
            <p className="text-red-400 font-semibold">Failed to load active subscription</p>
            <p className="text-gray-400 text-sm mt-1">{activeSubscriptionError}</p>
          </div>
        ) : activeSubscription ? (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-gray-400 text-sm">Current plan</p>
                <p className="text-white font-semibold">
                  {activeSubscription.plan_name} • {activeSubscription.plan_duration} • ${activeSubscription.plan_price}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {activeSubscription.auto_renew ? "Auto-renew: On" : "Auto-renew: Off"}
                </p>
              </div>
              <div className="text-sm text-gray-300">
                <p>
                  <span className="text-gray-400">Start:</span> {new Date(activeSubscription.start).toLocaleString()}
                </p>
                <p>
                  <span className="text-gray-400">End:</span> {new Date(activeSubscription.end).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg text-gray-300 mb-6">
            No active subscription found.
          </div>
        )}

        {plansLoading ? (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg text-gray-300">
            Loading plans...
          </div>
        ) : plansError ? (
          <div className="bg-[#272727] rounded-xl p-6 shadow-lg">
            <p className="text-red-400 font-semibold">Failed to load plans</p>
            <p className="text-gray-400 text-sm mt-1">{plansError}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const planKey = plan.name.trim().toLowerCase();
              const activeKey = (activePlan ?? "").trim().toLowerCase();
              const isActive = !!activeKey && planKey === activeKey;
              const isCanceled = canceledPlans.includes(plan.name);
              const isUpgrading = upgradeLoadingPlanId === plan.id;

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
                      ${plan.price}/<span className="text-sm">{plan.duration}</span>
                    </p>
                  </div>

                  <ul className="text-gray-300 text-sm space-y-1 mb-5">
                    <li>• Messages limit: {plan.msg_limit}</li>
                    <li>• User limit: {plan.user_limit}</li>
                    <li>• Token limit: {plan.token_limit}</li>
                  </ul>

                  {/* Conditional Button Logic (local UI only) */}
                  {isActive && !isCanceled ? (
                    <>
                      <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition">
                        Active Plan
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
                      onClick={() => handleUpgradePlan(plan)}
                      disabled={isUpgrading}
                      className={`w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 transition ${
                        isUpgrading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isUpgrading ? "Upgrading..." : "Upgrade Plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
              <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
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
              <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
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
