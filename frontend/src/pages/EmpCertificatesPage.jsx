import React, { useState } from 'react';
import { Table, Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaGraduationCap, FaCalendarAlt, FaUniversity, FaPlus, FaEdit, FaTrash, FaEye, FaInfoCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa';
import EmpGateSideBar from '../components/EmpGateSideBar';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import AddEduCertificate from '../components/AddEduCertificate';
import EditEduCertificate from '../components/EditEduCertificate';
import { useDeleteEmployeeDegree } from '../hooks/useEmployeeDegrees';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import RejectionReasonModal from '../components/RejectionReasonModal';
import EduCertificateDetailsModal from '../components/EduCertificateDetailsModal';

const EmpCertificatesPage = () => {
    const { data, isLoading, error, refetch } = useEmployeeDashboard();
    const deleteDegreeMutation = useDeleteEmployeeDegree();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDegree, setSelectedDegree] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [degreeToDelete, setDegreeToDelete] = useState(null);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedDegreeDetails, setSelectedDegreeDetails] = useState(null);

    if (isLoading) {
        return (
            <EmpGateSideBar>
                <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
                    <Spinner animation="border" variant="teal" />
                </div>
            </EmpGateSideBar>
        );
    }

    if (error) {
        return (
            <EmpGateSideBar>
                <Alert variant="danger" className="m-4">
                    {error.message || 'فشل جلب بيانات الشهادات'}
                </Alert>
            </EmpGateSideBar>
        );
    }

    const qualifications = data?.qualifications || [];

    const handleEditClick = (degree) => {
        // Map data from dashboard resource format to what the edit component expects
        setSelectedDegree({
            id: degree.id,
            qualification_id: degree.qualification_id,
            major_name: degree.major_name,
            university_name: degree.institution || degree.university_name, 
            graduation_year: degree.graduation_year,
            grade: degree.grade,
            notes: degree.notes,
            approval_status: degree.status,
            certificate_url: degree.certificate_url,
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (id) => {
        setDegreeToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!degreeToDelete) return;
        try {
            await deleteDegreeMutation.mutateAsync(degreeToDelete);
            // toast.success("تم الحذف بنجاح"); // Handled in mutation?
        } catch (error) {
        } finally {
            setShowConfirmModal(false);
            setDegreeToDelete(null);
        }
    };

    const getStatusBadge = (status, reason) => {
        switch (status) {
            case 'approved':
                return <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal">معتمد</Badge>;
            case 'pending':
                return <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal">قيد المراجعة</Badge>;
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

    const rejectedQualifications = qualifications.filter(q => q.status === 'rejected');

    return (
        <EmpGateSideBar>
            <div className="animate-fade-in p-2">
                {rejectedQualifications.length > 0 && (
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
                        <h4 className="fw-bold text-dark mb-1">المؤهلات العلمية</h4>
                        <p className="text-muted small mb-0">قائمة بالشهادات الأكاديمية المسجلة في ملفك</p>
                    </div>
                    <Button
                        variant="teal"
                        className="d-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#016A74', color: 'white', borderRadius: '10px', border: 'none', padding: '10px 20px' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus />
                        إضافة شهادة جديدة
                    </Button>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center">
                                <thead className="bg-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="py-3 border-0" style={{ borderRadius: '15px 0 0 0' }}>#</th>
                                        <th className="py-3 border-0">المؤهل العلمي</th>
                                        <th className="py-3 border-0">التخصص</th>
                                        <th className="py-3 border-0">المؤسسة التعليمية</th>
                                        <th className="py-3 border-0">سنة التخرج</th>
                                        <th className="py-3 border-0">الحالة</th>
                                        <th className="py-3 border-0">المرفقات</th>
                                        <th className="py-3 border-0" style={{ borderRadius: '0 15px 0 0' }}>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {qualifications.length > 0 ? (
                                        qualifications.map((q, index) => (
                                            <tr key={index}>
                                                <td className="fw-bold text-muted">{index + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaGraduationCap className="text-primary" />
                                                        <span className="fw-medium">{q.degree || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <span>{q.major_name || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaUniversity className="text-secondary" />
                                                        <span>{q.institution || q.university_name || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaCalendarAlt className="text-muted" />
                                                        <span>{q.graduation_year || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {getStatusBadge(q.status, q.rejection_reason)}
                                                </td>
                                                <td>
                                                    {q.certificate_url ? (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2 gap-1"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e0f7fa' }}
                                                            onClick={() => window.open(q.certificate_url, '_blank')}
                                                            title="عرض الشهادة"
                                                        >
                                                            <FaPaperclip />
                                                            <span className="small">الشهادة</span>
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
                                                                setSelectedDegreeDetails(q);
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
                                                            onClick={() => handleEditClick(q)}
                                                            title="تعديل"
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#ffe6e6' }}
                                                            onClick={() => handleDeleteClick(q.id)}
                                                            disabled={deleteDegreeMutation.isPending}
                                                            title={'حذف'}
                                                        >
                                                            {deleteDegreeMutation.isPending ? <Spinner size="sm" /> : <FaTrash />}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="py-5 text-center text-muted">
                                                <div className="mb-2">
                                                    <FaGraduationCap size={40} className="text-light-emphasis" />
                                                </div>
                                                لا توجد شهادات مسجلة حالياً
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                <div className="mt-4 p-3 bg-light border-start border-4 border-warning shadow-sm" style={{ borderRadius: '12px' }}>
                    <p className="mb-0 small text-muted">
                        <strong>ملاحظة:</strong> سيتم مراجعة الشهادات المضافة من قبل قسم الشؤون الإدارية قبل اعتمادها بشكل نهائي في ملفك.
                    </p>
                </div>
            </div>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
                <Modal.Body className="p-0">
                    <AddEduCertificate
                        onSuccess={() => {
                            setShowAddModal(false);
                            refetch();
                        }}
                        onCancel={() => setShowAddModal(false)}
                    />
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
                <Modal.Body className="p-0">
                    <EditEduCertificate
                        degree={selectedDegree}
                        onSuccess={() => {
                            setShowEditModal(false);
                            refetch();
                        }}
                        onCancel={() => setShowEditModal(false)}
                    />
                </Modal.Body>
            </Modal>

            <ConfirmModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message="هل أنت متأكد من حذف هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={deleteDegreeMutation.isPending}
            />

            <RejectionReasonModal
                show={showRejectionModal}
                handleClose={() => setShowRejectionModal(false)}
                reason={rejectionReason}
            />

            <EduCertificateDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                degree={selectedDegreeDetails}
            />
        </EmpGateSideBar>
    );
};

export default EmpCertificatesPage;
