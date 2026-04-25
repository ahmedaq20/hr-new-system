import React, { useState } from 'react'
import EmployeesHeader from '../components/EmployeesHeader';
import EmployeesFilters from '../components/EmployeesFilters';
import AdvancedFilters from '../components/AdvancedFilters';
import TemporaryEmpTable from '../components/TemporaryEmpTable';
import TempEmployeeModal from '../components/TempEmployeeModal';
import { useTempContractEmployees } from '../hooks/useTempContractEmployees';

function TemporaryContrastEmployees() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTempContractEmployees({
    filter_full_name: searchTerm,
    page: page,
    length: pageSize
  });

  return (
    <div className="animate-fade-in">
      <EmployeesHeader
        title="موظفي العقود المؤقتة"
        desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"
        onToggleFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
        onAdd={() => setShowAddModal(true)}
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