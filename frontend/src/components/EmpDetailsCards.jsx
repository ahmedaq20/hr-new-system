import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import {
  FaUser,
  FaUsers,
  FaHeart,
  FaGraduationCap,
  FaEdit
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EmpDetailsCards = ({ data }) => {
  const navigate = useNavigate();
  const personal = data?.personal_info;

  return (
    <Row className="g-4" style={{ paddingBottom: "50px", marginTop: "15px" }}>
      <div className="section-divider"></div>

      {/* بيانات الموظف */}
      <Col xs={12} sm={6} lg={3}>
        <h6 className="section-title text-center">
          <FaUser className="section-icon" /> بيانات الموظف
        </h6>
        <h6 className="section-title1 text-center mt-4">بيانات شخصية</h6>

        <Card className="profile-card text-center">
          <Card.Body>
            <p><strong>الاسم : <br /></strong>{personal?.full_name || "---"}</p>
            <p><strong>الرقم الوظيفي : <br /></strong>{personal?.employee_number || "---"}</p>
            <p><strong>رقم الهوية : <br /></strong>{personal?.national_id || "---"}</p>
            <p><strong>القسم : <br /></strong>{personal?.department || "---"}</p>
            <p><strong>المسمى الوظيفي : <br /></strong>{personal?.job_title || "---"}</p>
          </Card.Body>
        </Card>
      </Col>

      {/* الزوجة */}
      <Col xs={12} sm={6} lg={3}>
        <h6 className="section-title text-center">
          <FaUsers className="section-icon" /> الأزواج
        </h6>
        <h6 className="section-title1 text-center mt-4">بيانات الأزواج</h6>

        <Card className="profile-card text-center">
          <Card.Body className="d-flex flex-column">
            <div className="mt-4 mb-4">
              <h1 style={{ color: '#016A74', fontWeight: 'bold' }}>{data?.spouses?.length || 0}</h1>
              <p className="text-muted">عدد الزوجات المسجلات</p>
            </div>

            <button
              className="btn-gradient-teal mt-auto"
              onClick={() => navigate("/spouses", { state: { openAddModal: true } })}
            >
              <FaEdit style={{ marginLeft: "6px" }} />
              إضافة زوج/ة
            </button>
          </Card.Body>
        </Card>
      </Col>

      {/* الأبناء */}
      <Col xs={12} sm={6} lg={3}>
        <h6 className="section-title text-center">
          <FaUsers className="section-icon" /> الأبناء
        </h6>
        <h6 className="section-title1 text-center mt-4">بيانات الأبناء</h6>

        <Card className="profile-card text-center">
          <Card.Body className="d-flex flex-column">
            <div className="mt-2 mb-3">
              <h1 style={{ color: '#016A74', fontWeight: 'bold' }}>{data?.children?.length || 0}</h1>
              <p className="text-muted mb-0">إجمالي الأبناء</p>
            </div>
            <div className="d-flex justify-content-around border-top pt-3 mb-3">
              <div>
                <h5 className="mb-0" style={{ color: '#016A74' }}>{data?.children?.filter(c => c.is_university_student || c.study_status === 'طالب').length || 0}</h5>
                <small className="text-muted">طلاب</small>
              </div>
              <div className="border-end"></div>
              <div>
                <h5 className="mb-0" style={{ color: '#016A74' }}>{data?.children?.filter(c => c.is_working || c.study_status === 'يعمل').length || 0}</h5>
                <small className="text-muted">عاملين</small>
              </div>
            </div>

            <button
              className="btn-gradient-teal mt-auto"
              onClick={() => navigate("/children", { state: { openAddModal: true } })}
            >
              <FaEdit style={{ marginLeft: "6px" }} />
              إضافة إبن/ة
            </button>
          </Card.Body>
        </Card>
      </Col>

      {/* المعالون */}
      <Col xs={12} sm={6} lg={3}>
        <h6 className="section-title text-center">
          <FaHeart className="section-icon" /> المعالون
        </h6>
        <h6 className="section-title1 text-center mt-4">المعالون</h6>

        <Card className="profile-card text-center">
          <Card.Body className="d-flex flex-column">
            <div className="mt-4 mb-4">
              <h1 style={{ color: '#016A74', fontWeight: 'bold' }}>{data?.dependents?.length || 0}</h1>
              <p className="text-muted">عدد المعالون المسجلين</p>
            </div>

            <button
              className="btn-gradient-teal mt-auto"
              onClick={() => navigate("/dependents", { state: { openAddModal: true } })}>
              <FaEdit style={{ marginLeft: "6px" }} />
              إضافة معال
            </button>
          </Card.Body>
        </Card>
      </Col>
    </Row >
  );
};

export default EmpDetailsCards;