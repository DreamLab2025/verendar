"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StaffTable } from "./components/staff-table";
import { StaffToolbar, type StaffSortOrder } from "./components/staff-toolbar";

export default function BranchStaffPage() {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";
  const branchId = typeof params?.branchId === "string" ? params.branchId : "";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<StaffSortOrder>("default");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Nhân viên</h2>
        <p className="text-sm text-muted-foreground md:text-base">Quản lý nhân sự tại chi nhánh.</p>
      </div>

      <div className="space-y-0">
        <StaffToolbar
          garageId={garageId}
          branchId={branchId}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <div className="pt-4">
          <StaffTable
            garageId={garageId}
            branchId={branchId}
            search={debouncedSearch}
            roleFilter={roleFilter}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
}
