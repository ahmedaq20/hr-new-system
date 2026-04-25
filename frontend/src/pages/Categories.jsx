import { useState } from "react";
import CategoriesTable from "../components/CategoriesTable";
import CategoriesHeader from "../components/CategoriesHeader";
import EmployeesFilters from "../components/EmployeesFilters";
import { useReferenceData } from "../hooks/useReferenceData";

function Categories() {
  const { items: categories, isLoading, createItem, updateItem, deleteItem } = useReferenceData('CATEGORY');
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const filteredCategories = categories?.filter(cat =>
    cat.value.toLowerCase().includes(searchTerm.toLowerCase())
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
        title="الفئات"
        description="يمكنك إدارة البيانات المرجعية وإضافة أو تعديل أو حذف القيم."
        onAddCategory={(item) => createItem.mutate(item.name)}
      />

      <EmployeesFilters
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <CategoriesTable
        employees={filteredCategories}
        onUpdate={(id, value) => updateItem.mutate({ id, value })}
        onDelete={(id) => deleteItem.mutate(id)}
        isMutating={createItem.isPending || updateItem.isPending || deleteItem.isPending}
      />
    </div>
  );
}

export default Categories;
