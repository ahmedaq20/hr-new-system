import React from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import { FaInfoCircle, FaEdit, FaSave, FaTimes, FaClock, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaCalendarAlt, FaIdCard, FaBuilding, FaShieldAlt, FaCamera, FaExclamationTriangle } from 'react-icons/fa';
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { toast } from "react-hot-toast";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";
import { useLocation } from "react-router-dom";
import RejectionReasonModal from "./RejectionReasonModal";
import UserAvatar from "./UserAvatar";

const InfoTile = ({
  label,
  value,
  name,
  isEditable,
  type = "text",
  options = [],
  lookupKey = null,
  icon: Icon = FaInfoCircle,
  xl = 3,
  lg = 4,
  md = 6,
  sm = 6,
  xs = 12,
  isEditing,
  formData,
  handleInputChange,
  handleSelectChange,
  lookups,
  error
}) => {
  const isHighlight = isEditing && isEditable;
  const hasError = isEditing && error;

  return (
    <Col xl={xl} lg={lg} md={md} sm={sm} xs={xs}>
      <Card
        className={`h-100 border-0 shadow-sm transition-all hover-shadow ${isHighlight ? 'editable-highlight animate-pulse-subtle' : ''} ${hasError ? 'border-danger' : ''}`}
        style={{ borderRadius: '15px', ...(hasError && { border: '1.5px solid #dc3545 !important' }) }}
      >
        <Card.Body className="p-3 d-flex flex-column justify-content-center" style={{ minHeight: '90px' }}>
          <div className="d-flex align-items-center gap-2 mb-1">
            <div className={`p-1 rounded shadow-xs ${isHighlight ? 'bg-white' : 'bg-light'}`}>
              <Icon className="text-teal" size={12} style={{ color: '#016A74' }} />
            </div>
            <div className={`${isHighlight ? 'text-teal fw-bold' : 'text-muted fw-bold'} small`} style={{ fontSize: '0.75rem', ...(isHighlight && { color: '#016A74' }) }}>{label}</div>
          </div>

          {isEditing && isEditable ? (
            type === "select" ? (
              <CSelect
                options={lookupKey ? lookups?.[lookupKey]?.map(o => ({ value: o.id, label: o.value })) : options.map(o => (typeof o === 'string' ? { value: o, label: o } : o))}
                value={
                  lookupKey
                    ? lookups?.[lookupKey]?.map(o => ({ value: o.id, label: o.value })).find(o => String(o.value) === String(formData[name]))
                    : options.map(o => (typeof o === 'string' ? { value: o, label: o } : o)).find(o => String(o.value) === String(formData[name]))
                }
                onChange={(opt) => handleSelectChange(name, opt)}
                placeholder="اختر..."
                className="mt-1"
              />
            ) : (
              <Form.Control
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                size="sm"
                className="mt-1 border fw-bold"
                style={{
                  fontSize: '0.9rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  borderColor: hasError ? '#dc3545' : '#e2e8f0'
                }}
                isInvalid={!!hasError}
              />
            )
          ) : (
            <div className="fw-bold text-dark mt-1 overflow-hidden text-nowrap text-truncate" style={{ fontSize: '0.95rem', color: '#1f2937' }}>
              {value || "---"}
            </div>
          )}
          {hasError && (
            <Form.Control.Feedback type="invalid" className="d-block mt-1 fw-normal" style={{ fontSize: '0.7rem' }}>
              {error}
            </Form.Control.Feedback>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

const genderMap = {
  male: "ذكر",
  female: "أنثى"
};

const maritalStatusMap = {
  single: "أعزب/عزباء",
  married: "متزوج/متزوجة",
  divorced: "مطلق/مطلقة",
  widowed: "أرمل/أرملة"
};

const genderOptions = [
  { value: "male", label: "ذكر" },
  { value: "female", label: "أنثى" }
];

const maritalStatusOptions = [
  { value: "single", label: "أعزب/عزباء" },
  { value: "married", label: "متزوج/متزوجة" },
  { value: "divorced", label: "مطلق/مطلقة" },
  { value: "widowed", label: "أرمل/أرملة" }
];

const Profile = ({ data }) => {
  const personal = data?.personal_info;
  const pendingUpdate = data?.pending_profile_update;
  const queryClient = useQueryClient();
  const { data: lookups } = useLookups();
  const location = useLocation();

  const [isEditing, setIsEditing] = React.useState(false);

  // Trigger edit mode from navigation state
  React.useEffect(() => {
    if (location.state?.triggerEdit && !pendingUpdate) {
      setIsEditing(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, pendingUpdate]);

  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    primary_phone: personal?.phone || "",
    secondary_phone: personal?.secondary_phone || "",
    address: personal?.address || "",
    marital_status: personal?.marital_status || "",
    gender: personal?.gender || "",
    email: personal?.email || "",
    governorate_id: personal?.governorate_id || "",
    city_id: personal?.city_id || "",
  });

  const [errors, setErrors] = React.useState({});

  const [showRejectionModal, setShowRejectionModal] = React.useState(false);

  React.useEffect(() => {
    if (!isEditing) {
      setFormData({
        primary_phone: personal?.phone || "",
        secondary_phone: personal?.secondary_phone || "",
        address: personal?.address || "",
        marital_status: personal?.marital_status || "",
        gender: personal?.gender || "",
        email: personal?.email || "",
        governorate_id: personal?.governorate_id || "",
        city_id: personal?.city_id || "",
      });
      setErrors({});
    }
  }, [personal, isEditing]);

  // Password Update State
  const [passwordData, setPasswordData] = React.useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
      toast.error("يرجى ملء جميع حقول كلمة المرور");
      return;
    }
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("كلمة المرور الجديدة يجب أن لا تقل عن 8 أحرف");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post(ENDPOINTS.EMPLOYEE.UPDATE_PASSWORD, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirmation: passwordData.new_password_confirmation,
      });
      toast.success("تم تحديث كلمة المرور بنجاح");
      setPasswordData({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تحديث كلمة المرور");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 1. Phone number validation (digits and + only, max 14, only one +)
    if (name === 'primary_phone' || name === 'secondary_phone') {
      let filteredValue = value.replace(/[^\d+]/g, '');
      // Ensure at most one '+'
      if ((filteredValue.match(/\+/g) || []).length > 1) {
        // Keep only first '+' and digits
        const firstPlus = filteredValue.indexOf('+');
        filteredValue = filteredValue.slice(0, firstPlus + 1) + filteredValue.slice(firstPlus + 1).replace(/\+/g, '');
      }
      filteredValue = filteredValue.slice(0, 14);
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
      // Clear error as user types
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
      return;
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'governorate_id') newData.city_id = "";
      return newData;
    });

    // Clear error as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSelectChange = (name, option) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: option ? option.value : "" };
      if (name === 'governorate_id') newData.city_id = "";
      return newData;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmitRequest = async () => {
    // 1. Calculate the changed fields
    const changedFields = {};

    const originalData = {
      primary_phone: personal?.phone || "",
      secondary_phone: personal?.secondary_phone || "",
      address: personal?.address || "",
      marital_status: personal?.marital_status || "",
      gender: personal?.gender || "",
      email: personal?.email || "",
      governorate_id: personal?.governorate_id || "",
      city_id: personal?.city_id || "",
    };

    Object.keys(formData).forEach(key => {
      // Compare as strings to avoid type mismatch issues (e.g., number vs string IDs)
      if (String(formData[key]) !== String(originalData[key])) {
        changedFields[key] = formData[key];
      }
    });

    // 1.5 Frontend Validation
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Primary Phone is required
    if (!formData.primary_phone || formData.primary_phone.trim() === "") {
      newErrors.primary_phone = "رقم الجوال الأساسي مطلوب";
    } else if (formData.primary_phone.length < 10) {
      newErrors.primary_phone = "رقم الجوال يجب أن لا يقل عن 10 أرقام/رموز";
    }

    // Secondary Phone is optional but must be 10 digits if provided
    if (formData.secondary_phone && formData.secondary_phone.length < 10) {
      newErrors.secondary_phone = "رقم الجوال البديل يجب أن لا يقل عن 10 أرقام/رموز";
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('يرجى تصحيح الأخطاء في الحقول الموضحة.');
      return;
    }

    // 2. Abort if no changes
    if (Object.keys(changedFields).length === 0) {
      toast.error('لم تقم بإجراء أي تعديلات على البيانات.');
      return;
    }

    setLoading(true);
    try {
      // 3. Send only the changed fields
      await api.post(ENDPOINTS.EMPLOYEE.PROFILE_UPDATE_REQUEST, { requested_changes: changedFields });
      toast.success('تم إرسال طلب التحديث بنجاح، بانتظار موافقة الإدارة.');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = React.useMemo(() => {
    if (!lookups?.CITY || !formData.governorate_id) return [];
    return lookups.CITY
      .filter(city => String(city.governorate_id) === String(formData.governorate_id))
      .map(c => ({ value: c.id, label: c.value }));
  }, [lookups, formData.governorate_id]);

  const tileProps = {
    isEditing,
    formData,
    handleInputChange,
    handleSelectChange,
    lookups,
    errors
  };

  const isRejected = pendingUpdate?.status === 'rejected';

  return (
    <div dir="rtl" className="animate-fade-in pb-5">
      {isRejected && (
        <Alert variant="danger" className="border-0 shadow-sm mb-3 mt-3 d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3" style={{ borderRadius: '15px' }}>
          <div className="d-flex align-items-center gap-3 w-100">
            <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', flexShrink: 0 }}>
              <FaExclamationTriangle size={16} />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1 fw-bold text-danger">تم رفض طلب تحديث البيانات</h6>
              <p className="mb-0 small text-danger-emphasis">يمكنك الاطلاع على السبب وتعديل البيانات ثم إعادة الإرسال.</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="rounded-pill px-4 py-2 fw-bold ms-md-auto mt-2 mt-md-0 col-12 col-md-3"
            onClick={() => setShowRejectionModal(true)}
          >
            عرض السبب
          </Button>
        </Alert>
      )}
      <style>{`
        .transition-all { transition: all 0.3s ease; }
        .hover-shadow:hover { 
          transform: translateY(-2px);
          box-shadow: 0 .4rem .8rem rgba(0,0,0,.05)!important;
        }
        .form-control:focus {
          box-shadow: 0 0 0 2px rgba(1, 106, 116, 0.1)!important;
          background-color: white!important;
          border-color: #016A74!important;
        }
        .editable-highlight {
          border: 1.5px solid #016A74 !important;
          background-color: #f8fdfe !important;
          box-shadow: 0 0.5rem 1rem rgba(1, 106, 116, 0.08) !important;
        }
        @keyframes pulse-subtle {
          0% { transform: scale(1); }
          50% { transform: scale(1.005); }
          100% { transform: scale(1); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>

      {/* Profile Info Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mt-3 mb-3 bg-white p-3 shadow-sm gap-3" style={{ borderRadius: '15px' }}>
        <div className="d-flex align-items-center gap-3">
          <div style={{ width: '4px', height: '24px', backgroundColor: '#016A74', borderRadius: '2px' }}></div>
          <h5 className="fw-bold mb-0 text-dark text-nowrap">المعلومات الشخصية</h5>
        </div>

        <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-start justify-content-md-end">
          {isEditing ? (
            <>
              <Button variant="success" size="sm" className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm" onClick={handleSubmitRequest} disabled={loading} style={{ borderRadius: '10px' }}>
                {loading ? <Spinner animation="border" size="sm" /> : <FaSave />} حفظ التغييرات
              </Button>
              <Button variant="light" size="sm" className="d-flex align-items-center gap-2 px-3 py-2 border shadow-sm" onClick={() => setIsEditing(false)} disabled={loading} style={{ borderRadius: '10px' }}>
                <FaTimes /> إلغاء
              </Button>
            </>
          ) : (
            <>
              {pendingUpdate && (
                <div className={`badge ${isRejected ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-warning-subtle text-warning border-warning-subtle'} d-flex align-items-center gap-2 p-2 px-3`} style={{ borderRadius: '10px', fontSize: '0.85rem' }}>
                  {isRejected ? <FaTimes /> : <FaClock />}
                  {isRejected ? "طلب التحديث مرفوض" : "طلب تحديث معلق بانتظار المراجعة"}
                </div>
              )}
              {(!pendingUpdate || isRejected) && (
                <Button
                  variant="teal"
                  size="sm"
                  className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                  onClick={() => setIsEditing(true)}
                  style={{ borderRadius: '10px', backgroundColor: '#016A74', border: 'none', color: 'white' }}
                >
                  <FaEdit /> {isRejected ? "تعديل وإعادة إرسال" : "تعديل البيانات"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Row className="g-3">
        {/* Row 1 */}
        <InfoTile label="إسم الموظف الكامل" value={personal?.full_name} isEditable={false} icon={FaUser} {...tileProps} />
        <InfoTile label="رقم الهوية الوطنية" value={personal?.national_id} isEditable={false} icon={FaIdCard} {...tileProps} />
        <InfoTile label="الرقم الوظيفي" value={personal?.employee_number} isEditable={false} icon={FaBuilding} {...tileProps} />
        <InfoTile label="تاريخ الميلاد" value={personal?.birth_date} isEditable={false} icon={FaCalendarAlt} {...tileProps} />

        {/* Row 2 */}
        <InfoTile label="الجنس" value={isEditing ? formData.gender : genderMap[personal?.gender] || personal?.gender} name="gender" isEditable={true} type="select" options={genderOptions} error={errors.gender} icon={FaUser} {...tileProps} />
        <InfoTile label="الحالة الإجتماعية" value={isEditing ? formData.marital_status : maritalStatusMap[personal?.marital_status] || personal?.marital_status} name="marital_status" isEditable={true} type="select" options={maritalStatusOptions} error={errors.marital_status} icon={FaUser} {...tileProps} />
        <InfoTile label="رقم الجوال الأساسي" value={isEditing ? formData.primary_phone : personal?.phone} name="primary_phone" isEditable={true} error={errors.primary_phone} icon={FaPhone} {...tileProps} />
        <InfoTile label="رقم الجوال البديل" value={isEditing ? formData.secondary_phone : personal?.secondary_phone} name="secondary_phone" isEditable={true} error={errors.secondary_phone} icon={FaPhone} {...tileProps} />

        {/* Row 3 */}
        <InfoTile label="البريد الإلكتروني" value={isEditing ? formData.email : personal?.email} name="email" isEditable={true} type="email" error={errors.email} icon={FaEnvelope} {...tileProps} />
        <InfoTile label="تاريخ التعيين" value={personal?.appointment_date} isEditable={false} icon={FaCalendarAlt} {...tileProps} />
        <InfoTile label="المحافظة" value={isEditing ? lookups?.GOVERNORATE?.find(g => String(g.id) === String(formData.governorate_id))?.value : personal?.governorate_name} name="governorate_id" isEditable={true} type="select" lookupKey="GOVERNORATE" error={errors.governorate_id} icon={FaMapMarkerAlt} {...tileProps} />
        <InfoTile label="المدينة" value={isEditing ? lookups?.CITY?.find(c => String(c.id) === String(formData.city_id))?.value : personal?.city_name} name="city_id" isEditable={true} type="select" options={filteredCities} error={errors.city_id} icon={FaMapMarkerAlt} {...tileProps} />

        {/* Row 4 - Alignment fix */}
        <InfoTile label="العنوان السكني بالتفصيل" value={isEditing ? formData.address : personal?.address} name="address" isEditable={true} error={errors.address} icon={FaMapMarkerAlt} {...tileProps} />

        <Col md={12} className="d-flex align-items-center">
          <div className="p-3 bg-light border-start border-4 border-teal shadow-sm w-100" style={{ borderRadius: '12px', borderColor: '#016A74' }}>
            <div className="text-muted small d-flex align-items-center gap-2">
              <FaInfoCircle size={16} className="text-teal" style={{ color: '#016A74' }} />
              <span className="fw-medium" style={{ fontSize: '0.85rem' }}>
                {pendingUpdate
                  ? isRejected
                    ? "تنبيه: طلبك السابق مرفوض. يرجى تصحيح البيانات وإعادة إرسالها للمراجعة."
                    : "تنبيه: يوجد طلب تغيير بيانات قيد الدراسة لدى الموارد البشرية. لا يمكن إرسال طلب جديد حالياً."
                  : "ملاحظة: التغييرات التي تجريها لن تنعكس مباشرة في ملفك؛ سيقوم موظف الموارد البشرية بمراجعة طلبك والموافقة عليه أولاً."}
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Bottom Sections: Security & Photo */}
      <Row className="mt-5 g-4">
        {/* <Col lg={6}>
          <Card className="p-4 shadow-sm h-100 border-0" style={{ borderRadius: '20px' }}>
            <h6 className="mb-4 fw-bold d-flex align-items-center gap-3" style={{ color: '#016A74' }}>
              <div className="p-2 bg-light rounded shadow-xs"><FaShieldAlt /></div> إعدادات الأمان
            </h6>
            <Form onSubmit={handlePasswordSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">كلمة المرور الحالية</Form.Label>
                <Form.Control
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="********"
                  className="py-2 border-0 bg-light"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted">كلمة المرور الجديدة</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="********"
                  className="py-2 border-0 bg-light"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-muted">تأكيد كلمة المرور الجديدة</Form.Label>
                <Form.Control
                  type="password"
                  name="new_password_confirmation"
                  value={passwordData.new_password_confirmation}
                  onChange={handlePasswordChange}
                  placeholder="********"
                  className="py-2 border-0 bg-light"
                  style={{ borderRadius: '10px' }}
                />
              </Form.Group>
              <Button
                variant="teal"
                type="submit"
                disabled={passwordLoading}
                className="w-100 py-2 fw-bold shadow-sm"
                style={{ backgroundColor: '#016A74', border: 'none', borderRadius: '10px', color: 'white' }}
              >
                {passwordLoading ? <Spinner animation="border" size="sm" /> : "تحديث كلمة المرور"}
              </Button>
            </Form>
          </Card>
        </Col> */}

        <Col lg={6}>
          <PhotoUploadCard currentPhoto={personal?.photo_url} userName={personal?.full_name} />
        </Col>
      </Row>

      <RejectionReasonModal
        show={showRejectionModal}
        handleClose={() => setShowRejectionModal(false)}
        reason={pendingUpdate?.rejection_reason}
        title="سبب رفض تحديث الملف الشخصي"
      />
    </div>
  );
};

const PhotoUploadCard = ({ currentPhoto, userName }) => {
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [preview, setPreview] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('profile_photo', selectedFile);
    try {
      await api.post(ENDPOINTS.EMPLOYEE.UPDATE_PROFILE_PHOTO, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('تم تحديث الصورة الشخصية بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm h-100 border-0 text-center" style={{ borderRadius: '20px' }}>
      <h6 className="mb-4 fw-bold text-start d-flex align-items-center gap-3" style={{ color: '#016A74' }}>
        <div className="p-2 bg-light rounded shadow-xs"><FaCamera /></div> الصورة الشخصية
      </h6>
      <div className="mb-4 position-relative d-inline-block mx-auto">
        <UserAvatar
          src={preview || currentPhoto || "/images/employee-02.jpg"}
          name={userName}
          size={130}
          className="shadow-sm border"
          style={{ border: '5px solid #f8f9fa' }}
        />
        <div className="position-absolute bottom-0 end-0 bg-white p-2 rounded-circle shadow-sm border" style={{ cursor: 'pointer' }} onClick={() => document.getElementById('formFile').click()}>
          <FaEdit size={14} className="text-teal" style={{ color: '#016A74' }} />
        </div>
      </div>
      <div className="mb-3">
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Control type="file" accept="image/*" onChange={handleFileChange} className="d-none" />
          {!selectedFile ? (
            <div className="text-muted small mb-2">اضغط على الأيقونة فوق لتغيير الصورة</div>
          ) : (
            <div className="text-success small mb-2 fw-bold">تم اختيار صورة جديدة</div>
          )}
        </Form.Group>
      </div>
      {selectedFile && (
        <Button className="w-100 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#016A74', border: 'none', borderRadius: '10px', color: 'white' }} onClick={handleUpload} disabled={uploading}>
          {uploading ? <Spinner animation="border" size="sm" className="me-2" /> : 'حفظ الصورة الجديدة'}
        </Button>
      )}
      <div className="mt-3 text-muted small px-3 italic">
        يفضل اختيار صورة واضحة بخلفية بيضاء (JPG/PNG، بحد أقصى 2MB).
      </div>
    </Card>
  );
};

export default Profile;
