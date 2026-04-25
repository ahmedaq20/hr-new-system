import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Nav } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateTempEmployee, useUpdateTempEmployee, useTempContractEmployee } from "../hooks/useTempContractEmployees";
import { usePrograms } from "../hooks/usePrograms";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";
import toast from "react-hot-toast";
import { FaUser, FaMapMarkerAlt, FaFileContract, FaGraduationCap, FaPhoneAlt } from "react-icons/fa";

const TempEmployeeModal = ({ show, onClose, mode = "add", employeeId = null }) => {
    const [formData, setFormData] = useState({
        temp_contract_project_id: "",
        first_name: "",
        second_name: "",
        third_name: "",
        family_name: "",
        national_id: "",
        birth_date: null,
        primary_phone: "",
        secondary_phone: "",
        gender: "",
        marital_status: "",
        position_type: "",
        start_contract_date: null,
        end_contract_date: null,
        governorate_id: "",
        city_id: "",
        address: "",
        certificate_id: "",
        university_name: "",
        major_name: "",
        graduation_date: null,
    });

    const [activeTab, setActiveTab] = useState("personal");

    const createEmployee = useCreateTempEmployee();
    const updateEmployee = useUpdateTempEmployee();
    const { data: employeeData, isLoading: employeeLoading } = useTempContractEmployee(employeeId);
    const { data: programs, isLoading: programsLoading } = usePrograms();
    const { data: lookups, isLoading: lookupsLoading } = useLookups();

    useEffect(() => {
        if (employeeData && (mode === "edit" || mode === "view")) {
            const mappedData = { ...employeeData };
            // Ensure dates are converted to Date objects for DatePicker
            ["birth_date", "start_contract_date", "end_contract_date", "graduation_date"].forEach(field => {
                if (mappedData[field]) {
                    mappedData[field] = new Date(mappedData[field]);
                }
            });
            setFormData(mappedData);
        } else if (mode === "add") {
            // Reset form for add mode
            setFormData({
                temp_contract_project_id: "",
                first_name: "",
                second_name: "",
                third_name: "",
                family_name: "",
                national_id: "",
                birth_date: null,
                primary_phone: "",
                secondary_phone: "",
                gender: "",
                marital_status: "",
                position_type: "",
                start_contract_date: null,
                end_contract_date: null,
                governorate_id: "",
                city_id: "",
                address: "",
                certificate_id: "",
                university_name: "",
                major_name: "",
                graduation_date: null,
            });
        }
    }, [employeeData, mode]);

    const handleDateChange = (key, date) => {
        if (mode === "view") return;
        setFormData((prev) => ({ ...prev, [key]: date }));
    };

    const handleInputChange = (key, value) => {
        if (mode === "view") return;
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        if (!formData.temp_contract_project_id || !formData.first_name || !formData.family_name || !formData.national_id) {
            toast.error("يرجى ملء الحقول المطلوبة");
            return;
        }

        const payload = { ...formData };
        const dateFields = ["birth_date", "start_contract_date", "end_contract_date", "graduation_date"];
        dateFields.forEach(field => {
            if (payload[field] instanceof Date) {
                payload[field] = payload[field].toISOString().split('T')[0];
            }
        });

        if (mode === "edit") {
            updateEmployee.mutate({ id: employeeId, data: payload }, {
                onSuccess: () => {
                    toast.success("تم تحديث البيانات بنجاح");
                    onClose();
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "حدث خطأ أثناء التحديث");
                },
            });
        } else {
            createEmployee.mutate(payload, {
                onSuccess: () => {
                    toast.success("تم إضافة الموظف بنجاح");
                    onClose();
                },
                onError: (err) => {
                    toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
                },
            });
        }
    };

    const projectOptions = programs?.map(p => ({ value: p.id, label: p.name })) || [];
    const genderOptions = [
        { value: "male", label: "ذكر" },
        { value: "female", label: "أنثى" }
    ];
    const maritalOptions = [
        { value: "single", label: "أعزب/عزباء" },
        { value: "married", label: "متزوج/متزوجة" },
        { value: "divorced", label: "مطلق/مطلقة" },
        { value: "widowed", label: "أرمل/أرملة" }
    ];

    const govOptions = lookups?.GOVERNORATE?.map(g => ({ value: g.id, label: g.value })) || [];
    const cityOptions = lookups?.CITY?.map(c => ({ value: c.id, label: c.value })) || [];

    const certOptions = lookups?.CERTIFICATE?.map(c => ({ value: c.id, label: c.value })) || [];

    const getModalTitle = () => {
        if (mode === "add") return "إضافة موظف عقد مؤقت جديد";
        if (mode === "edit") return "تعديل بيانات الموظف";
        return "تفاصيل الموظف";
    };

    const renderField = (label, value, icon = null) => (
        <div className="view-field p-3 rounded-4 bg-white border border-light-subtle shadow-sm mb-3">
            <div className="d-flex align-items-center gap-2 mb-1">
                {icon && <span className="text-primary opacity-50">{icon}</span>}
                <span className="text-secondary small fw-medium">{label}</span>
            </div>
            <div className="fw-bold text-dark">{value || "---"}</div>
        </div>
    );

    const formatLocalDate = (date) => {
        if (!date) return "---";
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
    };

    const isPending = createEmployee.isLoading || updateEmployee.isLoading || employeeLoading;

    return (
        <Modal show={show} onHide={onClose} size="xl" centered scrollable className="modal-modern">
            <Modal.Header className="border-0 d-flex align-items-center justify-content-between" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white d-flex align-items-center gap-2 mb-0">
                    {getModalTitle()}
                </Modal.Title>
                <button
                    type="button"
                    className="btn-close btn-close-white ms-0 me-auto"
                    onClick={onClose}
                    aria-label="Close"
                ></button>
            </Modal.Header>
            <Modal.Body className="p-0 bg-light">
                {mode === "view" && (
                    <div className="view-header bg-white p-4 border-bottom shadow-sm mb-0">
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div className="employee-main-info">
                                <h3 className="fw-bold text-dark mb-1">{formData.first_name} {formData.second_name} {formData.third_name} {formData.family_name}</h3>
                                <span className="text-secondary small">موظف عقود مؤقتة - {formData.position_type}</span>
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                <span className="badge-premium project">المشروع: {projectOptions.find(o => String(o.value) === String(formData.temp_contract_project_id))?.label || "---"}</span>
                                <span className="badge-premium position">طبيعة العمل: {formData.position_type || "---"}</span>
                                <span className="badge-premium start-date">بداية العقد: {formatLocalDate(formData.start_contract_date)}</span>
                            </div>
                        </div>

                        <Nav variant="pills" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="premium-tabs mt-4 gap-2">
                            <Nav.Item>
                                <Nav.Link eventKey="personal" className="d-flex align-items-center gap-2">
                                    <FaUser size={14} /> البيانات الشخصية
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="location" className="d-flex align-items-center gap-2">
                                    <FaMapMarkerAlt size={14} /> بيانات العنوان
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="contact" className="d-flex align-items-center gap-2">
                                    <FaPhoneAlt size={14} /> معلومات الاتصال
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="contract" className="d-flex align-items-center gap-2">
                                    <FaFileContract size={14} /> بيانات العقد
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="education" className="d-flex align-items-center gap-2">
                                    <FaGraduationCap size={14} /> المؤهلات العلمية
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>
                )}

                <div className="p-4">
                    {employeeLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">جارِ التحميل...</span>
                            </div>
                        </div>
                    ) : mode === "view" ? (
                        <div className="animate-fade-in">
                            {activeTab === "personal" && (
                                <Row className="g-3">
                                    <Col md={3}>{renderField("الاسم الأول", formData.first_name)}</Col>
                                    <Col md={3}>{renderField("الاسم الأب", formData.second_name)}</Col>
                                    <Col md={3}>{renderField("الاسم الجد", formData.third_name)}</Col>
                                    <Col md={3}>{renderField("الاسم العائلة", formData.family_name)}</Col>
                                    <Col md={4}>{renderField("رقم الهوية", formData.national_id)}</Col>
                                    <Col md={4}>{renderField("تاريخ الميلاد", formatLocalDate(formData.birth_date))}</Col>
                                    <Col md={2}>{renderField("الجنس", genderOptions.find(o => o.value === formData.gender)?.label)}</Col>
                                    <Col md={2}>{renderField("الحالة الإجتماعية", maritalOptions.find(o => o.value === formData.marital_status)?.label)}</Col>
                                </Row>
                            )}
                            {activeTab === "location" && (
                                <Row className="g-3">
                                    <Col md={4}>{renderField("المحافظة", govOptions.find(o => String(o.value) === String(formData.governorate_id))?.label)}</Col>
                                    <Col md={4}>{renderField("المدينة", cityOptions.find(o => String(o.value) === String(formData.city_id))?.label)}</Col>
                                    <Col md={4}>{renderField("العنوان", formData.address)}</Col>
                                </Row>
                            )}
                            {activeTab === "contact" && (
                                <Row className="g-3">
                                    <Col md={6}>{renderField("رقم الجوال الأساسي", formData.primary_phone)}</Col>
                                    <Col md={6}>{renderField("رقم الجوال البديل", formData.secondary_phone)}</Col>
                                </Row>
                            )}
                            {activeTab === "contract" && (
                                <Row className="g-3">
                                    <Col md={4}>{renderField("طبيعة العمل", formData.position_type)}</Col>
                                    <Col md={4}>{renderField("تاريخ بداية العقد", formatLocalDate(formData.start_contract_date))}</Col>
                                    <Col md={4}>{renderField("تاريخ نهاية العقد", formatLocalDate(formData.end_contract_date))}</Col>
                                </Row>
                            )}
                            {activeTab === "education" && (
                                <Row className="g-3">
                                    <Col md={3}>{renderField("المؤهل العلمي", certOptions.find(o => String(o.value) === String(formData.certificate_id))?.label)}</Col>
                                    <Col md={3}>{renderField("الجامعة", formData.university_name)}</Col>
                                    <Col md={3}>{renderField("التخصص", formData.major_name)}</Col>
                                    <Col md={3}>{renderField("تاريخ التخرج", formatLocalDate(formData.graduation_date))}</Col>
                                </Row>
                            )}
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit} style={{ direction: 'rtl' }}>
                            {/* Project Selection */}
                            <div className="mb-4 bg-white p-3 rounded-3 shadow-sm border-top border-primary border-4">
                                <Form.Label className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
                                    المشروع <span className="text-danger">*</span>
                                </Form.Label>
                                <CSelect
                                    options={projectOptions}
                                    value={projectOptions.find(o => String(o.value) === String(formData.temp_contract_project_id))}
                                    onChange={(opt) => handleInputChange("temp_contract_project_id", opt?.value)}
                                    placeholder="اختر المشروع..."
                                    isLoading={programsLoading}
                                    isRtl
                                />
                            </div>

                            <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                                <Row className="g-3">
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الاسم الأول <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.first_name} onChange={(e) => handleInputChange("first_name", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الاسم الأب <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.second_name} onChange={(e) => handleInputChange("second_name", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الاسم الجد <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.third_name} onChange={(e) => handleInputChange("third_name", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الاسم العائلة <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.family_name} onChange={(e) => handleInputChange("family_name", e.target.value)} required />
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">رقم الهوية <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.national_id} onChange={(e) => handleInputChange("national_id", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">تاريخ الميلاد <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={formData.birth_date} onChange={(date) => handleDateChange("birth_date", date)} dateFormat="yyyy-MM-dd" className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100" placeholderText="YYYY-MM-DD" wrapperClassName="w-100" required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">رقم الجوال الأساسي <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.primary_phone} onChange={(e) => handleInputChange("primary_phone", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">رقم الجوال البديل</Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.secondary_phone} onChange={(e) => handleInputChange("secondary_phone", e.target.value)} />
                                    </Col>

                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الجنس <span className="text-danger">*</span></Form.Label>
                                        <CSelect options={genderOptions} value={genderOptions.find(o => o.value === formData.gender)} onChange={(opt) => handleInputChange("gender", opt?.value)} placeholder="اختر الجنس..." isRtl />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الحالة الإجتماعية <span className="text-danger">*</span></Form.Label>
                                        <CSelect options={maritalOptions} value={maritalOptions.find(o => o.value === formData.marital_status)} onChange={(opt) => handleInputChange("marital_status", opt?.value)} placeholder="اختر الحالة..." isRtl />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">طبيعة العمل <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.position_type} onChange={(e) => handleInputChange("position_type", e.target.value)} required />
                                    </Col>
                                    <Col md={3}></Col>

                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">تاريخ بداية العقد <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={formData.start_contract_date} onChange={(date) => handleDateChange("start_contract_date", date)} dateFormat="yyyy-MM-dd" className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100" placeholderText="YYYY-MM-DD" wrapperClassName="w-100" required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">تاريخ نهاية العقد <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={formData.end_contract_date} onChange={(date) => handleDateChange("end_contract_date", date)} dateFormat="yyyy-MM-dd" className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100" placeholderText="YYYY-MM-DD" wrapperClassName="w-100" required />
                                    </Col>
                                </Row>
                            </div>

                            <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                                <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">البيانات الجغرافية</h6>
                                <Row className="g-3">
                                    <Col md={4}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">المحافظة <span className="text-danger">*</span></Form.Label>
                                        <CSelect options={govOptions} value={govOptions.find(o => String(o.value) === String(formData.governorate_id))} onChange={(opt) => { handleInputChange("governorate_id", opt?.value); handleInputChange("city_id", ""); }} placeholder="اختر المحافظة" isLoading={lookupsLoading} isRtl />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">المدينة <span className="text-danger">*</span></Form.Label>
                                        <CSelect options={cityOptions} value={cityOptions.find(o => String(o.value) === String(formData.city_id))} onChange={(opt) => handleInputChange("city_id", opt?.value)} placeholder="اختر المدينة" disabled={!formData.governorate_id} isRtl />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">العنوان <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
                                    </Col>
                                </Row>
                            </div>

                            <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                                <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom">المؤهلات التعليمية</h6>
                                <Row className="g-3">
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">المؤهل العلمي <span className="text-danger">*</span></Form.Label>
                                        <CSelect options={certOptions} value={certOptions.find(o => String(o.value) === String(formData.certificate_id))} onChange={(opt) => handleInputChange("certificate_id", opt?.value)} placeholder="اختر المؤهل" isLoading={lookupsLoading} isRtl />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">الجامعة <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.university_name} onChange={(e) => handleInputChange("university_name", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">التخصص <span className="text-danger">*</span></Form.Label>
                                        <Form.Control className="rounded-3 shadow-none border-secondary-subtle py-2" value={formData.major_name} onChange={(e) => handleInputChange("major_name", e.target.value)} required />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Label className="fw-bold text-secondary small mb-2">تاريخ التخرج <span className="text-danger">*</span></Form.Label>
                                        <DatePicker selected={formData.graduation_date} onChange={(date) => handleDateChange("graduation_date", date)} dateFormat="yyyy-MM-dd" className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100" placeholderText="YYYY-MM-DD" wrapperClassName="w-100" required />
                                    </Col>
                                </Row>
                            </div>

                            <div className="d-flex justify-content-end gap-2 pt-3">
                                <Button variant="light" className="rounded-3 px-5 border fw-bold shadow-sm" onClick={onClose} disabled={isPending}>إلغاء</Button>
                                <Button type="submit" className="rounded-3 px-5 modern-save-btn fw-bold shadow" disabled={isPending}>
                                    {isPending ? <><span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span> جارٍ الحفظ...</> : "حفظ البيانات"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </div>
            </Modal.Body>
            {mode === "view" && (
                <Modal.Footer className="border-0 pt-0 pb-4 px-4 bg-light">
                    <Button variant="light" className="rounded-3 px-4 fw-medium border shadow-sm w-100 py-2" onClick={onClose}>إغلاق النافذة</Button>
                </Modal.Footer>
            )}
            <style>{`
                .modal-modern .modal-content { border-radius: 20px; overflow: hidden; border: none; }
                .view-header { background: #fff; }
                .badge-premium { padding: 8px 16px; border-radius: 50px; font-size: 0.82rem; font-weight: 600; }
                .badge-premium.project { background: rgba(0, 47, 108, 0.08); color: #002F6C; }
                .badge-premium.position { background: rgba(45, 85, 255, 0.08); color: #2d55ff; }
                .badge-premium.start-date { background: rgba(0, 150, 255, 0.08); color: #0096ff; }
                
                .premium-tabs .nav-link { 
                    border-radius: 50px; 
                    padding: 10px 20px; 
                    color: #6c757d; 
                    font-weight: 600; 
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    border: 1px solid transparent;
                }
                .premium-tabs .nav-link:hover { background: rgba(0, 47, 108, 0.05); color: #002F6C; }
                .premium-tabs .nav-link.active { 
                    background: #343a40 !important; 
                    color: #fff !important; 
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .view-field { transition: all 0.2s ease; }
                .view-field:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.05) !important; }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

                .modern-save-btn { background-color: #002F6C; border-color: #002F6C; color: white; }
                .modern-save-btn:hover { background-color: #001f46; border-color: #001f46; color: white; transform: translateY(-2px); }
            `}</style>
        </Modal>
    );
};

export default TempEmployeeModal;
