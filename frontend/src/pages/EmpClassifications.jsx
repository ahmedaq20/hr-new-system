import { useState } from "react";
import CategoriesHeader from "../components/CategoriesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import EmpClassificationsTable from "../components/EmpClassificationsTable";
import { useReferenceData } from "../hooks/useReferenceData";

function EmpClassifications() {
  const { items: classifications, isLoading, createItem, updateItem, deleteItem } = useReferenceData('CLASSIFICATION');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredData = classifications?.filter(c =>
    c.value.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <CategoriesHeader
        title="تصنيفات الموظفين العامة"
        description="إدارة البيانات المرجعية وإضافة أو تعديل أو حذف القيم."
        onAddCategory={(item) => createItem.mutate(item.name)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <EmpClassificationsTable
        employees={filteredData}
        onUpdate={(id, value) => updateItem.mutate({ id, value })}
        onDelete={(id) => deleteItem.mutate(id)}
        isMutating={createItem.isPending || updateItem.isPending || deleteItem.isPending}
      />
    </div>
  );
}

export default EmpClassifications;
