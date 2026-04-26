import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";
import { useDebounce } from "../hooks/useDebounce";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import EmployeesTable from "../components/EmployeesTable";
import YearNumber from '../components/YearNumber';

function OlderEmployees() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Lookups to find the correct Status ID dynamically
  const { data: lookups, isLoading: isLookupsLoading } = useLookups();

  // Find the "Retired" employment status ID by slug
  const retiredStatusId = useMemo(() => {
    if (!lookups?.EMPLOYMENT_STATUS) return null;
    const status = lookups.EMPLOYMENT_STATUS.find(
      (s) => s.slug === "employment_status.retired" || s.value?.includes("متقاعد")
    );
    return status?.id;
  }, [lookups]);

  // Combined filters logic
  const combinedFilters = useMemo(() => {
    const filters = { ...advancedFilters };

    // Force the retired status filter
    if (retiredStatusId) {
      filters.filter_employment_status = retiredStatusId;
    }

    return filters;
  }, [advancedFilters, retiredStatusId]);

  const { data, isLoading: isEmployeesLoading, isFetching } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    combinedFilters
  );

  const isLoading = isLookupsLoading || (retiredStatusId && isEmployeesLoading);

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
        title="المتقاعدين"
        desc="قائمة الموظفين المتقاعدين مع إمكانية البحث المتقدم والتصفية الدقيقة"
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        activeFiltersCount={activeFiltersCount}
      />

      <AdvancedFilters
        show={showAdvancedFilters}
        onCancel={handleCancelFilters}
        onApply={handleApplyFilters}
      />

      <YearNumber />

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

export default OlderEmployees;