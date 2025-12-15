"use client";
import React from "react";

export default function FeatureToggles({ plans, selectedPlan, setSelectedPlan, setPlans }: any) {
  const handleChange = (field: string, value: any) => {
    const updated = plans.map((p: any) =>
      p.name === selectedPlan.name ? { ...p, [field]: value } : p
    );
    setPlans(updated);
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Feature Toggles & Limits</h3>
      <select
        value={selectedPlan.name}
        onChange={(e) =>
          setSelectedPlan(plans.find((p: any) => p.name === e.target.value))
        }
        className="bg-gray-700 px-3 py-2 rounded-md mb-5"
      >
        {plans.map((p: any) => (
          <option key={p.id}>{p.name}</option>
        ))}
      </select>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">Payments</p>
          <p className="text-gray-400 text-sm mb-2">
            Enable payment processing for this plan
          </p>
          <input
            type="checkbox"
            checked={selectedPlan.paymentsEnabled}
            onChange={(e) => handleChange("paymentsEnabled", e.target.checked)}
            className="scale-125 accent-green-500"
          />
        </div>
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">User Seats</p>
          <input
            type="number"
            value={selectedPlan.userSeats}
            onChange={(e) => handleChange("userSeats", parseInt(e.target.value))}
            className="bg-gray-700 px-2 py-1 rounded-md w-20 text-center"
          />
        </div>
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">API Calls</p>
          <input
            type="number"
            value={selectedPlan.apiCalls}
            onChange={(e) => handleChange("apiCalls", parseInt(e.target.value))}
            className="bg-gray-700 px-2 py-1 rounded-md w-24 text-center"
          />
          <p className="text-gray-400 text-sm mt-1">calls/month</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-lg">
          <p className="font-medium">Channels</p>
          <p className="text-gray-400 text-sm mb-2">Enable integrations</p>
          <input
            type="checkbox"
            checked={selectedPlan.channels > 0}
            onChange={(e) => handleChange("channels", e.target.checked ? 5 : 0)}
            className="scale-125 accent-green-500"
          />
        </div>
      </div>
    </section>
  );
}
