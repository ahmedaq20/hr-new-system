import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner, Card, Badge } from "react-bootstrap";
import { useUpdateEmployeeChild, Child } from "../hooks/useEmployeeChildren";
import { toast } from "react-hot-toast";

interface EditChildProps {
    show: boolean;
    handleClose: () => void;
    child: Child | null;
}

interface ChildFormData {
    full_name: string;
    gender: string;
    id_number: string;
    birth_date: string;
    marital_status: string;
    is_working: boolean;
    is_university_student: boolean;
    mother_full_name: string;
    mother_id_number: string;
    notes: string;
}

const EditChild: React.FC<EditChildProps> = ({ show, handleClose, child }) => {
    const [formData, setFormData] = useState<ChildFormData>({
        full_name: child?.full_name || "",
        gender: child?.gender || "ذكر",
        id_number: child?.id_number || "",
        birth_date: child?.birth_date || "",
        marital_status: child?.marital_status || "أعزب/عزباء",
        is_working: child?.is_working || false,
        is_university_student: child?.is_university_student || false,
        mother_full_name: child?.mother_full_name || "",
        mother_id_number: child?.mother_id_number || "",
        notes: child?.notes || "",
    });

    const [idCardImage, setIdCardImage] = useState<File | null>(null);
    const [birthCertificateImage, setBirthCertificateImage] = useState<File | null>(null);
    const [universityCertificateImage, setUniversityCertificateImage] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateChildMutation = useUpdateEmployeeChild();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // 1. ID Number Filtering (digits only, max 9)
        if (name === 'id_number' || name === 'mother_id_number') {
            const filteredValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        // 2. Name Filtering (no digits)
        if (name === 'full_name' || name === 'mother_full_name') {
            const filteredValue = value.replace(/\d/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void, errorKey: string) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setErrors(prev => ({ ...prev, [errorKey]: "حجم الملف كبير جداً (الحد الأقصى 10 ميجا بايت)" }));
                setter(null);
                e.target.value = ""; // Clear input
                return;
            }
            setErrors(prev => ({ ...prev, [errorKey]: "" }));
            setter(file);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name) {
            newErrors.full_name = "الاسم الكامل مطلوب";
        }

        if (!formData.id_number) {
            newErrors.id_number = "رقم الهوية مطلوب";
        } else if (formData.id_number.length !== 9) {
            newErrors.id_number = "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط";
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "تاريخ الميلاد مطلوب";
        }

        if (!formData.mother_full_name) {
            newErrors.mother_full_name = "اسم الأم الكامل مطلوب";
        }

        if (!formData.mother_id_number) {
            newErrors.mother_id_number = "رقم هوية الأم مطلوب";
        } else if (formData.mother_id_number.length !== 9) {
            newErrors.mother_id_number = "رقم هوية الأم يجب أن يتكون من 9 أرقام بالضبط";
        }

        const hasIdCard = idCardImage || child?.id_card_image_url;
        const hasBirthCert = birthCertificateImage || child?.birth_certificate_image_url;

        if (!hasIdCard && !hasBirthCert) {
            newErrors.id_card_image = "يجب إرفاق صورة الهوية أو شهادة الميلاد";
            newErrors.birth_certificate_image = "يجب إرفاق صورة الهوية أو شهادة الميلاد";
        }

        const hasUnivCert = universityCertificateImage || child?.university_certificate_image_url;
        if (formData.is_university_student && !hasUnivCert) {
            newErrors.university_certificate_image = "يجب إرفاق شهادة القيد الجامعي";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!child) return;
        if (!validate()) {
            toast.error("يرجى تصحيح الأخطاء في الحقول الموضحة");
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value === true ? "1" : value === false ? "0" : String(value));
        });

        if (idCardImage) {
            data.append("id_card_image", idCardImage);
        }
        if (birthCertificateImage) {
            data.append("birth_certificate_image", birthCertificateImage);
        }
        if (universityCertificateImage) {
            data.append("university_certificate_image", universityCertificateImage);
        }

        try {
            await updateChildMutation.mutateAsync({ id: child.id, formData: data });
            toast.success("تم تحديث البيانات بنجاح وهي قيد المراجعة");
            handleClose();
            // Reset files
            setIdCardImage(null);
            setBirthCertificateImage(null);
            setUniversityCertificateImage(null);
            setErrors({});
        } catch (err: unknown) {
            const error = err as { response?: { data?: { errors?: Record<string, string[]> } } };
            if (error.response?.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
                toast.error(`خطأ في البيانات:\n${errorMessages}`);
            } else {
                toast.error("حدث خطأ أثناء تحديث البيانات");
            }
            console.error(err);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered dir="rtl" className="child-modal">
            <Modal.Body className="p-0">
                <Card className="p-4 border-0 shadow-sm" style={{ borderRadius: "15px", background: "#fff" }}>
                    <h5 className="mb-4 text-center d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, color: "#016A74" }}>
                        تعديل بيانات ابن/ابنة
                        {child?.approval_status === 'pending' ? (
                            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>قيد المراجعة</Badge>
                        ) : (
                            <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>{child?.approval_status}</Badge>
                        )}
                    </h5>

                    <Form onSubmit={handleSubmit}>
                        {/* Row 1: Name and Gender */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">الاسم الكامل <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.full_name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">الجنس <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="ذكر">ذكر</option>
                                        <option value="أنثى">أنثى</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 2: ID and DOB */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">رقم الهوية <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="id_number"
                                        value={formData.id_number}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.id_number}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.id_number}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">تاريخ الميلاد <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birth_date"
                                        value={formData.birth_date}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.birth_date}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.birth_date}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 3: Marital Status & Checkboxes */}
                        <Row className="mb-4 align-items-center">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">الحالة الاجتماعية</Form.Label>
                                    <Form.Select
                                        name="marital_status"
                                        value={formData.marital_status}
                                        onChange={handleChange}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="أعزب/عزباء">أعزب/عزباء</option>
                                        <option value="متزوج/متزوجة">متزوج/متزوجة</option>
                                        <option value="مطلق/مطلقة">مطلق/مطلقة</option>
                                        <option value="أرمل/أرملة">أرمل/أرملة</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex align-items-center gap-4 h-100 pt-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Label htmlFor="edit-is-working-child" className="mb-0 fw-bold" style={{ cursor: 'pointer' }}>يعمل</Form.Label>
                                        <Form.Check
                                            type="checkbox"
                                            id="edit-is-working-child"
                                            name="is_working"
                                            checked={formData.is_working}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Label htmlFor="edit-is-university-student" className="mb-0 fw-bold" style={{ cursor: 'pointer' }}>طالب جامعي</Form.Label>
                                        <Form.Check
                                            type="checkbox"
                                            id="edit-is-university-student"
                                            name="is_university_student"
                                            checked={formData.is_university_student}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Row 4: Mother Details */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">اسم الأم الكامل <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mother_full_name"
                                        value={formData.mother_full_name}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.mother_full_name}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mother_full_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">رقم هوية الأم <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mother_id_number"
                                        value={formData.mother_id_number}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.mother_id_number}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mother_id_number}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Row 5: Notes */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">ملاحظات</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                style={{ borderRadius: "10px" }}
                            />
                        </Form.Group>

                        {/* Row 6: Attachments */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">صورة بطاقة الهوية <span className="text-secondary" style={{ fontSize: '0.8rem' }}>(مطلوب واحد منهما على الأقل)</span></Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setIdCardImage, 'id_card_image')}
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.id_card_image}
                                    />
                                    {errors.id_card_image && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.id_card_image}</div>}
                                    {child?.id_card_image_url && (
                                        <div className="mt-2">
                                            <a href={child.id_card_image_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                                عرض المرفق الحالي
                                            </a>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">شهادة الميلاد <span className="text-secondary" style={{ fontSize: '0.8rem' }}>(مطلوب واحد منهما على الأقل)</span></Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setBirthCertificateImage, 'birth_certificate_image')}
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.birth_certificate_image}
                                    />
                                    {errors.birth_certificate_image && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.birth_certificate_image}</div>}
                                    {child?.birth_certificate_image_url && (
                                        <div className="mt-2">
                                            <a href={child.birth_certificate_image_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                                عرض المرفق الحالي
                                            </a>
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        {formData.is_university_student && (
                            <Row className="mb-4">
                                <Col md={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-danger">شهادة القيد الجامعي (مطلوب) <span className="text-danger">*</span></Form.Label>
                                        <Form.Control
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, setUniversityCertificateImage, 'university_certificate_image')}
                                            style={{ borderRadius: "10px", border: "1px solid #dc3545" }}
                                            isInvalid={!!errors.university_certificate_image}
                                        />
                                        {errors.university_certificate_image && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.university_certificate_image}</div>}
                                        {child?.university_certificate_image_url && (
                                            <div className="mt-2">
                                                <a href={child.university_certificate_image_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                                    عرض المرفق الحالي
                                                </a>
                                            </div>
                                        )}
                                        <small className="text-muted d-block mt-1">
                                            PDF أو صورة (حد أقصى 5 ميجابايت)
                                        </small>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}


                        <div
                            className="alert p-3 mb-4"
                            style={{
                                backgroundColor: "#e3f2fd",
                                borderRight: "5px solid #2196f3",
                                borderRadius: "10px",
                                fontSize: "0.9rem"
                            }}
                        >
                            <p className="mb-0 text-dark">
                                <strong>ملاحظة:</strong> عند تحديث البيانات، ستنتقل حالة الطلب تلقائياً إلى
                                <span className="text-primary fw-bold"> "انتظار الموافقة" </span>.
                            </p>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button
                                variant="outline-secondary"
                                onClick={handleClose}
                                disabled={updateChildMutation.isPending}
                                style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
                            >
                                إلغاء
                            </Button>
                            <Button
                                variant="teal"
                                type="submit"
                                disabled={updateChildMutation.isPending}
                                style={{
                                    borderRadius: "10px",
                                    fontWeight: "500",
                                    padding: "8px 25px",
                                    backgroundColor: "#016A74",
                                    borderColor: "#016A74",
                                    color: "white"
                                }}
                            >
                                {updateChildMutation.isPending ? <Spinner animation="border" size="sm" /> : "حفظ التعديلات"}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Modal.Body>
        </Modal>
    );
};

export default EditChild;
