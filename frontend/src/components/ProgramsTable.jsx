import React, { useState } from "react";
import { FaEdit, FaTrash, FaEye, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import ProgramModal from "./ProgramModal";
import ProgramViewModal from "./ProgramViewModal";
import ConfirmModal from "./ConfirmModal";

import { useUpdateProgram, useDeleteProgram } from "../hooks/usePrograms";
import toast from "react-hot-toast";
import { usePermissions } from "../hooks/usePermissions";

function ProgramsTable({ projects, totalCount, currentPage = 1, pageSize = 10, onPageChange }) {
  const { can } = usePermissions();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const onConfirmDelete = () => {
    if (!projectToDelete) return;

    deleteProgram.mutate(projectToDelete.id, {
      onSuccess: () => {
        toast.success("تم حذف المشروع بنجاح");
        setShowDeleteModal(false);
        setProjectToDelete(null);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
        setShowDeleteModal(false);
      }
    });
  };

  const openViewModal = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const saveEdit = (updatedProject) => {
    updateProgram.mutate({ id: updatedProject.id, data: updatedProject }, {
      onSuccess: () => {
        toast.success("تم تحديث المشروع بنجاح");
        setShowEditModal(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث")
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
                  <th>إسم المشروع</th>
                  <th>مدة المشروع</th>
                  <th>بداية المشروع</th>
                  <th>نهاية المشروع</th>
                  <th>الجهة الممولة</th>
                  {can.managePrograms && <th style={{ width: "160px" }}>الإجراءات</th>}
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((proj, index) => (
                    <tr key={proj.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className="fw-medium text-dark text-end ps-3">{proj.name}</td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal">{proj.duration}</span>
                      </td>
                      <td className="text-secondary small">
                        {proj.start_date ? proj.start_date.split('T')[0] : "-"}
                      </td>
                      <td className="text-secondary small">
                        {proj.end_date ? proj.end_date.split('T')[0] : "-"}
                      </td>
                      <td>{proj.funding_source}</td>
                      {can.managePrograms && (
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-action-modern view"
                              onClick={() => openViewModal(proj)}
                              title="عرض"
                            >
                              <FaEye />
                            </button>
                            <button
                              className="btn btn-action-modern edit"
                              onClick={() => openEditModal(proj)}
                              title="تعديل"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-action-modern delete"
                              onClick={() => handleDeleteClick(proj)}
                              title="حذف"
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
                    <td colSpan={can.managePrograms ? 7 : 6} className="py-5 text-center text-secondary">
                      <div className="d-flex flex-column align-items-center gap-2">
                        <i className="bi bi-inbox fs-2"></i>
                        <span>لا توجد مشاريع مضافة حالياً</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3 mb-3">
            <nav aria-label="Page navigation">
              <ul className="pagination mb-0">
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

      {/* Unified View Modal */}
      <ProgramViewModal
        show={showViewModal}
        project={selectedProject}
        onClose={() => setShowViewModal(false)}
      />

      {/* Unified Edit Modal */}
      <ProgramModal
        show={showEditModal}
        project={selectedProject}
        onClose={() => setShowEditModal(false)}
        onSave={saveEdit}
      />

      {/* Modern Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد أنك تريد حذف المشروع "${projectToDelete?.name}"؟ لا يمكن التراجع عن هذه العملية.`}
        isLoading={deleteProgram.isLoading}
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
      `}</style>
    </div>
  );
}

export default ProgramsTable;
