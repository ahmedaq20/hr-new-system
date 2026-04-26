// EmployeesTable.jsx
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import EditEmployeesForm from "../components/EditEmployeesForm";
import { useNavigate } from "react-router-dom";
import { useDeleteEmployee, useEmployee } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { usePermissions } from "../hooks/usePermissions";

function EmployeesTable({ employees, loading, isFetching, totalCount, currentPage = 1, pageSize = 10, onPageChange }) {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const lookups = useLookups();
  const [showEditForm, setShowEditForm] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);

  const { data: employeeData, isLoading: isFetchingEmployee, error: fetchError } = useEmployee(fetchingId);
  const selectedEmployee = employeeData?.data || null;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const deleteEmployee = useDeleteEmployee();
  const queryClient = useQueryClient();

  // Helper to resolve lookup labels
  const resolveLabel = (id, lookupKey) => {
    if (!id || !lookupKey || !lookups.data?.[lookupKey]) return null;
    const option = lookups.data[lookupKey].find(opt => String(opt.id) === String(id));
    return option ? option.value : null;
  };

  // Calculate total pages based on API total count
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const handleEditClick = (emp) => {
    setFetchingId(emp.id);
    setShowEditForm(true);
  };

  const handleShowWizard = (emp) => {
    navigate(`/employees/${emp.id}`);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteEmployee.mutate(employeeToDelete.id, {
        onSuccess: () => {
          toast.success("تم حذف الموظف بنجاح");
          setShowDeleteModal(false);
          setEmployeeToDelete(null);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
        }
      });
    }
  };

  useEffect(() => {
    if (fetchError) {
      toast.error("حدث خطأ أثناء جلب بيانات الموظف");
      setShowEditForm(false);
    }
  }, [fetchError]);

  return (
    <div className="card mt-4 position-relative overflow-hidden border-0 shadow-sm">
      {/* Background Fetching Indicator - Top Progress Bar */}
      {(isFetching && !loading) && (
        <div className="fetching-loader">
          <div className="fetching-loader-bar"></div>
        </div>
      )}

      <div className={`card-body p-0 transition-opacity ${isFetching && !loading ? 'opacity-50' : 'opacity-100'}`}>
        <table className="table table-hover text-center align-middle mb-0 table-modern-container">
          <thead className="table-header-modern-pill" style={{ background: '#f8f9fa' }}>
            <tr>
              <th className="py-3 px-2 text-secondary" style={{ width: "50px", fontSize: "0.85rem" }}>م</th>
              <th className="py-3 px-3 text-secondary text-end" style={{ minWidth: "200px", fontSize: "0.85rem" }}>الاسم الكامل</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>رقم الهوية</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>رقم الموظف</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>رقم الجوال</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>التصنيف</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>الدائرة</th>
              <th className="py-3 px-2 text-secondary" style={{ fontSize: "0.85rem" }}>المسمى الوظيفي</th>
              {(can.viewEmployees || can.editEmployees || can.deleteEmployees) && (
                <th className="py-3 px-2 text-secondary" style={{ width: "120px", fontSize: "0.85rem" }}>الإجراءات</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 9 : 8}>جارٍ التحميل...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 9 : 8}>لا توجد بيانات</td>
              </tr>
            ) : (
              employees.map((emp, index) => (
                <tr key={emp.id} className="hover-shadow-sm">
                  <td className="fw-bold text-secondary">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="text-end ps-3">
                    <div
                      className="text-truncate"
                      style={{ maxWidth: "220px" }}
                      title={emp.full_name}
                    >
                      {emp.full_name}
                    </div>
                  </td>
                  <td>{emp.national_id || "---"}</td>
                  <td><span className="badge bg-light text-dark border">{emp.employee_number}</span></td>
                  <td>{emp.primary_phone || "---"}</td>
                  <td>
                    {emp.employment_type_name ||
                      emp.classification_name ||
                      resolveLabel(emp.classification_id, "CLASSIFICATION") || "---"}
                  </td>
                  <td className="small text-truncate" style={{ maxWidth: "150px" }}>
                    {emp.department_name ||
                      resolveLabel(emp.work_department_id, "DEPARTMENT") || "---"}
                  </td>
                  <td className="small">
                    {emp.job_title_name ||
                      resolveLabel(emp.job_title_id, "JOB_TITLE") || "---"}
                  </td>
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
                            onClick={() => handleEditClick(emp)}
                            title="تعديل سريع"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {can.deleteEmployees && (
                          <button
                            className="btn-action-modern delete"
                            onClick={() => handleDeleteClick(emp)}
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

        {!loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>


      {/* مودال التعديل */}
      {showEditForm && (
        <div className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowEditForm(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-custom text-white py-3 px-4">
                <h5 className="modal-title fw-bold">تعديل الملف الشخصي للموظف</h5>
                <button type="button" className="btn-close btn-close-white m-0 me-auto shadow-none" onClick={() => setShowEditForm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 bg-white">
                {isFetchingEmployee ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-secondary">جارٍ تحميل بيانات الموظف...</p>
                  </div>
                ) : selectedEmployee ? (
                  <EditEmployeesForm
                    employee={selectedEmployee}
                    onSave={(updatedEmp) => {
                      queryClient.invalidateQueries({ queryKey: ['employees'] });
                      setShowEditForm(false);
                    }}
                    onCancel={() => setShowEditForm(false)}
                  />
                ) : (
                  <p className="text-center py-4">لم يتم العثور على بيانات الموظف</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال حذف موظف */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من حذف الموظف ${employeeToDelete?.full_name}؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={deleteEmployee.isPending}
        confirmText="نعم"
        cancelText="تراجع"
        confirmButtonClass="btn-danger"
      />

      <style>{`
        .transition-opacity {
          transition: opacity 0.3s ease-in-out;
        }

        .btn-action-modern {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #edf2f7;
          transition: all 0.2s ease;
          background: white;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .btn-action-modern.view { color: #002F6C; }
        .btn-action-modern.view:hover { background: #002F6C; color: white; border-color: #002F6C; transform: translateY(-2px); }

        .btn-action-modern.edit { color: #3182ce; }
        .btn-action-modern.edit:hover { background: #3182ce; color: white; border-color: #3182ce; transform: translateY(-2px); }

        .btn-action-modern.delete { color: #e53e3e; }
        .btn-action-modern.delete:hover { background: #e53e3e; color: white; border-color: #e53e3e; transform: translateY(-2px); }

        .fetching-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 10;
          background-color: rgba(0, 47, 108, 0.1);
        }

        .fetching-loader-bar {
          height: 100%;
          background-color: #002F6C;
          width: 30%;
          animation: moveLoader 1s infinite linear;
        }

        @keyframes moveLoader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }

        .hover-shadow-sm:hover {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
}

export default EmployeesTable;
