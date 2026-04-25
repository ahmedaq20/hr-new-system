import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaUsers, FaIdCard, FaCalendarAlt, FaLink, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaVenusMars, FaPhone, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa';

const AdminDependentDetailsModal = ({ show, onHide, dependent }) => {
    if (!dependent) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
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
            case 'rejected':
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
                        تفاصيل المعيل
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
                            <span className="text-dark">{dependent.employee_name || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(dependent.approval_status || dependent.status || (dependent.id && 'approved'))}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaUsers size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">اسم المعيل</p>
                                <p className="fw-bold mb-0 fs-5">{dependent.full_name || dependent.name || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaIdCard size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">رقم الهوية</p>
                                <p className="fw-bold mb-0">{dependent.dependent_id_number || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الميلاد</p>
                                <p className="fw-bold mb-0 text-start" dir="ltr">{dependent.birth_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaLink size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">صلة القرابة</p>
                                <p className="fw-bold mb-0">{dependent.relationship || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaVenusMars size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الجنس</p>
                                <p className="fw-bold mb-0">{dependent.gender || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaPhone size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">رقم الجوال</p>
                                <p className="fw-bold mb-0 text-start" dir="ltr">{dependent.mobile || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaMapMarkerAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">العنوان</p>
                                <p className="fw-bold mb-0">{dependent.address || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {dependent.notes && (
                    <div className="bg-light p-3 rounded-3 border d-flex align-items-start gap-3">
                        <div className="text-secondary mt-1">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1 small text-muted">الملاحظات</h6>
                            <p className="mb-0 small">{dependent.notes}</p>
                        </div>
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

export default AdminDependentDetailsModal;
