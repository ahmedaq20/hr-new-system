import React, { useState, useEffect } from "react";
import { Card, Form, Button, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";
import { useUpdateEmployeeDegree } from "../hooks/useEmployeeDegrees";

interface EditEduCertificateProps {
    degree: any | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const EditEduCertificate: React.FC<EditEduCertificateProps> = ({ degree, onSuccess, onCancel }) => {
    const { data: lookups, isLoading: lookupsLoading } = useLookups();
    const updateDegreeMutation = useUpdateEmployeeDegree();

    const [qualificationId, setQualificationId] = useState<string>("");
    const [majorName, setMajorName] = useState<string>("");
    const [universityName, setUniversityName] = useState<string>("");
    const [graduationYear, setGraduationYear] = useState<string>("");
    const [grade, setGrade] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (degree) {
            setQualificationId(degree.qualification_id?.toString() || "");
            setMajorName(degree.major_name || "");
            setUniversityName(degree.university_name || "");
            setGraduationYear(degree.graduation_year?.toString() || "");
            setGrade(degree.grade || "");
            setNotes(degree.notes || "");
            setAttachment(null);
            setErrors({});
        }
    }, [degree]);

    if (!degree) return null;

    const handleMajorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/\d/g, '');
        setMajorName(filteredValue);
        if (errors.major_name) setErrors(prev => ({ ...prev, major_name: "" }));
    };

    const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/\d/g, '');
        setUniversityName(filteredValue);
        if (errors.university_name) setErrors(prev => ({ ...prev, university_name: "" }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                setErrors(prev => ({ ...prev, certificate_attachment: "حجم الملف كبير جداً (الحد الأقصى 10 ميجا بايت)" }));
                setAttachment(null);
                e.target.value = "";
                return;
            }
            setErrors(prev => ({ ...prev, certificate_attachment: "" }));
            setAttachment(selectedFile);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!qualificationId) newErrors.qualification_id = "الدرجة العلمية مطلوبة";
        if (!majorName) newErrors.major_name = "التخصص مطلوب";
        if (!universityName) newErrors.university_name = "الجامعة/المؤسسة التعليمية مطلوبة";
        if (!graduationYear) newErrors.graduation_year = "سنة التخرج مطلوبة";
        if (!grade) newErrors.grade = "التقدير/المعدل مطلوب";

        if (!attachment && !degree?.certificate_url) {
            newErrors.certificate_attachment = "مرفق الشهادة مطلوب";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const formData = new FormData();
        formData.append("qualification_id", qualificationId);
        formData.append("major_name", majorName);
        formData.append("university_name", universityName);
        formData.append("graduation_year", graduationYear);
        formData.append("grade", grade);
        formData.append("notes", notes);
        if (attachment) {
            formData.append("certificate_attachment", attachment);
        }

        try {
            await updateDegreeMutation.mutateAsync({ id: degree.id, data: formData });
            if (onSuccess) onSuccess();
        } catch (err) {
            // Error handled by mutation
        }
    };

    const qualificationOptions = (lookups?.CERTIFICATE || [])
        .map((item: any) => ({
            value: item.id.toString(),
            label: item.value,
        }));

    const selectedQualification = qualificationOptions.find((opt: any) => String(opt.value) === String(qualificationId)) || null;

    return (
        <Card
            className="p-4 border-0 shadow-sm"
            style={{ borderRadius: "15px", background: "#fff" }}
            dir="rtl"
        >
            <h5 className="mb-4 text-center d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, color: "#016A74" }}>
                تعديل الشهادة التعليمية
                {degree.approval_status === 'pending' ? (
                    <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>قيد المراجعة</Badge>
                ) : (
                    <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>{degree.approval_status}</Badge>
                )}
            </h5>

            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">الدرجة العلمية <span className="text-danger">*</span></Form.Label>
                        {lookupsLoading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <CSelect
                                options={qualificationOptions}
                                value={selectedQualification}
                                onChange={(opt: any) => {
                                    setQualificationId(opt ? opt.value : "");
                                    if (errors.qualification_id) setErrors(prev => ({ ...prev, qualification_id: "" }));
                                }}
                                placeholder="اختر الدرجة العلمية"
                                isLoading={lookupsLoading}
                            />
                        )}
                        {errors.qualification_id && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.qualification_id}</div>}
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-bold">التخصص <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="مثال: هندسة برمجيات"
                            value={majorName}
                            onChange={handleMajorChange}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.major_name}
                        />
                        <Form.Control.Feedback type="invalid">{errors.major_name}</Form.Control.Feedback>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">الجامعة / المؤسسة التعليمية و الدولة <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="أدخل اسم الجامعة - الدولة"
                            value={universityName}
                            onChange={handleUniversityChange}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.university_name}
                        />
                        <Form.Control.Feedback type="invalid">{errors.university_name}</Form.Control.Feedback>
                    </Col>
                    <Col md={3}>
                        <Form.Label className="fw-bold">سنة التخرج <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="YYYY"
                            value={graduationYear}
                            onChange={(e) => {
                                setGraduationYear(e.target.value);
                                if (errors.graduation_year) setErrors(prev => ({ ...prev, graduation_year: "" }));
                            }}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.graduation_year}
                        />
                        <Form.Control.Feedback type="invalid">{errors.graduation_year}</Form.Control.Feedback>
                    </Col>

                    <Col md={3}>
                        <Form.Label className="fw-bold">التقدير / المعدل <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="امتياز، جيد جداً..."
                            value={grade}
                            onChange={(e) => {
                                setGrade(e.target.value);
                                if (errors.grade) setErrors(prev => ({ ...prev, grade: "" }));
                            }}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.grade}
                        />
                        <Form.Control.Feedback type="invalid">{errors.grade}</Form.Control.Feedback>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">ملاحظات</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="أدخل أي ملاحظات إضافية"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ borderRadius: "10px" }}
                    />
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">تحديث المرفق <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ borderRadius: "10px" }}
                        isInvalid={!!errors.certificate_attachment}
                    />
                    {errors.certificate_attachment && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.certificate_attachment}</div>}
                    {degree?.certificate_url && (
                        <div className="mt-2">
                            <a href={degree.certificate_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                عرض المرفق الحالي
                            </a>
                        </div>
                    )}
                    <Form.Text className="text-muted">
                        اترك هذا الحقل فارغاً إذا لم ترغب بتغيير المرفق الحالي.
                    </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                        variant="outline-secondary"
                        onClick={onCancel}
                        disabled={updateDegreeMutation.isPending}
                        style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="teal"
                        type="submit"
                        disabled={updateDegreeMutation.isPending}
                        style={{
                            borderRadius: "10px",
                            fontWeight: "500",
                            padding: "8px 25px",
                            backgroundColor: "#016A74",
                            borderColor: "#016A74",
                            color: "white"
                        }}
                    >
                        {updateDegreeMutation.isPending ? <Spinner animation="border" size="sm" /> : "حفظ التعديلات"}
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default EditEduCertificate;
