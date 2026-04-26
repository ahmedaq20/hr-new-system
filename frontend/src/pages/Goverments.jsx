import { useState } from "react";
import CategoriesHeader from "../components/CategoriesHeader";
import GovermentsTable from "../components/GovermentsTable";
import EmployeesFilters from "../components/EmployeesFilters";
import { useReferenceData } from "../hooks/useReferenceData";

function Goverments() {
  const { items: ministries, isLoading, createItem, updateItem, deleteItem } = useReferenceData('MINISTRY');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredData = ministries?.filter(min =>
    min.value.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="الوزارات"
        description="إدارة البيانات المرجعية وإضافة أو تعديل أو حذف الوزارات."
        onAddCategory={(item) => createItem.mutate(item.name)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <GovermentsTable
        employees={filteredData}
        onUpdate={(id, value) => updateItem.mutate({ id, value })}
        onDelete={(id) => deleteItem.mutate(id)}
        isMutating={createItem.isLoading || updateItem.isLoading || deleteItem.isLoading}
      />
    </div>
  );
}

export default Goverments;
