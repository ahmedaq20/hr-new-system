import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaGraduationCap, FaUniversity, FaCalendarAlt, FaStar, FaStickyNote, FaInfoCircle, FaCertificate, FaAward } from 'react-icons/fa';

const EduCertificateDetailsModal = ({ show, onHide, degree }) => {
    if (!degree) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal">معتمد</Badge>;
            case 'pending':
                return <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal">قيد المراجعة</Badge>;
            case 'rejected':
                return <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-normal">مرفوض</Badge>;
            default:
                return <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-3 py-2 fw-normal">{status}</Badge>;
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" dir="rtl">
            <Modal.Header className="border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <Modal.Title className="fw-bold fs-5 text-teal d-flex align-items-center gap-2 mb-0">
                        <FaInfoCircle />
                        تفاصيل الشهادة العلمية
                    </Modal.Title>
                    <div style={{ cursor: 'pointer' }} onClick={onHide}>
                        <FaTimes className="text-muted" size={20} />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center border">
                    <div>
                        <h5 className="fw-bold mb-1 d-flex align-items-center gap-2">
                            <FaGraduationCap className="text-teal" style={{ color: '#0f766e' }} />
                            <span>المؤهل: </span>
                            <span className="text-dark">{degree.degree || degree.qualification_id || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(degree.status || degree.approval_status)}
                    </div>
                </div>

                <Row className="g-4 mb-4 mt-2">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaCertificate size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">التخصص الدقيق</p>
                                <p className="fw-bold mb-0 fs-5">{degree.major_name || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaUniversity size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">المؤسسة التعليمية</p>
                                <p className="fw-bold mb-0">{degree.institution || degree.university_name || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">سنة التخرج</p>
                                <p className="fw-bold mb-0">{degree.graduation_year || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaAward size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">التقدير / المعدل</p>
                                <p className="fw-bold mb-0">{degree.grade || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {degree.notes && (
                    <div className="d-flex align-items-start gap-3 mb-4 bg-light p-3 rounded-3 border">
                        <div className="bg-secondary-subtle p-2 rounded text-secondary">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1">ملاحظات</p>
                            <p className="fw-bold mb-0">{degree.notes}</p>
                        </div>
                    </div>
                )}

                {degree.status === 'rejected' && degree.rejection_reason && (
                    <div className="p-3 bg-danger-subtle border border-danger-subtle rounded-3 mt-4">
                        <h6 className="fw-bold text-danger mb-2">سبب الرفض:</h6>
                        <p className="mb-0 text-danger-emphasis">{degree.rejection_reason}</p>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="secondary" onClick={onHide} className="px-4" style={{ borderRadius: '8px' }}>
                    إغلاق
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EduCertificateDetailsModal;
