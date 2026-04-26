import React, { useState, useEffect, useMemo } from "react";
import { useDebounce } from "../hooks/useDebounce";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import ContrastsTable from "../components/ContrastsTable";

import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";

function TemporaryEmploymentContracts() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const debouncedSearch = useDebounce(searchTerm, 500);

  const lookups = useLookups();

  // Find the exact IDs based on the slugs from reference_data.php
  const employmentTypeId = lookups.data?.EMPLOYMENT_TYPE?.find(t => t.slug === 'employment_type.contract')?.id;
  const contractId = lookups.data?.CONTRACT?.find(t => t.slug === 'unknown')?.id;

  // Fetch employees conditionally once we have both IDs resolved
  const shouldFetch = !!employmentTypeId && !!contractId;

  const extraFilters = useMemo(() => {
    const filters = { ...advancedFilters };

    // Force the base filters for this page
    if (employmentTypeId) {
      filters.filter_employment_type = employmentTypeId;
    }
    if (contractId) {
      filters.filter_contract = contractId;
    }

    return filters;
  }, [advancedFilters, employmentTypeId, contractId]);

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    extraFilters,
    { enabled: shouldFetch }
  );

  const loading = lookups.isLoading || isLoadingEmployees || !shouldFetch;

  // Reset to page 1 when searching or advanced filters change
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

  // Count active filters excluding base contract filters
  const activeFiltersCount = Object.keys(advancedFilters).length;

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="عقود تشغيل غير معلومة"
        desc="استعراض موظفي عقود التشغيل غير المعلومة مع إمكانية البحث والتصفية المتقدمة"
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
        searchTerm={searchTerm}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        onSearchChange={setSearchTerm}
      />

      <ContrastsTable
        employees={employeesData?.data || []}
        loading={loading}
        totalCount={employeesData?.recordsFiltered || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}

export default TemporaryEmploymentContracts;