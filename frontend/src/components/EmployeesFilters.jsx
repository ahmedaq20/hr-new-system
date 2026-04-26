import { FaSearch, FaListOl, FaFilter } from "react-icons/fa";

function EmployeesFilters({ pageSize, onPageSizeChange, searchTerm, onSearchChange, statusFilter, onStatusChange, showStatusFilter = false }) {
  return (
    <div className="employees-filters-modern d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 p-3 bg-white rounded-4 shadow-sm border border-light-subtle mb-4">
      <div className="search-group w-100 flex-grow-1 position-relative">
        <FaSearch className="search-icon text-secondary" />
        <input
          type="text"
          className="form-control modern-search-input py-2"
          placeholder="ابحث عن موظف بالاسم، الهوية، أو أي معلومة متاحة..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {showStatusFilter && (
        <div className="d-flex align-items-center gap-2 status-filter-group">
          <div className="d-flex align-items-center gap-2 text-secondary">
            <FaFilter size={14} />
            <span style={{ fontSize: '0.85rem' }}>الحالة</span>
          </div>
          <select
            className="form-select modern-select py-1 px-4"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">الكل</option>
            <option value="accepted">مقبول</option>
            <option value="pending">قيد الانتظار</option>
            <option value="refused">مرفوض</option>
          </select>
        </div>
      )}

      <div className="d-flex align-items-center gap-3 page-size-group">
        <div className="d-flex align-items-center gap-2 text-secondary">
          <FaListOl size={14} />
          <span style={{ fontSize: '0.85rem' }}>عرض السجلات</span>
        </div>
        <select
          className="form-select modern-select py-1 px-4"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>


      <style>{`
        .employees-filters-modern {
          transition: all 0.3s ease;
        }

        .modern-search-input {
          padding-right: 40px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0, 47, 108, 0.1) !important;
          font-size: 0.9rem !important;
          background-color: #fbfbfc !important;
          transition: all 0.2s ease !important;
        }

        .modern-search-input:focus {
          border-color: #002F6C !important;
          background-color: white !important;
          box-shadow: 0 0 0 4px rgba(0, 47, 108, 0.05) !important;
        }

        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          font-size: 0.9rem;
          pointer-events: none;
        }

        .modern-select {
          width: auto !important;
          min-width: 90px;
          border-radius: 10px !important;
          border: 1px solid rgba(0, 47, 108, 0.1) !important;
          font-size: 0.85rem !important;
          cursor: pointer;
          background-color: #fbfbfc !important;
          transition: all 0.2s ease !important;
          text-align: center;
        }

        .modern-select:focus {
          border-color: #002F6C !important;
          box-shadow: 0 0 0 4px rgba(0, 47, 108, 0.05) !important;
        }

        .page-size-group {
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .employees-filters-modern {
            flex-direction: column;
            align-items: flex-end !important;
          }
        }
      `}</style>
    </div>
  );
}

export default EmployeesFilters;