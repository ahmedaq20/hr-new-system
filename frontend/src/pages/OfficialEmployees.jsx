// import React from 'react'
// import EmployeesHeader from '../components/EmployeesHeader';
// import EmployeesFilters from '../components/EmployeesFilters';
// import EmployeesTable from '../components/EmployeesTable';
// function OfficialEmployees() {
//   return (
//     <div>
//       <EmployeesHeader title="قاعدة بيانات الموظفين" desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"/>
//       <EmployeesFilters/>       
//       <EmployeesTable />
//     </div>
//   )
// }

// export default OfficialEmployees

import { useState, useEffect, useMemo } from "react";
import { useEmployees } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";
import { useDebounce } from "../hooks/useDebounce";

import EmployeesHeader from "../components/EmployeesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import AdvancedFilters from "../components/AdvancedFilters";
import EmployeesTable from "../components/EmployeesTable";

function OfficialEmployees() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch Lookups to find the correct Official Status ID dynamically
  const { data: lookups, isLoading: isLookupsLoading } = useLookups();

  // Find the "Official" employment type ID by slug: 'employment_type.official'
  const officialStatusId = useMemo(() => {
    if (!lookups?.EMPLOYMENT_TYPE) return null;
    const officialType = lookups.EMPLOYMENT_TYPE.find(
      (type) => type.slug === "employment_type.official" || type.value === "رسمي"
    );
    return officialType?.id;
  }, [lookups]);

  // Apply API-level filter using the dynamically resolved ID
  const extraFilters = useMemo(() => {
    if (!officialStatusId) return {};
    return { filter_employment_type: officialStatusId };
  }, [officialStatusId]);

  const { data, isLoading: isEmployeesLoading, isFetching } = useEmployees(
    page,
    pageSize,
    debouncedSearch,
    extraFilters
  );

  const isLoading = isLookupsLoading || (officialStatusId && isEmployeesLoading);

  // Reset to page 1 when searching

  // Reset to page 1 when searching
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="الموظفين الرسميين"
        desc="قائمة بالموظفين الرسميين (تصفية بصرية من النتائج الحالية)"
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

export default OfficialEmployees;
