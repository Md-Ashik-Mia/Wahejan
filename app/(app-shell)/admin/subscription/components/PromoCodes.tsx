"use client";
import React, { useState } from "react";
import { Edit, XCircle } from "lucide-react";

export default function PromoCodes({ promos, setPromos }: any) {
  const [form, setForm] = useState({
    code: "",
    discount: "",
    type: "Percentage",
    status: "Active",
  });
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = () => {
    if (!form.code || !form.discount) return alert("Please fill all fields!");

    if (editMode) {
      setPromos(promos.map((p: any) => (p.code === form.code ? form : p)));
      setEditMode(false);
    } else {
      setPromos([...promos, form]);
    }

    setForm({ code: "", discount: "", type: "Percentage", status: "Active" });
  };

  const handleEdit = (promo: any) => {
    setForm(promo);
    setEditMode(true);
  };

  const handleDelete = (code: string) => {
    if (confirm("Are you sure you want to deactivate this promo?")) {
      setPromos(promos.filter((p: any) => p.code !== code));
    }
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Promo Codes & Discounts</h3>
      <div className="bg-[#272727]  p-5 rounded-lg space-y-3">
        <p className="font-medium">
          {editMode ? "Edit Promo Code" : "Create New Promo Code"}
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Promo Code"
            className="bg-gray-700 p-2 rounded-md"
          />
          <input
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
            placeholder="Discount Value"
            className="bg-gray-700 p-2 rounded-md"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md mt-3"
        >
          {editMode ? "Update Promo Code" : "Create Promo Code"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {promos.map((promo: any, i: number) => (
          <div key={i} className="bg-[#272727]  p-5 rounded-lg">
            <div className="flex justify-between mb-2">
              <h4 className="font-semibold">{promo.code}</h4>
              <span
                className={
                  promo.status === "Active" ? "text-green-400" : "text-red-400"
                }
              >
                {promo.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              {promo.discount}% {promo.type} discount
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(promo)}
                className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-md flex-1 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(promo.code)}
                className="bg-orange-600 hover:bg-orange-500 px-3 py-2 rounded-md flex-1 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
