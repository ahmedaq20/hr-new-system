import { useState } from "react";

function AddProgramsModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    interval: "",
    ProStart: "",
    ProFinished: "",
    Organize: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000
      }}
    >
      <div className="card" style={{ width: "500px" }}>
        <div className="card-body">
          <h5 className="mb-3">إضافة مشروع جديد</h5>

          <div className="mb-2">
            <label className="form-label">اسم المشروع</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">مدة المشروع</label>
            <input
              className="form-control"
              name="interval"
              value={form.interval}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">بداية المشروع</label>
            <input
              type="date"
              className="form-control"
              name="ProStart"
              value={form.ProStart}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <label className="form-label">نهاية المشروع</label>
            <input
              type="date"
              className="form-control"
              name="ProFinished"
              value={form.ProFinished}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">الجهة الممولة</label>
            <input
              className="form-control"
              name="Organize"
              value={form.Organize}
              onChange={handleChange}
            />
          </div>

          <div className="d-flex justify-content-between">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              إلغاء
            </button>
            <button
              className="btn btn-dark"
              onClick={() => onSave(form)}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProgramsModal;
