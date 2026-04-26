import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner, Card, Badge } from 'react-bootstrap';
import { useUpdateEmployeeDependent, Dependent } from '../hooks/useEmployeeDependents';
import { toast } from 'react-hot-toast';

interface EditDependentProps {
    show: boolean;
    handleClose: () => void;
    dependent: Dependent | null;
}

const EditDependent: React.FC<EditDependentProps> = ({ show, handleClose, dependent }) => {
    const updateMutation = useUpdateEmployeeDependent();
    const [formData, setFormData] = useState({
        full_name: '',
        dependent_id_number: '',
        birth_date: '',
        mobile: '',
        relationship: '',
        gender: 'ذكر',
        address: '',
        notes: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (dependent) {
            setFormData({
                full_name: dependent.full_name || '',
                dependent_id_number: dependent.dependent_id_number || '',
                birth_date: dependent.birth_date || '',
                mobile: dependent.mobile || '',
                relationship: dependent.relationship || '',
                gender: dependent.gender || 'ذكر',
                address: dependent.address || '',
                notes: dependent.notes || ''
            });
            setErrors({});
        }
    }, [dependent]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // 1. ID Number Filtering (digits only, max 9)
        if (name === 'dependent_id_number') {
            const filteredValue = value.replace(/\D/g, '').slice(0, 9);
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        // 2. Name & Relationship Filtering (no digits)
        if (name === 'full_name' || name === 'relationship') {
            const filteredValue = value.replace(/\d/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        // 3. Mobile Filtering
        if (name === 'mobile') {
            let filteredValue = value.replace(/[^\d+]/g, '');
            const plusIndex = filteredValue.indexOf('+');
            if (plusIndex !== -1) {
                filteredValue = '+' + filteredValue.replace(/\+/g, '');
            }
            filteredValue = filteredValue.slice(0, 14);
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files ? e.target.files[0] : null;
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
                setErrors(prev => ({ ...prev, dependency_proof_file: "حجم الملف كبير جداً (الحد الأقصى 10 ميجا بايت)" }));
                setFile(null);
                e.target.value = "";
                return;
            }
            setErrors(prev => ({ ...prev, dependency_proof_file: "" }));
            setFile(selectedFile);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.full_name) newErrors.full_name = "اسم المعال مطلوب";

        if (!formData.dependent_id_number) {
            newErrors.dependent_id_number = "رقم الهوية مطلوب";
        } else if (formData.dependent_id_number.length !== 9) {
            newErrors.dependent_id_number = "رقم الهوية يجب أن يكون 9 أرقام";
        }

        if (!formData.birth_date) newErrors.birth_date = "تاريخ الميلاد مطلوب";

        if (formData.mobile && (formData.mobile.length < 10 || formData.mobile.length > 14)) {
            newErrors.mobile = "رقم الجوال يجب أن يكون بين 10 و 14 حرفاً";
        }

        if (!formData.relationship) newErrors.relationship = "صلة القرابة مطلوبة";
        if (!formData.address) newErrors.address = "العنوان مطلوب";

        if (!file && !dependent?.dependency_proof_url) {
            newErrors.dependency_proof_file = "حجة الإعالة مطلوبة";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!dependent) return;
        if (!validate()) {
            toast.error("يرجى تصحيح الأخطاء في الحقول الموضحة");
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (file) {
            data.append('dependency_proof_file', file);
        }

        try {
            await updateMutation.mutateAsync({ id: dependent.id, formData: data });
            toast.success('تم تحديث البيانات بنجاح، وهي قيد الانتظار للموافقة');
            setFile(null);
            setErrors({});
            handleClose();
        } catch (error) {
            toast.error('حدث خطأ أثناء تحديث البيانات');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered dir="rtl" className="dependent-modal">
            <Modal.Body className="p-0">
                <Card className="p-4 border-0 shadow-sm" style={{ borderRadius: "15px", background: "#fff" }}>
                    <h5 className="mb-4 text-center d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 600, color: "#016A74" }}>
                        تعديل بيانات المعال
                        {dependent?.approval_status === 'pending' ? (
                            <Badge bg="warning-subtle" className="text-warning border border-warning-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>قيد المراجعة</Badge>
                        ) : (
                            <Badge bg="secondary-subtle" className="text-secondary border border-secondary-subtle px-2 py-1 fw-normal" style={{ fontSize: '0.8rem' }}>{dependent?.approval_status}</Badge>
                        )}
                    </h5>

                    <Form onSubmit={handleSubmit}>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">اسم المعال الرباعي <span className="text-danger">*</span></Form.Label>
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
                                    <Form.Label className="fw-bold">هوية المعال <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="dependent_id_number"
                                        value={formData.dependent_id_number}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.dependent_id_number}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.dependent_id_number}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">تاريخ ميلاد المعال <span className="text-danger">*</span></Form.Label>
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

                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-bold">صلة القرابة <span className="text-danger">*</span></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleChange}
                                        required
                                        style={{ borderRadius: "10px" }}
                                        isInvalid={!!errors.relationship}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.relationship}</Form.Control.Feedback>
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

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">السكن/العنوان <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                style={{ borderRadius: "10px" }}
                                isInvalid={!!errors.address}
                            />
                            <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                        </Form.Group>

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

                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">مرفقات (حجة الاعالة) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.jpeg,.png"
                                style={{ borderRadius: "10px" }}
                                isInvalid={!!errors.dependency_proof_file}
                            />
                            {errors.dependency_proof_file && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.dependency_proof_file}</div>}
                            {dependent?.dependency_proof_url && (
                                <div className="mt-2">
                                    <a href={dependent.dependency_proof_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-info" style={{ borderRadius: "8px" }}>
                                        عرض المرفق الحالي
                                    </a>
                                </div>
                            )}
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
                                disabled={updateMutation.isPending}
                                style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
                            >
                                إلغاء
                            </Button>
                            <Button
                                variant="teal"
                                type="submit"
                                disabled={updateMutation.isPending}
                                style={{
                                    borderRadius: "10px",
                                    fontWeight: "500",
                                    padding: "8px 25px",
                                    backgroundColor: "#016A74",
                                    borderColor: "#016A74",
                                    color: "white"
                                }}
                            >
                                {updateMutation.isPending ? <Spinner animation="border" size="sm" /> : "حفظ التعديلات"}
                            </Button>
                        </div>
                    </Form>
                </Card>
            </Modal.Body>
        </Modal>
    );
};

export default EditDependent;
