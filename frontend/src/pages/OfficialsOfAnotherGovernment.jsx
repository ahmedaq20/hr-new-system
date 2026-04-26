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
  const [advancedFilters, setAdvancedFilters] = useState({});

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

  // Combined filters logic
  const combinedFilters = useMemo(() => {
    const filters = { ...advancedFilters };

    // Force the official in another government filter
    if (officialOtherId) {
      filters.filter_employment_type = officialOtherId;
    }

    return filters;
  }, [advancedFilters, officialOtherId]);

  const { data, isLoading: isEmployeesLoading, isFetching } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    combinedFilters
  );

  const isLoading = isLookupsLoading || (officialOtherId && isEmployeesLoading);

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

  // Count active filters excluding base employee type
  const activeFiltersCount = Object.keys(advancedFilters).length;

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="رسميين في حكومة أخرى"
        desc="استعراض الموظفين الرسميين في منصات حكومية أخرى مع إمكانية البحث المتقدم"
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

export default OfficialsOfAnotherGovernment;
