import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Spouse } from '../hooks/useEmployeeSpouses';
import { FaTimes, FaIdCard, FaCalendarAlt, FaBriefcase, FaPhone, FaBuilding, FaInfoCircle } from 'react-icons/fa';

interface SpouseDetailsModalProps {
    show: boolean;
    onHide: () => void;
    spouse: Spouse | null;
}

const SpouseDetailsModal: React.FC<SpouseDetailsModalProps> = ({ show, onHide, spouse }) => {
    if (!spouse) return null;

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
                        تفاصيل بيانات الزوجة
                    </Modal.Title>
                    <div style={{ cursor: 'pointer' }} onClick={onHide}>
                        <FaTimes className="text-muted" size={20} />
                    </div>
                </div>
            </Modal.Header>
            <Modal.Body className="p-4">
                <div className="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center border">
                    <div>
                        <h5 className="fw-bold mb-1">{spouse.full_name}</h5>
                        <p className="text-muted small mb-0 d-flex align-items-center gap-2">
                            <FaIdCard /> {spouse.spouse_id_number}
                        </p>
                    </div>
                    <div>
                        {getStatusBadge(spouse.approval_status)}
                    </div>
                </div>

                <Row className="g-4">
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                <FaCalendarAlt size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الميلاد</p>
                                <p className="fw-bold mb-0">{spouse.birth_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-info-subtle p-2 rounded text-info">
                                <FaBuilding size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">تاريخ الزواج</p>
                                <p className="fw-bold mb-0">{spouse.marriage_date || 'غير محدد'}</p>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-start gap-3">
                            <div className="bg-success-subtle p-2 rounded text-success">
                                <FaBriefcase size={18} />
                            </div>
                            <div>
                                <p className="text-muted small mb-1">حالة العمل</p>
                                <p className="fw-bold mb-0">
                                    {spouse.is_working ? 'تعمل' : 'لا تعمل'}
                                </p>
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
                                    {spouse.mobile || 'غير محدد'}
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {spouse.approval_status === 'rejected' && spouse.rejection_reason && (
                    <div className="mt-4 p-3 bg-danger-subtle border border-danger-subtle rounded-3">
                        <h6 className="fw-bold text-danger mb-2">سبب الرفض:</h6>
                        <p className="mb-0 text-danger-emphasis">{spouse.rejection_reason}</p>
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

export default SpouseDetailsModal;
