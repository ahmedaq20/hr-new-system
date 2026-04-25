import { useState } from "react";
import CategoriesHeader from "../components/CategoriesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import TypeOfEmpTable from "../components/TypeOfEmpTable";
import { useReferenceData } from "../hooks/useReferenceData";

function EmpType() {
  const { items: types, isLoading, createItem, updateItem, deleteItem } = useReferenceData('EMPLOYMENT_TYPE');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredTypes = types?.filter(t =>
    t.value.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="أنواع التوظيف"
        description="إدارة تصنيفات وأنواع التوظيف المختلفة في النظام."
        onAddCategory={(item) => createItem.mutate(item.name)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <TypeOfEmpTable
        employees={filteredTypes}
        onUpdate={(id, value) => updateItem.mutate({ id, value })}
        onDelete={(id) => deleteItem.mutate(id)}
        isMutating={createItem.isPending || updateItem.isPending || deleteItem.isPending}
      />
    </div>
  );
}

export default EmpType;
