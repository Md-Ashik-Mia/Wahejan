"use client";
import React, { useState, useEffect } from "react";

export default function FeatureTogglesAndCustomPlans({
  plans,
  setPlans,
  editPlan,
  setEditPlan,
}: any) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    type: "",
    channels: false, // boolean instead of number
    aiMessages: "",
    support: "",
    advancedAnalytics: false,
    paymentsEnabled: false,
    apiCalls: "",
    userSeats: "",
  });

  useEffect(() => {
    if (editPlan) setForm(editPlan);
  }, [editPlan]);

  const handleChange = (key: string, value: any) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    if (editPlan) {
      setPlans(plans.map((p: any) => (p.id === editPlan.id ? form : p)));
      setEditPlan(null);
    } else {
      setPlans([...plans, { ...form, id: Date.now() }]);
    }
    setForm({
      name: "",
      price: "",
      duration: "",
      type: "",
      channels: false,
      aiMessages: "",
      support: "",
      advancedAnalytics: false,
      paymentsEnabled: false,
      apiCalls: "",
      userSeats: "",
    });
  };

  return (
    <section id="custom-plan-section" className="space-y-8">
      <h3 className="text-lg font-semibold mb-4">Custom Subscription Plans</h3>
      <form className="bg-[#272727]  p-6 rounded-lg space-y-3">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "name",
            "price",
            "duration",
            "type",
            "aiMessages",
            "support",
          ].map((field) => (
            <input
              key={field}
              value={(form as any)[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-gray-700 p-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Toggles and Inputs */}
        <div className="grid md:grid-cols-2 gap-5 mt-5">
          {/* Payments Toggle */}
          <div className="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium">Payments</p>
              <p className="text-gray-400 text-sm">
                Enable payment processing for this plan
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                handleChange("paymentsEnabled", !form.paymentsEnabled)
              }
              className={`relative w-12 h-6 flex items-center rounded-full transition ${
                form.paymentsEnabled ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform transition ${
                  form.paymentsEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Channel Toggle */}
          <div className="bg-gray-700 p-5 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium">Channel</p>
              <p className="text-gray-400 text-sm">Enable integrations</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange("channels", !form.channels)}
              className={`relative w-12 h-6 flex items-center rounded-full transition ${
                form.channels ? "bg-green-500" : "bg-gray-500"
              }`}
            >
              <span
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform transition ${
                  form.channels ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* User Seats */}
          <div className="bg-gray-700 p-5 rounded-lg">
            <p className="font-medium">User Seats</p>
            <p className="text-gray-400 text-sm mb-2">
              Maximum number of users
            </p>
            <input
              type="number"
              value={form.userSeats}
              onChange={(e) => handleChange("userSeats", e.target.value || "")}
              className="bg-gray-600 px-2 py-1 rounded-md w-full text-sm"
              placeholder="Enter seats"
            />
          </div>

          {/* API Calls */}
          <div className="bg-gray-700 p-5 rounded-lg">
            <p className="font-medium">API Calls</p>
            <p className="text-gray-400 text-sm mb-2">
              Monthly API call limit
            </p>
            <input
              type="number"
              value={form.apiCalls}
              onChange={(e) => handleChange("apiCalls", e.target.value || "")}
              className="bg-gray-600 px-2 py-1 rounded-md w-full text-sm"
              placeholder="Enter limit"
            />
          </div>
        </div>

        {/* Advanced Analytics */}
        <label className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            checked={form.advancedAnalytics}
            onChange={(e) =>
              handleChange("advancedAnalytics", e.target.checked)
            }
            className="accent-blue-600"
          />
          Advanced Analytics & Reports
        </label>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md"
          >
            {editPlan ? "Update Plan" : "Create Plan"}
          </button>
          <button
            type="reset"
            onClick={() => {
              setForm({
                name: "",
                price: "",
                duration: "",
                type: "",
                channels: false,
                aiMessages: "",
                support: "",
                advancedAnalytics: false,
                paymentsEnabled: false,
                apiCalls: "",
                userSeats: "",
              });
              setEditPlan(null);
            }}
            className="border border-gray-400 hover:bg-gray-700 px-4 py-2 rounded-md"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
