import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaChalkboardTeacher, FaCalendarAlt, FaUniversity, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaUserTie } from 'react-icons/fa';

const AdminCourseDetailsModal = ({ show, onHide, course }) => {
    if (!course) return null;

    const getStatusBadge = (status) => {
        // Fallback for "approved" if no status provided
        if (!status) status = 'approved'; 
        
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
                            <FaUserTie className="text-teal" style={{ color: '#0f766e' }} />
                            <span>الموظف: </span>
                            <span className="text-dark">{course.employee_name || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(course.approval_status || course.status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaChalkboardTeacher size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">اسم الدورة</p>
                                <p className="fw-bold mb-0 fs-5">{course.course_name || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaUniversity size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الجهة المنظمة</p>
                                <p className="fw-bold mb-0">{course.institution || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={3}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaClock size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">عدد الساعات</p>
                                <p className="fw-bold mb-0">{course.course_hours || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    
                    <Col md={3}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الدورة</p>
                                <p className="fw-bold mb-0 text-start" dir="ltr">{course.course_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
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

export default AdminCourseDetailsModal;
