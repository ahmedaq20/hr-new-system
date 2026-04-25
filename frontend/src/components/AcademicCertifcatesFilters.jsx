function AcademicCertifactesFilters() {
  return (
    <div
      className="employees-filters d-flex align-items-center gap-2 mt-3"
      style={{ fontSize: "12px" }}>
      <select className="form-select" style={{ width: "150px", fontSize: "12px" }}>
        <option value="">نوع الموظف</option>
        <option value="official">رسمي</option>
        <option value="temporary">مؤقت</option>
        <option value="contract">عقد</option>
      </select>
      <select className="form-select" style={{ width: "150px", fontSize: "12px" }}>
        <option value="">الحالة</option>
        <option value="active">نشط</option>
        <option value="retired">متقاعد</option>
        <option value="dismissed">مفصول</option>
      </select>
      <button className="btn btn-dark" style={{ fontSize: "12px" }}>
        البحث
      </button>
      <button className="btn btn-secondary" style={{ fontSize: "12px" }}>
        إعادة التعيين
      </button>
    </div>
  );
}

export default AcademicCertifactesFilters;