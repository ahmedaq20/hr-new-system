import React from "react";
import { FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft } from "react-icons/fa";

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    const renderPageButton = (page, index) => {
        if (page === '...') {
            return (
                <li key={`ellipsis-${index}`} className="page-item disabled">
                    <span className="page-link modern-pagination-ellipsis">...</span>
                </li>
            );
        }
        return (
            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                <button className="page-link modern-pagination-btn" onClick={() => onPageChange(page)}>
                    {page}
                </button>
            </li>
        );
    };

    const getPageRange = () => {
        const range = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) range.push(i);
        } else {
            if (currentPage <= 4) {
                range.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                range.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return range;
    };

    return (
        <div className="d-flex justify-content-center mt-3">
            <nav aria-label="Page navigation">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link modern-pagination-btn" onClick={() => onPageChange(1)} aria-label="First">
                            <FaAngleDoubleRight />
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link modern-pagination-btn" onClick={handlePrev} aria-label="Previous">
                            <FaAngleRight />
                        </button>
                    </li>

                    {getPageRange().map((page, index) => renderPageButton(page, index))}

                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link modern-pagination-btn" onClick={handleNext} aria-label="Next">
                            <FaAngleLeft />
                        </button>
                    </li>
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link modern-pagination-btn" onClick={() => onPageChange(totalPages)} aria-label="Last">
                            <FaAngleDoubleLeft />
                        </button>
                    </li>
                </ul>
            </nav>

            <style>{`
        /* Modern Pagination Styles */
        .modern-pagination-btn {
          margin: 0 3px;
          border-radius: 8px !important;
          border: 1px solid rgba(0, 47, 108, 0.1) !important;
          color: #002F6C !important;
          background-color: #fff !important;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 !important;
          transition: all 0.2s ease;
          font-weight: 500;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        }

        .modern-pagination-btn:hover:not(:disabled) {
          background-color: #f0f4f8 !important;
          border-color: #002F6C !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 47, 108, 0.1);
        }

        .page-item.active .modern-pagination-btn {
          background: linear-gradient(135deg, #002F6C, #004a99) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2);
        }

        .page-item.disabled .modern-pagination-btn {
          opacity: 0.5;
          background-color: #f8f9fa !important;
          border-color: #e9ecef !important;
          cursor: not-allowed;
        }

        .modern-pagination-ellipsis {
          border: none !important;
          background: transparent !important;
          color: #adb5bd !important;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
        }
      `}</style>
        </div>
    );
}

export default Pagination;
