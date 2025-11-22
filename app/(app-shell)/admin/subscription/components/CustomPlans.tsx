"use client";
import React, { useEffect, useState } from "react";

export default function CustomPlans({ plans, setPlans, editPlan, setEditPlan }: any) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    type: "",
    channels: "",
    aiMessages: "",
    support: "",
    advancedAnalytics: false,
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
      channels: "",
      aiMessages: "",
      support: "",
      advancedAnalytics: false,
    });
  };

  return (
    <section id="custom-plan-section">
      <h3 className="text-lg font-semibold mb-4">Custom Subscription Plans</h3>
      <form className="bg-gray-800 p-6 rounded-lg space-y-3">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "name",
            "price",
            "duration",
            "type",
            "channels",
            "aiMessages",
            "support",
          ].map((field) => (
            <input
              key={field}
              value={(form as any)[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="bg-gray-700 p-2 rounded-md"
            />
          ))}
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.advancedAnalytics}
            onChange={(e) => handleChange("advancedAnalytics", e.target.checked)}
            className="accent-blue-600"
          />
          Advanced Analytics & Reports
        </label>

        <div className="flex gap-3 mt-4">
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
                channels: "",
                aiMessages: "",
                support: "",
                advancedAnalytics: false,
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
