import React, { useState } from "react";
import { FaEdit, FaTrash, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";
import EmpClassificationModal from "./EmpClassificationModal";

function EmpClassificationsTable({ employees, onUpdate, onDelete, isMutating }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentData = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleDelete = (id) => {
    const item = employees.find(e => e.id === id);
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${item.value}"؟`)) {
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
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-modern table-hover text-center align-middle mb-0 table-modern-container">
              <thead className="table-header-modern-pill">
                <tr>
                  <th style={{ width: "60px" }}>م</th>
                  <th>اسم التصنيف</th>
                  <th>عدد الموظفين</th>
                  <th style={{ width: "160px" }}>الإجراءات</th>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-5 text-center text-secondary">لا توجد نتائج مطابقة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center p-3 border-top">
              <nav aria-label="Page navigation">
                <ul className="pagination mb-0">
                  <li className={`page - item ${currentPage === 1 ? 'disabled' : ''} `}>
                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(1)}>
                      <FaAngleDoubleRight />
                    </button>
                  </li>
                  <li className={`page - item ${currentPage === 1 ? 'disabled' : ''} `}>
                    <button className="page-link modern-pagination-btn" onClick={handlePrev}>
                      <FaAngleRight />
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i + 1} className={`page - item ${i + 1 === currentPage ? 'active' : ''} `}>
                      <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page - item ${currentPage === totalPages ? 'disabled' : ''} `}>
                    <button className="page-link modern-pagination-btn" onClick={handleNext}>
                      <FaAngleLeft />
                    </button>
                  </li>
                  <li className={`page - item ${currentPage === totalPages ? 'disabled' : ''} `}>
                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(totalPages)}>
                      <FaAngleDoubleLeft />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Unified Add/Edit Modal */}
      <EmpClassificationModal
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

export default EmpClassificationsTable;
