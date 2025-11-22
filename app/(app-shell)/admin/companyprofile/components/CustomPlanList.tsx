import React from "react";
import { CustomPlan } from "../page";
import { Trash2 } from "lucide-react";

interface Props {
  customPlans: CustomPlan[];
  onDeletePlan: (id: number) => void;
}

const CustomPlanList: React.FC<Props> = ({ customPlans, onDeletePlan }) => {
  if (!customPlans.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Custom Plans</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {customPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-[#272727]  p-5 rounded-lg border border-gray-700 relative"
          >
            <button
              onClick={() => onDeletePlan(plan.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
            <h4 className="font-semibold text-blue-400 text-lg mb-2">
              {plan.planName}
            </h4>
            <p className="text-sm text-gray-300 mb-1">
              <strong>Company:</strong> {plan.company}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <strong>Start:</strong> {plan.startDate}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <strong>End:</strong> {plan.endDate}
            </p>
            <p className="text-sm text-gray-300 mb-1">
              <strong>Seats:</strong> {plan.seats}
            </p>
            {/* <p className="text-sm text-gray-300 mb-1">
              <strong>Duration:</strong> {plan.duration}
            </p> */}
            <p className="text-sm text-gray-300 mb-1">
              <strong>Billing:</strong> {plan.billingCycle}
            </p>
            <p className="text-blue-400 font-semibold mt-2">
              ${plan.price}/month
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomPlanList;
