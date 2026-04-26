import React, { useState, useEffect } from 'react';
import { Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaUserTie, FaPlus, FaEdit, FaTrash, FaEye, FaInfoCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa';
import { useEmployeeSpouses, useDeleteEmployeeSpouse, Spouse } from '../hooks/useEmployeeSpouses';
import AddWifeModal from './AddWifeModal';
import EditWife from './EditWife';
import { toast } from 'react-hot-toast';
import ConfirmModal from './ConfirmModal';
import { useLocation } from 'react-router-dom';
import RejectionReasonModal from './RejectionReasonModal';
import SpouseDetailsModal from './SpouseDetailsModal';

const SpouseList: React.FC = () => {
    const location = useLocation();
    const { data: spouses, isLoading, error } = useEmployeeSpouses();
    const deleteMutation = useDeleteEmployeeSpouse();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [selectedSpouse, setSelectedSpouse] = useState<Spouse | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [spouseToDelete, setSpouseToDelete] = useState<number | null>(null);
    const [showRejectionModal, setShowRejectionModal] = useState<boolean>(false);
    const [rejectionReason, setRejectionReason] = useState<string | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [selectedSpouseDetails, setSelectedSpouseDetails] = useState<Spouse | null>(null);

    useEffect(() => {
        if (location.state?.openAddModal) {
            setShowModal(true);
        }
    }, [location.state]);

    const handleEditClick = (spouse: Spouse) => {
        setSelectedSpouse(spouse);
        setShowEditModal(true);
    };

    const handleDeleteClick = (id: number) => {
        setSpouseToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (spouseToDelete === null) return;
        try {
            await deleteMutation.mutateAsync(spouseToDelete);
            toast.success("تم الحذف بنجاح");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            toast.error("حدث خطأ أثناء عملية الحذف");
        } finally {
            setShowConfirmModal(false);
            setSpouseToDelete(null);
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
                حدث خطأ أثناء تحميل بيانات الزوجات
            </Alert>
        );
    }

    const rejectedSpouses = spouses?.filter(s => s.approval_status === 'rejected');

    return (
        <div className="animate-fade-in p-2">
            {rejectedSpouses && rejectedSpouses.length > 0 && (
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
                    <h4 className="fw-bold text-dark mb-1">بيانات العائلة (الأزواج)</h4>
                    <p className="text-muted small mb-0">قائمة ببيانات الزوجات المسجلة في ملفك الشخصي</p>
                </div>
                <Button
                    variant="teal"
                    className="d-flex align-items-center gap-2 shadow-sm"
                    style={{ backgroundColor: '#016A74', color: 'white', borderRadius: '10px', border: 'none', padding: '10px 20px' }}
                    onClick={() => setShowModal(true)}
                >
                    <FaPlus />
                    إضافة زوجة جديدة
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
                                    <th className="py-3 border-0">تاريخ الميلاد</th>
                                    <th className="py-3 border-0">تاريخ الزواج</th>
                                    <th className="py-3 border-0">الحالة</th>
                                    <th className="py-3 border-0">العمل</th>
                                    <th className="py-3 border-0">رقم الجوال</th>
                                    <th className="py-3 border-0">المرفقات</th>
                                    <th className="py-3 border-0" style={{ borderRadius: '0 15px 0 0' }}>إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spouses && spouses.length > 0 ? (
                                    spouses.map((spouse, index) => (
                                        <tr key={spouse.id}>
                                            <td className="fw-bold text-muted">{index + 1}</td>
                                            <td className="fw-bold">{spouse.full_name}</td>
                                            <td>{spouse.spouse_id_number}</td>
                                            <td>{spouse.birth_date || '---'}</td>
                                            <td>{spouse.marriage_date}</td>
                                            <td>{getStatusBadge(spouse.approval_status, spouse.rejection_reason)}</td>
                                            <td>
                                                {spouse.is_working ?
                                                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-2 py-1 fw-normal">يعمل</Badge> :
                                                    <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1 fw-normal">لا يعمل</Badge>
                                                }
                                            </td>
                                            <td>{spouse.mobile || '---'}</td>
                                            <td>
                                                {spouse.marriage_contract_url ? (
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2 gap-1"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e0f7fa' }}
                                                        onClick={() => window.open(spouse.marriage_contract_url as string, '_blank')}
                                                        title="عرض عقد الزواج"
                                                    >
                                                        <FaPaperclip />
                                                        <span className="small">عقد الزواج</span>
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
                                                            setSelectedSpouseDetails(spouse);
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
                                                        onClick={() => handleEditClick(spouse)}
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        className="d-inline-flex align-items-center p-2"
                                                        style={{ borderRadius: '8px', border: 'none', backgroundColor: '#ffe6e6' }}
                                                        onClick={() => handleDeleteClick(spouse.id)}
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
                                        <td colSpan={10} className="py-5 text-center text-muted">
                                            <div className="mb-2">
                                                <FaUserTie size={40} className="text-light-emphasis" />
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

            <AddWifeModal
                show={showModal}
                handleClose={() => setShowModal(false)}
            />

            <EditWife
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                spouse={selectedSpouse}
            />

            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف بيانات الزوجة؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={deleteMutation.isPending}
            />

            <RejectionReasonModal
                show={showRejectionModal}
                handleClose={() => setShowRejectionModal(false)}
                reason={rejectionReason}
            />

            <SpouseDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                spouse={selectedSpouseDetails}
            />
        </div>
    );
};

export default SpouseList;
