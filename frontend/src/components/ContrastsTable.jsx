import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteEmployee } from "../hooks/useEmployees";
import toast from "react-hot-toast";
import { FaEye, FaEdit, FaTrash, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";
import EditEmployeesForm from "../components/EditEmployeesForm";
import { usePermissions } from "../hooks/usePermissions";
function ContrastsTable({ employees, loading, totalCount, currentPage = 1, pageSize = 10, onPageChange }) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteEmployee = useDeleteEmployee();

  // ✅ حماية: تأكيد أن employees Array
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleDelete = (emp) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف ${emp.full_name}؟`)) return;

    deleteEmployee.mutate(emp.id, {
      onSuccess: () => {
        toast.success("تم حذف الموظف بنجاح");
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
      }
    });
  };

  const handleShowWizard = (emp) => {
    navigate(`/contract-employees/${emp.id}`);
  };

  return (
    <div className="card mt-4 position-relative overflow-hidden border-0 shadow-sm">
      <div className="card-body p-0">
        <table className="table table-hover text-center align-middle mb-0 table-modern-container">
          <thead className="table-header-modern-pill">
            <tr className="bg-light">
              <th style={{ width: "50px" }}>م</th>
              <th style={{ minWidth: "200px" }}>الاسم الكامل</th>
              <th>التصنيف</th>
              <th>رقم الهوية</th>
              <th>رقم الموظف</th>
              <th>الدائرة</th>
              <th>المسمى الوظيفي</th>
              {(can.viewEmployees || can.editEmployees || can.deleteEmployees) && (
                <th style={{ width: "120px" }}>الإجراءات</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 8 : 7}>جارٍ التحميل...</td>
              </tr>
            ) : safeEmployees.length === 0 ? (
              <tr>
                <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 8 : 7}>لا توجد بيانات</td>
              </tr>
            ) : (
              safeEmployees.map((emp, index) => (
                <tr key={emp.id} className="hover-shadow-sm">
                  <td className="fw-bold text-secondary">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="text-end ps-3">
                    <div className="text-truncate" style={{ maxWidth: "220px" }} title={emp.full_name}>
                      {emp.full_name || "-"}
                    </div>
                  </td>
                  <td>{emp.employment_type_name || "-"}</td>
                  <td>{emp.national_id || "-"}</td>
                  <td><span className="badge bg-light text-dark border">{emp.employee_number || "-"}</span></td>
                  <td className="small text-truncate" style={{ maxWidth: "150px" }}>
                    {emp.department_name || "-"}
                  </td>
                  <td className="small">{emp.work_detail?.job_title || emp.job_title_name || "-"}</td>
                  {(can.viewEmployees || can.editEmployees || can.deleteEmployees) && (
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        {can.viewEmployees && (
                          <button
                            className="btn-action-modern view"
                            onClick={() => handleShowWizard(emp)}
                            title="عرض التفاصيل الكاملة"
                          >
                            <FaEye />
                          </button>
                        )}
                        {can.editEmployees && (
                          <button
                            className="btn-action-modern edit"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setShowEditForm(true);
                            }}
                            title="تعديل سريع"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {can.deleteEmployees && (
                          <button
                            className="btn-action-modern delete"
                            onClick={() => handleDelete(emp)}
                            title="حذف الموظف"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3 mb-3">
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={() => onPageChange(1)} aria-label="First">
                    <FaAngleDoubleRight />
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={handlePrev} aria-label="Previous">
                    <FaAngleRight />
                  </button>
                </li>

                {(() => {
                  const pages = [];
                  const maxPagesToShow = 5;
                  const range = [];

                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) range.push(i);
                  } else {
                    if (currentPage <= 4) {
                      range.push(1, 2, 3, 4, 5, '...', totalPages);
                    } else if (currentPage >= totalPages - 3) {
                      range.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    } else {
                      range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                    }
                  }

                  return range.map((page, index) => {
                    if (page === '...') {
                      return (
                        <li key={`ellipsis-${index}`} className="page-item disabled">
                          <span className="page-link modern-pagination-ellipsis">...</span>
                        </li>
                      );
                    }
                    return (
                      <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        <button className="page-link modern-pagination-btn" onClick={() => onPageChange(page)}>
                          {page}
                        </button>
                      </li>
                    );
                  });
                })()}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={handleNext} aria-label="Next">
                    <FaAngleLeft />
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={() => onPageChange(totalPages)} aria-label="Last">
                    <FaAngleDoubleLeft />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* مودال التعديل */}
      {showEditForm && selectedEmployee && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowEditForm(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-custom text-white py-3 px-4">
                <h5 className="modal-title fw-bold">تعديل بيانات الموظف</h5>
                <button type="button" className="btn-close btn-close-white m-0 me-auto shadow-none" onClick={() => setShowEditForm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 bg-white">
                <EditEmployeesForm
                  employee={selectedEmployee}
                  onSave={(updatedEmp) => {
                    queryClient.invalidateQueries({ queryKey: ['employees'] });
                    setShowEditForm(false);
                  }}
                  onCancel={() => setShowEditForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .btn-action-modern {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          background: #f8f9fa;
          font-size: 14px;
        }

        .btn-action-modern.view { color: #002F6C; border-color: rgba(0, 47, 108, 0.1); }
        .btn-action-modern.view:hover { background: #002F6C; color: white; transform: translateY(-2px); }

        .btn-action-modern.edit { color: #0d6efd; border-color: rgba(13, 110, 253, 0.1); }
        .btn-action-modern.edit:hover { background: #0d6efd; color: white; transform: translateY(-2px); }

        .btn-action-modern.delete { color: #dc3545; border-color: rgba(220, 53, 69, 0.1); }
        .btn-action-modern.delete:hover { background: #dc3545; color: white; transform: translateY(-2px); }

        .hover-shadow-sm:hover {
          background-color: #f8f9fa;
        }

        .modern-pagination-btn {
          margin: 0 3px;
          border-radius: 8px !important;
          border: 1px solid rgba(0, 47, 108, 0.1) !important;
          color: #002F6C !important;
          background-color: #fff !important;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          transition: all 0.2s ease;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .modern-pagination-btn:hover:not(:disabled) {
          background-color: #f0f4f8 !important;
          border-color: #002F6C !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 47, 108, 0.1);
        }

        .page-item.active .modern-pagination-btn {
          background: linear-gradient(135deg, #002F6C, #004a99) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2);
        }

        .page-item.disabled .modern-pagination-btn {
          opacity: 0.5;
          background-color: #f8f9fa !important;
          border-color: #e9ecef !important;
          cursor: not-allowed;
        }

        .modern-pagination-ellipsis {
          border: none !important;
          background: transparent !important;
          color: #adb5bd !important;
        }

        .bg-custom {
          background-color: #002F6C !important;
        }
      `}</style>
    </div>
  );
}

export default ContrastsTable;
