import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaTimes,
    FaInfoCircle,
    FaFileContract,
    FaBookOpen,
    FaUsers,
    FaClipboardCheck,
    FaPaperclip,
    FaUserTie,
    FaPlus,
    FaUser,
    FaIdCard,
    FaCalendarAlt,
    FaStickyNote,
    FaFileDownload,
    FaTrash,
    FaImage,
    FaSearch,
    FaEdit,
    FaFileUpload,
    FaFileExport
} from "react-icons/fa";
import { Modal, Button, Form } from "react-bootstrap";
import CSelect from "../components/CSelect";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useCourseDetails, useAttendance } from "../hooks/useTraining";
import { useEmployees } from "../hooks/useEmployees";

// Dummy data for initial implementation
const initialCourses = [
    {
        id: 1,
        courseName: "فحص ومراقبة الجودة للحوم والدواجن",
        type: "دورة",
        category: "داخلي",
        targetAudience: "مفتشو الجودة والأطباء البيطريون وموظفو قسم الرقابة الغذائية",
        fundingEntity: "وزارة الاقتصاد الوطني",
        duration: "5 أيام",
        startDate: "2026-01-17",
        endDate: "2026-01-21",
        location: "غزة - الغرفة التجارية - بجوار ترخيص السامر",
        mechanism: "حضوري - محاضرات نظرية وتطبيقات عملية ميدانية",
        supervisorsCount: 2,
        participants: [
            { id: 101, name: "أحمد محمد علي", empId: "Emp-001", department: "الرقابة الغذائية", status: "حاضر" },
            { id: 102, name: "سارة محمود حسن", empId: "Emp-045", department: "الصحة والبيئة", status: "حاضر" },
            { id: 103, name: "ياسر كمال عبيد", empId: "Emp-112", department: "الرقابة الغذائية", status: "غائب" },
        ],
        content: [
            { id: 1, title: "مقدمة في معايير الجودة العالمية", duration: "يوم 1" },
            { id: 2, title: "طرق فحص اللحوم الحمراء والمصنعات", duration: "يوم 2" },
            { id: 3, title: "الاشتراطات الصحية في المسالخ ومحلات الجزارة", duration: "يوم 3" },
            { id: 4, title: "الأمراض المشتركة وطرق الوقاية منها", duration: "يوم 4" },
            { id: 5, title: "تطبيقات عملية وميدانية في الأسواق", duration: "يوم 5" },
        ],
        supervisors: [
            { id: 1, name: "د. خالد العمراني", role: "مشرف أكاديمي", specialty: "الطب البيطري" },
            { id: 2, name: "أ. منى السعدي", role: "منسق تدريب", specialty: "إدارة الجودة" },
        ],
        attachments: [
            { id: 1, name: "منهج الدورة التدريبية.pdf", size: "2.4 MB", type: "PDF" },
            { id: 2, name: "دليل الجودة للحوم.pdf", size: "1.8 MB", type: "PDF" },
            { id: 3, name: "صور التطبيقات العملية.zip", size: "15.0 MB", type: "ZIP" },
        ],
        attendanceSummary: [
            { id: 1, date: "2026-01-17", present: 2, absent: 1 },
            { id: 2, date: "2026-01-18", present: 3, absent: 0 },
            { id: 3, date: "2026-01-19", present: 2, absent: 1 },
            { id: 4, date: "2026-01-20", present: 3, absent: 0 },
            { id: 5, date: "2026-01-21", present: 3, absent: 0 },
        ]
    },
    {
        id: 2,
        courseName: "حل المشكلات الفنية في الشبكات",
        type: "ورشة",
        category: "فني",
        targetAudience: "مهندسي تكنولوجيا المعلومات",
        fundingEntity: "وزارة الاقتصاد الوطني",
        duration: "3 أيام",
        startDate: "2024-03-15",
        endDate: "2024-03-18",
        location: "مختبر الحاسوب",
        mechanism: "حضوري - محاضرات نظرية",
        supervisorsCount: 1
    },
];

