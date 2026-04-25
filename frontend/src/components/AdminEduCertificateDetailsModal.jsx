import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaGraduationCap, FaCalendarAlt, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaBuilding, FaStickyNote, FaUniversity, FaAward } from 'react-icons/fa';

const AdminEduCertificateDetailsModal = ({ show, onHide, cert }) => {
    if (!cert) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted':
                return (
                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaCheckCircle size={12} />
                        مقبول
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaClock size={12} />
                        قيد الانتظار
                    </Badge>
                );
            case 'refused':
                return (
                    <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaTimesCircle size={12} />
                        مرفوض
                    </Badge>
                );
            default:
                return (
                    <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaClock size={12} />
                        قيد الانتظار
                    </Badge>
                );
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" dir="rtl">
            <Modal.Header className="border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center w-100">
                    <Modal.Title className="fw-bold fs-5 text-teal d-flex align-items-center gap-2 mb-0">
                        <FaInfoCircle />
                        تفاصيل الشهادة الأكاديمية
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
                            <FaUserTie className="text-teal" style={{ color: '#0f766e' }} />
                            <span>الموظف: </span>
                            <span className="text-dark">{cert.employee_name || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(cert.status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaGraduationCap size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الشهادة / التخصص</p>
                                <p className="fw-bold mb-0 fs-5">{cert.certificate_type || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaBuilding size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">مصدر الإضافة</p>
                                <p className="fw-bold mb-0">{cert.source === 'degree' ? 'إضافة موظف' : 'إضافة إدارة'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الرفع</p>
                                <p className="fw-bold mb-0 text-start" dir="ltr">{cert.upload_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    {cert.major_name && (
                        <Col md={6}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-primary-subtle p-2 rounded text-primary">
                                    <FaGraduationCap size={18} />
                                </div>
                                <div>
                                    <p className="text-muted small mb-1">التخصص الدقيق</p>
                                    <p className="fw-bold mb-0">{cert.major_name}</p>
                                </div>
                            </div>
                        </Col>
                    )}

                    {cert.university_name && (
                        <Col md={6}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-info-subtle p-2 rounded text-info">
                                    <FaUniversity size={18} />
                                </div>
                                <div>
                                    <p className="text-muted small mb-1">الجامعة / المؤسسة التعليمية</p>
                                    <p className="fw-bold mb-0">{cert.university_name}</p>
                                </div>
                            </div>
                        </Col>
                    )}

                    {cert.graduation_year && (
                        <Col md={6}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-success-subtle p-2 rounded text-success">
                                    <FaCalendarAlt size={18} />
                                </div>
                                <div>
                                    <p className="text-muted small mb-1">سنة التخرج</p>
                                    <p className="fw-bold mb-0">{cert.graduation_year}</p>
                                </div>
                            </div>
                        </Col>
                    )}

                    {cert.grade && (
                        <Col md={6}>
                            <div className="d-flex align-items-start gap-3">
                                <div className="bg-warning-subtle p-2 rounded text-warning">
                                    <FaAward size={18} />
                                </div>
                                <div>
                                    <p className="text-muted small mb-1">التقدير / المعدل</p>
                                    <p className="fw-bold mb-0">{cert.grade}</p>
                                </div>
                            </div>
                        </Col>
                    )}

                    {cert.notes && (
                        <Col md={12}>
                            <div className="bg-light p-3 rounded-3 border d-flex align-items-start gap-3 mt-2">
                                <div className="text-secondary mt-1">
                                    <FaStickyNote size={18} />
                                </div>
                                <div>
                                    <h6 className="fw-bold mb-1">الملاحظات</h6>
                                    <p className="text-muted mb-0 small">{cert.notes}</p>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
                <Button variant="secondary" onClick={onHide} className="px-4" style={{ borderRadius: '8px' }}>
                    إغلاق
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AdminEduCertificateDetailsModal;
