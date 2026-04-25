import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import UnitModal from "./UnitModal";
import Pagination from "./Pagination";
import { usePermissions } from "../hooks/usePermissions";

function UnitTable({ employees, onUpdate, onDelete, isMutating }) {
  const { can } = usePermissions();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentData = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDelete = (id) => {
    const item = employees.find(e => e.id === id);
    if (window.confirm(`هل أنت متأكد أنك تريد حذف الوحدة "${item.value}"؟`)) {
      onDelete(id);
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    if (selectedItem) {
      onUpdate(selectedItem.id, formData.name);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="animate-fade-in mt-2">
      <div className="card card-modern border-0 shadow-sm">
        <div className="card-body p-0 text-center">
          <div className="table-responsive">
            <table className="table table-modern table-hover align-middle mb-0 table-modern-container">
              <thead className="table-header-modern-pill">
                <tr>
                  <th style={{ width: "60px" }}>م</th>
                  <th>اسم الوحدة</th>
                  <th>عدد الموظفين</th>
                  {can.manageLookups && <th style={{ width: "120px" }}>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-medium text-dark">{item.value}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                          {item.employee_count ?? 0}
                        </span>
                      </td>
                      {can.manageLookups && (
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn-action-modern edit"
                              onClick={() => openEditModal(item)}
                              title="تعديل"
                              disabled={isMutating}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-action-modern delete"
                              onClick={() => handleDelete(item.id)}
                              title="حذف"
                              disabled={isMutating}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={can.manageLookups ? 4 : 3} className="py-5 text-center text-secondary">لا توجد نتائج مطابقة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <UnitModal
        show={showModal}
        item={selectedItem}
        isMutating={isMutating}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export default UnitTable;

