import React, { useState } from "react";
import { FaEye, FaPaperclip } from "react-icons/fa";
import Pagination from "./Pagination";
import AdminCourseDetailsModal from "./AdminCourseDetailsModal";

function TrainingCoursesDocumentsTable({ data, currentPage, pageSize, totalPages, onPageChange, isMutating }) {
  const itemsPerPage = pageSize || 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const currentData = data;

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
                  <th>اسم الدورة</th>
                  <th>الجهة المنظمة</th>
                  <th>عدد الساعات</th>
                  <th>التاريخ</th>
                  <th>المصدر</th>
                  <th>الحالة</th>
                  <th style={{ width: "100px" }}>المرفقات</th>
                  <th style={{ width: "80px", borderRadius: '0 15px 0 0' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr key={item.id} className="hover-shadow-sm">
                      <td className="fw-bold text-secondary">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-medium text-dark">{item.employee_name}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-3 py-2 fw-normal">
                          {item.course_name}
                        </span>
                      </td>
                      <td className="text-secondary small">{item.institution || "---"}</td>
                      <td className="text-secondary small">{item.course_hours || "---"}</td>
                      <td className="text-secondary small">{item.course_date || "---"}</td>
                      <td>
                        <span className={`badge px-3 py-2 fw-normal ${item.source === 'manual' ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'} border`}>
                          {item.source === 'manual' ? 'إضافة موظف' : 'دورة معتمدة'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-3 py-2 fw-normal ${item.status === "accepted" ? "bg-success-subtle text-success border-success-subtle" :
                          item.status === "refused" ? "bg-danger-subtle text-danger border-danger-subtle" :
                            "bg-warning-subtle text-warning border-warning-subtle"
                          } border`}>
                          {item.status === 'accepted' ? 'مقبول' : item.status === 'refused' ? 'مرفوض' : 'قيد الانتظار'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          {item.certificate_url ? (
                            <button
                                className="btn btn-outline-info btn-sm d-inline-flex align-items-center p-2 gap-1 border-0"
                                style={{ borderRadius: '8px', backgroundColor: '#e0f7fa' }}
                                onClick={() => window.open(item.certificate_url, '_blank')}
                                title="عرض الشهادة"
                                disabled={isMutating}
                            >
                                <FaPaperclip />
                                <span className="small">شهادة</span>
                            </button>
                          ) : (
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
                                    setSelectedCourse(item);
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
                    <td colSpan="10" className="py-5 text-center text-secondary">لا توجد دورات تدريبية</td>
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

      <AdminCourseDetailsModal
          show={showDetailsModal}
          onHide={() => setShowDetailsModal(false)}
          course={selectedCourse}
      />
    </div>
  );
}

export default TrainingCoursesDocumentsTable;
