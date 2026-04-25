import React, { useState } from 'react';
import EmployeesFilters from '../components/EmployeesFilters';
import CategoriesHeader from "../components/CategoriesHeader";
import CrossingTable from '../components/CrossingTable';
import { useReferenceData } from '../hooks/useReferenceData';

function Crossing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const {
    items: crossings = [],
    isLoading,
    createItem,
    updateItem,
    deleteItem
  } = useReferenceData('CROSSING');

  const handleAddItem = (formData) => {
    createItem.mutate(formData.name);
  };

  const filteredData = crossings.filter(item =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <CategoriesHeader
        title="المعابر"
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
        <CrossingTable
          employees={filteredData}
          onUpdate={(id, value) => updateItem.mutate({ id, value })}
          onDelete={(id) => deleteItem.mutate(id)}
          isMutating={updateItem.isPending || deleteItem.isPending}
        />
      )}
    </div>
  )
}

export default Crossing;
