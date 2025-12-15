"use client";
import { useState } from "react";
import CustomPlanList from "./components//CustomPlanList";
import CompanyFilter from "./components/CompanyFilter";
import CompanyList from "./components/CompanyList";
import CustomPlanForm from "./components/CustomPlanForm";

export interface Company {
  id: number;
  name: string;
  contact: string;
  email: string;
  vat: string;
  joinDate: string;
  address: string;
  invoiceNo: string;
  dueAmount: number;
  totalPaid: number;
  plan: string;
  status: "Active" | "Inactive";
}

export interface CustomPlan {
  id: number;
  company: string;
  planName: string;
  price: number;
  startDate: string;
  endDate: string;
  duration: string;
  seats: number;
  billingCycle: string;
  renewalDate?: string;
  coupon?: string;
}

const AdminCompaniesPage = () => {
  const [companies] = useState<Company[]>([
    {
      id: 1,
      name: "TechCorp Inc.",
      contact: "Sarah Johnson",
      email: "sarah@techcorp.com",
      vat: "GB123456789",
      joinDate: "Jan 15, 2023",
      address: "Westheimer Rd, Santa Ana, Illinois",
      invoiceNo: "INV-7892",
      dueAmount: 250,
      totalPaid: 520,
      plan: "Basic",
      status: "Active",
    },
    {
      id: 2,
      name: "DataWorks Ltd.",
      contact: "James Smith",
      email: "james@dataworks.com",
      vat: "GB876543210",
      joinDate: "Feb 10, 2024",
      address: "Baker St, London, UK",
      invoiceNo: "INV-1123",
      dueAmount: 499,
      totalPaid: 1200,
      plan: "Premium",
      status: "Inactive",
    },
  ]);

  const [filters, setFilters] = useState({ status: "All", plan: "All", search: "" });
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);

  const handleAddPlan = (newPlan: CustomPlan) => {
    setCustomPlans((prev) => [...prev, { ...newPlan, id: prev.length + 1 }]);
  };

  const handleDeletePlan = (id: number) => {
    setCustomPlans(customPlans.filter((p) => p.id !== id));
  };

  const filteredCompanies = companies.filter((c) => {
    const matchStatus = filters.status === "All" || c.status === filters.status;
    const matchPlan = filters.plan === "All" || c.plan === filters.plan;
    const matchSearch = c.name.toLowerCase().includes(filters.search.toLowerCase());
    return matchStatus && matchPlan && matchSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Company Subscription Management</h2>

      <CustomPlanForm companies={companies} onAddCustomPlan={handleAddPlan} />

      <CustomPlanList customPlans={customPlans} onDeletePlan={handleDeletePlan} />

      <CompanyFilter filters={filters} setFilters={setFilters} />

      <CompanyList companies={filteredCompanies} />
    </div>
  );
};

export default AdminCompaniesPage;
