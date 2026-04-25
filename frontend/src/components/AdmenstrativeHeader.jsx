function AdmenstrativeHeader({ title = "عنوان افتراضي", desc = "وصف", onAdd }) {
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
          <div>
            <button
              className="btn rounded-pill px-4 py-2 shadow-sm transition-all fw-bold text-white d-flex align-items-center gap-2"
              style={{ background: '#002F6C', border: 'none', fontSize: "14px" }}
              onClick={onAdd}
            >
              <i className="bi bi-plus-lg"></i>
              <span>إضافة مرفق جديد</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2); }
      `}</style>
    </div>
  );
}


export default AdmenstrativeHeader;
