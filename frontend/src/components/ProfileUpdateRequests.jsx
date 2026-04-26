import React from 'react';
import { Card, Table, Button, Badge, Modal, Form, Tabs, Tab, Spinner, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaUsers, FaChild, FaHeart, FaUserEdit, FaPhone, FaMapMarkerAlt, FaEnvelope, FaUser, FaInfoCircle, FaCalendarAlt, FaIdCard, FaGraduationCap, FaChalkboardTeacher, FaClock, FaUniversity, FaUserTie, FaCheckDouble } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-hot-toast';
import { useLookups } from '../hooks/useLookups';
import { getStorageUrl } from '../utils/storage';
import CSelect from './CSelect';
import Pagination from './Pagination';

const EMPTY_ARRAY = [];

const FIELD_LABELS = {
    primary_phone: { label: 'رقم الجوال الأساسي', icon: FaPhone },
    secondary_phone: { label: 'رقم الجوال البديل', icon: FaPhone },
    address: { label: 'العنوان بالتفصيل', icon: FaMapMarkerAlt },
    marital_status: { label: 'الحالة الاجتماعية', icon: FaUser },
    gender: { label: 'الجنس', icon: FaUser },
    email: { label: 'البريد الإلكتروني', icon: FaEnvelope },
    governorate_id: { label: 'المحافظة', icon: FaMapMarkerAlt, lookup: 'GOVERNORATE' },
    city_id: { label: 'المدينة', icon: FaMapMarkerAlt, lookup: 'CITY' },
};

const TRANSLATIONS = {
    male: 'ذكر',
    female: 'أنثى',
    married: 'متزوج/ة',
    single: 'أعزب/عزباء',
    divorced: 'مطلق/ة',
    widowed: 'أرمل/ة',
    true: 'نعم',
    false: 'لا',
    'نعم': 'نعم',
    'لا': 'لا'
};

const translateValue = (val) => {
    if (val === null || val === undefined) return val;
    const sVal = String(val).toLowerCase();
    return TRANSLATIONS[sVal] || val;
};

