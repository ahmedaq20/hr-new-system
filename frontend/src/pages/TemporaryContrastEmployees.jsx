import React, { useState, useEffect, useMemo } from 'react'
import EmployeesHeader from '../components/EmployeesHeader';
import EmployeesFilters from '../components/EmployeesFilters';
import AdvancedFiltersTemp from '../components/AdvancedFiltersTemp';
import TemporaryEmpTable from '../components/TemporaryEmpTable';
import TempEmployeeModal from '../components/TempEmployeeModal';
import { useTempContractEmployees } from '../hooks/useTempContractEmployees';

function TemporaryContrastEmployees() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState({});

  // Merge search term with advanced filters
  const combinedFilters = useMemo(() => {
    return {
      ...advancedFilters,
      filter_full_name: searchTerm,
      page: page,
      length: pageSize
    };
  }, [searchTerm, advancedFilters, page, pageSize]);

  const { data, isLoading, isFetching } = useTempContractEmployees(combinedFilters);

  // Reset to page 1 when search or advanced filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, advancedFilters]);

  const handleApplyFilters = (filters) => {
    setAdvancedFilters(filters);
    setPage(1);
    setShowAdvancedFilters(false);
  };

  const handleCancelFilters = () => {
    setAdvancedFilters({});
    setShowAdvancedFilters(false);
  };

  const activeFiltersCount = Object.values(advancedFilters).filter(v => v !== "").length;

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="موظفي العقود المؤقتة"
        desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        onAdd={() => setShowAddModal(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <AdvancedFiltersTemp
        show={showAdvancedFilters}
        onCancel={handleCancelFilters}
        onApply={handleApplyFilters}
        onHide={() => setShowAdvancedFilters(false)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={(val) => { setPageSize(val); setPage(1); }}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setPage(1); }}
        totalCount={data?.recordsFiltered || 0}
        currentPage={page}
        onPageChange={setPage}
      />

      <TemporaryEmpTable
        employees={data?.data || []}
        loading={isLoading}
        isFetching={isFetching}
        totalCount={data?.recordsFiltered || 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <TempEmployeeModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="add"
      />
    </div>
  )
}

export default TemporaryContrastEmployees