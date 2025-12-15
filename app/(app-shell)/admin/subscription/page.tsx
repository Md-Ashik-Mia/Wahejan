// "use client";
// import React, { useState } from "react";
// import SubscriptionPlans from "./components/SubscriptionPlans";
// import FeatureToggles from "./components/FeatureToggles";
// import PromoCodes from "./components/PromoCodes";
// import CustomPlans from "./components/CustomPlans";

// export default function SubscriptionPage() {
//   // MASTER STATE
//   const [plans, setPlans] = useState([
//     {
//       id: 1,
//       name: "Basic",
//       price: 29,
//       duration: 30,
//       type: "Standard",
//       channels: 5,
//       aiMessages: 1000,
//       support: "Email Support",
//       advancedAnalytics: false,
//       paymentsEnabled: true,
//       apiCalls: 2000,
//       userSeats: 5,
//     },
//     {
//       id: 2,
//       name: "Business",
//       price: 59,
//       duration: 60,
//       type: "Professional",
//       channels: 10,
//       aiMessages: 5000,
//       support: "Priority Support",
//       advancedAnalytics: true,
//       paymentsEnabled: true,
//       apiCalls: 5000,
//       userSeats: 12,
//     },
//     {
//       id: 3,
//       name: "Premium",
//       price: 99,
//       duration: 90,
//       type: "Enterprise",
//       channels: 20,
//       aiMessages: 10000,
//       support: "24/7 Support",
//       advancedAnalytics: true,
//       paymentsEnabled: true,
//       apiCalls: 10000,
//       userSeats: 20,
//     },
//   ]);

//   const [promos, setPromos] = useState([
//     { code: "WELCOME15", discount: 15, type: "Percentage", status: "Active" },
//     { code: "ANNUAL20", discount: 20, type: "Percentage", status: "Active" },
//     { code: "WINTER30", discount: 30, type: "Percentage", status: "Expired" },
//   ]);

//   const [selectedPlan, setSelectedPlan] = useState(plans[0] || null);
//   const [editPlan, setEditPlan] = useState(null); // when editing plan

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-6 space-y-10">
//       <h2 className="text-xl font-semibold">Admin Control Center</h2>

//       <SubscriptionPlans
//         plans={plans}
//         setPlans={setPlans}
//         setEditPlan={setEditPlan}
//       />
//       <FeatureToggles
//         plans={plans}
//         selectedPlan={selectedPlan}
//         setSelectedPlan={setSelectedPlan}
//         setPlans={setPlans}
//       />
//       <PromoCodes promos={promos} setPromos={setPromos} />
//       <CustomPlans plans={plans} setPlans={setPlans} editPlan={editPlan} setEditPlan={setEditPlan} />
//     </div>
//   );
// }



"use client";
import React, { useState } from "react";
import SubscriptionPlans from "./components/SubscriptionPlans";
import FeatureTogglesAndCustomPlans from "./components/FeatureTogglesAndCustomPlans";
import PromoCodes from "./components/PromoCodes";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic",
      price: 29,
      duration: 30,
      type: "Standard",
      channels: 5,
      aiMessages: 1000,
      support: "Email Support",
      advancedAnalytics: false,
      paymentsEnabled: true,
      apiCalls: 2000,
      userSeats: 5,
    },
    {
      id: 2,
      name: "Business",
      price: 59,
      duration: 60,
      type: "Professional",
      channels: 10,
      aiMessages: 5000,
      support: "Priority Support",
      advancedAnalytics: true,
      paymentsEnabled: true,
      apiCalls: 5000,
      userSeats: 12,
    },
    {
      id: 3,
      name: "Premium",
      price: 99,
      duration: 90,
      type: "Enterprise",
      channels: 20,
      aiMessages: 10000,
      support: "24/7 Support",
      advancedAnalytics: true,
      paymentsEnabled: true,
      apiCalls: 10000,
      userSeats: 20,
    },
  ]);

  const [promos, setPromos] = useState([
    { code: "WELCOME15", discount: 15, type: "Percentage", status: "Active" },
    { code: "ANNUAL20", discount: 20, type: "Percentage", status: "Active" },
    { code: "WINTER30", discount: 30, type: "Percentage", status: "Expired" },
  ]);

  const [editPlan, setEditPlan] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Admin Control Center</h2>

      <SubscriptionPlans plans={plans} setPlans={setPlans} setEditPlan={setEditPlan} />
      <FeatureTogglesAndCustomPlans plans={plans} setPlans={setPlans} editPlan={editPlan} setEditPlan={setEditPlan} />
      <PromoCodes promos={promos} setPromos={setPromos} />
    </div>
  );
}

