import { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner, Card, Badge } from "react-bootstrap";
import { useUpdateEmployeeSpouse, Spouse } from "../hooks/useEmployeeSpouses";
import { toast } from "react-hot-toast";

interface EditWifeProps {
    show: boolean;
    handleClose: () => void;
    spouse: Spouse | null;
}

interface SpouseFormData {
    full_name: string;
    spouse_id_number: string;
    birth_date: string;
    marriage_date: string;
    marital_status: string;
    mobile: string;
    is_working: boolean;
}

const EditWife: React.FC<EditWifeProps> = ({ show, handleClose, spouse }) => {
    const [formData, setFormData] = useState<SpouseFormData>({
        full_name: "",
        spouse_id_number: "",
        birth_date: "",
        marriage_date: "",
        marital_status: "متزوج/متزوجة",
        mobile: "",
        is_working: false,
    });
    const [marriageContract, setMarriageContract] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateSpouseMutation = useUpdateEmployeeSpouse();

    useEffect(() => {
        if (spouse) {
            setFormData({
                full_name: spouse.full_name || "",
                spouse_id_number: spouse.spouse_id_number || "",
                birth_date: spouse.birth_date || "",
                marriage_date: spouse.marriage_date || "",
                marital_status: spouse.approval_status,
                mobile: spouse.mobile || "",
                is_working: spouse.is_working || false,
            });
            if ("marital_status" in spouse) {
                setFormData((prev) => ({ ...prev, marital_status: (spouse as any).marital_status || "متزوج/متزوجة" }));
            }
            setErrors({});
        }
    }, [spouse]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        // 1. ID Number Filtering (digits only, max 9)
        if (name === 'spouse_id_number') {
            const filteredValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        // 2. Name Filtering (no digits)
        if (name === 'full_name') {
            const filteredValue = value.replace(/\d/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        // 3. Phone Number Filtering (digits and one +, max 14)
        if (name === 'mobile') {
            let filteredValue = value.replace(/[^\d+]/g, '');
            if ((filteredValue.match(/\+/g) || []).length > 1) {
                const firstPlus = filteredValue.indexOf('+');
                filteredValue = filteredValue.slice(0, firstPlus + 1) + filteredValue.slice(firstPlus + 1).replace(/\+/g, '');
            }
            filteredValue = filteredValue.slice(0, 14);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB
                setErrors(prev => ({ ...prev, marriage_contract_file: "حجم الملف كبير جداً (الحد الأقصى 10 ميجا بايت)" }));
                setMarriageContract(null);
                e.target.value = ""; // Clear input
                return;
            }
            setErrors(prev => ({ ...prev, marriage_contract_file: "" }));
            setMarriageContract(file);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.full_name) newErrors.full_name = "الاسم الكامل مطلوب";

        if (!formData.spouse_id_number) {
            newErrors.spouse_id_number = "رقم الهوية مطلوب";
        } else if (formData.spouse_id_number.length !== 9) {
            newErrors.spouse_id_number = "رقم الهوية يجب أن يتكون من 9 أرقام بالضبط";
        }

        if (!formData.birth_date) newErrors.birth_date = "تاريخ الميلاد مطلوب";
        if (!formData.marriage_date) newErrors.marriage_date = "تاريخ الزواج مطلوب";

        if (formData.mobile && formData.mobile.length < 10) {
            newErrors.mobile = "رقم الجوال يجب أن لا يقل عن 10 أرقام/رموز";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!spouse) return;
        if (!validate()) {
            toast.error("يرجى تصحيح الأخطاء في الحقول الموضحة");
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value === true ? "1" : value === false ? "0" : String(value));
        });

        if (marriageContract) {
            data.append("marriage_contract_file", marriageContract);
        }

        try {
            await updateSpouseMutation.mutateAsync({ id: spouse.id, formData: data });
            toast.success("تم تحديث البيانات بنجاح وهي قيد المراجعة");
            handleClose();
            setMarriageContract(null);
            setErrors({});
        } catch (err) {
            toast.error("حدث خطأ أثناء تحديث البيانات");
            console.error(err);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            centered
            dir="rtl"
            className="spouse-modal"
        >
            <Modal.Body className="p-0">
                <Card className="p-4 border-0 shadow-sm" style={{ borderRadius: "15px", background: "#fff" }}>
                    <h5 className="mb-4 text-center d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, color: "#016A74" }}>
                        تعديل بيانات زوج/زوجة
                        {spouse?.approval_status === 'pending' ? (
                            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>قيد المراجعة</Badge>
                        ) : (
                            <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>{spouse?.approval_status}</Badge>
                        )}
                    </h5>

                    <Form onSubmit={handleSubmit}>
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
                                    <Form.Label className="fw-bold">رقم الهوية <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="spouse_id_number"
                                        value={formData.spouse_id_number}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.spouse_id_number}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.spouse_id_number}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
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
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">تاريخ الزواج <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="marriage_date"
                                        value={formData.marriage_date}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.marriage_date}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.marriage_date}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">حالة الزواج <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                        name="marital_status"
                                        value={formData.marital_status}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <option value="متزوج/متزوجة">متزوج/متزوجة</option>
                                        <option value="أرمل/أرملة">أرمل/أرملة</option>
                                        <option value="مطلق/مطلقة">مطلق/مطلقة</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">رقم الجوال</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.mobile}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Form.Label htmlFor="edit-is-working" className="mb-0 fw-bold" style={{ cursor: 'pointer' }}>يعمل/تعمل</Form.Label>
                            <Form.Check
                                type="checkbox"
                                id="edit-is-working"
                                name="is_working"
                                checked={formData.is_working}
                                onChange={handleChange}
                            />
                        </div>

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">تحديث مرفق عقد الزواج <small className="text-muted">(اختياري)</small></Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                style={{ borderRadius: "10px" }}
                                isInvalid={!!errors.marriage_contract_file}
                            />
                            <Form.Control.Feedback type="invalid">{errors.marriage_contract_file}</Form.Control.Feedback>
                            {errors.marriage_contract_file && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.marriage_contract_file}</div>}
                            {spouse?.marriage_contract_url && (
                                <div className="mt-2">
                                    <a href={spouse.marriage_contract_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                        عرض المرفق الحالي
                                    </a>
                                </div>
                            )}
                            <Form.Text className="text-muted">
                                اترك هذا الحقل فارغاً إذا لم ترغب بتغيير المرفق الحالي.
                            </Form.Text>
                        </Form.Group>

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
                                disabled={updateSpouseMutation.isPending}
                                style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
                            >
                                إلغاء
                            </Button>
                            <Button
                                variant="teal"
                                type="submit"
                                disabled={updateSpouseMutation.isPending}
                                style={{
                                    borderRadius: "10px",
                                    fontWeight: "500",
                                    padding: "8px 25px",
                                    backgroundColor: "#016A74",
                                    borderColor: "#016A74",
                                    color: "white"
                                }}
                            >
                                {updateSpouseMutation.isPending ? <Spinner animation="border" size="sm" /> : "حفظ التعديلات"}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Modal.Body>
        </Modal>
    );
};

export default EditWife;
