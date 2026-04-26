import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateTempEmployee } from "../hooks/useTempContractEmployees";
import { usePrograms } from "../hooks/usePrograms";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";
import toast from "react-hot-toast";

const AddTempEmployeeModal = ({ show, onClose }) => {
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

    const createEmployee = useCreateTempEmployee();
    const { data: programs, isLoading: programsLoading } = usePrograms();
    const { data: lookups, isLoading: lookupsLoading } = useLookups();

    const handleDateChange = (key, date) => {
        setFormData((prev) => ({ ...prev, [key]: date }));
    };

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.temp_contract_project_id || !formData.first_name || !formData.family_name || !formData.national_id) {
            toast.error("يرجى ملء الحقول المطلوبة");
            return;
        }

        // Format dates for backend (YYYY-MM-DD)
        const payload = { ...formData };
        const dateFields = ["birth_date", "start_contract_date", "end_contract_date", "graduation_date"];
        dateFields.forEach(field => {
            if (payload[field]) {
                payload[field] = payload[field].toISOString().split('T')[0];
            }
        });

        createEmployee.mutate(payload, {
            onSuccess: () => {
                toast.success("تم إضافة الموظف بنجاح");
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
                onClose();
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
            },
        });
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
    const cityOptions = lookups?.CITY?.filter(c => !formData.governorate_id || String(c.governorate_id) === String(formData.governorate_id))
        .map(c => ({ value: c.id, label: c.value })) || [];

    const certOptions = lookups?.CERTIFICATE?.map(c => ({ value: c.id, label: c.value })) || [];

    return (
        <Modal show={show} onHide={onClose} size="xl" centered scrollable className="modal-modern">
            <Modal.Header closeButton closeVariant="white" className="border-0" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white">إضافة موظف عقد مؤقت جديد</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form onSubmit={handleSubmit} style={{ direction: 'rtl' }}>
                    {/* Project Selection */}
                    <div className="mb-4 bg-white p-3 rounded-3 shadow-sm border-top border-primary border-4">
                        <Form.Label className="fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
                            المشروع <span className="text-danger">*</span>
                        </Form.Label>
                        <CSelect
                            options={projectOptions}
                            value={projectOptions.find(o => o.value === formData.temp_contract_project_id)}
                            onChange={(opt) => handleInputChange("temp_contract_project_id", opt?.value)}
                            placeholder="اختر المشروع..."
                            isLoading={programsLoading}
                            isRtl
                        />
                    </div>

                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                        <Row className="g-3">
                            {/* Name Fields */}
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الاسم الأول <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="الاسم الأول"
                                    value={formData.first_name}
                                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الاسم الأب <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="الاسم الأب"
                                    value={formData.second_name}
                                    onChange={(e) => handleInputChange("second_name", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الاسم الجد <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="الاسم الجد"
                                    value={formData.third_name}
                                    onChange={(e) => handleInputChange("third_name", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الاسم العائلة <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="الاسم العائلة"
                                    value={formData.family_name}
                                    onChange={(e) => handleInputChange("family_name", e.target.value)}
                                    required
                                />
                            </Col>

                            {/* ID & Birth Date */}
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">رقم الهوية <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="مثال: 40147862"
                                    value={formData.national_id}
                                    onChange={(e) => handleInputChange("national_id", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">تاريخ الميلاد <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.birth_date}
                                    onChange={(date) => handleDateChange("birth_date", date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100"
                                    placeholderText="YYYY-MM-DD"
                                    wrapperClassName="w-100"
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">رقم الجوال الأساسي <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="0594132478"
                                    value={formData.primary_phone}
                                    onChange={(e) => handleInputChange("primary_phone", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">رقم الجوال البديل</Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="0597412547"
                                    value={formData.secondary_phone}
                                    onChange={(e) => handleInputChange("secondary_phone", e.target.value)}
                                />
                            </Col>

                            {/* Gender & Marital Status */}
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الجنس <span className="text-danger">*</span></Form.Label>
                                <CSelect
                                    options={genderOptions}
                                    value={genderOptions.find(o => o.value === formData.gender)}
                                    onChange={(opt) => handleInputChange("gender", opt?.value)}
                                    placeholder="اختر الجنس..."
                                    isRtl
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الحالة الإجتماعية <span className="text-danger">*</span></Form.Label>
                                <CSelect
                                    options={maritalOptions}
                                    value={maritalOptions.find(o => o.value === formData.marital_status)}
                                    onChange={(opt) => handleInputChange("marital_status", opt?.value)}
                                    placeholder="اختر الحالة..."
                                    isRtl
                                />
                            </Col>

                            {/* Contract Specifics */}
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">طبيعة العمل <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="مثال: منسق ميداني"
                                    value={formData.position_type}
                                    onChange={(e) => handleInputChange("position_type", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}></Col>

                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">تاريخ بداية العقد <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.start_contract_date}
                                    onChange={(date) => handleDateChange("start_contract_date", date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100"
                                    placeholderText="YYYY-MM-DD"
                                    wrapperClassName="w-100"
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">تاريخ نهاية العقد <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.end_contract_date}
                                    onChange={(date) => handleDateChange("end_contract_date", date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100"
                                    placeholderText="YYYY-MM-DD"
                                    wrapperClassName="w-100"
                                    required
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                        <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                            <i className="bi bi-geo-alt"></i> البيانات الجغرافية
                        </h6>
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Label className="fw-bold text-secondary small mb-2">المحافظة <span className="text-danger">*</span></Form.Label>
                                <CSelect
                                    options={govOptions}
                                    value={govOptions.find(o => String(o.value) === String(formData.governorate_id))}
                                    onChange={(opt) => {
                                        handleInputChange("governorate_id", opt?.value);
                                        handleInputChange("city_id", ""); // reset city
                                    }}
                                    placeholder="اختر المحافظة"
                                    isLoading={lookupsLoading}
                                    isRtl
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold text-secondary small mb-2">المدينة <span className="text-danger">*</span></Form.Label>
                                <CSelect
                                    options={cityOptions}
                                    value={cityOptions.find(o => String(o.value) === String(formData.city_id))}
                                    onChange={(opt) => handleInputChange("city_id", opt?.value)}
                                    placeholder="اختر المدينة"
                                    disabled={!formData.governorate_id}
                                    isRtl
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Label className="fw-bold text-secondary small mb-2">عنوان السكن بالتفصيل <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="الحي، الشارع..."
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                    required
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="bg-white p-4 rounded-3 shadow-sm mb-4 border border-light-subtle">
                        <h6 className="fw-bold text-primary mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                            <i className="bi bi-mortarboard"></i> المؤهلات التعليمية
                        </h6>
                        <Row className="g-3">
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">المؤهل العلمي <span className="text-danger">*</span></Form.Label>
                                <CSelect
                                    options={certOptions}
                                    value={certOptions.find(o => String(o.value) === String(formData.certificate_id))}
                                    onChange={(opt) => handleInputChange("certificate_id", opt?.value)}
                                    placeholder="اختر المؤهل"
                                    isLoading={lookupsLoading}
                                    isRtl
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">الجامعة <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="اسم الجامعة"
                                    value={formData.university_name}
                                    onChange={(e) => handleInputChange("university_name", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">التخصص <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    className="rounded-3 shadow-none border-secondary-subtle py-2"
                                    placeholder="التخصص الحالي"
                                    value={formData.major_name}
                                    onChange={(e) => handleInputChange("major_name", e.target.value)}
                                    required
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="fw-bold text-secondary small mb-2">تاريخ التخرج <span className="text-danger">*</span></Form.Label>
                                <DatePicker
                                    selected={formData.graduation_date}
                                    onChange={(date) => handleDateChange("graduation_date", date)}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control rounded-3 shadow-none border-secondary-subtle py-2 w-100"
                                    placeholderText="YYYY-MM-DD"
                                    wrapperClassName="w-100"
                                    required
                                />
                            </Col>
                        </Row>
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-3">
                        <Button
                            variant="light"
                            className="rounded-3 px-5 border fw-bold shadow-sm"
                            onClick={onClose}
                            disabled={createEmployee.isLoading}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-3 px-5 modern-save-btn fw-bold shadow"
                            disabled={createEmployee.isLoading}
                        >
                            {createEmployee.isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                                    جارٍ الحفظ...
                                </>
                            ) : (
                                "حفظ بيانات الموظف"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
            <style>{`
        .modern-save-btn {
          background-color: #002F6C;
          border-color: #002F6C;
          color: white;
        }
        .modern-save-btn:hover {
          background-color: #001f46;
          border-color: #001f46;
          color: white;
          transform: translateY(-2px);
        }
        .react-datepicker-wrapper {
          width: 100%;
        }
      `}</style>
        </Modal>
    );
};

export default AddTempEmployeeModal;
