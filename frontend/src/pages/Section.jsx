import React, { useState } from 'react';
import EmployeesFilters from '../components/EmployeesFilters';
import CategoriesHeader from "../components/CategoriesHeader";
import SectionTable from '../components/SectionTable';
import { useReferenceData } from '../hooks/useReferenceData';

function Section() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const {
    items: sections = [],
    isLoading,
    createItem,
    updateItem,
    deleteItem
  } = useReferenceData('SECTION');

  const handleAddItem = (formData) => {
    createItem.mutate(formData.name);
  };

  const filteredData = sections.filter(item =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <CategoriesHeader
        title="القسم"
        desc="يمكنك إدارة البيانات المرجعية وإضافة أو تعديل أو حذف القيم."
        onAddCategory={handleAddItem}
        isMutating={createItem.isPending}
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
        <SectionTable
          employees={filteredData}
          onUpdate={(id, value) => updateItem.mutate({ id, value })}
          onDelete={(id) => deleteItem.mutate(id)}
          isMutating={updateItem.isPending || deleteItem.isPending}
        />
      )}
    </div>
  )
}

export default Section;
