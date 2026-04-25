import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Dependent } from '../hooks/useEmployeeDependents';
import { FaTimes, FaIdCard, FaCalendarAlt, FaMapMarkerAlt, FaVenusMars, FaPhone, FaStickyNote, FaInfoCircle } from 'react-icons/fa';

interface DependentDetailsModalProps {
    show: boolean;
    onHide: () => void;
    dependent: Dependent | null;
}

const DependentDetailsModal: React.FC<DependentDetailsModalProps> = ({ show, onHide, dependent }) => {
    if (!dependent) return null;

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
                        تفاصيل بيانات المُعال
                    </Modal.Title>
                    <div style={{ cursor: 'pointer' }} onClick={onHide}>
                        <FaTimes className="text-muted" size={20} />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center border">
                    <div>
                        <h5 className="fw-bold mb-1">{dependent.full_name}</h5>
                        <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                            <FaIdCard /> {dependent.dependent_id_number}
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-3 py-2 fw-normal">
                            {dependent.relationship}
                        </Badge>
                        {getStatusBadge(dependent.approval_status)}
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
                                <p className="fw-bold mb-0">{dependent.birth_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
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
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaMapMarkerAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">العنوان</p>
                                <p className="fw-bold mb-0">{dependent.address || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-warning-subtle p-2 rounded text-warning">
                                <FaPhone size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">رقم الجوال</p>
                                <p className="fw-bold mb-0" style={{ direction: 'ltr', textAlign: 'right' }}>
                                    {dependent.mobile || 'غير محدد'}
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {dependent.notes && (
                    <div className="d-flex align-items-start gap-3 mb-4 bg-light p-3 rounded-3 border">
                        <div className="bg-secondary-subtle p-2 rounded text-secondary">
                            <FaStickyNote size={18} />
                        </div>
                        <div>
                            <p className="text-muted small mb-1">ملاحظات</p>
                            <p className="fw-bold mb-0">{dependent.notes}</p>
                        </div>
                    </div>
                )}

                {dependent.approval_status === 'rejected' && dependent.rejection_reason && (
                    <div className="p-3 bg-danger-subtle border border-danger-subtle rounded-3 mt-4">
                        <h6 className="fw-bold text-danger mb-2">سبب الرفض:</h6>
                        <p className="mb-0 text-danger-emphasis">{dependent.rejection_reason}</p>
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

export default DependentDetailsModal;
