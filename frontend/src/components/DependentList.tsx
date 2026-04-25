import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaInfoCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa';
import { useEmployeeDependents, useDeleteEmployeeDependent, Dependent } from '../hooks/useEmployeeDependents';
import AddDependent from './AddDependent';
import EditDependent from './EditDependent';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import ConfirmModal from './ConfirmModal';
import RejectionReasonModal from './RejectionReasonModal';
import DependentDetailsModal from './DependentDetailsModal';

const DependentList: React.FC = () => {
    const location = useLocation();
    const { data: dependents, isLoading, error } = useEmployeeDependents();
    const deleteMutation = useDeleteEmployeeDependent();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [dependentToDelete, setDependentToDelete] = useState<number | null>(null);
    const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [selectedDependentDetails, setSelectedDependentDetails] = useState<Dependent | null>(null);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowModal(true);
        }
    }, [location.state]);

    const handleEditClick = (dependent: Dependent) => {
        setSelectedDependent(dependent);
        setShowEditModal(true);
    };

    const handleDeleteClick = (id: number) => {
        setDependentToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (dependentToDelete === null) return;
        try {
            await deleteMutation.mutateAsync(dependentToDelete);
            toast.success("تم الحذف بنجاح");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("حدث خطأ أثناء عملية الحذف");
        } finally {
            setShowConfirmModal(false);
            setDependentToDelete(null);
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
                حدث خطأ أثناء تحميل بيانات المعالين
            </Alert>
        );
    }

    const rejectedDependents = dependents?.filter(d => d.approval_status === 'rejected');

    return (
        <div className="animate-fade-in p-2">
            {rejectedDependents && rejectedDependents.length > 0 && (
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
                    <h4 className="fw-bold text-dark mb-1">بيانات العائلة (المعالين)</h4>
                    <p className="text-muted small mb-0">قائمة ببيانات المعالين المسجلة في ملفك الشخصي</p>
                </div>
                <Button
                    variant="teal"
                    className="d-flex align-items-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#016A74', color: 'white', borderRadius: '10px', border: 'none', padding: '10px 20px' }}
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus />
                    إضافة معال جديد
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
                                    <th className="py-3 border-0">صلة القرابة</th>
                                    <th className="py-3 border-0">الجنس</th>
                                    <th className="py-3 border-0">رقم الجوال</th>
                                    <th className="py-3 border-0">الحالة</th>
                                    <th className="py-3 border-0">المرفقات</th>
                                    <th className="py-3 border-0" style={{ borderRadius: '0 15px 0 0' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dependents && dependents.length > 0 ? (
                                    dependents.map((dependent, index) => (
                                        <tr key={dependent.id}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td className="fw-bold">{dependent.full_name}</td>
                                            <td>{dependent.dependent_id_number}</td>
                                            <td>
                                                <Badge bg="primary-subtle" className="text-primary border border-primary-subtle px-2 py-1 fw-normal">
                                                    {dependent.relationship}
                                                </Badge>
                                            </td>
                                            <td>{dependent.gender}</td>
                                            <td>{dependent.mobile || '---'}</td>
                                            <td>{getStatusBadge(dependent.approval_status, dependent.rejection_reason)}</td>
                                            <td>
                                                {dependent.dependency_proof_url ? (
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2 gap-1"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e0f7fa' }}
                                                        onClick={() => window.open(dependent.dependency_proof_url as string, '_blank')}
                                                        title="عرض المستند"
                                                    >
                                                        <FaPaperclip />
                                                        <span className="small">إثبات إعالة</span>
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted small">---</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center justify-content-center gap-2">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#f8f9fa' }}
                                                        onClick={() => {
                                                            setSelectedDependentDetails(dependent);
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
                                                        onClick={() => handleEditClick(dependent)}
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#ffe6e6' }}
                                                        onClick={() => handleDeleteClick(dependent.id)}
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
                                        <td colSpan={9} className="py-5 text-center text-muted">
                                            <div className="mb-2">
                                                <FaUsers size={40} className="text-light-emphasis" />
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

            <div className="mt-4 p-3 bg-light border-start border-4 border-teal shadow-sm" style={{ borderRadius: '12px', borderLeftColor: '#016A74 !important' }}>
                <p className="mb-0 small text-muted">
                    <strong>ملاحظة:</strong> سيتم مراجعة البيانات المضافة من قبل قسم الشؤون الإدارية قبل اعتمادها بشكل نهائي في ملفك.
                </p>
            </div>

            <AddDependent
                show={showModal}
                handleClose={() => setShowModal(false)}
            />

            <EditDependent
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                dependent={selectedDependent}
            />

            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف بيانات المعال؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={deleteMutation.isPending}
            />

            <RejectionReasonModal
                show={showRejectionModal}
                handleClose={() => setShowRejectionModal(false)}
                reason={rejectionReason}
            />

            <DependentDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                dependent={selectedDependentDetails}
            />
        </div>
    );
};

export default DependentList;
