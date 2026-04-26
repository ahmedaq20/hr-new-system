import { Link } from "react-router-dom";
import { FaPlus, FaArrowRight } from "react-icons/fa";
import { usePermissions } from "../hooks/usePermissions";

function ProgramHeader({ title, desc, onOpenAddModal }) {
  const { can } = usePermissions();
  return (
    <div className="mb-4 animate-fade-in">
      <div className="p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden">
        {/* Glassmorphism Background Accent */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 position-relative" style={{ zIndex: 1 }}>
          <div className="header-text text-end">
            <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>
              {title}
            </h4>
            <p className="text-secondary mb-0" style={{ fontSize: "14px" }}>
              {desc}
            </p>
          </div>

          <div className="d-flex gap-2 justify-content-end align-items-center">
            <Link to="/temporary-contrast-employees" className="text-decoration-none">
              <button className="btn btn-modern-secondary d-flex align-items-center gap-2 px-3 py-2">
                <FaArrowRight size={14} />
                <span>الإنتقال إلى موظفي العقود المؤقتة</span>
              </button>
            </Link>
            {can.managePrograms && (
              <button
                className="btn btn-modern-add d-flex align-items-center gap-2 px-4 py-2"
                onClick={onOpenAddModal}
              >
                <FaPlus size={14} />
                <span>إضافة مشروع جديد</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .btn-modern-secondary {
          background-color: white;
          color: #002F6C;
          border: 1px solid rgba(0, 47, 108, 0.2);
          border-radius: 10px;
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .btn-modern-secondary:hover {
          background-color: #f8f9fa;
          border-color: #002F6C;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .btn-modern-add {
          background: #002F6C;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2);
        }
        .btn-modern-add:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 47, 108, 0.3);
          color: white;
          background: #002F6C;
        }

        .header-text {
          padding-right: 5px;
        }
      `}</style>
    </div>
  );
}

export default ProgramHeader;


