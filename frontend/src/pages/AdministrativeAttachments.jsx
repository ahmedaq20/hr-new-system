import { useState } from "react";
import AdmenstrativeHeader from '../components/AdmenstrativeHeader'
import EmployeesFilters from '../components/EmployeesFilters'
import AdministrativeAttachmentsTables from '../components/AdministrativeAttachmentsTables'
import AdministrativeAttachmentsModal from '../components/AdministrativeAttachmentsModal'
import { useDocuments } from '../hooks/useDocuments';
import { usePermissions } from '../hooks/usePermissions';

function AdministrativeAttachments() {
  const { can } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    documents = [],
    isLoading,
    uploadDocument,
    updateStatus,
    deleteDocument,
    downloadDocument
  } = useDocuments('administrative');

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
      data.append('notes', formData.notes || '');
      data.append('is_academic', '0');
      uploadDocument.mutate(data);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  const filteredData = documents.filter(item =>
    item.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === "" || item.status === statusFilter)
  );

  return (
    <div className="animate-fade-in">
      <AdmenstrativeHeader
        title="مرفقات إدارية"
        desc="يمكنك استعراض بيانات الموظفين والبحث المتقدم عبر الفلاتر التخصصية"
        onAdd={can.editEmployees ? (() => handleOpenModal()) : null}
      />
      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        showStatusFilter={true}
      />

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : (
        <AdministrativeAttachmentsTables
          employees={filteredData}
          onEdit={handleOpenModal}
          onDelete={(id) => deleteDocument.mutate(id)}
          onDownload={(id, fileName) => downloadDocument.mutate({ id, fileName })}
          isMutating={uploadDocument.isPending || updateStatus.isPending || deleteDocument.isPending || downloadDocument.isPending}
        />
      )}

      <AdministrativeAttachmentsModal
        show={showModal}
        item={selectedItem}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isMutating={uploadDocument.isPending || updateStatus.isPending}
      />
    </div>
  )
}

export default AdministrativeAttachments;
