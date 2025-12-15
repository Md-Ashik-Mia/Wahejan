import { Download } from "lucide-react";
import React from "react";
import { Company } from "../page";

interface Props {
  companies: Company[];
}

const CompanyList: React.FC<Props> = ({ companies }) => {
  return (
    <div className="space-y-5">
      {companies.map((c) => (
        <div
          key={c.id}
          className="bg-[#272727]  rounded-lg border border-gray-700 p-6 text-sm"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold flex items-center gap-2">
                🏢 {c.name}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-md ${
                  c.status === "Active"
                    ? "bg-green-700/30 text-green-400"
                    : "bg-red-700/30 text-red-400"
                }`}
              >
                {c.status}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-gray-400">Billing Contact:</p>
              <p className="text-gray-200">{c.contact}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-gray-400">Billing Email:</p>
              <p className="text-gray-200 font-semibold">{c.email}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-gray-400">VAT Number:</p>
              <p className="text-gray-200">{c.vat}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-gray-400">Join Date:</p>
              <p className="text-gray-200">{c.joinDate}</p>
            </div>

            <div className="flex justify-between items-start">
              <p className="text-gray-400">Company Address:</p>
              <p className="text-gray-200 text-right">{c.address}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-400">Invoice:</p>
              <div className="flex items-center gap-2">
                <p className="text-gray-200 font-mono">#{c.invoiceNo}</p>
                <button className="text-gray-400 hover:text-white transition">
                  <Download size={14} />
                </button>
              </div>
            </div>

            <div className="flex justify-between">
              <p className="text-gray-400">Due Amount:</p>
              <p className="text-gray-200">${c.dueAmount.toFixed(2)}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-gray-400">Total Paid:</p>
              <p className="text-gray-200">${c.totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanyList;
