import React, { useState } from "react";
import { FaEdit, FaTrash, FaFileDownload, FaEye, FaPaperclip } from "react-icons/fa";
import Pagination from "./Pagination";
import ConfirmModal from "./ConfirmModal";
import AdminEduCertificateDetailsModal from "./AdminEduCertificateDetailsModal";
import { usePermissions } from "../hooks/usePermissions";

function AcademicCertificatesTables({ employees, currentPage, pageSize, totalPages, onPageChange, onEdit, onDelete, onDownload, isMutating }) {
  const { can } = usePermissions();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const itemsPerPage = pageSize || 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const currentData = employees;

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
                  <th>الشهادة</th>
                  <th>المصدر</th>
                  <th>الحالة</th>
                  <th>الملاحظات</th>
                  <th>تاريخ الرفع</th>
                  <th style={{ width: "100px" }}>المرفقات</th>
                  <th style={{ width: "150px", borderRadius: '0 15px 0 0' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((emp, index) => (
                    <tr key={emp.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-medium text-dark">{emp.employee_name}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                          {emp.certificate_type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 fw-normal ${emp.source === 'degree' ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'} border`}>
                          {emp.source === 'degree' ? 'إضافة موظف' : 'إضافة إدارة'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 fw-normal ${emp.status === "accepted" ? "bg-success-subtle text-success border-success-subtle" :
                          emp.status === "refused" ? "bg-danger-subtle text-danger border-danger-subtle" :
                            "bg-warning-subtle text-warning border-warning-subtle"
                          } border`}>
                          {emp.status === 'accepted' ? 'مقبول' : emp.status === 'refused' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td className="text-secondary small">{emp.notes || "---"}</td>
                      <td className="text-secondary small">{emp.upload_date || "---"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {emp.file_url ? (
                            <button
                              className="btn btn-outline-info btn-sm d-inline-flex align-items-center p-2 gap-1 border-0"
                              style={{ borderRadius: '8px', backgroundColor: '#e0f7fa' }}
                              onClick={() => {
                                if (emp.source === 'degree') {
                                  window.open(emp.file_url, '_blank');
                                } else {
                                  onDownload(emp.id, `${emp.employee_name}_${emp.certificate_type}.${emp.file_extension || 'pdf'}`)
                                }
                              }}
                              title="عرض المرفق"
                              disabled={isMutating}
                            >
                              <FaPaperclip />
                              <span className="small">المرفق</span>
                            </button>
                          ) : (
                            <span className="text-muted small">---</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <button
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center p-2 border-0"
                            style={{ borderRadius: '8px', backgroundColor: '#f8f9fa' }}
                            onClick={() => {
                              setSelectedCert(emp);
                              setShowDetailsModal(true);
                            }}
                            title="عرض التفاصيل"
                          >
                            <FaEye />
                          </button>
                          {emp.source !== 'degree' && (can.editEmployees || can.deleteEmployees) && (
                            <>
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
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-5 text-center text-secondary">لا توجد وثائق</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الشهادة"
        message={`هل أنت متأكد أنك تريد حذف الشهادة الخاصة بـ "${deleteName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isMutating}
      />

      <AdminEduCertificateDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        cert={selectedCert}
      />
    </div>
  );
}

export default AcademicCertificatesTables;


