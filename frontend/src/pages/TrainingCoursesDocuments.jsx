import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import AcademicCertificatesHeader from '../components/AcademicCertificatesHeader';
import EmployeesFilters from '../components/EmployeesFilters';
import TrainingCoursesDocumentsTable from '../components/TrainingCoursesDocumentsTable';

function TrainingCoursesDocuments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-training-participants', currentPage, pageSize, debouncedSearch, statusFilter],
    queryFn: async () => {
      const { data } = await api.get(ENDPOINTS.ADMIN.TRAINING_PARTICIPANTS, {
        params: {
          start: (currentPage - 1) * pageSize,
          length: pageSize,
          search: debouncedSearch,
          status: statusFilter,
          draw: currentPage
        }
      });
      return data;
    },
  });

  const participants = data?.data || [];
  const meta = data?.meta || null;

  return (
    <div className="animate-fade-in">
      <AcademicCertificatesHeader
        title="الدورات التدريبية"
        desc="عرض الدورات التدريبية المقبولة التي أضافها الموظفون والدورات الداخلية التي شارك فيها الموظفين"
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={(newStatus) => {
          setStatusFilter(newStatus);
          setCurrentPage(1);
        }}
        showStatusFilter={true}
      />

      {isLoading && !participants.length ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : (
        <TrainingCoursesDocumentsTable
          data={participants}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={meta?.last_page || 1}
          onPageChange={setCurrentPage}
          isMutating={false}
        />
      )}
    </div>
  );
}

export default TrainingCoursesDocuments;
