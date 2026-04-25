import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaUserPlus, FaEdit, FaTrash, FaEye, FaInfoCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa';
import { useEmployeeChildren, useDeleteEmployeeChild, Child } from '../hooks/useEmployeeChildren';
import AddChild from './AddChild';
import { toast } from 'react-hot-toast';
import EditChild from './EditChild';
import { useLocation } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import RejectionReasonModal from './RejectionReasonModal';
import ChildDetailsModal from './ChildDetailsModal';

const ChildrenList: React.FC = () => {
    const location = useLocation();
    const { data: children, isLoading, error } = useEmployeeChildren();
    const deleteMutation = useDeleteEmployeeChild();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [childToDelete, setChildToDelete] = useState<number | null>(null);
    const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [selectedChildDetails, setSelectedChildDetails] = useState<Child | null>(null);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowModal(true);
        }
    }, [location.state]);

    const handleEditClick = (child: Child) => {
        setSelectedChild(child);
        setShowEditModal(true);
    };

    const handleDeleteClick = (id: number) => {
        setChildToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (childToDelete === null) return;
        try {
            await deleteMutation.mutateAsync(childToDelete);
            toast.success("تم الحذف بنجاح");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("حدث خطأ أثناء عملية الحذف");
        } finally {
            setShowConfirmModal(false);
            setChildToDelete(null);
        }
    };

    const getStatusBadge = (status: string, reason?: string | null) => {
        switch (status) {
            case 'approved':
                return <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal">مقبول</Badge>;
            case 'pending':
                return <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal">انتظار الموافقة</Badge>;
            case 'rejected':
                return (
                    <div className="d-flex align-items-center justify-content-center gap-1">
                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-normal">مرفوض</Badge>
                        <Button
                            variant="link"
                            className="p-0 text-danger"
                            onClick={() => {
                                setRejectionReason(reason || null);
                                setShowRejectionModal(true);
                            }}
                            title="عرض سبب الرفض"
                        >
                            <FaInfoCircle size={14} />
                        </Button>
                    </div>
                );
            default:
                return <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-3 py-2 fw-normal">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '40vh' }}>
                <Spinner animation="border" variant="teal" style={{ color: '#016A74' }} />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="text-center mt-4">
                حدث خطأ أثناء تحميل بيانات الأبناء
            </Alert>
        );
    }

    const rejectedChildren = children?.filter(c => c.approval_status === 'rejected');

    return (
        <div className="animate-fade-in p-2">
            {rejectedChildren && rejectedChildren.length > 0 && (
                <Alert variant="danger" className="border-0 shadow-sm mb-4 d-flex align-items-center gap-3" style={{ borderRadius: '15px' }}>
                    <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px' }}>
                        <FaExclamationTriangle size={16} />
                    </div>
                    <div>
                        <h6 className="mb-1 fw-bold">يوجد طلبات مرفوضة</h6>
                        <p className="mb-0 small text-danger-emphasis">يرجى مراجعة أسباب الرفض وتعديل البيانات المطلوبة لإعادة إرسالها.</p>
                    </div>
                </Alert>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold text-dark mb-1">بيانات العائلة (الأبناء)</h4>
                    <p className="text-muted small mb-0">قائمة ببيانات الأبناء المسجلة في ملفك الشخصي</p>
                </div>
                <Button
                    variant="teal"
                    className="d-flex align-items-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#016A74', color: 'white', borderRadius: '10px', border: 'none', padding: '10px 20px' }}
                    onClick={() => setShowModal(true)}
                >
                    <FaUserPlus />
                    إضافة ابن/ابنة جديدة
                </Button>
            </div>

            <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Body className="p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 text-center">
                            <thead className="bg-light text-secondary small text-uppercase">
                                <tr>
                                    <th className="py-3 border-0" style={{ borderRadius: '15px 0 0 0' }}>#</th>
                                    <th className="py-3 border-0">الاسم الكامل</th>
                                    <th className="py-3 border-0">رقم الهوية</th>
                                    <th className="py-3 border-0">الجنس</th>
                                    <th className="py-3 border-0">تاريخ الميلاد</th>
                                    <th className="py-3 border-0">الحالة</th>
                                    <th className="py-3 border-0">المرفقات</th>
                                    <th className="py-3 border-0" style={{ borderRadius: '0 15px 0 0' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {children && children.length > 0 ? (
                                    children.map((child, index) => (
                                        <tr key={child.id}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td className="fw-bold">{child.full_name}</td>
                                            <td>{child.id_number}</td>
                                            <td>
                                                <Badge bg="info-subtle" className="text-info border border-info-subtle px-2 py-1 fw-normal">
                                                    {child.gender}
                                                </Badge>
                                            </td>
                                            <td>{child.birth_date || '---'}</td>
                                            <td>{getStatusBadge(child.approval_status, child.rejection_reason)}</td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center gap-1 flex-wrap">
                                                    {child.id_card_image_url && (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2 gap-1"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e0f7fa' }}
                                                            onClick={() => window.open(child.id_card_image_url, '_blank')}
                                                            title="عرض الهوية"
                                                        >
                                                            <FaPaperclip />
                                                            <span className="small">هوية</span>
                                                        </Button>
                                                    )}
                                                    {child.birth_certificate_image_url && (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2 gap-1"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e8f5e9', color: '#2e7d32' }}
                                                            onClick={() => window.open(child.birth_certificate_image_url, '_blank')}
                                                            title="عرض شهادة الميلاد"
                                                        >
                                                            <FaPaperclip />
                                                            <span className="small">ميلاد</span>
                                                        </Button>
                                                    )}
                                                    {child.university_certificate_image_url && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2 gap-1"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e8eaf6', color: '#3f51b5' }}
                                                            onClick={() => window.open(child.university_certificate_image_url, '_blank')}
                                                            title="عرض شهادة القيد"
                                                        >
                                                            <FaPaperclip />
                                                            <span className="small">جامعة</span>
                                                        </Button>
                                                    )}
                                                    {!child.id_card_image_url && !child.birth_certificate_image_url && !child.university_certificate_image_url && (
                                                        <span className="text-muted small">لا يوجد</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#f8f9fa' }}
                                                        onClick={() => {
                                                            setSelectedChildDetails(child);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        title="عرض التفاصيل"
                                                    >
                                                        <FaEye />
                                                    </Button>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e6f0ff' }}
                                                        onClick={() => handleEditClick(child)}
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#ffe6e6' }}
                                                        onClick={() => handleDeleteClick(child.id)}
                                                        disabled={deleteMutation.isPending}
                                                        title="حذف"
                                                    >
                                                        {deleteMutation.isPending ? <Spinner size="sm" /> : <FaTrash />}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-5 text-center text-muted">
                                            <div className="mb-2">
                                                <FaUserPlus size={40} className="text-light-emphasis" />
                                            </div>
                                            لا توجد بيانات مسجلة حالياً
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            <div className="mt-4 p-3 bg-light border-start border-4 border-info shadow-sm" style={{ borderRadius: '12px' }}>
                <p className="mb-0 small text-muted">
                    <strong>ملاحظة:</strong> سيتم مراجعة البيانات المضافة من قبل قسم الشؤون الإدارية قبل اعتمادها بشكل نهائي في ملفك.
                </p>
            </div>

            <AddChild
                show={showModal}
                handleClose={() => setShowModal(false)}
            />

            <EditChild
                key={selectedChild?.id || 'edit-child'}
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                child={selectedChild}
            />

            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف بيانات الابن/الابنة؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={deleteMutation.isPending}
            />

            <RejectionReasonModal
                show={showRejectionModal}
                handleClose={() => setShowRejectionModal(false)}
                reason={rejectionReason}
            />

            <ChildDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                child={selectedChildDetails}
            />
        </div>
    );
};

export default ChildrenList;
