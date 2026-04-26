import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface RejectionReasonModalProps {
    show: boolean;
    handleClose: () => void;
    reason: string | null;
    title?: string;
}

const RejectionReasonModal: React.FC<RejectionReasonModalProps> = ({
    show,
    handleClose,
    reason,
    title = "سبب الرفض والاعتراض"
}) => {
    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            dir="rtl"
            className="custom-modal"
        >
            <Modal.Header className="border-0 p-4 d-flex align-items-center justify-content-between">
                <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
                    <FaExclamationTriangle /> {title}
                </Modal.Title>
                <button
                    type="button"
                    className="btn-close m-0"
                    aria-label="Close"
                    onClick={handleClose}
                ></button>
            </Modal.Header>
            <Modal.Body className="p-4 bg-white">
                <div className="p-4 rounded-4 bg-danger-subtle border border-danger-subtle">
                    <p className="mb-0 fw-medium text-danger" style={{ lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                        {reason || "لم يتم تحديد سبب للرفض."}
                    </p>
                </div>

                <div className="mt-4 p-3 bg-light rounded-3 border">
                    <p className="mb-0 small text-muted">
                        <strong>ملاحظة:</strong> يمكنك تعديل البيانات المرفوضة وإعادة إرسالها للمراجعة مرة أخرى من خلال زر التعديل.
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 p-4 pt-0">
                <Button
                    variant="danger"
                    className="w-100 py-2 fw-bold rounded-pill shadow-sm"
                    onClick={handleClose}
                >
                    موافق، فهمت
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default RejectionReasonModal;
