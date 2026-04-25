import React, { useMemo, useState } from "react";
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

  const debouncedSearch = useDebounce(searchTerm, 500);

  // 1. Fetch Lookups for dynamic IDs
  const { data: lookupsData, isLoading: lookupsLoading } = useLookups();

  // 2. Resolve IDs dynamically based on slugs
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

    // Ensure we both valid IDs before fetching
    if (employmentTypeInfo?.id && contractStatusInfo?.id) {
      return {
        // The backend expects `filter_employment_type` and `filter_contract` parameters
        filter_employment_type: employmentTypeInfo.id,
        filter_contract: contractStatusInfo.id
      };
    }

    return null;
  }, [lookupsData]);


  // 3. Fetch Employees with the dynamic filters
  const { data, isLoading: employeesLoading, isError } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    filterParams || {} // Pass empty object if IDs aren't ready to avoid hook error, but we'll conditionally ignore the data later
  );

  // Overall loading state
  const isLoading = lookupsLoading || (filterParams && employeesLoading);

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="عقود تشغيل دائمة"
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
