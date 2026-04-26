import React from "react";
import { Modal, Button } from "react-bootstrap";

function ProgramViewModal({ show, onClose, project }) {
    if (!project) return null;

    return (
        <Modal show={show} onHide={onClose} centered className="modal-modern">
            <Modal.Header closeButton closeVariant="white" className="border-0 shadow-none d-flex justify-content-between align-items-center" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white m-0">بيانات المشروع</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 text-end">
                <div className="project-details">
                    <div className="detail-item mb-4">
                        <label className="text-secondary small d-block mb-1 fw-bold">اسم المشروع</label>
                        <div className="fw-bold fs-5 text-dark">{project.name}</div>
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-6">
                            <label className="text-secondary small d-block mb-1 fw-bold">مدة المشروع</label>
                            <div className="fw-medium text-dark">
                                <span className="badge bg-light text-dark border px-3 py-2 fw-normal fs-6">
                                    {project.duration}
                                </span>
                            </div>
                        </div>
                        <div className="col-6">
                            <label className="text-secondary small d-block mb-1 fw-bold">الجهة الممولة</label>
                            <div className="fw-medium text-dark">{project.funding_source}</div>
                        </div>
                    </div>

                    <div className="row g-4 mb-4">
                        <div className="col-6">
                            <label className="text-secondary small d-block mb-1 fw-bold">بداية المشروع</label>
                            <div className="fw-medium text-dark">
                                {project.start_date ? project.start_date.split('T')[0] : "غير محدد"}
                            </div>
                        </div>
                        <div className="col-6">
                            <label className="text-secondary small d-block mb-1 fw-bold">نهاية المشروع</label>
                            <div className="fw-medium text-dark">
                                {project.end_date ? project.end_date.split('T')[0] : "غير محدد"}
                            </div>
                        </div>
                    </div>

                    <div className="detail-item">
                        <label className="text-secondary small d-block mb-1 fw-bold">تفاصيل إضافية</label>
                        <div className="p-3 bg-light rounded-3 text-secondary border-0" style={{ minHeight: '80px', lineHeight: '1.6' }}>
                            {project.description || "لا يوجد وصف متاح لهذا المشروع حالياً."}
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                <Button
                    variant="light"
                    className="rounded-3 px-4 fw-medium border shadow-sm w-100 py-2"
                    onClick={onClose}
                >
                    إغلاق النافذة
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ProgramViewModal;
