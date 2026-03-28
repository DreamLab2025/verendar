"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BranchesCard } from "./components/branches-card";
import { BranchesToolbar, type BranchesSortOrder } from "./components/branches-toolbar";

export default function GarageDashboardBranchesPage() {
  const params = useParams();
  const garageId = typeof params?.id === "string" ? params.id : "";

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<BranchesSortOrder>("default");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const isDescending = sortOrder === "default" ? undefined : sortOrder === "desc";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Chi nhánh</h2>
        <p className="text-sm text-muted-foreground md:text-base">Quản lý chi nhánh trong garage</p>
      </div>

      <div className="space-y-0">
        <BranchesToolbar
          garageId={garageId}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
        />
        <div className="pt-4">
          <BranchesCard
            garageId={garageId}
            search={debouncedSearch}
            statusFilter={statusFilter}
            isDescending={isDescending}
          />
        </div>
      </div>
    </div>
  );
}
