import React, { useState } from "react";
import { FaEdit, FaTrash, FaFileDownload } from "react-icons/fa";
import Pagination from "./Pagination";
import ConfirmModal from "./ConfirmModal";
import { usePermissions } from "../hooks/usePermissions";

function AdministrativeAttachmentsTables({ employees, onEdit, onDelete, onDownload, isMutating }) {
  const { can } = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const itemsPerPage = 10;

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentData = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(deleteId);
    setShowConfirm(false);
  };

  return (
    <div className="animate-fade-in mt-4">
      <div className="card card-modern border-0 shadow-sm">
        <div className="card-body p-0 text-center">
          <div className="table-responsive">
            <table className="table table-modern table-hover align-middle mb-0 table-modern-container">
              <thead className="table-header-modern-pill">
                <tr>
                  <th style={{ width: "60px" }}>م</th>
                  <th>اسم الموظف</th>
                  <th>الحالة</th>
                  <th>الملاحظات</th>
                  <th>تاريخ الرفع</th>
                  <th style={{ width: "150px" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((emp, index) => (
                    <tr key={emp.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-medium text-dark">{emp.employee_name}</td>
                      <td>
                        <span className={`badge px-3 py-2 fw-normal ${emp.status === "accepted" ? "bg-success-subtle text-success border-success-subtle" :
                          emp.status === "refused" ? "bg-danger-subtle text-danger border-danger-subtle" :
                            "bg-warning-subtle text-warning border-warning-subtle"
                          } border`}>
                          {emp.status === 'accepted' ? 'مكتمل' : emp.status === 'refused' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td className="text-secondary small">{emp.notes || "---"}</td>
                      <td className="text-secondary small">{emp.upload_date || "---"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {emp.file_url && (
                            <button
                              onClick={() => onDownload(emp.id, `${emp.employee_name}_مرفق.${emp.file_extension || 'pdf'}`)}
                              className="btn-action-modern view"
                              title="تحميل"
                              disabled={isMutating}
                            >
                              <FaFileDownload />
                            </button>
                          )}
                          {can.editEmployees && (
                            <button
                              className="btn-action-modern edit"
                              onClick={() => onEdit(emp)}
                              title="تعديل الحالة"
                              disabled={isMutating}
                            >
                              <FaEdit />
                            </button>
                          )}
                          {can.deleteEmployees && (
                            <button
                              className="btn-action-modern delete"
                              onClick={() => handleDelete(emp.id, emp.employee_name)}
                              title="حذف"
                              disabled={isMutating}
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-5 text-center text-secondary">لا توجد مرفقات</td>
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

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف المرفق"
        message={`هل أنت متأكد أنك تريد حذف المرفق الخاص بـ "${deleteName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isMutating}
      />
    </div>
  );
}

export default AdministrativeAttachmentsTables;

