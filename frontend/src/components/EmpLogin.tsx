import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import "./EmpLogin.css";

function EmpLogin() {
  const navigate = useNavigate();

  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!nationalId || !password) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ national_id: nationalId, password }),
        }
      );

      const data = await response.json();

      if (response.status === 200 || response.status === 202) {
        const userData = data.data.user || data.data;
        useAuthStore.getState().login(userData, data.data.token);
        
        const finalUser = useAuthStore.getState().user;
        if (finalUser?.is_admin) {
          navigate("/dashboard");
        } else {
          navigate("/emp-dashboard");
        }
        return;
      }

      setError(data.message || "اسم المستخدم أو كلمة المرور غير صحيحة");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="split-login-page" dir="rtl">
      <Container fluid className="p-0">
        <Row className="m-0 min-vh-100">

          {/* Right Side - Image/Branding (Shows only on medium/large screens) */}
          <Col xs={12} lg={7} className="split-login-right d-none d-lg-flex p-0">
            <div className="split-login-overlay"></div>
            <div className="split-login-right-content px-5">
              <h3 className="mb-3" style={{ color: '#00FA9A', opacity: 0.9 }}>نظام الموارد البشرية</h3>
              <h1 className="fw-bold mb-4" style={{ fontSize: '3rem', lineHeight: '1.4' }}>
                بوابة الموظفين الإلكترونية<br />لوزارة الاقتصاد الوطني الفلسطيني
              </h1>
              <p className="fs-5 opacity-75 lh-lg" style={{ maxWidth: '90%' }}>
                توفر البوابة خدمات متكاملة للموظفين تشمل متابعة البيانات الشخصية، الإجازات، الرواتب، والطلبات الإدارية بشكل لحظي لضمان كفاءة وسرعة الوصول للمعلومات.
              </p>
            </div>
          </Col>

          {/* Left Side - Login Form */}
          <Col xs={12} lg={5} className="split-login-left">
            <div className="split-login-form-container text-right">
              <div className="text-center mb-4">
                <img
                  src="/images/logo222.png"
                  alt="Ministry Logo"
                  className="img-fluid"
                  style={{ maxWidth: '120px' }}
                />
              </div>
              <div className="text-center text-lg-end mb-4">
                <h2 className="split-login-title">تسجيل الدخول</h2>
                <p className="split-login-subtitle">
                  سجل دخولك للوصول إلى خدماتك وبياناتك بسهولة وأمان.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 mb-4 small text-center rounded-3">
                  {error}
                </div>
              )}

              <Form onSubmit={handleLogin} className="text-right">
                <Form.Group className="mb-3">
                  <Form.Label className="split-label">رقم الهوية</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="رقم الهوية"
                    maxLength={9}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="split-input text-end"
                    dir="ltr"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="split-label">الرقم الوظيفي</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="الرقم الوظيفي"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="split-input text-end"
                    dir="ltr"
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
                  <div className="d-flex align-items-center custom-checkbox">
                    <Form.Check
                      type="checkbox"
                      id="remember-me"
                      className="m-0 p-0"
                    />
                    <Form.Label htmlFor="remember-me" className="mb-0 cursor-pointer text-muted me-2" style={{ fontSize: '0.9rem' }}>
                      تذكرني
                    </Form.Label>
                  </div>
                  <NavLink
                    // to="/reset-pass"
                    to=""
                    className="text-decoration-none"
                    style={{ color: '#016A74', fontSize: '0.9rem', fontWeight: 'bold' }}
                  >
                    نسيت كلمة المرور؟
                  </NavLink>
                </div>

                <Button
                  type="submit"
                  className="btn-split-login w-100"
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </Form>
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default EmpLogin;