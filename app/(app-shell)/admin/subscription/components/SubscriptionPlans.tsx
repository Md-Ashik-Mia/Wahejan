// "use client";
// import React from "react";
// import { Edit, Trash2 } from "lucide-react";

// export default function SubscriptionPlans({ plans, setPlans, setEditPlan }: any) {
//   const handleDelete = (id: number) => {
//     if (confirm("Delete this plan?")) {
//       setPlans(plans.filter((p: any) => p.id !== id));
//     }
//   };

//   const handleEdit = (plan: any) => {
//     setEditPlan(plan);
//     document.getElementById("custom-plan-section")?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <section>
//       <h3 className="text-lg font-semibold mb-4">Subscription Management & Billing</h3>
//       <div className="grid md:grid-cols-3 gap-6">
//         {plans.map((plan: any) => (
//           <div key={plan.id} className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 transition">
//             <div className="flex justify-between items-center mb-2">
//               <h4 className="text-lg font-semibold">{plan.name}</h4>
//               <p className="text-blue-400 font-medium">${plan.price}/mo</p>
//             </div>
//             <ul className="text-gray-400 text-sm space-y-1 mb-4">
//               <li>Duration: {plan.duration} days</li>
//               <li>Type: {plan.type}</li>
//               <li>Channels: {plan.channels}</li>
//               <li>AI Msgs: {plan.aiMessages}/month</li>
//               <li>Support: {plan.support}</li>
//               <li>Payments: {plan.paymentsEnabled ? "✅ Active" : "❌ Disabled"}</li>
//               <li>API Calls: {plan.apiCalls}</li>
//               <li>User Seats: {plan.userSeats}</li>
//             </ul>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => handleEdit(plan)}
//                 className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
//               >
//                 <Edit className="w-4 h-4" /> Edit Plan
//               </button>
//               <button
//                 onClick={() => handleDelete(plan.id)}
//                 className="flex-1 border border-red-600 text-red-400 hover:bg-red-600/10 active:scale-95 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
//               >
//                 <Trash2 className="w-4 h-4" /> Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// }



"use client";
import React from "react";
import { Edit, Trash2 } from "lucide-react";

export default function SubscriptionPlans({ plans, setPlans, setEditPlan }: any) {
  const handleDelete = (id: number) => {
    if (confirm("Delete this plan?")) {
      setPlans(plans.filter((p: any) => p.id !== id));
    }
  };

  const handleEdit = (plan: any) => {
    setEditPlan(plan);
    document.getElementById("custom-plan-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Subscription Management & Billing</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <div key={plan.id} className="bg-[#272727]  p-6 rounded-xl shadow-lg hover:bg-gray-700 transition">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold">{plan.name}</h4>
              <p className="text-blue-400 font-medium">${plan.price}/mo</p>
            </div>
            <ul className="text-gray-400 text-sm space-y-1 mb-4">
              <li>Duration: {plan.duration} days</li>
              <li>Type: {plan.type}</li>
              <li>Channels: {plan.channels}</li>
              <li>AI Msgs: {plan.aiMessages}/month</li>
              <li>Support: {plan.support}</li>
              <li>Payments: {plan.paymentsEnabled ? "✅ Active" : "❌ Disabled"}</li>
              <li>API Calls: {plan.apiCalls}</li>
              <li>User Seats: {plan.userSeats}</li>
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Plan
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="flex-1 border border-red-600 text-red-400 hover:bg-red-600/10 active:scale-95 px-3 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
