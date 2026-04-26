import { useState, useEffect } from "react";
import AcademicCertificatesHeader from '../components/AcademicCertificatesHeader'
import EmployeesFilters from '../components/EmployeesFilters'
import AcademicCertificatesTables from '../components/AcademicCertificatesTables'
import AcademicCertificatesModal from '../components/AcademicCertificatesModal'
import { useDocuments } from '../hooks/useDocuments';
import { usePermissions } from '../hooks/usePermissions';

function AcademicCertifcates() {
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    documents,
    meta,
    isLoading,
    uploadDocument,
    updateStatus,
    deleteDocument,
    downloadDocument
  } = useDocuments('academic', {
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch,
    status: statusFilter
  });

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    if (selectedItem) {
      updateStatus.mutate({
        id: selectedItem.id,
        status: formData.status,
        notes: formData.notes
      });
    } else {
      const data = new FormData();
      data.append('file', formData.file);
      data.append('employee_id', formData.employee_id);
      data.append('reference_value_id', formData.reference_value_id);
      data.append('notes', formData.notes || '');
      data.append('is_academic', '1');
      uploadDocument.mutate(data);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="animate-fade-in">
      <AcademicCertificatesHeader
        title="الشهادات الأكاديمية"
        desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"
        onAdd={can.editEmployees ? (() => handleOpenModal()) : null}
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

      {isLoading && !documents.length ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : (
        <AcademicCertificatesTables
          employees={documents}
          currentPage={currentPage}
          pageSize={pageSize}
          totalPages={meta?.last_page || 1}
          onPageChange={setCurrentPage}
          onEdit={handleOpenModal}
          onDelete={(id) => deleteDocument.mutate(id)}
          onDownload={(id, fileName) => downloadDocument.mutate({ id, fileName })}
          isMutating={uploadDocument.isPending || updateStatus.isPending || deleteDocument.isPending || downloadDocument.isPending}
        />
      )}

      <AcademicCertificatesModal
        show={showModal}
        item={selectedItem}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isMutating={uploadDocument.isPending || updateStatus.isPending}
      />
    </div>
  )
}

export default AcademicCertifcates;

