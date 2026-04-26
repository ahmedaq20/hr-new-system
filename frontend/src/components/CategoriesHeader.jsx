import React, { useState } from "react";
import AddCategoryModal from "./AddCategoryModal";
import { usePermissions } from "../hooks/usePermissions";

function CategoriesHeader({ title, desc, onAddCategory }) {
  const { can } = usePermissions();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="mb-4 animate-fade-in">
      <div className="p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden">
        {/* Glassmorphism Background Accent */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

        <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
          <div className="text-end">
            <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>
              {title}
            </h4>
            <p className="text-secondary mb-0" style={{ fontSize: "14px" }}>{desc}</p>
          </div>
          {can.manageLookups && (
            <div>
              <button
                className="btn rounded-pill px-4 py-2 shadow-sm transition-all fw-bold text-white d-flex align-items-center gap-2"
                style={{ background: '#002F6C', border: 'none', fontSize: "14px" }}
                onClick={() => setShowAddModal(true)}
              >
                <i className="bi bi-plus-lg"></i>
                <span>إضافة قيمة جديدة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 p-3 rounded-3 bg-primary-subtle border border-primary-subtle">
        <div className="d-flex align-items-center gap-2 text-primary-emphasis">
          <i className="bi bi-info-circle-fill"></i>
          <p className="mb-0 small fw-medium">
            يمكن للإداري إدخال قيم للموظفين الذين لا يمتلكون التصنيف من خلال تعديل بيانات الموظفين
          </p>
        </div>
      </div>

      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={(category) => {
            onAddCategory(category);
            setShowAddModal(false);
          }}
        />
      )}

      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2); }
      `}</style>
    </div>
  );
}

export default CategoriesHeader;
