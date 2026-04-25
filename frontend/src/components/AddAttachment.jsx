import React, { useState } from "react";

function AddAttachment() {
  const [form, setForm] = useState({
    employee: "",
    certificate: "",
    attachment: null,
    notes: "",
  });

  return (
    <div className="card p-3">
      <h5 className="mb-3">إضافة مرفق</h5>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">الموظف</label>
          <select
            className="form-select"
            value={form.employee}
            onChange={(e) =>
              setForm({ ...form, employee: e.target.value })
            }
          >
            <option value="">اختر الموظف</option>
            <option>ولاء عايش</option>
            <option>علي أبو العطا</option>
             <option>حسام حرز</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">الشهادة</label>
          <select
            className="form-select"
            value={form.certificate}
            onChange={(e) =>
              setForm({ ...form, certificate: e.target.value })
            }
          >
            <option value="">اختر الشهادة</option>
            <option>بكالوريوس</option>
            <option>ماجستير</option>
            <option>دكتوراه</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">إرفاق الملف</label>
        <input
          type="file"
          className="form-control"
          onChange={(e) =>
            setForm({ ...form, attachment: e.target.files[0] })
          }
        />
      </div>

      <div className="mb-3">
        <label className="form-label">ملاحظات</label>
        <input
          type="text"
          className="form-control"
          placeholder="أدخل الملاحظات"
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
        />
      </div>

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-dark">رفع االمرفق</button>
      </div>
    </div>
  );
}

export default AddAttachment;