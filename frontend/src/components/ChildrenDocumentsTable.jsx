import React, { useState } from "react";
import { FaEye, FaPaperclip } from "react-icons/fa";
import Pagination from "./Pagination";
import AdminChildDetailsModal from "./AdminChildDetailsModal";

function ChildrenDocumentsTable({ data, isMutating, currentPage, totalPages, onPageChange }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
      case 'approved':
        return <span className="badge px-3 py-2 fw-normal bg-success-subtle text-success border-success-subtle border">مقبول</span>;
      case 'refused':
      case 'rejected':
        return <span className="badge px-3 py-2 fw-normal bg-danger-subtle text-danger border-danger-subtle border">مرفوض</span>;
      default:
        return <span className="badge px-3 py-2 fw-normal bg-warning-subtle text-warning border-warning-subtle border">قيد الانتظار</span>;
    }
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
                  <th>اسم الابن/الابنة</th>
                  <th>رقم الهوية</th>
                  <th>تاريخ الميلاد</th>
                  <th>الجنس</th>
                  <th>الحالة</th>
                  <th style={{ width: "150px" }}>المرفقات</th>
                  <th style={{ width: "80px", borderRadius: '0 15px 0 0' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{item.row_number}</td>
                      <td className="fw-medium text-dark">{item.employee_name}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                          {item.full_name}
                        </span>
                      </td>
                      <td className="text-secondary small">{item.id_number || "---"}</td>
                      <td className="text-secondary small">{item.birth_date || "---"}</td>
                      <td className="text-secondary small">{item.gender || "---"}</td>
                      <td>{getStatusBadge(item.approval_status)}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {item.id_card_image ? (
                            <button
                                className="btn btn-outline-info btn-sm d-inline-flex align-items-center p-2 gap-1 border-0"
                                style={{ borderRadius: '8px', backgroundColor: '#e0f7fa' }}
                                onClick={() => window.open(item.id_card_image, '_blank')}
                                title="عرض الهوية"
                                disabled={isMutating}
                            >
                                <FaPaperclip />
                                <span className="small">هوية</span>
                            </button>
                          ) : null}
                          {item.birth_certificate_image ? (
                            <button
                                className="btn btn-outline-success btn-sm d-inline-flex align-items-center p-2 gap-1 border-0"
                                style={{ borderRadius: '8px', backgroundColor: '#e6ffe6' }}
                                onClick={() => window.open(item.birth_certificate_image, '_blank')}
                                title="عرض شهادة الميلاد"
                                disabled={isMutating}
                            >
                                <FaPaperclip />
                                <span className="small">ميلاد</span>
                            </button>
                          ) : null}
                          {item.university_certificate_image ? (
                            <button
                                className="btn btn-outline-primary btn-sm d-inline-flex align-items-center p-2 gap-1 border-0"
                                style={{ borderRadius: '8px', backgroundColor: '#e8eaf6', color: '#3f51b5' }}
                                onClick={() => window.open(item.university_certificate_image, '_blank')}
                                title="عرض شهادة القيد"
                                disabled={isMutating}
                            >
                                <FaPaperclip />
                                <span className="small">جامعة</span>
                            </button>
                          ) : null}
                          {!item.id_card_image && !item.birth_certificate_image && !item.university_certificate_image && (
                            <span className="text-muted small">---</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center p-2 border-0"
                                style={{ borderRadius: '8px', backgroundColor: '#f8f9fa' }}
                                onClick={() => {
                                    setSelectedChild(item);
                                    setShowDetailsModal(true);
                                }}
                                title="عرض التفاصيل"
                            >
                                <FaEye />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-5 text-center text-secondary">لا توجد بيانات أبناء</td>
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

      <AdminChildDetailsModal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          child={selectedChild}
      />
    </div>
  );
}

export default ChildrenDocumentsTable;