function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("basic");

    const {
        course,
        sections,
        participants,
        supervisors,
        attachments,
        meta,
        isLoading,
        error,
        removeParticipant,
        removeSupervisor,
        addParticipant,
        addSupervisor,
        uploadAttachment,
        deleteAttachment,
        uploadCertificate,
        deleteCertificate,
        addAttendance,
        updateAttendance,
        importAttendance
    } = useCourseDetails(id);

    // Filter state for attendance
    const [attendanceFilters, setAttendanceFilters] = useState({
        attendance_date: new Date().toISOString().split('T')[0],
        search: ""
    });

    const { data: attendanceData, isLoading: isAttendanceLoading } = useAttendance(id, attendanceFilters);

    // Modal States
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [showAttachmentModal, setShowAttachmentModal] = useState(false);
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [showImportAttendanceModal, setShowImportAttendanceModal] = useState(false);
    const [showManualAttendanceModal, setShowManualAttendanceModal] = useState(false);

    // Form States
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [attachmentForm, setAttachmentForm] = useState({
        type: "general", // "general" or "certificate"
        file: null,
        description: "",
        employee_id: "",
        notes: "",
        issued_at: ""
    });
    const [supervisorForm, setSupervisorForm] = useState({
        is_external: false,
        employee_id: "",
        external_name: "",
        role: "",
        specialty: "",
        notes: ""
    });
    const [manualAttendanceForm, setManualAttendanceForm] = useState({
        id: null,
        employee_id: "",
        attendance_date: attendanceFilters.attendance_date,
        check_in_at: "08:00",
        check_out_at: "15:00",
        workplace: "",
        notes: ""
    });
    const [importAttendanceFile, setImportAttendanceFile] = useState(null);

    const { data: employeesData } = useEmployees(1, 1000, "", {}, { enabled: showParticipantModal || showSupervisorModal });

    // Filter out existing participants
    const existingParticipantEmployeeIds = participants?.map(p => p.employee_id) || [];
    const availableEmployeeOptions = employeesData?.data
        ?.filter(emp => !existingParticipantEmployeeIds.includes(emp.id))
        ?.map(emp => ({
            value: emp.id,
            label: emp.full_name || emp.name || `${emp.first_name} ${emp.family_name}`
        })) || [];

    const allEmployeeOptions = employeesData?.data?.map(emp => ({
        value: emp.id,
        label: emp.full_name || emp.name || `${emp.first_name} ${emp.family_name}`
    })) || [];

    const handleDownload = async (url, filename) => {
        try {
            const response = await api.get(url, {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            toast.success("تم بدء التحميل بنجاح");
        } catch (err) {
            console.error("Download error:", err);
            toast.error("حدث خطأ أثناء تحميل الملف. يرجى المحاولة مرة أخرى.");
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="container py-5 text-center">
                <div className="alert alert-danger shadow-sm rounded-4">
                    حدث خطأ أثناء تحميل بيانات الدورة. يرجى المحاولة مرة أخرى.
                </div>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => navigate(-1)}>
                    العودة للخلف
                </button>
            </div>
        );
    }

    const tabs = [
        { id: "basic", label: "البيانات الأساسية", icon: <FaInfoCircle /> },
        { id: "details", label: "تفاصيل الدورة", icon: <FaFileContract /> },
        { id: "content", label: "المحتوى", icon: <FaBookOpen /> },
        { id: "participants", label: "المشاركين", icon: <FaUsers /> },
        { id: "attendance", label: "الحضور والانصراف", icon: <FaClipboardCheck /> },
        { id: "attachments", label: "المرفقات", icon: <FaPaperclip /> },
        { id: "supervisors", label: "المشرفين", icon: <FaUserTie /> },
    ];

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light-subtle animate-fade-in">
            {/* Header Section */}
            <div className="course-header mb-4 p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden">
                {/* Decorative Background Shape */}
                <div className="position-absolute top-0 end-0 w-25 h-100 bg-primary opacity-10"
                    style={{ zIndex: 0, clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }}>
                </div>

                <div className="d-flex justify-content-between align-items-start position-relative" style={{ zIndex: 1 }}>
                    <div className="d-flex flex-column gap-1 text-end">
                        <div className="d-flex align-items-center gap-3 justify-content-end">
                            <h2 className="mb-0 fw-bold text-dark">{course.name}</h2>
                            <div className="d-flex gap-2">
                                {(meta?.badges || []).map((badge, idx) => (
                                    <span key={idx} className="badge-modern badge-blue">
                                        {badge.label}: {badge.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <p className="text-dark mb-0 small mt-1">
                            {course.type} • {course.classification}
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-light text-dark rounded-circle shadow-sm border d-flex align-items-center justify-content-center p-0"
                        style={{ width: '40px', height: '40px' }}
                        onClick={() => navigate(-1)}
                        title="إغلاق"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tabs-container mb-4 overflow-auto hide-scrollbar">
                <div className="d-flex border-bottom bg-white rounded-top-4 px-3 pt-3 gap-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn pb-3 px-2 d-flex align-items-center gap-2 transition-all position-relative ${activeTab === tab.id ? 'active text-primary fw-bold' : 'text-secondary'}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="tab-icon">{tab.icon}</span>
                            <span>{tab.label}</span>
                            {activeTab === tab.id && <div className="active-indicator"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="content-area bg-white rounded-bottom-4 shadow-sm p-4 min-vh-50 text-end">
                {activeTab === "basic" && (
                    <div className="row g-4 animate-slide-up">
                        {(sections?.basic?.items || []).map((item, idx) => (
                            <div className="col-md-4" key={idx}>
                                <div className="detail-card p-4 rounded-4 border bg-white h-100 shadow-sm transition-all">
                                    <span className="text-muted small d-block mb-2">{item.label}</span>
                                    <h6 className="fw-bold text-dark mb-0">{item.value}</h6>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "details" && (
                    <div className="row g-4 animate-slide-up">
                        {(sections?.details?.items || []).map((item, idx) => (
                            <div className="col-md-4" key={idx}>
                                <div className="detail-card p-4 rounded-4 border bg-white h-100 shadow-sm transition-all">
                                    <span className="text-muted small d-block mb-2">{item.label}</span>
                                    <h6 className="fw-bold text-dark mb-0">{item.value}</h6>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === "participants" && (
                    <div className="animate-slide-up">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark mb-0">قائمة المشاركين</h5>
                            <button className="btn-modern-add" onClick={() => setShowParticipantModal(true)}>
                                <FaPlus className="ms-2" /> إضافة مشارك
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-end table-modern-container">
                                <thead className="table-header-modern-pill">
                                    <tr>
                                        <th style={{ width: "60px" }}>م</th>
                                        <th>الاسم الكامل</th>
                                        <th>الرقم الوظيفي</th>
                                        <th>ملاحظات</th>
                                        <th style={{ width: "100px" }}>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(participants || []).map((p, index) => (
                                        <tr key={p.id} className="table-row-hover">
                                            <td className="fw-bold text-secondary">{index + 1}</td>
                                            <td className="fw-medium text-dark">{p.employee_name}</td>
                                            <td><span className="badge bg-light text-dark border">{p.employee_number}</span></td>
                                            <td className="text-secondary small">{p.notes}</td>
                                            <td>
                                                <button
                                                    className="btn-action-modern delete"
                                                    title="إزالة المشارك"
                                                    onClick={() => removeParticipant.mutate(p.id)}
                                                    disabled={removeParticipant.isPending}
                                                >
                                                    <FaTimes size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!participants || participants.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="py-5 text-center text-secondary">لا يوجد مشاركين مسجلين لهذه الدورة</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === "content" && (
                    <div className="animate-slide-up">
                        <div className="row g-4">
                            {(sections?.content?.items || []).map((item, idx) => (
                                <div key={idx} className="col-12">
                                    <div className="detail-card p-4 rounded-4 border bg-white shadow-sm transition-all">
                                        <span className="text-muted small d-block mb-2">{item.label}</span>
                                        <h6 className="fw-bold text-dark mb-0 lh-base" style={{ whiteSpace: 'pre-wrap' }}>{item.value || '-'}</h6>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === "supervisors" && (
                    <div className="animate-slide-up">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark mb-0">المشرفين على الدورة</h5>
                            <button className="btn-modern-add" onClick={() => setShowSupervisorModal(true)}>
                                <FaPlus className="ms-2" /> إضافة مشرف
                            </button>
                        </div>
                        <div className="row g-4">
                            {(supervisors || []).map((sup) => (
                                <div key={sup.id} className="col-md-6 col-lg-4">
                                    <div className="detail-card p-4 rounded-4 border bg-white shadow-sm transition-all text-center position-relative">
                                        <button
                                            className="btn btn-sm btn-outline-danger border-0 position-absolute top-0 start-0 m-2 rounded-circle"
                                            onClick={() => removeSupervisor.mutate(sup.id)}
                                            style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '64px', height: '64px' }}>
                                            <FaUserTie size={32} className="text-secondary" />
                                        </div>
                                        <h6 className="fw-bold text-dark mb-1">{sup.name}</h6>
                                        <p className="text-primary small mb-2">{sup.is_external ? 'مشرف خارجي' : 'موظف داخلي'}</p>
                                        <div className="d-flex flex-column gap-1 mt-2">
                                            {sup.notes && sup.notes !== '-' && (
                                                <div className="small text-secondary">
                                                    <span className="fw-bold">الدور:</span> {sup.notes}
                                                </div>
                                            )}
                                            {sup.external_experience && sup.external_experience !== '-' && (
                                                <div className="small text-secondary">
                                                    <span className="fw-bold">التخصص:</span> {sup.external_experience}
                                                </div>
                                            )}
                                            {(!sup.notes || sup.notes === '-') && (!sup.external_experience || sup.external_experience === '-') && (
                                                <div className="badge bg-light text-secondary border fw-normal">لا توجد تفاصيل إضافية</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!supervisors || supervisors.length === 0) && (
                                <div className="col-12 py-5 text-center text-secondary">لا يوجد مشرفين مسجلين لهذه الدورة</div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === "attendance" && (
                    <div className="animate-slide-up">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0 text-end table-modern-container">
                                <thead className="table-header-modern-pill">
                                    <tr>
                                        <th style={{ width: "60px" }}>م</th>
                                        <th>التاريخ</th>
                                        <th>عدد الحضور</th>
                                        <th>عدد الغياب</th>
                                        <th>النسبة المئوية</th>
                                        <th style={{ width: "100px" }}>الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(course.attendanceSummary || []).map((day, index) => (
                                        <tr key={day.id} className="table-row-hover">
                                            <td className="fw-bold text-secondary">{index + 1}</td>
                                            <td className="fw-medium text-dark">{day.date}</td>
                                            <td><span className="text-success fw-bold">{day.present}</span></td>
                                            <td><span className="text-danger fw-bold">{day.absent}</span></td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2" style={{ direction: 'ltr' }}>
                                                    <div className="progress flex-grow-1" style={{ height: '6px' }}>
                                                        <div className="progress-bar bg-primary" style={{ width: `${(day.present / (day.present + day.absent)) * 100}%` }}></div>
                                                    </div>
                                                    <span className="small text-muted">{Math.round((day.present / (day.present + day.absent)) * 100)}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button className="btn-action-modern view" title="تفاصيل اليوم">
                                                    <FaClipboardCheck size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === "attachments" && (
                    <div className="animate-slide-up">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold text-dark mb-0">المرفقات والوثائق</h5>
                            <button className="btn-modern-add" onClick={() => setShowAttachmentModal(true)}>
                                <FaPlus className="ms-2" /> إضافة مرفق
                            </button>
                        </div>

                        {/* General Attachments & Photos */}
                        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                            <div className="card-header bg-white py-3 border-bottom-0">
                                <h6 className="fw-bold mb-0 text-primary">
                                    <FaPaperclip className="ms-2" /> المرفقات والصور العامة
                                </h6>
                            </div>
                            <div className="card-body p-4 pt-0">
                                <div className="row g-3">
                                    {(attachments || []).filter(f => f.type !== 'certificate').map((file) => (
                                        <div key={file.key} className="col-12 col-md-6 col-lg-4">
                                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4 border bg-white hover-shadow-sm transition-all text-end">
                                                <div className="d-flex align-items-center gap-3 overflow-hidden">
                                                    <div className="rounded-3 bg-light text-primary d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '48px', height: '48px' }}>
                                                        {file.type === 'photo' ? <FaImage /> : <FaPaperclip />}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h6 className="fw-bold text-dark mb-1 small text-truncate" title={file.name}>{file.name}</h6>
                                                        <span className="text-muted d-block text-truncate" style={{ fontSize: '0.7rem' }}>
                                                            {file.size} • {file.file_type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light border rounded-3 p-2" title="تنزيل">
                                                        <FaFileDownload size={12} className="text-secondary" />
                                                    </a>
                                                    <button
                                                        className="btn btn-sm btn-light border rounded-3 p-2 text-danger"
                                                        title="حذف"
                                                        onClick={() => {
                                                            if (window.confirm('هل أنت متأكد من حذف هذا المرفق؟')) {
                                                                if (file.type === 'attachment') deleteAttachment.mutate(file.id);
                                                            }
                                                        }}
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!attachments || attachments.filter(f => f.type !== 'certificate').length === 0) && (
                                        <div className="col-12 py-4 text-center text-secondary small">لا توجد مرفقات عامة مسجلة</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificates Table */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mt-2">
                            <div className="card-header bg-white py-3 border-bottom-0">
                                <h6 className="fw-bold mb-0 text-primary">
                                    <FaIdCard className="ms-2" /> شهادات المشاركين
                                </h6>
                            </div>
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-end table-modern-container">
                                        <thead className="table-header-modern-pill" style={{ background: '#f8f9fa' }}>
                                            <tr>
                                                <th className="py-3 px-4 text-secondary" style={{ width: '50px', fontSize: '0.85rem' }}>م</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>الموظف</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>الرقم الوظيفي</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>تاريخ الإصدار</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>ملاحظات</th>
                                                <th className="py-3 text-secondary text-center" style={{ width: '120px', fontSize: '0.85rem' }}>الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(attachments || []).filter(f => f.type === 'certificate').map((cert, index) => (
                                                <tr key={cert.key} className="hover-shadow-sm transition-all border-bottom border-light">
                                                    <td className="px-4 text-secondary fw-bold">{(index + 1)}</td>
                                                    <td>
                                                        <div className="fw-bold text-dark small">{cert.name.replace('شهادة: ', '')}</div>
                                                    </td>
                                                    <td className="text-muted small">
                                                        <span className="badge bg-light text-dark border">{cert.employee_number || '---'}</span>
                                                    </td>
                                                    <td className="text-muted small">
                                                        <div className="d-flex align-items-center gap-1">
                                                            <FaCalendarAlt size={12} className="text-secondary opacity-50" />
                                                            {cert.issue_date || '---'}
                                                        </div>
                                                    </td>
                                                    <td className="text-muted small text-truncate" style={{ maxWidth: '200px' }} title={cert.notes}>
                                                        {cert.notes || '---'}
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn-action-modern view" title="تحميل">
                                                                <FaFileDownload size={14} />
                                                            </a>
                                                            <button
                                                                className="btn-action-modern delete"
                                                                title="حذف"
                                                                onClick={() => {
                                                                    if (window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) {
                                                                        deleteCertificate.mutate(cert.id);
                                                                    }
                                                                }}
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!attachments || attachments.filter(f => f.type === 'certificate').length === 0) && (
                                                <tr>
                                                    <td colSpan="7" className="py-5 text-center text-secondary bg-light bg-opacity-50">
                                                        <div className="opacity-50 mb-2"><FaIdCard size={30} /></div>
                                                        لا توجد شهادات مرفوعة حالياً.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "attendance" && (
                    <div className="animate-fade-in">
                        {/* Attendance Controls */}
                        <div className="card border-0 shadow-sm rounded-4 p-3 mb-3">
                            <div className="row g-3 align-items-center">
                                <div className="col-md-auto ms-auto d-flex gap-2">
                                    <button
                                        className="btn btn-dark rounded-pill px-4 d-flex align-items-center gap-2"
                                        onClick={() => setShowImportAttendanceModal(true)}
                                    >
                                        <FaFileUpload size={14} /> رفع كشف جديد
                                    </button>
                                    <button
                                        className="btn btn-outline-dark rounded-pill px-4 d-flex align-items-center gap-2"
                                        onClick={() => {
                                            const exportUrl = `training-courses/${id}/attendance/export?attendance_date=${attendanceFilters.attendance_date}&search=${attendanceFilters.search}`;
                                            handleDownload(exportUrl, `كشف_حضور_${attendanceFilters.attendance_date}.xlsx`);
                                        }}
                                    >
                                        <FaFileExport size={14} /> تصدير
                                    </button>
                                    <button
                                        className="btn btn-outline-warning rounded-pill px-4 d-flex align-items-center gap-2"
                                        onClick={() => {
                                            const templateUrl = `training-courses/${id}/attendance/template`;
                                            handleDownload(templateUrl, `قالب_كشف_حضور.xlsx`);
                                        }}
                                    >
                                        <FaFileDownload size={14} /> تنزيل القالب
                                    </button>
                                </div>
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><FaSearch className="text-secondary" /></span>
                                        <input
                                            type="text"
                                            className="form-control bg-light border-0 py-2"
                                            placeholder="ابحث باسم الموظف أو رقمه..."
                                            value={attendanceFilters.search}
                                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, search: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-auto d-flex align-items-center gap-2">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><FaCalendarAlt className="text-secondary" /></span>
                                        <input
                                            type="date"
                                            className="form-control bg-light border-0 py-2"
                                            value={attendanceFilters.attendance_date}
                                            onChange={(e) => setAttendanceFilters({ ...attendanceFilters, attendance_date: e.target.value })}
                                        />
                                    </div>
                                    <span className="small fw-bold text-secondary text-nowrap">تاريخ الكشف</span>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Table */}
                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div className="card-body p-0">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0 text-end">
                                        <thead className="table-header-modern-pill" style={{ background: '#f8f9fa' }}>
                                            <tr>
                                                <th className="py-3 px-4 text-secondary" style={{ width: '50px', fontSize: '0.85rem' }}>م</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>اسم الموظف</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>رقم الموظف</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>التاريخ</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>ساعة الحضور</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>ساعة الانصراف</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>مكان العمل</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>ملاحظات</th>
                                                <th className="py-3 text-secondary" style={{ fontSize: '0.85rem' }}>المصدر</th>
                                                <th className="py-3 text-secondary text-center" style={{ width: '100px', fontSize: '0.85rem' }}>الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isAttendanceLoading ? (
                                                <tr><td colSpan="10" className="py-5 text-center"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
                                            ) : attendanceData?.data?.length > 0 ? (
                                                attendanceData.data.map((record, idx) => (
                                                    <tr key={record.id} className="hover-shadow-sm transition-all border-bottom border-light">
                                                        <td className="px-4 text-secondary fw-bold">{idx + 1}</td>
                                                        <td><div className="fw-bold text-dark small">{record.employee_name}</div></td>
                                                        <td><span className="badge bg-light text-dark border">{record.employee_number}</span></td>
                                                        <td className="small text-muted">{record.attendance_date}</td>
                                                        <td className="small"><span className="text-success fw-bold">{record.check_in_at || '--:--'}</span></td>
                                                        <td className="small"><span className="text-danger fw-bold">{record.check_out_at || '--:--'}</span></td>
                                                        <td className="small text-muted">{record.workplace || '---'}</td>
                                                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }} title={record.notes}>{record.notes || '---'}</td>
                                                        <td className="small"><span className={`badge ${record.source === 'manual' || record.source === 'إدخال يدوي' ? 'bg-info' : 'bg-primary'} bg-opacity-10 text-${record.source === 'manual' || record.source === 'إدخال يدوي' ? 'info' : 'primary'} border-0`}>{record.source}</span></td>
                                                        <td className="text-center">
                                                            <button
                                                                className="btn-action-modern edit mx-auto"
                                                                onClick={() => {
                                                                    setManualAttendanceForm({
                                                                        id: record.id,
                                                                        employee_id: record.employee_id,
                                                                        attendance_date: record.attendance_date,
                                                                        check_in_at: record.check_in_at,
                                                                        check_out_at: record.check_out_at,
                                                                        workplace: record.workplace || "",
                                                                        notes: record.notes || ""
                                                                    });
                                                                    setShowManualAttendanceModal(true);
                                                                }}
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="10" className="py-5 text-center text-secondary bg-light bg-opacity-50">
                                                        <div className="opacity-50 mb-2"><FaCalendarAlt size={30} /></div>
                                                        لا توجد بيانات حضور لهذا التاريخ
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal show={showAttachmentModal} onHide={() => setShowAttachmentModal(false)} centered className="modal-modern">
                <Modal.Header closeButton className="border-0 modal-header-themed">
                    <Modal.Title className="fw-normal text-white">إضافة مرفق جديد</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-end">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">نوع المرفق</Form.Label>
                            <div className="d-flex gap-4 justify-content-end mt-2">
                                <Form.Check
                                    type="radio"
                                    id="type-general"
                                    label="ملف عام (PDF, Word, Image...)"
                                    name="attachment_type"
                                    checked={attachmentForm.type === "general"}
                                    onChange={() => setAttachmentForm({ ...attachmentForm, type: "general" })}
                                />
                                <Form.Check
                                    type="radio"
                                    id="type-cert"
                                    label="شهادة موظف"
                                    name="attachment_type"
                                    checked={attachmentForm.type === "certificate"}
                                    onChange={() => setAttachmentForm({ ...attachmentForm, type: "certificate" })}
                                />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">الملف</Form.Label>
                            <Form.Control
                                type="file"
                                className="rounded-3 border-0 bg-light py-2"
                                onChange={(e) => setAttachmentForm({ ...attachmentForm, file: e.target.files[0] })}
                            />
                            <div className="small text-muted mt-1">يدعم: PDF, Word, Excel, PowerPoint, Images (Max 20MB)</div>
                        </Form.Group>

                        {attachmentForm.type === "certificate" ? (
                            <>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-secondary">الموظف</Form.Label>
                                    <CSelect
                                        options={participants?.map(p => ({ value: p.employee_id, label: p.employee_name })) || []}
                                        value={participants?.find(p => p.employee_id === attachmentForm.employee_id) ? { value: attachmentForm.employee_id, label: participants.find(p => p.employee_id === attachmentForm.employee_id).employee_name } : null}
                                        onChange={(val) => setAttachmentForm({ ...attachmentForm, employee_id: val?.value })}
                                        placeholder="اختر الموظف المشارك..."
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-secondary">تاريخ الإصدار</Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="rounded-3 border-0 bg-light py-2"
                                        value={attachmentForm.issued_at}
                                        onChange={(e) => setAttachmentForm({ ...attachmentForm, issued_at: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">ملاحظات</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={2}
                                        className="rounded-3 border-0 bg-light py-2"
                                        placeholder="أي ملاحظات إضافية..."
                                        value={attachmentForm.notes}
                                        onChange={(e) => setAttachmentForm({ ...attachmentForm, notes: e.target.value })}
                                    />
                                </Form.Group>
                            </>
                        ) : (
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-secondary">وصف الملف</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-0 bg-light py-2"
                                    placeholder="مثال: صور اليوم الأول، جدول البيانات..."
                                    value={attachmentForm.description}
                                    onChange={(e) => setAttachmentForm({ ...attachmentForm, description: e.target.value })}
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowAttachmentModal(false)}>إلغاء</Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#002F6C' }}
                        disabled={!attachmentForm.file || (attachmentForm.type === 'certificate' && !attachmentForm.employee_id) || uploadAttachment.isPending || uploadCertificate.isPending}
                        onClick={() => {
                            const formData = new FormData();
                            formData.append('file', attachmentForm.file);

                            if (attachmentForm.type === 'general') {
                                if (attachmentForm.description) formData.append('description', attachmentForm.description);
                                uploadAttachment.mutate(formData, {
                                    onSuccess: () => {
                                        setShowAttachmentModal(false);
                                        setAttachmentForm({ type: "general", file: null, description: "", employee_id: "", notes: "" });
                                    }
                                });
                            } else {
                                formData.delete('file'); // Certificates expect 'certificate' field in backend logic potentially, but let's check
                                formData.append('certificate', attachmentForm.file);
                                formData.append('employee_id', attachmentForm.employee_id);
                                if (attachmentForm.notes) formData.append('notes', attachmentForm.notes);
                                if (attachmentForm.issued_at) formData.append('issued_at', attachmentForm.issued_at);
                                uploadCertificate.mutate(formData, {
                                    onSuccess: () => {
                                        setShowAttachmentModal(false);
                                        setAttachmentForm({ type: "general", file: null, description: "", employee_id: "", notes: "", issued_at: "" });
                                    }
                                });
                            }
                        }}
                    >
                        {(uploadAttachment.isPending || uploadCertificate.isPending) ? 'جاري الرفع...' : 'رفع المرفق'}
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showParticipantModal} onHide={() => setShowParticipantModal(false)} centered className="modal-modern" size="lg">
                <Modal.Header closeButton className="border-0 modal-header-themed">
                    <Modal.Title className="fw-normal text-white">إضافة مشاركين جدد</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-4 text-end">
                        <label className="small fw-bold text-secondary mb-2">البحث عن موظفين</label>
                        <CSelect
                            isMulti
                            options={availableEmployeeOptions}
                            value={selectedEmployees}
                            onChange={(val) => setSelectedEmployees(val)}
                            placeholder="اختر الموظفين..."
                            cacheOptions
                            defaultOptions
                        />
                    </div>
                    {selectedEmployees.length > 0 && (
                        <div className="selected-list p-3 bg-light rounded-4 border">
                            <h6 className="small fw-bold text-dark mb-3">الموظفون المختارون: ({selectedEmployees.length})</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {selectedEmployees.map(emp => (
                                    <span key={emp.value} className="badge bg-white text-dark border p-2 rounded-3 d-flex align-items-center gap-2">
                                        {emp.label}
                                        <FaTimes
                                            className="text-danger cursor-pointer"
                                            onClick={() => setSelectedEmployees(prev => prev.filter(e => e.value !== emp.value))}
                                        />
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowParticipantModal(false)}>إلغاء</Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#002F6C' }}
                        disabled={selectedEmployees.length === 0 || addParticipant.isPending}
                        onClick={() => {
                            addParticipant.mutate({ employee_ids: selectedEmployees.map(e => e.value) }, {
                                onSuccess: () => {
                                    setShowParticipantModal(false);
                                    setSelectedEmployees([]);
                                }
                            });
                        }}
                    >
                        {addParticipant.isPending ? 'جاري الإضافة...' : 'إضافة الموظفين'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Supervisor Modal */}
            <Modal show={showSupervisorModal} onHide={() => setShowSupervisorModal(false)} centered className="modal-modern">
                <Modal.Header closeButton className="border-0 modal-header-themed">
                    <Modal.Title className="fw-normal text-white">إضافة مشرف جديد</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-end">
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">نوع المشرف</Form.Label>
                            <div className="d-flex gap-4 justify-content-end mt-2">
                                <Form.Check
                                    type="radio"
                                    id="type-internal-sup"
                                    label="موظف داخلي"
                                    name="is_external_sup"
                                    checked={!supervisorForm.is_external}
                                    onChange={() => setSupervisorForm({ ...supervisorForm, is_external: false })}
                                />
                                <Form.Check
                                    type="radio"
                                    id="type-external-sup"
                                    label="مشرف خارجي"
                                    name="is_external_sup"
                                    checked={supervisorForm.is_external}
                                    onChange={() => setSupervisorForm({ ...supervisorForm, is_external: true })}
                                />
                            </div>
                        </Form.Group>

                        {!supervisorForm.is_external ? (
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-secondary">اسم المشرف (موظف)</Form.Label>
                                <CSelect
                                    options={allEmployeeOptions}
                                    value={allEmployeeOptions.find(opt => opt.value === supervisorForm.employee_id)}
                                    onChange={(val) => setSupervisorForm({ ...supervisorForm, employee_id: val?.value })}
                                    placeholder="اختر الموظف..."
                                    cacheOptions
                                    defaultOptions
                                />
                            </Form.Group>
                        ) : (
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold text-secondary">اسم المشرف</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-0 bg-light py-2"
                                    value={supervisorForm.external_name}
                                    onChange={(e) => setSupervisorForm({ ...supervisorForm, external_name: e.target.value })}
                                />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">الدور التدريبي</Form.Label>
                            <Form.Control
                                type="text"
                                className="rounded-3 border-0 bg-light py-2"
                                value={supervisorForm.role}
                                onChange={(e) => setSupervisorForm({ ...supervisorForm, role: e.target.value })}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">التخصص</Form.Label>
                            <Form.Control
                                type="text"
                                className="rounded-3 border-0 bg-light py-2"
                                value={supervisorForm.specialty}
                                onChange={(e) => setSupervisorForm({ ...supervisorForm, specialty: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowSupervisorModal(false)}>إلغاء</Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#002F6C' }}
                        disabled={addSupervisor.isPending}
                        onClick={() => {
                            // Map role to notes and specialty to external_experience for the backend
                            const payload = {
                                ...supervisorForm,
                                notes: supervisorForm.role,
                                external_experience: supervisorForm.specialty
                            };
                            addSupervisor.mutate(payload, {
                                onSuccess: () => {
                                    setShowSupervisorModal(false);
                                    setSupervisorForm({
                                        is_external: false,
                                        employee_id: "",
                                        external_name: "",
                                        role: "",
                                        specialty: "",
                                        notes: ""
                                    });
                                }
                            });
                        }}
                    >
                        {addSupervisor.isPending ? 'جاري الإضافة...' : 'إضافة المشرف'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Attendance Modals */}
            <Modal show={showImportAttendanceModal} onHide={() => setShowImportAttendanceModal(false)} centered className="modal-modern">
                <Modal.Header closeButton className="border-0 modal-header-themed">
                    <Modal.Title className="fw-normal text-white">رفع كشف حضور جديد</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-end">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">تاريخ الحضور</Form.Label>
                            <Form.Control
                                type="date"
                                className="rounded-3 border-0 bg-light py-2 px-3"
                                value={attendanceFilters.attendance_date}
                                onChange={(e) => setAttendanceFilters({ ...attendanceFilters, attendance_date: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">ملف Excel</Form.Label>
                            <Form.Control
                                type="file"
                                className="rounded-3 border-0 bg-light py-2 px-3"
                                onChange={(e) => setImportAttendanceFile(e.target.files[0])}
                            />
                            <div className="small text-muted mt-2">
                                <FaInfoCircle className="ms-1 text-primary" /> تأكد من استخدام القالب الخاص بالدورة لضمان تطابق البيانات.
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowImportAttendanceModal(false)}>إلغاء</Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#002F6C' }}
                        disabled={!importAttendanceFile || importAttendance.isPending}
                        onClick={() => {
                            const formData = new FormData();
                            formData.append('file', importAttendanceFile);
                            formData.append('attendance_date', attendanceFilters.attendance_date);
                            importAttendance.mutate(formData, {
                                onSuccess: () => {
                                    setShowImportAttendanceModal(false);
                                    setImportAttendanceFile(null);
                                    if (typeof refetchAttendance === 'function') {
                                        refetchAttendance();
                                    }
                                }
                            });
                        }}
                    >
                        {importAttendance.isPending ? 'جاري الرفع...' : 'رفع الملف'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showManualAttendanceModal} onHide={() => setShowManualAttendanceModal(false)} centered className="modal-modern">
                <Modal.Header closeButton className="border-0 modal-header-themed">
                    <Modal.Title className="fw-normal text-white">{manualAttendanceForm.id ? 'تعديل سجل حضور' : 'إضافة سجل حضور يدوي'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4 text-end">
                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">الموظف</Form.Label>
                            <CSelect
                                options={participants?.map(p => ({ value: p.employee_id, label: p.employee_name })) || []}
                                value={participants?.find(p => p.employee_id === manualAttendanceForm.employee_id) ? { value: manualAttendanceForm.employee_id, label: participants.find(p => p.employee_id === manualAttendanceForm.employee_id).employee_name } : null}
                                onChange={(val) => setManualAttendanceForm({ ...manualAttendanceForm, employee_id: val?.value })}
                                placeholder="اختر الموظف..."
                                isDisabled={!!manualAttendanceForm.id}
                            />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6 order-2">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-secondary">ساعة الحضور</Form.Label>
                                    <Form.Control
                                        type="time"
                                        className="rounded-3 border-0 bg-light py-2 px-3 text-center"
                                        value={manualAttendanceForm.check_in_at}
                                        onChange={(e) => setManualAttendanceForm({ ...manualAttendanceForm, check_in_at: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6 order-1">
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-secondary">ساعة الانصراف</Form.Label>
                                    <Form.Control
                                        type="time"
                                        className="rounded-3 border-0 bg-light py-2 px-3 text-center"
                                        value={manualAttendanceForm.check_out_at}
                                        onChange={(e) => setManualAttendanceForm({ ...manualAttendanceForm, check_out_at: e.target.value })}
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary">مكان العمل</Form.Label>
                            <Form.Control
                                type="text"
                                className="rounded-3 border-0 bg-light py-2 px-3"
                                placeholder="مثال: قاعة التدريب الرئيسية"
                                value={manualAttendanceForm.workplace}
                                onChange={(e) => setManualAttendanceForm({ ...manualAttendanceForm, workplace: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">ملاحظات</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                className="rounded-3 border-0 bg-light py-2 px-3"
                                value={manualAttendanceForm.notes}
                                onChange={(e) => setManualAttendanceForm({ ...manualAttendanceForm, notes: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="light" className="rounded-pill px-4" onClick={() => setShowManualAttendanceModal(false)}>إلغاء</Button>
                    <Button
                        variant="primary"
                        className="rounded-pill px-4 border-0 shadow-sm"
                        style={{ backgroundColor: '#002F6C' }}
                        disabled={addAttendance.isPending || updateAttendance.isPending}
                        onClick={() => {
                            if (manualAttendanceForm.id) {
                                updateAttendance.mutate({ id: manualAttendanceForm.id, data: manualAttendanceForm }, {
                                    onSuccess: () => setShowManualAttendanceModal(false)
                                });
                            } else {
                                addAttendance.mutate(manualAttendanceForm, {
                                    onSuccess: () => setShowManualAttendanceModal(false)
                                });
                            }
                        }}
                    >
                        {addAttendance.isPending || updateAttendance.isPending ? 'جاري الحفظ...' : 'حفظ البيانات'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .btn-modern-add {
                    background-color: #002F6C;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px rgba(0, 47, 108, 0.1);
                    display: flex;
                    align-items: center;
                }

                .btn-modern-add:hover {
                    background-color: #001f46;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 47, 108, 0.2);
                    color: white;
                }

                .modal-modern .modal-content {
                    border-radius: 20px;
                    border: none;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }

                .modal-header-themed {
                    background-color: #002F6C;
                    color: white;
                    padding: 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header-themed .btn-close {
                    filter: invert(1) grayscale(100%) brightness(200%);
                    margin: 0 !important;
                }

                .form-check-input:checked {
                    background-color: #002F6C;
                    border-color: #002F6C;
                }

                .course-header {
                    background: rgba(255, 255, 255, 0.95) !important;
                    border: 1px solid rgba(0, 47, 108, 0.08) !important;
                }

                .badge-modern {
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                }

                .badge-blue { background-color: #eef2ff; color: #4338ca; }
                .badge-teal { background-color: #f0fdfa; color: #0d9488; }
                .badge-purple { background-color: #faf5ff; color: #7e22ce; }

                .tab-btn {
                    border: none;
                    background: none;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                .tab-btn:hover {
                    color: #002F6C !important;
                }

                .tab-icon {
                    font-size: 1.1rem;
                    opacity: 0.7;
                }

                .active-indicator {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background-color: #004bbf;
                    border-radius: 3px 3px 0 0;
                }

                .detail-card {
                    border-color: #f1f3f5 !important;
                }

                .detail-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05) !important;
                    border-color: rgba(0, 47, 108, 0.15) !important;
                }

                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-slide-up {
                    animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

export default CourseDetails;
