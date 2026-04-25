import { useState } from "react";
import { Modal, Form, Button, Row, Col, Alert, Spinner, Card } from "react-bootstrap";
import { useAddEmployeeSpouse } from "../hooks/useEmployeeSpouses";
import { toast } from "react-hot-toast";

interface AddWifeModalProps {
  show: boolean;
  handleClose: () => void;
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

const AddWifeModal: React.FC<AddWifeModalProps> = ({ show, handleClose }) => {
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

  const addSpouseMutation = useAddEmployeeSpouse();

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

    if (!marriageContract) {
      newErrors.marriage_contract_file = "مرفق عقد الزواج مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await addSpouseMutation.mutateAsync(data);
      toast.success("تم إرسال الطلب بنجاح وهو قيد المراجعة");
      handleClose();
      // Reset form
      setFormData({
        full_name: "",
        spouse_id_number: "",
        birth_date: "",
        marriage_date: "",
        marital_status: "متزوج/متزوجة",
        mobile: "",
        is_working: false,
      });
      setMarriageContract(null);
      setErrors({});
    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال البيانات");
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
          <h5 className="mb-4 text-center" style={{ fontWeight: 600, color: "#016A74" }}>
            إضافة زوج/زوجة جديدة
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
                    placeholder="أدخل الاسم الكامل"
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
                    placeholder="أدخل رقم الهوية"
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
                  />
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
                  />
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
                    placeholder="أدخل رقم الجوال"
                    isInvalid={!!errors.mobile}
                  />
                  <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex align-items-center gap-2 mb-4">
              <Form.Label htmlFor="is-working" className="mb-0 fw-bold" style={{ cursor: 'pointer' }}>يعمل/تعمل</Form.Label>
              <Form.Check
                type="checkbox"
                id="is-working"
                name="is_working"
                checked={formData.is_working}
                onChange={handleChange}
              />
            </div>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">مرفق عقد الزواج <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                style={{ borderRadius: "10px" }}
                required
                isInvalid={!!errors.marriage_contract_file}
              />
              {errors.marriage_contract_file && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.marriage_contract_file}</div>}
              <Form.Text className="text-muted">
                يرجى رفع نسخة واضحة من عقد الزواج (PDF أو صورة).
              </Form.Text>
            </Form.Group>

            <div
              className="alert p-3 mb-4"
              style={{
                backgroundColor: "#fff8e1",
                borderRight: "5px solid #ffc107",
                borderRadius: "10px",
                fontSize: "0.9rem"
              }}
            >
              <p className="mb-0 text-dark">
                <strong>ملاحظة:</strong> البيانات المضافة ستكون في حالة
                <span className="text-warning fw-bold"> "انتظار الموافقة" </span>
                حتى يتم اعتمادها من قبل قسم الشؤون الإدارية.
              </p>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={handleClose}
                disabled={addSpouseMutation.isPending}
                style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}
              >
                إلغاء
              </Button>
              <Button
                variant="teal"
                type="submit"
                disabled={addSpouseMutation.isPending}
                style={{
                  borderRadius: "10px",
                  fontWeight: "500",
                  padding: "8px 25px",
                  backgroundColor: "#016A74",
                  borderColor: "#016A74",
                  color: "white"
                }}
              >
                {addSpouseMutation.isPending ? <Spinner animation="border" size="sm" /> : "إرسال الطلب"}
              </Button>
            </div>
          </Form>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default AddWifeModal;