const ProfileUpdateRequests = () => {
    const queryClient = useQueryClient();
    const { data: lookups } = useLookups();
    const [selectedRequest, setSelectedRequest] = React.useState(null);
    const [requestType, setRequestType] = React.useState('profile');
    const [showModal, setShowModal] = React.useState(false);
    const [rejectionReason, setRejectionReason] = React.useState('');
    const [showRejectModal, setShowRejectModal] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('profile');
    const [filterEmployee, setFilterEmployee] = React.useState(null);
    const [lastUpdated, setLastUpdated] = React.useState(new Date());
    const [showFullReasonModal, setShowFullReasonModal] = React.useState(false);
    const [viewingReason, setViewingReason] = React.useState('');

    // Archive specific state
    const [archivePage, setArchivePage] = React.useState(1);
    const archiveItemsPerPage = 15;

    const POLLING_INTERVAL = 30000; // 30 seconds

    // Fetching Functions
    const fetchRequests = async (type) => {
        let endpoint = '';
        switch (type) {
            case 'profile': endpoint = ENDPOINTS.ADMIN.PROFILE_UPDATE_REQUESTS; break;
            case 'spouse': endpoint = ENDPOINTS.ADMIN.SPOUSES; break;
            case 'child': endpoint = ENDPOINTS.ADMIN.CHILDREN; break;
            case 'dependent': endpoint = ENDPOINTS.ADMIN.DEPENDENTS; break;
            case 'qualification': endpoint = `${ENDPOINTS.EMPLOYEE.DEGREES}/all`; break;
            case 'course': endpoint = `${ENDPOINTS.TRAINING_COURSES.LIST}/participants/all`; break;
            default: return [];
        }

        const params = (type === 'profile' || type === 'qualification' || type === 'course') ? {} : { approval_status: 'pending', length: 100 };
        const response = await api.get(endpoint, { params });

        if (type === 'profile') return response.data.data.data;
        if (type === 'qualification' || type === 'course') {
            return response.data.data.filter(item => item.approval_status === 'pending');
        }
        return response.data.data;
    };

    const { data: profileRequests, isLoading: isLoadingProfile, refetch: refetchProfile, isFetching: isFetchingProfile } = useQuery({ queryKey: ['admin-profile-requests'], queryFn: async () => { const res = await fetchRequests('profile'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });
    const { data: spouseRequests, isLoading: isLoadingSpouse, refetch: refetchSpouse, isFetching: isFetchingSpouse } = useQuery({ queryKey: ['admin-spouse-requests'], queryFn: async () => { const res = await fetchRequests('spouse'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });
    const { data: childRequests, isLoading: isLoadingChild, refetch: refetchChild, isFetching: isFetchingChild } = useQuery({ queryKey: ['admin-child-requests'], queryFn: async () => { const res = await fetchRequests('child'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });
    const { data: dependentRequests, isLoading: isLoadingDependent, refetch: refetchDependent, isFetching: isFetchingDependent } = useQuery({ queryKey: ['admin-dependent-requests'], queryFn: async () => { const res = await fetchRequests('dependent'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });
    const { data: qualificationRequests, isLoading: isLoadingQualification, refetch: refetchQualification, isFetching: isFetchingQualification } = useQuery({ queryKey: ['admin-qualification-requests'], queryFn: async () => { const res = await fetchRequests('qualification'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });
    const { data: courseRequests, isLoading: isLoadingCourse, refetch: refetchCourse, isFetching: isFetchingCourse } = useQuery({ queryKey: ['admin-course-requests'], queryFn: async () => { const res = await fetchRequests('course'); setLastUpdated(new Date()); return res; }, refetchInterval: POLLING_INTERVAL });

    const { data: archiveRequestsData, isLoading: isLoadingArchive, refetch: refetchArchive, isFetching: isFetchingArchive } = useQuery({
        queryKey: ['admin-archive-requests', archivePage, filterEmployee],
        queryFn: async () => {
            const params = { per_page: archiveItemsPerPage, page: archivePage };
            if (filterEmployee?.value) params.employee_id = filterEmployee.value;
            const res = await api.get(ENDPOINTS.ADMIN.APPROVAL_ARCHIVE, { params });
            return res.data.data;
        },
        enabled: activeTab === 'archive'
    });

    const archiveRequests = archiveRequestsData?.data || [];
    const archiveTotalPages = archiveRequestsData?.last_page || 1;

    const { data: archiveEmployeesData } = useQuery({
        queryKey: ['admin-archive-employees'],
        queryFn: async () => {
            const res = await api.get(ENDPOINTS.ADMIN.APPROVAL_ARCHIVE_EMPLOYEES);
            return res.data.data;
        },
        enabled: activeTab === 'archive'
    });

    const isFetchingAny = isFetchingProfile || isFetchingSpouse || isFetchingChild || isFetchingDependent || isFetchingQualification || isFetchingCourse || isFetchingArchive;

    const handleRefresh = () => {
        refetchProfile();
        refetchSpouse();
        refetchChild();
        refetchDependent();
        refetchQualification();
        refetchCourse();
        if (activeTab === 'archive') refetchArchive();
        toast.success('يتم الآن تحديث البيانات...');
    };

    // Compute unique employees for filtering
    const uniqueEmployees = React.useMemo(() => {
        const allRequests = [
            ...(profileRequests || []),
            ...(spouseRequests || []),
            ...(childRequests || []),
            ...(dependentRequests || []),
            ...(qualificationRequests || []),
            ...(courseRequests || []),
            ...(archiveRequests || [])
        ];

        const employeesMap = new Map();
        allRequests.forEach(req => {
            const id = req.employee_id || req.employee?.id;
            const name = req.employee_name || req.employee?.user?.name || req.employee?.full_name || req.employee?.first_name;
            if (id && name) {
                employeesMap.set(id, { value: id, label: name });
            }
        });

        return Array.from(employeesMap.values()).sort((a, b) => a.label.localeCompare(b.label, 'ar'));
    }, [profileRequests, spouseRequests, childRequests, dependentRequests, qualificationRequests, courseRequests]);

    const displayEmployees = activeTab === 'archive' ? (archiveEmployeesData || EMPTY_ARRAY) : uniqueEmployees;

    const tabConfigs = [
        { key: 'profile', title: 'تحديث البيانات', icon: FaUserEdit, count: profileRequests?.length },
        { key: 'spouse', title: 'الزوجات', icon: FaUsers, count: spouseRequests?.length },
        { key: 'child', title: 'الأبناء', icon: FaChild, count: childRequests?.length },
        { key: 'dependent', title: 'المعيلين', icon: FaHeart, count: dependentRequests?.length },
        { key: 'qualification', title: 'الشهادات', icon: FaGraduationCap, count: qualificationRequests?.length },
        { key: 'course', title: 'الدورات', icon: FaChalkboardTeacher, count: courseRequests?.length },
        { key: 'archive', title: 'الأرشيف والسجل الإداري', icon: FaClock, count: 0 },
    ];

    const rawActiveData = activeTab === 'profile' ? profileRequests :
        activeTab === 'spouse' ? spouseRequests :
            activeTab === 'child' ? childRequests :
                activeTab === 'dependent' ? dependentRequests :
                    activeTab === 'qualification' ? qualificationRequests :
                        activeTab === 'course' ? courseRequests :
                            archiveRequests;

    const activeData = React.useMemo(() => {
        if (activeTab === 'archive') {
            return rawActiveData || [];
        }

        if (!filterEmployee) return rawActiveData;
        return rawActiveData?.filter(req => {
            const id = req.employee_id || req.employee?.id;
            return String(id) === String(filterEmployee.value);
        });
    }, [rawActiveData, filterEmployee, activeTab]);

    // Pagination is handled by the backend for archive, so paginatedArchiveData is no longer needed.

    const isLoadingActive = activeTab === 'profile' ? isLoadingProfile :
        activeTab === 'spouse' ? isLoadingSpouse :
            activeTab === 'child' ? isLoadingChild :
                activeTab === 'dependent' ? isLoadingDependent :
                    activeTab === 'qualification' ? isLoadingQualification :
                        activeTab === 'course' ? isLoadingCourse :
                            isLoadingArchive;

    // Mutations
    const approveMutation = useMutation({
        mutationFn: (id) => {
            let endpoint = '';
            switch (activeTab) {
                case 'profile': endpoint = ENDPOINTS.ADMIN.APPROVE_PROFILE_REQUEST(id); break;
                case 'spouse': endpoint = ENDPOINTS.ADMIN.APPROVE_SPOUSE(id); break;
                case 'child': endpoint = ENDPOINTS.ADMIN.APPROVE_CHILD(id); break;
                case 'dependent': endpoint = ENDPOINTS.ADMIN.APPROVE_DEPENDENT(id); break;
                case 'qualification': endpoint = `${ENDPOINTS.EMPLOYEE.DEGREES}/${id}/approve`; break;
                case 'course': endpoint = `${ENDPOINTS.TRAINING_COURSES.LIST}/participants/${id}/approve`; break;
            }
            return api.post(endpoint);
        },
        onSuccess: () => {
            toast.success('تمت الموافقة بنجاح');
            queryClient.invalidateQueries({ queryKey: [`admin-${activeTab}-requests`] });
            setShowModal(false);
        },
        onError: (error) => toast.error(error.response?.data?.message || 'حدث خطأ أثناء الموافقة')
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }) => {
            let endpoint = '';
            switch (activeTab) {
                case 'profile': endpoint = ENDPOINTS.ADMIN.REJECT_PROFILE_REQUEST(id); break;
                case 'spouse': endpoint = ENDPOINTS.ADMIN.REJECT_SPOUSE(id); break;
                case 'child': endpoint = ENDPOINTS.ADMIN.REJECT_CHILD(id); break;
                case 'dependent': endpoint = ENDPOINTS.ADMIN.REJECT_DEPENDENT(id); break;
                case 'qualification': endpoint = `${ENDPOINTS.EMPLOYEE.DEGREES}/${id}/reject`; break;
                case 'course': endpoint = `${ENDPOINTS.TRAINING_COURSES.LIST}/participants/${id}/reject`; break;
            }
            return api.post(endpoint, { rejection_reason: reason });
        },
        onSuccess: () => {
            toast.success('تم رفض الطلب');
            queryClient.invalidateQueries({ queryKey: [`admin-${activeTab}-requests`] });
            setShowRejectModal(false);
            setShowModal(false);
            setRejectionReason('');
        }
    });

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setRequestType(activeTab === 'archive' ? request._type : activeTab);
        setShowModal(true);
    };

    const resolveValue = (key, value) => {
        const config = FIELD_LABELS[key];
        if (config?.lookup && lookups?.[config.lookup]) {
            const found = lookups[config.lookup].find(item => String(item.id) === String(value));
            return found ? found.value : value;
        }
        return translateValue(value);
    };

    const renderTableContent = () => {
        if (isLoadingActive) {
            return <div className="text-center p-5"><Spinner animation="border" style={{ color: '#002F6C' }} /></div>;
        }

        if (activeTab === 'archive') {
            return (
                <>
                    <Table responsive hover className="align-middle text-center border-0 mb-0">
                        <thead className="bg-light-subtle text-secondary small text-uppercase">
                            <tr>
                                <th className="py-3 px-4 text-end">الموظف</th>
                                <th className="py-3">المعاملة</th>
                                <th className="py-3">القرار</th>
                                <th className="py-3">المسؤول</th>
                                <th className="py-3">تاريخ القرار</th>
                                <th className="py-3 text-end px-4">تفاصيل إضافية</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeData?.length > 0 ? activeData.map((req) => {
                                const status = req.status || req.approval_status;
                                const isApproved = status === 'approved';
                                return (
                                    <tr key={`archive-${req._type}-${req.id}`} className="border-bottom border-light">
                                        <td className="py-3 px-4 text-start">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light text-secondary p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                                    <FaUser size={14} />
                                                </div>
                                                <div>
                                                    <span className="fw-bold text-dark d-block text-truncate" style={{ maxWidth: '150px' }}>{req.employee_name || req.employee?.user?.name || req.employee?.first_name || req.employee?.full_name || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge bg="light" text="dark" className="border px-2 py-1">
                                                {req._type === 'profile' ? 'تحديث بيانات' :
                                                    req._type === 'spouse' ? 'إضافة زوجة' :
                                                        req._type === 'child' ? 'إضافة ابن' :
                                                            req._type === 'dependent' ? 'إضافة معيل' :
                                                                req._type === 'qualification' ? 'إضافة شهادة' : 'إضافة دورة'
                                                }
                                            </Badge>
                                        </td>
                                        <td>
                                            {isApproved ? (
                                                <Badge bg="success" className="px-3" style={{ borderRadius: '50px' }}>مقبول <FaCheck className="ms-1" size={10} /></Badge>
                                            ) : status === 'rejected' ? (
                                                <Badge bg="danger" className="px-3" style={{ borderRadius: '50px' }}>مرفوض <FaTimes className="ms-1" size={10} /></Badge>
                                            ) : (
                                                <Badge bg="secondary" className="px-3" style={{ borderRadius: '50px' }}>غير معروف</Badge>
                                            )}
                                        </td>
                                        <td>
                                            <span className="small fw-medium d-block text-dark">{req.approved_by_name || req.approver?.name || '-'}</span>
                                            {req.approver?.national_id && (
                                                <span className="extra-small text-muted d-block opacity-75">{req.approver.national_id}</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="text-muted small" dir="ltr">{req.approved_at || req.updated_at ? new Date(req.approved_at || req.updated_at).toLocaleString('en-GB') : '-'}</span>
                                        </td>
                                        <td className="text-end px-4">
                                            <div className="d-flex align-items-center justify-content-between gap-2">
                                                {!isApproved && req.rejection_reason && (
                                                    <div className="d-flex align-items-center">
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className="rounded-pill px-3 py-1 border-danger-subtle text-danger extra-small fw-bold d-flex align-items-center gap-2 hover-lift transition-all"
                                                            style={{
                                                                backgroundColor: 'rgba(220, 53, 69, 0.05)',
                                                                border: '1px solid rgba(220, 53, 69, 0.2)'
                                                            }}
                                                            onClick={() => {
                                                                setViewingReason(req.rejection_reason);
                                                                setShowFullReasonModal(true);
                                                            }}
                                                        >
                                                            <FaInfoCircle size={10} /> عرض سبب الرفض
                                                        </Button>
                                                    </div>
                                                )}
                                                <Button variant="light" size="sm" className="rounded-pill px-3 py-1 border shadow-sm btn-view-request me-auto" onClick={() => handleViewDetails(req)}>
                                                    <FaEye className="ms-1" /> التفاصيل
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="6" className="p-5 text-muted fst-italic">لا يوجد سجل للأرشيف حالياً</td></tr>
                            )}
                        </tbody>
                    </Table>
                    {
                        <div className="p-3 border-top bg-white">
                            <Pagination
                                currentPage={archivePage}
                                totalPages={archiveTotalPages}
                                onPageChange={setArchivePage}
                            />
                        </div>
                    }
                </>
            );
        }

        return (
            <Table responsive hover className="align-middle text-center border-0 mb-0">
                <thead className="bg-light-subtle text-secondary small text-uppercase">
                    <tr>
                        <th className="py-3 px-4 text-end">الموظف</th>
                        <th className="py-3">رقم الهوية</th>
                        {activeTab === 'profile' ? (
                            <>
                                <th className="py-3">تاريخ الطلب</th>
                                <th className="py-3">الحقول المعدلة</th>
                            </>
                        ) : (
                            <>
                                <th className="py-3">الاسم المراد إضافته</th>
                                <th className="py-3">أو البيان الجديد</th>
                            </>
                        )}
                        <th className="py-3 text-end px-4">الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {activeData?.length > 0 ? activeData.map((req) => (
                        <tr key={req.id} className="request-row border-bottom border-light">
                            <td className="py-3 px-4 text-start">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-primary-subtle text-primary p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                                        <FaUser size={14} />
                                    </div>
                                    <span className="fw-bold text-dark">{req.employee_name || req.employee?.user?.name || req.employee?.first_name}</span>
                                </div>
                            </td>
                            <td><span className="badge-modern badge-id">{req.national_id || req.employee?.national_id}</span></td>
                            {activeTab === 'profile' ? (
                                <>
                                    <td className="text-muted small">{new Date(req.created_at).toLocaleDateString('ar-EG')}</td>
                                    <td><Badge className="px-3" style={{ borderRadius: '50px', backgroundColor: 'rgba(0, 47, 108, 0.1)', color: '#002F6C' }}>{Object.keys(req.requested_changes).length} حقول</Badge></td>
                                </>
                            ) : (
                                <>
                                    <td className="fw-medium">{req.full_name || req.degree || req.course_name || req.manual_course_name}</td>
                                    <td>
                                        <span className="text-secondary small">
                                            {
                                                activeTab === 'spouse' ? 'زوج/زوجة' :
                                                    activeTab === 'child' ? 'ابن/ابنة' :
                                                        activeTab === 'qualification' ? (req.qualification?.value || 'شهادة علمية') :
                                                            activeTab === 'course' ? 'دورة تدريبية' :
                                                                req.relationship
                                            }
                                        </span>
                                    </td>
                                </>
                            )}
                            <td className="text-end px-4">
                                <Button variant="light" size="sm" className="rounded-pill px-3 py-1 border shadow-sm btn-view-request" onClick={() => handleViewDetails(req)}>
                                    <FaEye className="ms-1" /> عرض القرار
                                </Button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" className="p-5 text-muted fst-italic">لا توجد طلبات معلقة في هذا القسم حالياً</td></tr>
                    )}
                </tbody>
            </Table>
        );
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light-subtle" dir="rtl">
            {/* Glassmorphism Header */}
            <div className="employee-header mb-4 p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden">
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

                <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                    <div className="col-lg-7">
                        <div className="d-flex align-items-center gap-3">
                            <div className={`profile-avatar shadow-sm d-flex align-items-center justify-content-center rounded-circle text-white fs-4 fw-bold ${isFetchingAny ? 'pulse-avatar' : ''}`}
                                style={{ width: '90px', height: '90px', border: '3px solid #fff', background: 'linear-gradient(135deg, #002F6C 0%, #1c3d5a 100%)', position: 'relative', flexShrink: 0 }}>
                                <FaCheckDouble className={isFetchingAny ? 'spin-slow' : ''} style={{ fontSize: '2.2rem' }} />
                                {isFetchingAny && (
                                    <div className="position-absolute w-100 h-100 rounded-circle border border-primary border-4 animate-ping" style={{ inset: 0, opacity: 0.5 }}></div>
                                )}
                            </div>

                            <div>
                                <h2 className="mb-1 fw-bold text-dark-emphasis tracking-tight">مركز الموافقات الإدارية</h2>
                                <div className="d-flex align-items-center flex-wrap gap-3 text-secondary">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-info-circle" style={{ color: '#002F6C' }}></i>
                                        <span className="small fw-medium">إدارة طلبات تحديث بيانات الموظفين وعائلاتهم</span>
                                    </div>
                                    <div className="vr opacity-25" style={{ height: '15px' }}></div>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge-modern badge-active`}>
                                            <span className="pulse-dot ms-2 text-success"></span>
                                            {(profileRequests?.length || 0) + (spouseRequests?.length || 0) + (childRequests?.length || 0) + (dependentRequests?.length || 0) + (qualificationRequests?.length || 0) + (courseRequests?.length || 0)} طلبات قيد الانتظار
                                        </span>
                                    </div>
                                    <div className="vr opacity-25" style={{ height: '15px' }}></div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="p-0 text-decoration-none text-secondary d-flex align-items-center gap-1 hover-primary"
                                            onClick={handleRefresh}
                                            disabled={isFetchingAny}
                                        >
                                            <i className={`bi bi-arrow-clockwise ${isFetchingAny ? 'spin' : ''}`} style={{ color: '#002F6C' }}></i>
                                            <span className="extra-small fw-bold">تحديث الآن</span>
                                        </Button>
                                        <span className="extra-small opacity-75">آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5 mt-3 mt-lg-0">
                        <div className="bg-white p-1 rounded-3 border-0">
                            <CSelect
                                placeholder="البحث عن موظف معين..."
                                options={displayEmployees}
                                isClearable
                                value={filterEmployee}
                                onChange={(val) => { setFilterEmployee(val); setArchivePage(1); }}
                                className="mb-0 border-0"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pill-style Tab Navigation */}
            <div className="tabs-wrapper mb-4 p-2 bg-white rounded-pill shadow-sm d-flex flex-nowrap overflow-auto hide-scrollbar sticky-top mx-auto w-fit-content" style={{ top: '20px', zIndex: 100, backdropFilter: 'blur(10px)', border: '1px solid rgba(0, 47, 108, 0.08)' }}>
                {tabConfigs.map((tab) => (
                    <div
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`tab-item px-4 py-2 rounded-pill cursor-pointer transition-all white-space-nowrap d-flex align-items-center gap-2 ${activeTab === tab.key ? "bg-white shadow-sm fw-bold scale-up active-pill" : "text-secondary opacity-75"}`}
                        style={activeTab === tab.key ? { color: '#002F6C', boxShadow: '0 4px 10px rgba(0, 47, 108, 0.1)' } : {}}
                    >
                        <tab.icon />
                        <span className="small">{tab.title}</span>
                        {tab.count > 0 && <span className="tab-badge">{tab.count}</span>}
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="rounded-4 shadow-sm border-0 main-content-shield mb-5 overflow-hidden">
                {activeTab === 'archive' && (
                    <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <FaClock className="text-primary opacity-75" />
                            <h6 className="mb-0 fw-bold text-dark">سجل الأرشيف</h6>
                        </div>
                    </Card.Header>
                )}
                <Card.Body className="p-0">
                    <div className="animate-fade-in">
                        {renderTableContent()}
                    </div>
                </Card.Body>
            </Card>

            {/* Details Modal */}
            <Modal show={showModal} onHide={() => !approveMutation.isLoading && setShowModal(false)} size="lg" centered dir="rtl" backdrop="static" className="custom-modal">
                <Modal.Header className="border-0 bg-light-subtle p-4 d-flex align-items-center justify-content-between">
                    <Modal.Title className="fw-bold d-flex align-items-center gap-2" style={{ color: '#002F6C' }}>
                        <FaInfoCircle /> تفاصيل طلب الموافقة
                    </Modal.Title>
                    <button
                        type="button"
                        className="btn-close m-0"
                        aria-label="Close"
                        onClick={() => !approveMutation.isLoading && setShowModal(false)}
                    ></button>
                </Modal.Header>
                <Modal.Body className="p-4 bg-white modal-scrollable">
                    {selectedRequest && (
                        <div>
                            <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-4 bg-light shadow-sm border-start border-5" style={{ borderLeftColor: '#002F6C' }}>
                                <div className="bg-primary text-white p-3 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #002F6C 0%, #1c3d5a 100%)' }}>
                                    <FaUser size={24} />
                                </div>
                                <div>
                                    <div className="text-secondary small fw-bold opacity-75 mb-1">الموظف صاحب الطلب</div>
                                    <h5 className="fw-bold mb-0" style={{ color: '#002F6C' }}>{selectedRequest.employee_name || selectedRequest.employee?.user?.name || selectedRequest.employee?.full_name}</h5>
                                </div>
                            </div>

                            {requestType === 'profile' ? (
                                <Row className="g-3 animate-fade-in">
                                    <Col md={12}>
                                        <div className="p-2 mb-1 text-secondary small fw-bold opacity-75 border-bottom">مقارنة الحقول المراد تعديلها:</div>
                                    </Col>
                                    {Object.entries(selectedRequest.requested_changes).map(([key, value]) => {
                                        const config = FIELD_LABELS[key] || { label: key, icon: FaInfoCircle };
                                        const Icon = config.icon;
                                        return (
                                            <Col md={6} key={key}>
                                                <div className="stat-card p-3 rounded-4 h-100 transition-all border bg-light-subtle">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <span className="text-muted small fw-medium d-flex align-items-center gap-2 font-noto">
                                                            <Icon size={12} className="text-primary opacity-75" />
                                                            {config.label}
                                                        </span>
                                                        <i className="bi bi-info-circle-fill opacity-25" style={{ color: '#002F6C' }}></i>
                                                    </div>
                                                    <div className="val-container">
                                                        <span className="fw-bold text-dark fs-6 d-block mt-1">
                                                            {resolveValue(key, value) || <span className="text-muted fw-normal opacity-50">---</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            ) : (
                                <Row className="g-4 animate-fade-in">
                                    {(
                                        ['profile', 'spouse', 'child', 'dependent'].includes(requestType) ? (
                                            [
                                                { label: 'الاسم الكامل', value: selectedRequest.full_name, icon: FaUser },
                                                { label: 'رقم الهوية', value: selectedRequest.spouse_id_number || selectedRequest.id_number || selectedRequest.dependent_id_number || selectedRequest.national_id, icon: FaIdCard },
                                                { label: 'تاريخ الميلاد', value: selectedRequest.birth_date, icon: FaCalendarAlt },
                                                ...(requestType === 'spouse' ? [
                                                    { label: 'رقم الجوال', value: selectedRequest.mobile, icon: FaPhone },
                                                    { label: 'تاريخ الزواج', value: selectedRequest.marriage_date, icon: FaCalendarAlt },
                                                    { label: 'حالة الزواج', value: selectedRequest.marital_status, icon: FaHeart },
                                                    { label: 'يعمل/تعمل', value: selectedRequest.is_working, icon: FaUserTie },
                                                    { label: 'مرفق عقد القران', value: selectedRequest.marriage_contract_path ? <a href={getStorageUrl(selectedRequest.marriage_contract_path)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض المرفق</a> : '---', icon: FaEye }
                                                ] : []),
                                                ...(requestType === 'child' ? [
                                                    { label: 'الجنس', value: selectedRequest.gender, icon: FaInfoCircle },
                                                    { label: 'الحالة الاجتماعية', value: selectedRequest.marital_status, icon: FaHeart },
                                                    { label: 'يعمل', value: selectedRequest.is_working, icon: FaUserTie },
                                                    { label: 'طالب جامعي', value: selectedRequest.is_university_student, icon: FaGraduationCap },
                                                    { label: 'اسم الأم', value: selectedRequest.mother_full_name, icon: FaUser },
                                                    { label: 'رقم هوية الأم', value: selectedRequest.mother_id_number, icon: FaIdCard },
                                                    { label: 'ملاحظات', value: selectedRequest.notes, icon: FaInfoCircle },
                                                    { label: 'مرفق بطاقة الهوية', value: selectedRequest.id_card_image ? <a href={getStorageUrl(selectedRequest.id_card_image)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض المرفق</a> : '---', icon: FaEye },
                                                    { label: 'مرفق شهادة الميلاد', value: selectedRequest.birth_certificate_image ? <a href={getStorageUrl(selectedRequest.birth_certificate_image)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض المرفق</a> : '---', icon: FaEye },
                                                    { label: 'مرفق شهادة القيد الجامعي', value: selectedRequest.university_certificate_image ? <a href={getStorageUrl(selectedRequest.university_certificate_image)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض المرفق</a> : '---', icon: FaEye }
                                                ] : []),
                                                ...(requestType === 'dependent' ? [
                                                    { label: 'رقم الجوال', value: selectedRequest.mobile, icon: FaPhone },
                                                    { label: 'صلة القرابة', value: selectedRequest.relationship, icon: FaHeart },
                                                    { label: 'الجنس', value: selectedRequest.gender, icon: FaInfoCircle },
                                                    { label: 'العنوان', value: selectedRequest.address, icon: FaMapMarkerAlt },
                                                    { label: 'ملاحظات', value: selectedRequest.notes, icon: FaInfoCircle },
                                                    { label: 'مرفق حجة الإعالة', value: selectedRequest.dependency_proof_path ? <a href={getStorageUrl(selectedRequest.dependency_proof_path)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض المرفق</a> : '---', icon: FaEye }
                                                ] : []),
                                            ]
                                        ) : requestType === 'qualification' ? (
                                            [
                                                { label: 'الدرجة العلمية', value: selectedRequest.degree, icon: FaGraduationCap },
                                                { label: 'التخصص', value: selectedRequest.major_name, icon: FaGraduationCap },
                                                { label: 'الجامعة', value: selectedRequest.university_name, icon: FaUniversity },
                                                { label: 'سنة التخرج', value: selectedRequest.graduation_year, icon: FaCalendarAlt },
                                                { label: 'التقدير', value: selectedRequest.grade, icon: FaInfoCircle },
                                                { label: 'ملاحظات', value: selectedRequest.notes, icon: FaInfoCircle },
                                                { label: 'مرفق الشهادة', value: selectedRequest.certificate_attachment ? <a href={getStorageUrl(selectedRequest.certificate_attachment)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض الشهادة</a> : '---', icon: FaEye }
                                            ]
                                        ) : (
                                            [
                                                { label: 'اسم الدورة', value: selectedRequest.course?.name || selectedRequest.course_name || selectedRequest.manual_course_name, icon: FaChalkboardTeacher },
                                                { label: 'الجهة المنظمة', value: selectedRequest.course?.provider || selectedRequest.provider || selectedRequest.manual_institution, icon: FaMapMarkerAlt },
                                                { label: 'عدد الساعات', value: selectedRequest.hours || selectedRequest.course_hours, icon: FaClock },
                                                { label: 'تاريخ البدء/الدورة', value: selectedRequest.course?.start_date || selectedRequest.date || selectedRequest.course_date, icon: FaCalendarAlt },
                                                { label: 'ملاحظات الموظف', value: selectedRequest.notes, icon: FaInfoCircle },
                                                { label: 'مرفق الشهادة', value: selectedRequest.certificate_path ? <a href={getStorageUrl(selectedRequest.certificate_path)} target="_blank" rel="noreferrer" className="text-decoration-none fw-bold" style={{ color: '#002F6C' }}><i className="bi bi-link-45deg"></i> عرض الشهادة</a> : '---', icon: FaEye },
                                            ]
                                        )
                                    ).map((item, i) => (
                                        <Col md={6} key={i}>
                                            <div className="stat-card p-3 rounded-4 h-100 border bg-light-subtle">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="bg-white shadow-sm p-3 rounded d-flex align-items-center justify-content-center" style={{ color: '#002F6C' }}>
                                                        <item.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="text-secondary extra-small d-block opacity-75 fw-bold font-noto">{item.label}</div>
                                                        <div className="fw-bold text-dark-emphasis">{translateValue(item.value) || '---'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </div>
                    )}
                </Modal.Body>
                {activeTab !== 'archive' && (!selectedRequest?.status || selectedRequest?.status === 'pending') && (!selectedRequest?.approval_status || selectedRequest?.approval_status === 'pending') && (
                    <Modal.Footer className="border-0 p-4 pt-0 gap-3 bg-white">
                        <Button
                            variant="primary"
                            className="flex-grow-1 py-3 fw-bold shadow transition-all d-flex align-items-center justify-content-center gap-2"
                            style={{ borderRadius: '15px', background: '#002F6C', border: 'none' }}
                            onClick={() => approveMutation.mutate(selectedRequest.id)}
                            disabled={approveMutation.isLoading}
                        >
                            {approveMutation.isLoading ? <Spinner size="sm" /> : <FaCheck />}
                            موافقة واعتماد الطلب
                        </Button>
                        <Button
                            variant="light"
                            className="flex-grow-1 py-3 fw-bold shadow-sm border transition-all d-flex align-items-center justify-content-center gap-2 rounded-4"
                            onClick={() => setShowRejectModal(true)}
                            disabled={approveMutation.isLoading}
                        >
                            <FaTimes className="text-danger" /> رفض الطلب
                        </Button>
                    </Modal.Footer>
                )}
            </Modal>

            {/* View Full Reason Modal */}
            <Modal show={showFullReasonModal} onHide={() => setShowFullReasonModal(false)} centered dir="rtl" className="custom-modal">
                <Modal.Header className="border-0 p-4 d-flex align-items-center justify-content-between">
                    <Modal.Title className="fw-bold text-danger d-flex align-items-center gap-2">
                        <FaTimes /> تفاصيل سبب الرفض
                    </Modal.Title>
                    <button
                        type="button"
                        className="btn-close m-0"
                        aria-label="Close"
                        onClick={() => setShowFullReasonModal(false)}
                    ></button>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="p-4 rounded-4 bg-light-subtle border border-danger-subtle shadow-sm" style={{ minHeight: '150px' }}>
                        <p className="mb-0 text-dark-emphasis lh-lg" style={{ whiteSpace: 'pre-wrap' }}>
                            {viewingReason || 'لا يوجد سبب مفصل متاح.'}
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0">
                    <Button variant="light" className="px-4 fw-bold rounded-pill border" onClick={() => setShowFullReasonModal(false)}>إغلاق النافذة</Button>
                </Modal.Footer>
            </Modal>

            {/* Reject Modal */}
            <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered dir="rtl" className="custom-modal">
                <Modal.Header className="border-0 p-4 d-flex align-items-center justify-content-between">
                    <Modal.Title className="fw-bold text-danger">سبب الرفض والاعتراض</Modal.Title>
                    <button
                        type="button"
                        className="btn-close m-0"
                        aria-label="Close"
                        onClick={() => setShowRejectModal(false)}
                    ></button>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form.Group>
                        <Form.Label className="fw-bold small mb-2 opacity-75">يرجى توضيح سبب الرفض الموجه للموظف:</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="اكتب ملاحظات الرفض هنا..."
                            style={{ borderRadius: '15px', resize: 'none' }}
                            className="bg-light-subtle border-light p-3 shadow-none focus-navy"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 p-4 pt-0">
                    <Button variant="light" className="px-4 fw-bold rounded-pill border" onClick={() => setShowRejectModal(false)}>إلغاء</Button>
                    <Button
                        variant="danger"
                        className="px-4 fw-bold shadow rounded-pill"
                        onClick={() => rejectMutation.mutate({ id: selectedRequest.id, reason: rejectionReason })}
                        disabled={!rejectionReason || rejectMutation.isLoading}
                    >
                        {rejectMutation.isLoading ? <Spinner size="sm" /> : 'تأكيد الرفض والإرسال'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
                @import url('https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@400;700&display=swap');

                .tracking-tight { letter-spacing: -0.02em; }
                .font-noto { font-family: 'Noto Kufi Arabic', sans-serif!important; }
                .w-fit-content { width: fit-content; }
                .white-space-nowrap { white-space: nowrap; }
                .cursor-pointer { cursor: pointer; }
                .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .extra-small { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }

                .employee-header {
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 47, 108, 0.1) !important;
                }

                .badge-modern {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.45rem 0.95rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .badge-id { background-color: #f1f3f5; color: #002F6C; border: 1px solid #dee2e6; }
                .badge-active { background-color: #e6fcf5; color: #087f5b; border: 1px solid #c3fae8; }

                .pulse-dot {
                    width: 7px;
                    height: 7px;
                    background-color: currentColor;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0,0,0, 0.1); }
                    70% { box-shadow: 0 0 0 8px rgba(0,0,0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,0,0, 0); }
                }

                .main-content-shield { border-top: 5px solid #002F6C !important; }

                .tab-item { font-size: 0.88rem; min-width: 140px; text-align: center; }
                .tab-item:hover:not(.active-pill) { background-color: rgba(0, 47, 108, 0.05); color: #002F6C; }
                .scale-up { transform: scale(1.04); }
                .tab-badge { 
                    background: #002F6C; 
                    color: white; 
                    font-size: 0.65rem; 
                    padding: 2px 7px; 
                    border-radius: 10px; 
                    margin-right: auto;
                }

                .request-row:hover { background-color: rgba(0, 47, 108, 0.02); }
                .btn-view-request:hover { background-color: #002F6C!important; color: white!important; transform: translateY(-2px); }

                .stat-card {
                    background: #fff;
                    border-color: #f1f3f5 !important;
                    box-shadow: 0 4px 6px rgba(0, 47, 108, 0.02);
                }
                .stat-card:hover { box-shadow: 0 8px 15px rgba(0, 47, 108, 0.06); border-color: rgba(0, 47, 108, 0.1) !important; transform: translateY(-3px); }

                .animate-fade-in { animation: fadeIn 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }


                .focus-navy:focus { border-color: #002F6C; box-shadow: 0 0 0 0.25rem rgba(0, 47, 108, 0.1); }
                .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(220, 53, 69, 0.15); background-color: rgba(220, 53, 69, 0.1) !important; }
                .modal-scrollable { max-height: 550px; overflow-y: auto; scrollbar-width: thin; }
                .custom-modal .modal-content { border-radius: 20px; border: none; overflow: hidden; }

                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
                .spin-slow {
                    animation: spin 3s linear infinite;
                }
                .pulse-avatar {
                    animation: pulse-shadow 2s infinite;
                }
                @keyframes pulse-shadow {
                    0% { box-shadow: 0 0 0 0 rgba(0, 47, 108, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(0, 47, 108, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0, 47, 108, 0); }
                }
                .hover-primary:hover { color: #002F6C !important; }
            `}</style>
        </div>
    );
};

export default ProfileUpdateRequests;
