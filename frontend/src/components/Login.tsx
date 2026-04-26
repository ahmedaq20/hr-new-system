import { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useAuthStore } from "../store/useAuthStore";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="admin-login-page" dir="rtl">
      <Container fluid className="p-0">
        <Row className="m-0 min-vh-100">

          {/* Right Side - Illustration Panel */}
          <Col xs={12} lg={7} className="admin-login-illustration d-none d-lg-flex">
            <div className="illustration-content">
              <h2 className="illustration-title">نظام إدارة الموارد</h2>
              <p className="illustration-subtitle">حل متكامل لإدارة البيانات</p>

              <div className="hero-image-wrapper">
                <img
                  src="/images/hero-right.png"
                  alt="نظام إدارة الموارد"
                  className="hero-image"
                />
              </div>
            </div>
          </Col>

          {/* Left Side - Login Form */}
          <Col xs={12} lg={5} className="admin-login-form-col">
            <div className="admin-login-form-wrapper">

              {/* Nexar Logo */}
              <div className="login-logo">
                <div className="nexar-logo-container">
                  <div className="nexar-icon">
                    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="44" height="44" rx="10" fill="#2B7DE9" />
                      <path d="M12 32V12h4.5l11 14.5V12H32v20h-4.5L16.5 17.5V32H12z" fill="#fff" />
                    </svg>
                  </div>
                  <span className="nexar-text">nexar</span>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="login-welcome">
                <h1 className="welcome-title">مرحبًا بك</h1>
                <p className="welcome-subtitle">
                  سجل دخولك للوصول إلي نظام لإدارة الموارد
                </p>
                <p className="welcome-subtitle-en">
                  Resource Management System
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger py-2 mb-3 small text-center rounded-3">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="form-field-label">اسم المستخدم</Form.Label>
                  <div className="input-icon-wrapper">
                    <FiUser className="input-icon" />
                    <Form.Control
                      type="text"
                      placeholder="أدخل اسم المستخدم"
                      maxLength={9}
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="login-input"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-field-label">كلمة المرور</Form.Label>
                  <div className="input-icon-wrapper">
                    <FiLock className="input-icon" />
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="login-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </Form.Group>

                <div className="remember-forgot-row">
                  <Form.Check
                    type="checkbox"
                    id="admin-remember-me"
                    label="تذكرني"
                    className="remember-check"
                  />
                  <a href="#" className="forgot-password-link" onClick={(e) => e.preventDefault()}>
                    نسيت كلمة المرور؟
                  </a>
                </div>

                <Button
                  type="submit"
                  className="login-submit-btn w-100"
                  disabled={loading}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </Form>

              {/* Divider */}
              <div className="login-divider">
                <span>أو</span>
              </div>

              {/* Microsoft Login Button (placeholder) */}
              <button type="button" className="microsoft-login-btn">
                <svg className="microsoft-logo" viewBox="0 0 21 21" width="21" height="21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>تسجيل الدخول باستخدام Microsoft</span>
              </button>

              {/* Copyright */}
              <p className="login-copyright">
                © 2026 nexar. جميع الحقوق محفوظة.
              </p>

            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
}

export default Login;
