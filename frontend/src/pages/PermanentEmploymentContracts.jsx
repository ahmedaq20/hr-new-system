import React, { useMemo, useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import ContrastsTable from "../components/ContrastsTable";

function PermanentEmploymentContracts() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({});

  const debouncedSearch = useDebounce(searchTerm, 500);

  // 1. Fetch Lookups for dynamic IDs
  const { data: lookupsData, isLoading: lookupsLoading } = useLookups();

  // 2. Resolve IDs dynamically based on slugs and merge with advanced filters
  const filterParams = useMemo(() => {
    if (!lookupsData) return null;

    // Find the ID for "عقد تشغيل"
    const employmentTypeInfo = lookupsData.EMPLOYMENT_TYPE?.find(
      (type) => type.slug === "employment_type.contract"
    );

    // Find the ID for "عقد دائم"
    const contractStatusInfo = lookupsData.CONTRACT?.find(
      (type) => type.slug === "permanent"
    );

    // Ensure we have valid base IDs before fetching
    if (employmentTypeInfo?.id && contractStatusInfo?.id) {
        const filters = { ...advancedFilters };
        
        // Force the base filters for this page
        filters.filter_employment_type = employmentTypeInfo.id;
        filters.filter_contract = contractStatusInfo.id;
        
        return filters;
    }

    return null;
  }, [lookupsData, advancedFilters]);

  // 3. Fetch Employees with the dynamic filters
  const { data, isLoading: employeesLoading, isError } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    filterParams || {}
  );

  // Overall loading state
  const isLoading = lookupsLoading || (filterParams && employeesLoading);

  // Reset to page 1 when search or advanced filters change
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
        title="عقود تشغيل دائمة"
        desc="استعراض موظفي عقود التشغيل الدائمة مع إمكانية البحث والتصفية المتقدمة"
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
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1);
        }}
      />

      {/* Show Loading state if lookup or initial employee fetch is pending */}
      {isLoading ? (
        <div className="d-flex justify-content-center p-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : isError || !filterParams ? (
        <div className="alert alert-danger mx-3 mt-3">
          عذراً، حدث خطأ أثناء تحميل البيانات أو أن بعض الإعدادات المرجعية (أنواع التوظيف/العقود) مفقودة.
        </div>
      ) : (
        <ContrastsTable
          employees={data?.data || []}
          loading={employeesLoading}
          totalCount={data?.recordsFiltered || 0}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

export default PermanentEmploymentContracts;
