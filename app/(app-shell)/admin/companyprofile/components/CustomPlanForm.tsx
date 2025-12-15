// import React, { useState } from "react";
// import { Company, CustomPlan } from "../page";

// interface Props {
//   companies: Company[];
//   onAddCustomPlan: (plan: CustomPlan) => void;
// }

// const CustomPlanForm: React.FC<Props> = ({ companies, onAddCustomPlan }) => {
//   const [form, setForm] = useState<Partial<CustomPlan>>({});

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.company || !form.planName || !form.startDate || !form.endDate) {
//       alert("Please fill all required fields!");
//       return;
//     }
//     onAddCustomPlan(form as CustomPlan);
//     setForm({});
//   };

//   return (
//     <div className="bg-gray-800 p-6 rounded-xl">
//       <h3 className="text-lg font-semibold mb-4">Create Custom Plan</h3>
//       <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4 text-sm">
//         <select
//           value={form.company || ""}
//           onChange={(e) => setForm({ ...form, company: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         >
//           <option value="">Select Company</option>
//           {companies.map((c) => (
//             <option key={c.id} value={c.name}>
//               {c.name}
//             </option>
//           ))}
//         </select>

//         <input
//           placeholder="Plan Name"
//           value={form.planName || ""}
//           onChange={(e) => setForm({ ...form, planName: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <input
//           type="number"
//           placeholder="Price ($)"
//           value={form.price || ""}
//           onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <input
//           type="date"
//           placeholder="Start Date"
//           value={form.startDate || ""}
//           onChange={(e) => setForm({ ...form, startDate: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <input
//           type="date"
//           placeholder="End Date"
//           value={form.endDate || ""}
//           onChange={(e) => setForm({ ...form, endDate: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <input
//           placeholder="Duration (e.g. 6 months)"
//           value={form.duration || ""}
//           onChange={(e) => setForm({ ...form, duration: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <input
//           type="number"
//           placeholder="Seats"
//           value={form.seats || ""}
//           onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
//           className="bg-gray-700 p-2 rounded-md"
//         />

//         <select
//           value={form.billingCycle || ""}
//           onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
//           className="bg-gray-700 p-2 rounded-md"
//         >
//           <option value="">Billing Cycle</option>
//           <option value="Monthly">Monthly</option>
//           <option value="Yearly">Yearly</option>
//         </select>

//         <div className="col-span-3 flex justify-end">
//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md"
//           >
//             Create Custom Plan
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CustomPlanForm;



import React, { useState } from "react";
import { Company, CustomPlan } from "../page";

interface Props {
  companies: Company[];
  onAddCustomPlan: (plan: CustomPlan) => void;
}

const CustomPlanForm: React.FC<Props> = ({ companies, onAddCustomPlan }) => {
  const [form, setForm] = useState<Partial<CustomPlan>>({
    company: "",
    planName: "",
    billingCycle: "",
    seats: 0,
    renewalDate: "",
    price: 0,
    coupon: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company || !form.planName || !form.startDate || !form.endDate) {
      alert("Please fill all required fields!");
      return;
    }
    onAddCustomPlan(form as CustomPlan);
    setForm({
      company: "",
      planName: "",
      billingCycle: "",
      seats: 0,
      renewalDate: "",
      price: 0,
      coupon: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="bg-[#272727]  text-white p-8 rounded-lg ">
      <form
        onSubmit={handleSubmit}
        className="space-y-8 text-sm max-w-4xl "
      >
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Subscription Details</h3>
          <select
            name="company"
            value={form.company}
            onChange={handleChange}
            className="bg-gray-700 w-64 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Select Company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trial Start & End */}
        <div className="flex items-center gap-10">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Trial Start</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Trial End</label>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Current Plan</label>
            <input
              name="planName"
              placeholder="Enter your plan"
              value={form.planName}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Billing Cycle</label>
            <select
              name="billingCycle"
              value={form.billingCycle}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            >
              <option value="">Select Cycle</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Seats / Users</label>
            <input
              name="seats"
              placeholder="25/50"
              value={form.seats || ""}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Renewal Date</label>
            <input
              name="renewalDate"
              placeholder="20 March, 2023"
              value={form.renewalDate}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Custom Price</label>
            <input
              name="price"
              type="text"
              placeholder="$133.00"
              value={form.price || ""}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1 text-sm">Discounts & Coupons</label>
            <input
              name="coupon"
              placeholder="Coupon code"
              value={form.coupon || ""}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 w-full text-sm text-white rounded px-3 py-2 focus:outline-none"
            />
            <p className="text-xs text-blue-400 mt-1">
              15% annual discount applied
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition"
          >
            💾 Save change
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPlanForm;

