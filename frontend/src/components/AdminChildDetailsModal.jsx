import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaChild, FaIdCard, FaCalendarAlt, FaVenusMars, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaUserFriends, FaGraduationCap, FaFemale, FaStickyNote, FaBriefcase, FaPaperclip } from 'react-icons/fa';

const AdminChildDetailsModal = ({ show, onHide, child }) => {
    if (!child) return null;

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
                        تفاصيل الابن / الابنة
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
                            <span className="text-dark">{child.employee_name || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(child.approval_status || child.status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaChild size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">اسم الابن / الابنة</p>
                                <p className="fw-bold mb-0 fs-5">{child.full_name || child.name || 'غير محدد'}</p>
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
                                <p className="fw-bold mb-0">{child.id_number || 'غير محدد'}</p>
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
                                <p className="fw-bold mb-0 text-start" dir="ltr">{child.birth_date || 'غير محدد'}</p>
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
                                <p className="fw-bold mb-0">{child.gender || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaUserFriends size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الحالة الاجتماعية</p>
                                <p className="fw-bold mb-0">{child.marital_status || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">حالة العمل</p>
                                <p className="fw-bold mb-0">
                                    {child.is_working === 1 || child.is_working === '1' || child.is_working === true || child.is_working === 'نعم' || child.is_working === 'يعمل' ? 'يعمل' : 'لا يعمل'}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaGraduationCap size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">طالب جامعي</p>
                                <p className="fw-bold mb-0">
                                    {child.is_university_student === 1 || child.is_university_student === '1' || child.is_university_student === true || child.is_university_student === 'نعم' ? 'نعم' : 'لا'}
                                </p>
                                {child.university_certificate_image && (
                                    <a
                                        href={child.university_certificate_image}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-decoration-none fw-bold small d-flex align-items-center gap-1 mt-1"
                                        style={{ color: '#0f766e' }}
                                    >
                                        <FaPaperclip size={12} />
                                        عرض شهادة القيد
                                    </a>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="bg-light p-3 rounded-3 border mb-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-teal">
                        <FaFemale />
                        بيانات الأم
                    </h6>
                    <Row>
                        <Col md={6}>
                            <p className="text-muted small mb-1">اسم الأم بالكامل</p>
                            <p className="fw-bold mb-0">{child.mother_full_name || 'غير محدد'}</p>
                        </Col>
                        <Col md={6}>
                            <p className="text-muted small mb-1">رقم هوية الأم</p>
                            <p className="fw-bold mb-0">{child.mother_id_number || 'غير محدد'}</p>
                        </Col>
                    </Row>
                </div>

                {child.notes && (
                    <div className="bg-light p-3 rounded-3 border d-flex align-items-start gap-3">
                        <div className="text-secondary mt-1">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <h6 className="fw-bold mb-1">الملاحظات</h6>
                            <p className="text-muted mb-0 small">{child.notes}</p>
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

export default AdminChildDetailsModal;
