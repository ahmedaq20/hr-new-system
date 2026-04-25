import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Child } from '../hooks/useEmployeeChildren';
import { FaTimes, FaIdCard, FaCalendarAlt, FaBriefcase, FaGraduationCap, FaUserFriends, FaFemale, FaStickyNote, FaInfoCircle } from 'react-icons/fa';

interface ChildDetailsModalProps {
    show: boolean;
    onHide: () => void;
    child: Child | null;
}

const ChildDetailsModal: React.FC<ChildDetailsModalProps> = ({ show, onHide, child }) => {
    if (!child) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal">مقبول</Badge>;
            case 'pending':
                return <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal">انتظار الموافقة</Badge>;
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
                        تفاصيل بيانات الابن/الابنة
                    </Modal.Title>
                    <div style={{ cursor: 'pointer' }} onClick={onHide}>
                        <FaTimes className="text-muted" size={20} />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center border">
                    <div>
                        <h5 className="fw-bold mb-1">{child.full_name}</h5>
                        <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                            <FaIdCard /> {child.id_number}
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg="info-subtle" className="text-info border border-info-subtle px-3 py-2 fw-normal">
                            {child.gender}
                        </Badge>
                        {getStatusBadge(child.approval_status)}
                    </div>
                </div>

                <Row className="g-4 mb-4">
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الميلاد</p>
                                <p className="fw-bold mb-0">{child.birth_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
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
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">حالة العمل</p>
                                <p className="fw-bold mb-0">
                                    {child.is_working ? 'يعمل / تعمل' : 'لا يعمل / لا تعمل'}
                                </p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaGraduationCap size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">طالب جامعي</p>
                                <p className="fw-bold mb-0">
                                    {child.is_university_student ? 'نعم' : 'لا'}
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>

                <div className="bg-light p-3 rounded-3 border mb-4">
                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
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
                    <div className="d-flex align-items-start gap-3 mb-4">
                        <div className="bg-secondary-subtle p-2 rounded text-secondary">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1">ملاحظات</p>
                            <p className="fw-bold mb-0">{child.notes}</p>
                        </div>
                    </div>
                )}

                {child.approval_status === 'rejected' && child.rejection_reason && (
                    <div className="p-3 bg-danger-subtle border border-danger-subtle rounded-3">
                        <h6 className="fw-bold text-danger mb-2">سبب الرفض:</h6>
                        <p className="mb-0 text-danger-emphasis">{child.rejection_reason}</p>
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

export default ChildDetailsModal;
