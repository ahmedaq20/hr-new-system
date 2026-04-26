import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import { usePermissions } from "../hooks/usePermissions";

function GovermentsTable({ employees, onUpdate, onDelete, isMutating }) {
  const { can } = usePermissions();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editData, setEditData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const currentData = employees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleDelete = (id, name) => {
    if (window.confirm(`هل أنت متأكد أنك تريد حذف "${name}"؟`)) {
      onDelete(id);
    }
  };

  const openViewModal = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const openEditModal = (item) => {
    setEditData({ ...item });
    setShowEditModal(true);
  };

  const saveEdit = () => {
    if (!editData) return;
    onUpdate(editData.id, editData.value);
    setShowEditModal(false);
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="animate-fade-in">
      <div className="card card-modern mt-4">
        <div className="card-body p-0">
          <table className="table table-modern table-hover text-center align-middle mb-0 table-modern-container">
            <thead className="table-header-modern-pill">
              <tr>
                <th style={{ width: "60px" }}>م</th>
                <th>القيمة</th>
                <th>عدد الموظفين</th>
                {can.manageLookups && <th style={{ width: "160px" }}>الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id} className="hover-shadow-sm">
                  <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{item.value}</td>
                  <td><span className="badge-modern bg-light text-dark border">{item.employee_count}</span></td>
                  {can.manageLookups && (
                    <td>
                      <div className="d-flex justify-content-center">
                        <button className="btn-action-modern view" onClick={() => openViewModal(item)} title="عرض">
                          <FaEye />
                        </button>
                        <button className="btn-action-modern edit" onClick={() => openEditModal(item)} title="تعديل">
                          <FaEdit />
                        </button>
                        <button className="btn-action-modern delete" onClick={() => handleDelete(item.id, item.value)} title="حذف">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {currentData.length === 0 && (
                <tr>
                  <td colSpan={can.manageLookups ? 4 : 3} className="py-5 text-secondary">لا توجد بيانات متاحة</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center p-3 border-top">
              <nav aria-label="Page navigation">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(1)}>
                      <FaAngleDoubleRight />
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link modern-pagination-btn" onClick={handlePrev}>
                      <FaAngleRight />
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                      <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link modern-pagination-btn" onClick={handleNext}>
                      <FaAngleLeft />
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
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

      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered className="modal-modern">
        <Modal.Header closeButton closeVariant="white" className="border-0" style={{ background: '#002F6C' }}>
          <Modal.Title className="fs-5 fw-bold text-white">عرض البيانات</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedItem && (
            <div className="text-end">
              <div className="mb-3">
                <label className="fw-bold text-secondary small d-block">القيمة</label>
                <p className="fs-5 mb-0">{selectedItem.value}</p>
              </div>
              <div className="mb-0">
                <label className="fw-bold text-secondary small d-block">عدد الموظفين</label>
                <p className="fs-5 mb-0">{selectedItem.employee_count}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 px-4 bg-light">
          <Button variant="light" className="rounded-pill px-4 fw-medium border shadow-sm w-100" onClick={() => setShowViewModal(false)}>
            إغلاق
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="modal-modern">
        <Modal.Header closeButton closeVariant="white" className="border-0" style={{ background: '#002F6C' }}>
          <Modal.Title className="fs-5 fw-bold text-white">تعديل البيانات</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editData && (
            <Form className="text-end">
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary small">القيمة</Form.Label>
                <Form.Control
                  type="text"
                  className="rounded-3 py-2 border-light-subtle shadow-sm"
                  value={editData.value}
                  onChange={(e) => handleEditChange("value", e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-secondary small">عدد الموظفين (للعرض فقط)</Form.Label>
                <Form.Control
                  type="number"
                  disabled
                  className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                  value={editData.employee_count}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 px-4 bg-light">
          <Button variant="light" className="rounded-pill px-4 fw-medium border shadow-sm" onClick={() => setShowEditModal(false)}>
            إلغاء
          </Button>
          <Button className="rounded-pill px-4 fw-medium bg-dark border-0 shadow text-white" onClick={saveEdit}>
            حفظ التعديلات
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GovermentsTable;
