import React from "react";
import { FaPlus, FaChalkboardTeacher, FaUsers, FaBookOpen } from "react-icons/fa";

function TrainingHeader({ title, desc, onAdd }) {
  return (
    <div className="training-header-modern mb-4 animate-fade-in">
      {/* Header Card - Style copied from AcademicCertificatesHeader */}
      <div className="p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden mb-4">
        {/* Glassmorphism Background Accent */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

        <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="text-end">
            <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>
              {title}
            </h4>
            <p className="text-secondary mb-0" style={{ fontSize: "14px" }}>{desc}</p>
          </div>
          <div>
            <button
              className="btn rounded-pill px-4 py-2 shadow-sm transition-all fw-bold text-white d-flex align-items-center gap-2"
              style={{ background: '#002F6C', border: 'none', fontSize: "14px" }}
              onClick={onAdd}
            >
              <FaPlus size={14} />
              <span>إضافة دورة جديدة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="stat-card p-3 rounded-4 bg-white border border-light-subtle shadow-sm d-flex align-items-center gap-3">
            <div className="stat-icon p-3 rounded-3 bg-primary-subtle text-primary">
              <FaBookOpen size={20} />
            </div>
            <div className="text-end flex-grow-1">
              <div className="text-secondary small fw-medium">إجمالي الدورات</div>
              <div className="h4 fw-bold mb-0">12</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card p-3 rounded-4 bg-white border border-light-subtle shadow-sm d-flex align-items-center gap-3">
            <div className="stat-icon p-3 rounded-3 bg-success-subtle text-success">
              <FaChalkboardTeacher size={20} />
            </div>
            <div className="text-end flex-grow-1">
              <div className="text-secondary small fw-medium">إجمالي المدربين</div>
              <div className="h4 fw-bold mb-0">8</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card p-3 rounded-4 bg-white border border-light-subtle shadow-sm d-flex align-items-center gap-3">
            <div className="stat-icon p-3 rounded-3 bg-warning-subtle text-warning">
              <FaUsers size={20} />
            </div>
            <div className="text-end flex-grow-1">
              <div className="text-secondary small fw-medium">إجمالي المشاركين</div>
              <div className="h4 fw-bold mb-0">145</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .stat-card {
           transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.05) !important;
        }
        .hover-scale:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default TrainingHeader;
