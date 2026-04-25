import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaTimes, FaUser, FaIdCard, FaCalendarAlt, FaBriefcase, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaUserTie, FaPhone } from 'react-icons/fa';

const AdminSpouseDetailsModal = ({ show, onHide, spouse }) => {
    if (!spouse) return null;

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
                        تفاصيل الزوج/الزوجة
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
                            <span className="text-dark">{spouse.employee_name || 'غير محدد'}</span>
                        </h5>
                    </div>
                    <div>
                        {getStatusBadge(spouse.approval_status || spouse.status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={12}>
                        <div className="d-flex align-items-start gap-3 border-bottom pb-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaUser size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">اسم الزوج/ الزوجة</p>
                                <p className="fw-bold mb-0 fs-5">{spouse.full_name || 'غير محدد'}</p>
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
                                <p className="fw-bold mb-0">{spouse.spouse_id_number || 'غير محدد'}</p>
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
                                <p className="fw-bold mb-0 text-start" dir="ltr">{spouse.birth_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الزواج</p>
                                <p className="fw-bold mb-0 text-start" dir="ltr">{spouse.marriage_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">هل يعمل؟</p>
                                <p className="fw-bold mb-0">
                                    {spouse.is_working === 1 || spouse.is_working === '1' || spouse.is_working === true || spouse.is_working === 'نعم' || spouse.is_working === 'تعمل' ? 'تعمل' : 'لا تعمل'}
                                </p>
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
                                <p className="fw-bold mb-0 text-start" dir="ltr">{spouse.mobile || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>

                    <Col md={4}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaInfoCircle size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">الحالة الاجتماعية</p>
                                <p className="fw-bold mb-0">{spouse.marital_status || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {(spouse.is_working === 1 || spouse.is_working === '1' || spouse.is_working === true || spouse.is_working === 'نعم' || spouse.is_working === 'تعمل') && (
                    <div className="bg-light p-3 rounded-3 border mt-4">
                        <h6 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                            <FaBriefcase className="text-teal" />
                            تفاصيل العمل
                        </h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <p className="text-muted small mb-1">قطاع العمل</p>
                                <p className="fw-bold mb-0">{spouse.work_sector || 'غير محدد'}</p>
                            </Col>
                            {spouse.private_company_name && (
                                <Col md={4}>
                                    <p className="text-muted small mb-1">اسم الشركة</p>
                                    <p className="fw-bold mb-0">{spouse.private_company_name}</p>
                                </Col>
                            )}
                            {spouse.international_organization_name && (
                                <Col md={4}>
                                    <p className="text-muted small mb-1">المنظمة الدولية</p>
                                    <p className="fw-bold mb-0">{spouse.international_organization_name}</p>
                                </Col>
                            )}
                        </Row>
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

export default AdminSpouseDetailsModal;
