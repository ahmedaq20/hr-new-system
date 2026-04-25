import { useState } from "react";
import AddGovermentModal from "./AddGovermentModal";

function GovermentsHeader({ title = "عنوان افتراضي", desc = "وصف", onAddItem }) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="employees-header d-flex justify-content-between align-items-center">
        <div>
          <h4 style={{ textAlign: "right", fontSize: "18px", fontWeight: "bold" }}>
            {title}
          </h4>
          <p style={{ fontSize: "14px" }}>{desc}</p>
        </div>

        <button
          className="btn btn-dark"
          style={{ fontSize: "13px", padding: "6px 10px" }}
          onClick={() => setShowAddModal(true)}
        >
          إضافة قيمة جديدة
        </button>
      </div>

      {showAddModal && (
        <AddGovermentModal
          onClose={() => setShowAddModal(false)}
          onSave={(item) => {
            onAddItem(item);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

export default GovermentsHeader;
