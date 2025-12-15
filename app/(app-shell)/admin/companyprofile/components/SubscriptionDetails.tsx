"use client";
import { Download, Save } from "lucide-react";
import { useState } from "react";

interface Company {
  id: number;
  name: string;
  contact: string;
  email: string;
  vat: string;
  joinDate: string;
  address: string;
  plan: string;
  planPrice: number;
  billingCycle: string;
  trialStart: string;
  trialEnd: string;
  renewalDate: string;
  seatsUsed: number;
  seatsTotal: number;
  discountCode?: string;
  discountPercent?: number;
  totalPaid: number;
  dueAmount: number;
  invoiceNo: string;
}

const SubscriptionDetails = () => {
  // Fake company data
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: "TechCorp Inc.",
      contact: "Sarah Johnson",
      email: "sarah@techcorp.com",
      vat: "GB123456789",
      joinDate: "Jan 15, 2023",
      address: "Westheimer Rd, Santa Ana, Illinois",
      plan: "Business",
      planPrice: 250,
      billingCycle: "Monthly",
      trialStart: "5/7/16",
      trialEnd: "5/7/19",
      renewalDate: "20 March, 2023",
      seatsUsed: 25,
      seatsTotal: 50,
      discountCode: "ANNUAL15",
      discountPercent: 15,
      totalPaid: 520,
      dueAmount: 250,
      invoiceNo: "INV-7892",
    },
    {
      id: 2,
      name: "DataWorks Ltd.",
      contact: "James Smith",
      email: "james@dataworks.com",
      vat: "GB876543210",
      joinDate: "Feb 10, 2024",
      address: "Baker St, London, UK",
      plan: "Premium",
      planPrice: 499,
      billingCycle: "Yearly",
      trialStart: "6/2/24",
      trialEnd: "6/3/24",
      renewalDate: "6 March, 2025",
      seatsUsed: 10,
      seatsTotal: 25,
      totalPaid: 1200,
      dueAmount: 499,
      invoiceNo: "INV-1123",
    },
  ]);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    companies[0]
  );

  // Editable form data
  const [formData, setFormData] = useState<Partial<Company>>(selectedCompany || {});

  const handleSelectChange = (id: number) => {
    const company = companies.find((c) => c.id === id);
    setSelectedCompany(company || null);
    setFormData(company || {});
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSave = () => {
    if (!selectedCompany) return;
    setCompanies((prev) =>
      prev.map((c) => (c.id === selectedCompany.id ? { ...formData } as Company : c))
    );
    alert("Changes saved successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">All Companies</h2>

      {/* ---------- SUBSCRIPTION FORM ---------- */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>

        {/* Company Dropdown */}
        <select
          className="bg-gray-700 text-white px-3 py-2 rounded-md mb-6 w-1/3"
          value={selectedCompany?.id || ""}
          onChange={(e) => handleSelectChange(Number(e.target.value))}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Grid Layout */}
        {selectedCompany && (
          <div className="grid md:grid-cols-2 gap-5 text-sm">
            {/* Trial */}
            <div>
              <label className="block text-gray-400 mb-1">Trial Start</label>
              <input
                value={formData.trialStart || ""}
                onChange={(e) =>
                  handleInputChange("trialStart", e.target.value)
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Trial End</label>
              <input
                value={formData.trialEnd || ""}
                onChange={(e) => handleInputChange("trialEnd", e.target.value)}
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>

            {/* Current Plan / Billing */}
            <div>
              <label className="block text-gray-400 mb-1">Current Plan</label>
              <input
                value={formData.plan || ""}
                onChange={(e) => handleInputChange("plan", e.target.value)}
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Billing Cycle</label>
              <input
                value={formData.billingCycle || ""}
                onChange={(e) =>
                  handleInputChange("billingCycle", e.target.value)
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>

            {/* Users & Renewal */}
            <div>
              <label className="block text-gray-400 mb-1">Seats / Users</label>
              <input
                value={`${formData.seatsUsed}/${formData.seatsTotal}`}
                onChange={(e) =>
                  handleInputChange("seatsUsed", e.target.value.split("/")[0])
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Renewal Date</label>
              <input
                value={formData.renewalDate || ""}
                onChange={(e) =>
                  handleInputChange("renewalDate", e.target.value)
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>

            {/* Custom Price */}
            <div>
              <label className="block text-gray-400 mb-1">Custom Price</label>
              <input
                value={`$${formData.planPrice || ""}`}
                onChange={(e) =>
                  handleInputChange(
                    "planPrice",
                    Number(e.target.value.replace("$", ""))
                  )
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="block text-gray-400 mb-1">
                Discounts & Coupons
              </label>
              <input
                value={formData.discountCode || ""}
                onChange={(e) =>
                  handleInputChange("discountCode", e.target.value)
                }
                className="bg-gray-700 p-2 w-full rounded-md"
              />
              {formData.discountPercent && (
                <p className="text-blue-400 text-xs mt-1">
                  {formData.discountPercent}% discount applied
                </p>
              )}
            </div>

            {/* Cancellation */}
            <div className="col-span-2">
              <label className="block text-gray-400 mb-1">
                Cancellation Reason (if applicable)
              </label>
              <textarea
                className="bg-gray-700 w-full p-2 rounded-md"
                placeholder="Reason for cancellation"
              ></textarea>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-500 flex items-center gap-2 px-4 py-2 rounded-md mt-5"
        >
          <Save className="w-4 h-4" /> Save change
        </button>
      </div>

      {/* ---------- COMPANY SUBSCRIPTIONS ---------- */}
      <div className="space-y-6">
        {companies.map((c) => (
          <div
            key={c.id}
            className="bg-gray-800 rounded-lg p-5 text-sm border border-gray-700"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span>🏢</span> {c.name}
              </h4>
              <span className="bg-green-700/40 text-green-400 text-xs px-2 py-1 rounded-md">
                Active
              </span>
            </div>
            <p>
              <strong>Billing Contact:</strong> {c.contact}
            </p>
            <p>
              <strong>Billing Email:</strong> {c.email}
            </p>
            <p>
              <strong>VAT Number:</strong> {c.vat}
            </p>
            <p>
              <strong>Join Date:</strong> {c.joinDate}
            </p>
            <p>
              <strong>Company Address:</strong> {c.address}
            </p>

            <div className="flex justify-between mt-3 border-t border-gray-700 pt-3">
              <div>
                <p>
                  <strong>Invoice:</strong> #{c.invoiceNo}
                </p>
                <p>
                  <strong>Due Amount:</strong> ${c.dueAmount}
                </p>
                <p>
                  <strong>Total Paid:</strong> ${c.totalPaid}
                </p>
              </div>
              <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md flex items-center gap-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionDetails;
