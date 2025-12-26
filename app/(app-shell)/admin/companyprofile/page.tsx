"use client";
import { useEffect, useMemo, useState } from "react";
import CustomPlanList from "./components//CustomPlanList";
import CompanyFilter from "./components/CompanyFilter";
import CompanyList from "./components/CompanyList";
import CustomPlanForm from "./components/CustomPlanForm";
import { useSession } from "next-auth/react";
import axios from "axios";
import { adminApi } from "@/lib/http/client";

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

type SessionWithAccessToken = { accessToken?: string };

function getAccessToken(session: unknown): string | null {
  const fromSession = (session as SessionWithAccessToken | null)?.accessToken;
  if (typeof fromSession === "string" && fromSession) return fromSession;
  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem("access_token");
    if (fromStorage) return fromStorage;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

type ApiCompany = {
  id?: number;
  name?: string | null;
  email?: string | null;
  billing_contact?: string | null;
  billing_email?: string | null;
  joining_date?: string | null;
  invoice?: { name?: string | null; url?: string | null } | null;
  total_paid?: number | null;
  is_active?: boolean;
};

function formatJoinDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

function mapApiCompany(c: ApiCompany): Company {
  const id = typeof c.id === "number" ? c.id : 0;
  const name = (c.name ?? "").toString();
  const contact = (c.billing_contact ?? "").toString();
  const email = (c.billing_email ?? c.email ?? "").toString();
  const joinDateRaw = (c.joining_date ?? "").toString();
  const joinDate = joinDateRaw ? formatJoinDate(joinDateRaw) : "";
  const invoiceNo =
    (isRecord(c.invoice) && typeof c.invoice.name === "string" && c.invoice.name) ||
    (id ? String(id) : "");
  const totalPaid = typeof c.total_paid === "number" ? c.total_paid : 0;
  const status: "Active" | "Inactive" = c.is_active === true ? "Active" : "Inactive";

  return {
    id,
    name,
    contact,
    email,
    vat: "",
    joinDate,
    address: "",
    invoiceNo,
    dueAmount: 0,
    totalPaid,
    plan: "",
    status,
  };
}

const AdminCompaniesPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({ status: "All", plan: "All", search: "" });
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    const token = getAccessToken(session);
    if (!token) {
      setError("Missing access token.");
      setLoading(false);
      return;
    }

    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await adminApi.get("/admin/companies/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload: unknown = res.data;
        let list: ApiCompany[] = [];

        if (Array.isArray(payload)) {
          list = payload as ApiCompany[];
        } else if (isRecord(payload) && Array.isArray(payload["results"])) {
          list = payload["results"] as ApiCompany[];
        } else if (isRecord(payload) && Array.isArray(payload["data"])) {
          list = payload["data"] as ApiCompany[];
        }

        const mapped = list.map(mapApiCompany).filter((c) => c.id !== 0);
        setCompanies(mapped);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const code = err.response?.status;
          setError(code ? `Failed to load companies (${code}).` : "Failed to load companies.");
        } else {
          setError("Failed to load companies.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [session, sessionStatus]);

  const handleAddPlan = (newPlan: CustomPlan) => {
    setCustomPlans((prev) => [...prev, { ...newPlan, id: prev.length + 1 }]);
  };

  const handleDeletePlan = (id: number) => {
    setCustomPlans(customPlans.filter((p) => p.id !== id));
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchStatus = filters.status === "All" || c.status === filters.status;
      const matchPlan = filters.plan === "All" || c.plan === filters.plan;
      const matchSearch = c.name.toLowerCase().includes(filters.search.toLowerCase());
      return matchStatus && matchPlan && matchSearch;
    });
  }, [companies, filters.plan, filters.search, filters.status]);

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-10">
      <h2 className="text-xl font-semibold">Company Subscription Management</h2>

      {loading ? (
        <p className="text-gray-400">Loading companies...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : null}

      <CustomPlanForm companies={companies} onAddCustomPlan={handleAddPlan} />

      <CustomPlanList customPlans={customPlans} onDeletePlan={handleDeletePlan} />

      <CompanyFilter filters={filters} setFilters={setFilters} />

      <CompanyList companies={filteredCompanies} />
    </div>
  );
};

export default AdminCompaniesPage;
