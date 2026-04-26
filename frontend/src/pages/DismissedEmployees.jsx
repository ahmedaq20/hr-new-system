import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";
import { useDebounce } from "../hooks/useDebounce";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import EmployeesTable from "../components/EmployeesTable";

function DismissedEmployees() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Lookups to find the correct Status ID dynamically
  const { data: lookups, isLoading: isLookupsLoading } = useLookups();

  // Find the "Dismissed" employment status ID by slug
  const dismissedStatusId = useMemo(() => {
    if (!lookups?.EMPLOYMENT_STATUS) return null;
    const status = lookups.EMPLOYMENT_STATUS.find(
      (s) => s.slug === "employment_status.dismissed" || s.value?.includes("مفصول")
    );
    return status?.id;
  }, [lookups]);

  // Combined filters logic
  const combinedFilters = useMemo(() => {
    const filters = { ...advancedFilters };

    // Force the dismissed status filter
    if (dismissedStatusId) {
      filters.filter_employment_status = dismissedStatusId;
    }

    return filters;
  }, [advancedFilters, dismissedStatusId]);

  const { data, isLoading: isEmployeesLoading, isFetching } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    combinedFilters
  );

  const isLoading = isLookupsLoading || (dismissedStatusId && isEmployeesLoading);

  // Reset to page 1 when searching or filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, advancedFilters]);

  // Handle advanced filter apply
  const handleApplyFilters = (filters) => {
    setAdvancedFilters(filters);
    setPage(1);
    setShowAdvancedFilters(false);
  };

  // Handle advanced filter cancel
  const handleCancelFilters = () => {
    setAdvancedFilters({});
    setShowAdvancedFilters(false);
  };

  // Count active filters excluding base employee status
  const activeFiltersCount = Object.keys(advancedFilters).length;

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="المفصولين"
        desc="قائمة الموظفين المفصولين مع إمكانية البحث المتقدم والتصفية الدقيقة"
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        activeFiltersCount={activeFiltersCount}
      />

      <AdvancedFilters
        show={showAdvancedFilters}
        onCancel={handleCancelFilters}
        onApply={handleApplyFilters}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <EmployeesTable
        employees={data?.data || []}
        loading={isLoading}
        isFetching={isFetching}
        totalCount={data?.recordsFiltered || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

export default DismissedEmployees;
