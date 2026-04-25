import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nationalId || !password) {
      setError("يرجى إدخال رقم الهوية وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            national_id: nationalId,
            password: password,
          }),
        }
      );

      const data = await response.json();

      // نجاح (202 أو 200)
      if (response.status === 200 || response.status === 202) {
        const userData = data.data.user || data.data;
        useAuthStore.getState().login(userData, data.data.token);

        // التوجيه بناءً على الصلاحيات (يتم التحقق منها عبر الـ store لضمان المرونة)
        const finalUser = useAuthStore.getState().user;
        if (finalUser?.is_admin) {
          navigate("/dashboard");
        } else {
          navigate("/emp-dashboard");
        }
        return;
      }

      // فشل تسجيل الدخول
      setError(data.message || "رقم الهوية أو كلمة المرور غير صحيحة");

    } catch (err) {
      console.error("Login error:", err);
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-admin-login-page" dir="rtl">
      <Container fluid className="p-0">
        <Row className="m-0 min-vh-100">
          
          {/* Right Side - Branding Overlay */}
          <Col xs={12} lg={7} className="split-admin-login-right d-none d-lg-flex p-0">
            <div className="split-admin-login-overlay"></div>
            <div className="split-admin-login-right-content px-5">
              <h3 className="mb-3 text-info opacity-75">وزارة الاقتصاد الوطني</h3>
              <h1 className="fw-bold mb-4" style={{ fontSize: '3rem', lineHeight: '1.4' }}>
                نظام إدارة معلومات الموظفين<br />الإداري والمالي
              </h1>
              <p className="fs-5 opacity-75 lh-lg" style={{ maxWidth: '90%' }}>
                المنصة المركزية لإدارة الموارد البشرية والشؤون المالية، توفر أدوات متكاملة لإدارة البيانات والتقارير والعمليات الإدارية بكفاءة عالية.
              </p>
            </div>
          </Col>

          {/* Left Side - Login Form */}
          <Col xs={12} lg={5} className="split-admin-login-left">
            <div className="split-admin-login-form-container text-right">
              
              {/* Centered Logo */}
              <div className="text-center mb-4">
                <img
                  src="/images/logo222.png"
                  alt="Ministry Logo"
                  className="img-fluid"
                  style={{ maxWidth: '120px' }}
                />
              </div>

              <div className="text-center text-lg-end mb-4">
                <h2 className="split-admin-login-title">تسجيل دخول المسؤول</h2>
                <p className="split-admin-login-subtitle">
                  كافة الحقول مطلوبة للمتابعة.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 mb-4 small text-center rounded-3">
                  {error}
                </div>
              )}

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-4">
                  <Form.Label className="admin-split-label">رقم الهوية الوطنية</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="أدخل رقم الهوية"
                    maxLength={9}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="admin-split-input text-end"
                    dir="ltr"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="admin-split-label">كلمة المرور</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="admin-split-input text-end"
                    dir="ltr"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                  <Form.Check 
                    type="checkbox" 
                    id="admin-remember-me" 
                    label="تذكرني"
                    className="small text-muted"
                  />
                  <span className="cursor-pointer small" style={{ color: '#002F6C', fontWeight: '600' }}>
                    هل نسيت كلمة المرور؟
                  </span>
                </div>

                <Button
                  type="submit"
                  className="btn-admin-login w-100"
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </Form>

              <p className="text-center mt-5 small text-muted opacity-50">
                جميع الحقوق محفوظة لدى وزارة الاقتصاد الوطني الفلسطيني
              </p>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default Login;
