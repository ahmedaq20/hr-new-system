import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaChalkboardTeacher, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaStickyNote, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const CourseDetailsModal = ({ show, onHide, course }) => {
    if (!course) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
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
                        انتظار المراجعة
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaTimesCircle size={12} />
                        مرفوض
                    </Badge>
                );
            default:
                return (
                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal d-flex align-items-center gap-1">
                        <FaCheckCircle size={12} />
                        مكتملة
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
                        تفاصيل الدورة التدريبية
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
                            <FaChalkboardTeacher className="text-teal" style={{ color: '#0f766e' }} />
                            {course.course_name || 'غير محدد'}
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(course.status || course.approval_status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaMapMarkerAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الجهة المنظمة</p>
                                <p className="fw-bold mb-0">{course.provider || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ البدء</p>
                                <p className="fw-bold mb-0">{course.date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaClock size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">عدد الساعات</p>
                                <p className="fw-bold mb-0">{course.hours || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {course.notes && (
                    <div className="d-flex align-items-start gap-3 mb-4 bg-light p-3 rounded-3 border">
                        <div className="bg-secondary-subtle p-2 rounded text-secondary">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1">ملاحظات</p>
                            <p className="fw-bold mb-0">{course.notes}</p>
                        </div>
                    </div>
                )}

                {course.status === 'rejected' && course.rejection_reason && (
                    <div className="p-3 bg-danger-subtle border border-danger-subtle rounded-3 mt-4">
                        <h6 className="fw-bold text-danger mb-2">سبب الرفض:</h6>
                        <p className="mb-0 text-danger-emphasis">{course.rejection_reason}</p>
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

export default CourseDetailsModal;
