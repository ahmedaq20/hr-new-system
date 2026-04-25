import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";
import { useDebounce } from "../hooks/useDebounce";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import EmployeesTable from "../components/EmployeesTable";

function OfficialsOfAnotherGovernment() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Lookups to find the correct Status ID dynamically
  const { data: lookups, isLoading: isLookupsLoading } = useLookups();

  // Find the "Official in Another Government" ID by slug
  const officialOtherId = useMemo(() => {
    if (!lookups?.EMPLOYMENT_TYPE) return null;
    const type = lookups.EMPLOYMENT_TYPE.find(
      (t) => t.slug === "employment_type.official_other_government" || t.value?.includes("رسمي في حكومة أخرى")
    );
    return type?.id;
  }, [lookups]);

  // Apply API-level filter using the dynamically resolved ID
  const extraFilters = useMemo(() => {
    if (!officialOtherId) return {};
    return { filter_employment_type: officialOtherId };
  }, [officialOtherId]);

  const { data, isLoading: isEmployeesLoading, isFetching } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    extraFilters
  );

  const isLoading = isLookupsLoading || (officialOtherId && isEmployeesLoading);

  // Reset to page 1 when searching
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="رسميين في حكومة أخرى"
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

export default OfficialsOfAnotherGovernment;
