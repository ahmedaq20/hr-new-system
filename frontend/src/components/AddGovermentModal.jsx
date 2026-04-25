// AddGovermentModal.jsx
import { useState } from "react";

function AddGovermentModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [secondValue, setSecondValue] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
       onSave({ name, secondValue });
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">إضافة قيمة جديدة</h5>
            <button className="btn-close mx-2" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <label className="form-label">اسم القيمة</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}/>
              <label className="form-label mt-2">عدد الموظفين</label>
              <input
                type="text"
                className="form-control"
                value={secondValue}
                onChange={(e) => setSecondValue(e.target.value)}/>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button className="btn btn-dark" onClick={handleSave}>
              حفظ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AddGovermentModal;
