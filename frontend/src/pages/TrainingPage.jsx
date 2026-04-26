import React, { useState } from 'react';
import TrainingHeader from '../components/TrainingHeader';
import Training from '../components/Training';
import EmployeesFilters from '../components/EmployeesFilters';
import TrainingModal from '../components/TrainingModal';
import { useTraining } from '../hooks/useTraining';

function TrainingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    courses = [],
    isLoading,
    createCourse,
    updateCourse,
    deleteCourse
  } = useTraining();

  const handleOpenModal = (item = null) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    if (selectedItem) {
      updateCourse.mutate({
        id: selectedItem.id,
        data: formData
      });
    } else {
      createCourse.mutate(formData);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDelete = (id) => {
    deleteCourse.mutate(id);
  };

  return (
    <div className="animate-fade-in">
      <TrainingHeader
        title="إدارة الدورات التدريبية"
        desc="يمكنك استعراض وإدارة الدورات التدريبية وورش العمل والتدريب الميداني."
        onAdd={() => handleOpenModal()}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      ) : (
        <Training
          projects={courses}
          searchTerm={searchTerm}
          pageSize={pageSize}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          isMutating={createCourse.isPending || updateCourse.isPending || deleteCourse.isPending}
        />
      )}

      <TrainingModal
        show={showModal}
        item={selectedItem}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        isMutating={createCourse.isPending || updateCourse.isPending}
      />
    </div>
  );
}

export default TrainingPage;
