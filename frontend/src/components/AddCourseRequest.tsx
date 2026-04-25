import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAddCourseRequest } from "../hooks/useAddCourseRequest";

interface AddCourseRequestProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const AddCourseRequest: React.FC<AddCourseRequestProps> = ({ onSuccess, onCancel }) => {
    const [courseName, setCourseName] = useState<string>("");
    const [institution, setInstitution] = useState<string>("");
    const [hours, setHours] = useState<string>("");
    const [courseDate, setCourseDate] = useState<Date | null>(null);
    const [notes, setNotes] = useState<string>("");
    const [attachment, setAttachment] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const addRequestMutation = useAddCourseRequest();

    const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/\d/g, '');
        setCourseName(filteredValue);
        if (errors.course_name) setErrors(prev => ({ ...prev, course_name: "" }));
    };

    const handleInstitutionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filteredValue = e.target.value.replace(/\d/g, '');
        setInstitution(filteredValue);
        if (errors.institution) setErrors(prev => ({ ...prev, institution: "" }));
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

        if (!courseName) newErrors.course_name = "اسم الدورة مطلوب";
        if (!institution) newErrors.institution = "المؤسسة المانحة مطلوبة";
        if (!hours) newErrors.hours = "عدد الساعات مطلوب";
        if (!courseDate) newErrors.course_date = "تاريخ الدورة مطلوب";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const formData = new FormData();
        formData.append("manual_course_name", courseName);
        formData.append("manual_institution", institution);
        formData.append("course_hours", hours);

        // Format date as MM/YYYY
        if (courseDate) {
            const month = (courseDate.getMonth() + 1).toString().padStart(2, '0');
            const year = courseDate.getFullYear();
            formData.append("course_date", `${month}/${year}`);
        } else {
            formData.append("course_date", "");
        }

        formData.append("notes", notes);
        if (attachment) {
            formData.append("certificate_attachment", attachment);
        }

        try {
            await addRequestMutation.mutateAsync({
                data: formData,
            });
            if (onSuccess) onSuccess();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            // Error handled by mutation
        }
    };

    return (
        <Card
            className="p-4 border-0 shadow-sm"
            style={{ borderRadius: "15px", background: "#fff" }}
            dir="rtl"
        >
            <h5 className="mb-4 text-center" style={{ fontWeight: 600, color: "#016A74" }}>
                إضافة دورة تدريبية خارجية
            </h5>

            <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">اسم الدورة <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="أدخل اسم الدورة"
                            value={courseName}
                            onChange={handleCourseNameChange}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.course_name}
                        />
                        <Form.Control.Feedback type="invalid">{errors.course_name}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-bold">المؤسسة المانحة <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="أدخل اسم المركز أو المؤسسة"
                            value={institution}
                            onChange={handleInstitutionChange}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.institution}
                        />
                        <Form.Control.Feedback type="invalid">{errors.institution}</Form.Control.Feedback>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">عدد الساعات <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="عدد ساعات التدريب"
                            value={hours}
                            onChange={(e) => {
                                setHours(e.target.value);
                                if (errors.hours) setErrors(prev => ({ ...prev, hours: "" }));
                            }}
                            required
                            style={{ borderRadius: "10px" }}
                            isInvalid={!!errors.hours}
                        />
                        <Form.Control.Feedback type="invalid">{errors.hours}</Form.Control.Feedback>
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-bold">تاريخ الدورة (شهر/سنة) <span className="text-danger">*</span></Form.Label>
                        <DatePicker
                            selected={courseDate}
                            onChange={(date: Date | null) => {
                                setCourseDate(date);
                                if (errors.course_date) setErrors(prev => ({ ...prev, course_date: "" }));
                            }}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            className={`form-control ${errors.course_date ? 'is-invalid' : ''}`}
                            placeholderText="اختر الشهر والسنة"
                            required
                        />
                        {errors.course_date && <div className="invalid-feedback d-block">{errors.course_date}</div>}
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
                    <Form.Label className="fw-bold">إرفاق الشهادة (اختياري)</Form.Label>
                    <Form.Control
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ borderRadius: "10px" }}
                        isInvalid={!!errors.certificate_attachment}
                    />
                    {errors.certificate_attachment && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.certificate_attachment}</div>}
                    <Form.Text className="text-muted">
                        يرجى رفع نسخة واضحة من الدورة التدريبية إن وجدت (حد أقصى 10 ميجابايت).
                    </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                        variant="outline-secondary"
                        onClick={onCancel}
                        disabled={addRequestMutation.isPending}
                        style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="teal"
                        type="submit"
                        disabled={addRequestMutation.isPending}
                        style={{
                            borderRadius: "10px",
                            fontWeight: "500",
                            padding: "8px 25px",
                            backgroundColor: "#016A74",
                            borderColor: "#016A74",
                            color: "white"
                        }}
                    >
                        {addRequestMutation.isPending ? <Spinner animation="border" size="sm" /> : "حفظ الدورة"}
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default AddCourseRequest;
