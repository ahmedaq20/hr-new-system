import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { FaUserPlus, FaSave, FaTimes, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-hot-toast';

interface Role {
  id: number;
  name: string;
}

interface UserResponse {
  name: string;
  email: string;
  national_id: string;
  roles: Role[];
}

const UserFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    national_id: "",
    password: "",
    confirmPassword: "",
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rolesRes = await api.get(ENDPOINTS.ADMIN.USERS.ROLES_LIST);
        setRoles(rolesRes.data);

        if (isEdit) {
          const userRes = await api.get(ENDPOINTS.ADMIN.USERS.DETAILS(id));
          const userData = userRes.data as UserResponse;
          setFormData({
            name: userData.name,
            email: userData.email,
            national_id: userData.national_id,
            password: "",
            confirmPassword: "",
          });
          setSelectedRoles(userData.roles.map((r) => r.name));
        }
      } catch (error: unknown) {
        console.error("Error fetching user data:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEdit && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "كلمة المرور غير متطابقة" });
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        email: formData.email,
        national_id: formData.national_id,
        roles: selectedRoles,
        ...(formData.password ? { password: formData.password } : {}),
      };

      if (isEdit) {
        await api.put(ENDPOINTS.ADMIN.USERS.UPDATE(id), data);
        toast.success('تم تحديث المستخدم بنجاح');
      } else {
        await api.post(ENDPOINTS.ADMIN.USERS.CREATE, data);
        toast.success('تمت إضافة المستخدم بنجاح');
      }
      navigate("/users");
    } catch (error: unknown) {
      console.error("Error saving user:", error);

      const axiosError = error as { response?: { data?: { message?: string, errors?: Record<string, string | string[]> } } };

      if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error('حدث خطأ أثناء حفظ بيانات المستخدم');
      }

      if (axiosError.response?.data?.errors) {
        setErrors(axiosError.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">جاري التحميل...</div>;

  return (
    <div className="user-form-page h-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaUserCircle className="text-info fs-3" />
          <h4 className="mb-0 fw-bold" style={{ color: "#014f56" }}>
            {isEdit ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
          </h4>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="info"
            className="text-white d-flex align-items-center gap-2 px-4"
            disabled={saving}
            onClick={handleSubmit}
            style={{ backgroundColor: "#002F6C", border: "none" }}
          >
            <FaSave /> {saving ? "جاري الحفظ..." : "حفظ المستخدم"}
          </Button>
          <Button variant="light" onClick={() => navigate("/users")} className="d-flex align-items-center gap-2">
            <FaTimes /> إلغاء
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {!isEdit && (
          <Col lg={12}>
            <div className="alert border-0 rounded-4 d-flex align-items-start gap-3 p-3 shadow-sm" style={{ backgroundColor: '#fff3cd', borderRight: '4px solid #ffc107' }} role="alert">
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div>
                <strong className="d-block mb-1">تنبيه مهم</strong>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  هذه الصفحة تنشئ <strong>حساب دخول فقط</strong> (مثل: مسؤول، مدير عام).
                  إذا كنت تريد إنشاء موظف يمكنه الوصول لبوابة الموظف وقسيمة الراتب، يجب أولاً إنشاؤه من صفحة
                  <strong> "أضف موظف جديد" </strong>
                  بنفس رقم الهوية.
                </span>
              </div>
            </div>
          </Col>
        )}
        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold">البيانات الأساسية</h5>
              <Row>
                <Col md={12} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold fs-6">الاسم الكامل *</Form.Label>
                    <Form.Control
                      name="name"
                      type="text"
                      placeholder="أدخل الاسم الكامل"
                      className="bg-light border-0 py-2 rounded-3"
                      value={formData.name}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold fs-6">الهوية (اسم المستخدم) *</Form.Label>
                    <Form.Control
                      name="national_id"
                      type="text"
                      placeholder="أدخل رقم الهوية"
                      className="bg-light border-0 py-2 rounded-3"
                      value={formData.national_id}
                      onChange={handleChange}
                      isInvalid={!!errors.national_id}
                    />
                    <Form.Control.Feedback type="invalid">{errors.national_id}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold fs-6">البريد الإلكتروني *</Form.Label>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="example@moe.gov.ps"
                      className="bg-light border-0 py-2 rounded-3"
                      value={formData.email}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                    />
                    <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-bold fs-6">{isEdit ? "تغيير كلمة المرور" : "كلمة المرور *"}</Form.Label>
                    <Form.Control
                      name="password"
                      type="password"
                      placeholder="********"
                      className="bg-light border-0 py-2 rounded-3"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                {!isEdit && (
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-bold fs-6">تأكيد كلمة المرور *</Form.Label>
                      <Form.Control
                        name="confirmPassword"
                        type="password"
                        placeholder="********"
                        className="bg-light border-0 py-2 rounded-3"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <FaShieldAlt className="text-info" />
                <h5 className="mb-0 fw-bold">الأدوار والصلاحيات</h5>
              </div>

              <div className="d-flex flex-row flex-wrap gap-3">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className={`p-3 rounded-4 border transition-all ${selectedRoles.includes(role.name) ? 'bg-info bg-opacity-10 border-info border-opacity-25' : 'bg-light border-transparent'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRoleToggle(role.name)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <Form.Check
                        type="checkbox"
                        checked={selectedRoles.includes(role.name)}
                        onChange={() => { }}
                        id={`role-${role.id}`}
                      />
                      <label htmlFor={`role-${role.id}`} className="mb-0 fw-bold flex-grow-1" style={{ cursor: 'pointer' }}>
                        {role.name === 'admin' ? 'مدير نظام (Admin)' :
                          role.name === 'employee' ? 'موظف (Employee)' :
                            role.name === 'officer' ? 'مسؤول (Officer)' :
                              role.name === 'director' ? 'مدير عام (Director)' :
                              role.name === 'super admin' ? 'مدير أعلى (Super Admin)' : role.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-light rounded-4">
                <small className="text-muted">
                  <FaUserPlus className="me-2" />
                  سيتم منح المستخدم كافة الصلاحيات المرتبطة بالأدوار المختارة أعلاه.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .rounded-4 { border-radius: 1rem !important; }
        .transition-all { transition: all 0.2s ease; }
        .bg-info.bg-opacity-10 { background-color: rgba(0, 188, 212, 0.1) !important; }
        .border-transparent { border-color: transparent !important; }
      `}</style>
    </div>
  );
};

export default UserFormPage;
