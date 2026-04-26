import { useState } from "react";
import CategoriesHeader from "../components/CategoriesHeader"
import EmployeesFilters from "../components/EmployeesFilters";
import JobScaleTable from "../components/JobScaleTable"
import { useReferenceData } from "../hooks/useReferenceData";

function JobScale() {
  const { items: jobScales, isLoading, createItem, updateItem, deleteItem } = useReferenceData('JOB_SCALE');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredData = jobScales?.filter(item =>
    item.value.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="السلم الوظيفي"
        description="يمكنك إدارة البيانات المرجعية وإضافة أو تعديل أو حذف القيم."
        onAddCategory={(item) => createItem.mutate(item.name)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <JobScaleTable
        employees={filteredData}
        onUpdate={(id, value) => updateItem.mutate({ id, value })}
        onDelete={(id) => deleteItem.mutate(id)}
        isMutating={createItem.isPending || updateItem.isPending || deleteItem.isPending}
      />
    </div>
  )
}

export default JobScale;
