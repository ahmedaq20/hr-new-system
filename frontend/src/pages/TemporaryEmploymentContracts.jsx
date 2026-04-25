import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const debouncedSearch = useDebounce(searchTerm, 500);

  const lookups = useLookups();

  // Find the exact IDs based on the slugs from reference_data.php
  const employmentTypeId = lookups.data?.EMPLOYMENT_TYPE?.find(t => t.slug === 'employment_type.contract')?.id;
  const contractId = lookups.data?.CONTRACT?.find(t => t.slug === 'unknown')?.id;

  // Fetch employees conditionally once we have both IDs resolved
  const shouldFetch = !!employmentTypeId && !!contractId;

  const extraFilters = {
    filter_employment_type: employmentTypeId,
    filter_contract: contractId,
  };

  const { data: employeesData, isLoading: isLoadingEmployees } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    extraFilters,
    { enabled: shouldFetch }
  );

  const loading = lookups.isLoading || isLoadingEmployees || !shouldFetch;

  // Reset to page 1 when searching
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="عقود تشغيل غير معلومة"
        desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      <AdvancedFilters
        show={showAdvancedFilters}
        onCancel={() => setShowAdvancedFilters(false)}
        onApply={(filters) => {
          console.log("Applying filters:", filters);
          setShowAdvancedFilters(false);
        }}
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