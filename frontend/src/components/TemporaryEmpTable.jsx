import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import TempEmployeeModal from "./TempEmployeeModal";
import ConfirmModal from "./ConfirmModal";
import { useUpdateTempEmployee, useDeleteTempEmployee } from "../hooks/useTempContractEmployees";
import toast from "react-hot-toast";
import { usePermissions } from "../hooks/usePermissions";

function TemporaryEmpTable({ employees, loading, totalCount, currentPage = 1, pageSize = 10, onPageChange }) {
  const { can } = usePermissions();
  const [modalShow, setModalShow] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add", "edit", "view"
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const deleteTempEmployee = useDeleteTempEmployee();

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  const handleActionClick = (emp, mode) => {
    setSelectedEmployeeId(emp.id);
    setModalMode(mode);
    setModalShow(true);
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = () => {
    if (!employeeToDelete) return;

    deleteTempEmployee.mutate(employeeToDelete.id, {
      onSuccess: () => {
        toast.success("تم حذف الموظف بنجاح");
        setShowDeleteModal(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
        setShowDeleteModal(false);
      }
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="card card-modern border-0 shadow-sm mt-4">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-modern table-hover text-center align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>م</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهوية</th>
                  <th>رقم الجوال</th>
                  <th>تاريخ الميلاد</th>
                  <th>المشروع</th>
                  <th>طبيعة العمل</th>
                  <th>بداية العقد</th>
                   {(can.viewEmployees || can.editEmployees || can.deleteEmployees) && (
                     <th style={{ width: "160px" }}>الإجراءات</th>
                   )}
                 </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 9 : 8}>
                      <div className="d-flex justify-content-center p-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">جارٍ التحميل...</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={can.viewEmployees || can.editEmployees || can.deleteEmployees ? 9 : 8} className="p-5 text-secondary text-center">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-inbox fs-2"></i>
                        <span>لا توجد بيانات متاحة حالياً</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  employees.map((emp, index) => (
                    <tr key={emp.id || index} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="text-end ps-3 fw-medium">{emp.full_name}</td>
                      <td>{emp.national_id}</td>
                      <td>{emp.primary_phone}</td>
                      <td className="small text-secondary">{emp.birth_date}</td>
                      <td>
                        <span className="badge-modern bg-light text-dark border fw-normal">
                          {emp.project_name}
                        </span>
                      </td>
                      <td className="small">{emp.position_type}</td>
                       <td className="small text-secondary">{emp.start_contract_date}</td>
                       {(can.viewEmployees || can.editEmployees || can.deleteEmployees) && (
                         <td>
                           <div className="d-flex justify-content-center gap-2">
                             {can.viewEmployees && (
                               <button
                                 className="btn-action-modern view"
                                 onClick={() => handleActionClick(emp, "view")}
                                 title="عرض"
                               >
                                 <FaEye />
                               </button>
                             )}
                             {can.editEmployees && (
                               <button
                                 className="btn-action-modern edit"
                                 onClick={() => handleActionClick(emp, "edit")}
                                 title="تعديل"
                               >
                                 <FaEdit />
                               </button>
                             )}
                             {can.deleteEmployees && (
                               <button
                                 className="btn-action-modern delete"
                                 onClick={() => handleDeleteClick(emp)}
                                 title="حذف"
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
          </div>
        </div>

        {!loading && totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3 mb-3">
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={() => onPageChange(1)}>
                    <FaAngleDoubleRight />
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={handlePrev}>
                    <FaAngleRight />
                  </button>
                </li>

                {(() => {
                  const range = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) range.push(i);
                  } else {
                    if (currentPage <= 4) range.push(1, 2, 3, 4, 5, '...', totalPages);
                    else if (currentPage >= totalPages - 3) range.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                    else range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                  }
                  return range.map((p, i) => (
                    <li key={i} className={`page-item ${p === currentPage ? 'active' : ''} ${p === '...' ? 'disabled' : ''}`}>
                      {p === '...' ? (
                        <span className="page-link modern-pagination-ellipsis">...</span>
                      ) : (
                        <button className="page-link modern-pagination-btn" onClick={() => onPageChange(p)}>
                          {p}
                        </button>
                      )}
                    </li>
                  ));
                })()}

                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={handleNext}>
                    <FaAngleLeft />
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link modern-pagination-btn" onClick={() => onPageChange(totalPages)}>
                    <FaAngleDoubleLeft />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      <TempEmployeeModal
        show={modalShow}
        onClose={() => setModalShow(false)}
        mode={modalMode}
        employeeId={selectedEmployeeId}
      />

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد أنك تريد حذف الموظف "${employeeToDelete?.full_name}"؟ لا يمكن التراجع عن هذه العملية.`}
        isLoading={deleteTempEmployee.isLoading}
      />

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
        }

        .modern-pagination-btn:hover:not(:disabled) {
          background-color: #f0f4f8 !important;
          border-color: #002F6C !important;
          transform: translateY(-2px);
        }

        .page-item.active .modern-pagination-btn {
          background: linear-gradient(135deg, #002F6C, #004a99) !important;
          color: white !important;
          border-color: transparent !important;
        }

        .modern-pagination-ellipsis {
          border: none !important;
          background: transparent !important;
          color: #adb5bd !important;
        }
      `}</style>
    </div>
  );
}

export default TemporaryEmpTable;
