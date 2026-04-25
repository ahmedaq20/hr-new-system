import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import AcademicCertificatesHeader from '../components/AcademicCertificatesHeader';
import EmployeesFilters from '../components/EmployeesFilters';
import SpousesDocumentsTable from '../components/SpousesDocumentsTable';

function SpousesDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-spouses', currentPage, pageSize, debouncedSearch, statusFilter],
    queryFn: async () => {
      const start = (currentPage - 1) * pageSize;
      const { data } = await api.get(ENDPOINTS.ADMIN.SPOUSES, {
        params: {
          start,
          length: pageSize,
          search: debouncedSearch || undefined,
          status: statusFilter,
          draw: currentPage,
        },
      });
      return data;
    },
    placeholderData: (previousData) => previousData,
  });

  const data = response?.data || [];
  const recordsFiltered = response?.recordsFiltered || 0;
  const totalPages = Math.ceil(recordsFiltered / pageSize);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="animate-fade-in">
      <AcademicCertificatesHeader
        title="الأزواج"
        desc="عرض بيانات أزواج המوظفين المسجلة في النظام"
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={(newStatus) => {
            setStatusFilter(newStatus);
            setCurrentPage(1);
        }}
        showStatusFilter={true}
      />

      {isLoading && !response ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : (
        <SpousesDocumentsTable
          data={data}
          isMutating={false}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

export default SpousesDocuments;
