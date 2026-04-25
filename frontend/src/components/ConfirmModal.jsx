import React from "react";
import ReactDOM from "react-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";

function ConfirmModal({ show, onClose, onConfirm, title, message, isLoading = false, confirmText = "نعم، حذف", cancelText = "إلغاء", confirmButtonClass = "btn-danger" }) {
    if (!show) return null;

    return ReactDOM.createPortal(
        <div
            className="confirm-modal-overlay d-flex justify-content-center align-items-center"
            style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)'
            }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                role="document"
                style={{ zIndex: 10000, width: '100%', maxWidth: '450px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content shadow-lg border-0 bg-white p-2" style={{ borderRadius: '15px' }}>
                    <div className="modal-header border-bottom-0 pb-0 d-flex flex-row-reverse justify-content-between align-items-center">
                        <button
                            type="button"
                            className="btn-close m-0 p-2 shadow-none"
                            onClick={onClose}
                            style={{ filter: 'grayscale(1)', opacity: 0.5 }}
                            aria-label="Close"
                        ></button>
                        <div className="d-flex align-items-center gap-2">
                            <HiOutlineExclamationCircle className="text-danger fs-3" />
                            <h5 className="modal-title fw-bold text-dark m-0">{title}</h5>
                        </div>
                    </div>
                    <div className="modal-body text-end py-4 px-3">
                        <p className="mb-0 fs-6 text-secondary" style={{ lineHeight: '1.6' }}>{message}</p>
                    </div>
                    <div className="modal-footer border-top-0 pt-0 pb-3 d-flex justify-content-start gap-2">
                        <button
                            type="button"
                            className={`btn ${confirmButtonClass} px-4 py-2 fw-bold text-white`}
                            onClick={onConfirm}
                            disabled={isLoading}
                            style={{ borderRadius: '8px' }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    جارٍ الحذف...
                                </>
                            ) : confirmText}
                        </button>
                        <button
                            type="button"
                            className="btn btn-light border-0 px-4 py-2 fw-bold text-secondary"
                            onClick={onClose}
                            disabled={isLoading}
                            style={{ borderRadius: '8px', backgroundColor: '#f8f9fa' }}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default ConfirmModal;
