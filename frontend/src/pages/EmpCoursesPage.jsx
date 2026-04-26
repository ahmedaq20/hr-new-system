import React from 'react';
import { Table, Card, Badge, Spinner, Alert, Modal, Button } from 'react-bootstrap';
import { FaChalkboardTeacher, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaPlus, FaClock, FaTimesCircle, FaEdit, FaTrash, FaEye, FaInfoCircle, FaExclamationTriangle, FaPaperclip } from 'react-icons/fa';
import EmpGateSideBar from '../components/EmpGateSideBar';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import AddCourseRequest from '../components/AddCourseRequest';
import EditCourseRequest from '../components/EditCourseRequest';
import { useDeleteCourseRequest } from '../hooks/useAddCourseRequest';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import RejectionReasonModal from '../components/RejectionReasonModal';
import CourseDetailsModal from '../components/CourseDetailsModal';

const EmpCoursesPage = () => {
    const { data, isLoading, error, refetch } = useEmployeeDashboard();
    const deleteRequestMutation = useDeleteCourseRequest();

    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [selectedRequest, setSelectedRequest] = React.useState(null);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [requestToDelete, setRequestToDelete] = React.useState(null);
    const [showRejectionModal, setShowRejectionModal] = React.useState(false);
    const [rejectionReason, setRejectionReason] = React.useState(null);
    const [showDetailsModal, setShowDetailsModal] = React.useState(false);
    const [selectedCourseDetails, setSelectedCourseDetails] = React.useState(null);

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
                    {error.message || 'فشل جلب بيانات الدورات'}
                </Alert>
            </EmpGateSideBar>
        );
    }

    const courses = data?.courses || [];

    const handleEditClick = (courseReq) => {
        setSelectedRequest({
            id: courseReq.id,
            course_name: courseReq.course_name,
            provider: courseReq.provider,
            hours: courseReq.hours,
            date: courseReq.date,
            notes: courseReq.notes,
            approval_status: courseReq.status,
            certificate_url: courseReq.certificate_url,
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (id) => {
        setRequestToDelete(id);
        setShowConfirmModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!requestToDelete) return;
        try {
            await deleteRequestMutation.mutateAsync(requestToDelete);
        } catch (error) {
        } finally {
            setShowConfirmModal(false);
            setRequestToDelete(null);
        }
    };

    const getStatusBadge = (status, reason) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
                        <FaCheckCircle size={12} />
                        مقبول
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-3 py-2 fw-normal d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
                        <FaClock size={12} />
                        انتظار المراجعة
                    </Badge>
                );
            case 'rejected':
                return (
                    <div className="d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
                        <Badge bg="danger-subtle" className="text-danger border border-danger-subtle px-3 py-2 fw-normal d-flex align-items-center justify-content-center gap-1" style={{ width: 'fit-content' }}>
                            <FaTimesCircle size={12} />
                            مرفوض
                        </Badge>
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
                return (
                    <Badge bg="success-subtle" className="text-success border border-success-subtle px-3 py-2 fw-normal d-flex align-items-center justify-content-center gap-1 mx-auto" style={{ width: 'fit-content' }}>
                        <FaCheckCircle size={12} />
                        مكتملة
                    </Badge>
                );
        }
    };

    const rejectedCourses = courses.filter(c => c.status === 'rejected');

    return (
        <EmpGateSideBar>
            <div className="animate-fade-in p-2">
                {rejectedCourses.length > 0 && (
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
                        <h4 className="fw-bold text-dark mb-1">الدورات التدريبية</h4>
                        <p className="text-muted small mb-0">قائمة بالدورات التدريبية والطلبات الحالية</p>
                    </div>
                    <Button
                        variant="teal"
                        className="d-flex align-items-center gap-2 shadow-sm"
                        style={{ backgroundColor: '#016A74', color: 'white', borderRadius: '10px', border: 'none', padding: '10px 20px' }}
                        onClick={() => setShowAddModal(true)}
                    >
                        <FaPlus />
                        طلب تسجيل دورة
                    </Button>
                </div>

                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-center">
                                <thead className="bg-light text-secondary small text-uppercase">
                                    <tr>
                                        <th className="py-3 border-0" style={{ borderRadius: '15px 0 0 0' }}>#</th>
                                        <th className="py-3 border-0">اسم الدورة</th>
                                        <th className="py-3 border-0">الجهة المنظمة</th>
                                        <th className="py-3 border-0">عدد الساعات</th>
                                        <th className="py-3 border-0">تاريخ البدء</th>
                                        <th className="py-3 border-0">الحالة</th>
                                        <th className="py-3 border-0">المرفقات</th>
                                        <th className="py-3 border-0" style={{ borderRadius: '0 15px 0 0' }}>إجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.length > 0 ? (
                                        courses.map((c, index) => (
                                            <tr key={index}>
                                                <td className="fw-bold text-muted">{index + 1}</td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaChalkboardTeacher className="text-teal" style={{ color: '#0f766e' }} />
                                                        <span className="fw-medium">{c.course_name || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaMapMarkerAlt className="text-secondary" />
                                                        <span>{c.provider || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaClock className="text-muted" />
                                                        <span>{c.hours || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                        <FaCalendarAlt className="text-muted" />
                                                        <span>{c.date || '---'}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {getStatusBadge(c.status, c.rejection_reason)}
                                                </td>
                                                <td>
                                                    {c.certificate_url ? (
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2 gap-1"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#e0f7fa' }}
                                                            onClick={() => window.open(c.certificate_url, '_blank')}
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
                                                                setSelectedCourseDetails(c);
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
                                                            onClick={() => handleEditClick(c)}
                                                            title="تعديل"
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            className="d-inline-flex align-items-center p-2"
                                                            style={{ borderRadius: '8px', border: 'none', backgroundColor: '#ffe6e6' }}
                                                            onClick={() => handleDeleteClick(c.id)}
                                                            disabled={deleteRequestMutation.isPending}
                                                            title={'حذف'}
                                                        >
                                                            {deleteRequestMutation.isPending ? <Spinner size="sm" /> : <FaTrash />}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="py-5 text-center text-muted">
                                                <div className="mb-2">
                                                    <FaChalkboardTeacher size={40} className="text-light-emphasis" />
                                                </div>
                                                لا توجد دورات تدريبية مسجلة حالياً
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
                        <strong>ملاحظة:</strong> سيتم مراجعة طلبك من قبل إدارة الموارد البشرية.
                    </p>
                </div>
            </div>

            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
                <Modal.Body className="p-0">
                    <AddCourseRequest
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
                    <EditCourseRequest
                        participant={selectedRequest}
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
                message="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
                isLoading={deleteRequestMutation.isPending}
            />

            <RejectionReasonModal
                show={showRejectionModal}
                handleClose={() => setShowRejectionModal(false)}
                reason={rejectionReason}
            />

            <CourseDetailsModal
                show={showDetailsModal}
                onHide={() => setShowDetailsModal(false)}
                course={selectedCourseDetails}
            />
        </EmpGateSideBar>
    );
};

export default EmpCoursesPage;
