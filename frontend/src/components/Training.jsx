import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import Pagination from "./Pagination";
import ConfirmModal from "./ConfirmModal";

function Training({ projects, searchTerm = "", onEdit, onDelete, isMutating }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const itemsPerPage = 10;

  // Filtered data based on search term
  const filteredData = projects.filter(proj =>
    (proj.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proj.training_type?.value || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proj.training_classification?.value || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
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
    <div className="training-table-modern">
      <div className="card card-modern border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <div className="table-responsive">
          <table className="table table-modern table-hover align-middle mb-0 text-center">
            <thead className="table-header-modern-pill">
              <tr>
                <th style={{ width: "60px" }}>م</th>
                <th>اسم الدورة</th>
                <th>النوع</th>
                <th>التصنيف</th>
                <th>الفئة المستهدفة</th>
                <th>المدة</th>
                <th>مكان الإنعقاد</th>
                <th>تاريخ البداية</th>
                <th style={{ width: "150px" }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((proj, index) => (
                  <tr key={proj.id} className="hover-shadow-sm">
                    <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="fw-medium text-dark">{proj.name}</td>
                    <td>
                      <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                        {proj.training_type?.value || "---"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge px-3 py-2 fw-normal ${proj.training_classification?.value === "فني" ? "bg-info-subtle text-info border-info-subtle" :
                        proj.training_classification?.value === "إداري" ? "bg-primary-subtle text-primary border-primary-subtle" :
                          "bg-warning-subtle text-warning border-warning-subtle"
                        } border`}>
                        {proj.training_classification?.value || "---"}
                      </span>
                    </td>
                    <td className="text-secondary small">{proj.target_audience || "---"}</td>
                    <td className="text-secondary small">{proj.duration || "---"}</td>
                    <td className="text-secondary small">{proj.location || "---"}</td>
                    <td className="text-secondary small">{proj.start_date || "---"}</td>
                    <td>
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          className="btn-action-modern edit"
                          onClick={() => onEdit(proj)}
                          title="تعديل"
                          disabled={isMutating}
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          className="btn-action-modern delete"
                          onClick={() => handleDelete(proj.id, proj.name)}
                          title="حذف"
                          disabled={isMutating}
                        >
                          <FaTrash size={14} />
                        </button>
                        <button
                          className="btn-action-modern view"
                          title="عرض التفاصيل"
                          onClick={() => navigate(`/training/${proj.id}`)}
                          disabled={isMutating}
                        >
                          <FaEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-5 text-center text-secondary">لا توجد دورات مسجلة</td>
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

      <ConfirmModal
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الدورة التدريبية"
        message={`هل أنت متأكد أنك تريد حذف الدورة "${deleteName}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        isLoading={isMutating}
      />

      <style>{`
        .table-header-modern-pill th {
          background-color: #f8fafc;
          color: #64748b;
          font-weight: 600;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1.25rem 1rem;
          border-bottom: 2px solid #e2e8f0;
        }

        .btn-action-modern {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .btn-action-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .btn-action-modern.edit:hover { color: #002F6C; border-color: #002F6C; background: #f0f7ff; }
        .btn-action-modern.delete:hover { color: #ef4444; border-color: #ef4444; background: #fef2f2; }
        .btn-action-modern.view:hover { color: #10b981; border-color: #10b981; background: #ecfdf5; }

        .page-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          border-color: #002F6C;
          color: #002F6C;
          background: #f0f7ff;
        }

        .page-btn.active {
          background: #002F6C;
          color: white;
          border-color: #002F6C;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
}

export default Training;

