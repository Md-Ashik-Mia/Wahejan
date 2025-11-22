import React from "react";

interface Props {
  filters: { status: string; plan: string; search: string };
  setFilters: (f: any) => void;
}

const CompanyFilter: React.FC<Props> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        className="bg-[#272727]  p-2 rounded-md text-sm"
      >
        <option value="All">All status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      <select
        value={filters.plan}
        onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
        className="bg-[#272727]  p-2 rounded-md text-sm"
      >
        <option value="All">All Plan</option>
        <option value="Basic">Basic</option>
        <option value="Premium">Premium</option>
      </select>

      <input
        type="text"
        placeholder="Company name here"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        className="bg-[#272727]  p-2 rounded-md text-sm w-64"
      />
    </div>
  );
};

export default CompanyFilter;
