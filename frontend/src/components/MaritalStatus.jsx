import React from 'react';
import { Card, Row, Col, Table, Spinner, Alert } from "react-bootstrap";
import { FaHeart, FaChild, FaUserTie, FaInfoCircle, FaUsers } from "react-icons/fa";

const maritalStatusMap = {
  single: "أعزب/عزباء",
  married: "متزوج/متزوجة",
  divorced: "مطلق/مطلقة",
  widowed: "أرمل/أرملة"
};

function MaritalStatus({ personalInfo, spouses, children, dependents, loading, error }) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <Spinner animation="border" variant="teal" style={{ color: '#016A74' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center shadow-sm" style={{ borderRadius: '12px', marginTop: '2rem' }}>
        حدث خطأ أثناء تحميل البيانات العائلية
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in p-2" dir="rtl">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 text-end">
        <div>
          <h4 className="fw-bold text-dark mb-1">الحالة الاجتماعية والعائلية</h4>
          <p className="text-muted small mb-0">عرض بيانات الحالة الاجتماعية، الزوجات والأبناء المسجلة في ملفك</p>
        </div>
        <div className="p-3 bg-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
          <FaUsers size={24} style={{ color: "#016A74" }} />
        </div>
      </div>

      <Row className="g-4">
        {/* Row 1: Current Marital Status */}
        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: "#016A74" }}>
                <FaInfoCircle />
                الحالة الاجتماعية الحالية
              </h5>
              <div className="bg-light p-3 rounded-3 border-start border-4 border-primary">
                <div className="d-flex align-items-center gap-3">
                  <div>
                    <span className="text-muted small d-block">الحالة المسجلة:</span>
                    <span className="fw-bold fs-5 text-dark">{maritalStatusMap[personalInfo?.marital_status] || personalInfo?.marital_status || "غير محدد"}</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Row 2: Spouses Data */}
        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: "#016A74" }}>
                <FaUserTie />
                بيانات الزوج / الزوجة
              </h5>

              <div className="table-responsive">
                <Table hover className="text-center align-middle mb-0">
                  <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                      <th className="py-3 border-0">#</th>
                      <th className="py-3 border-0">الاسم بالكامل</th>
                      <th className="py-3 border-0">رقم الهوية</th>
                      <th className="py-3 border-0">تاريخ الميلاد</th>
                      <th className="py-3 border-0">حالة العمل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spouses && spouses.length > 0 ? (
                      spouses.map((spouse, index) => (
                        <tr key={index}>
                          <td className="fw-bold text-muted">{index + 1}</td>
                          <td className="fw-bold text-dark">{spouse.full_name}</td>
                          <td className="text-muted">{spouse.national_id || "---"}</td>
                          <td className="text-muted">{spouse.birth_date || "---"}</td>
                          <td>
                            {spouse.is_working ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-normal" style={{ borderRadius: '8px' }}>
                                تعمل
                              </span>
                            ) : (
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 fw-normal" style={{ borderRadius: '8px' }}>
                                لا تعمل
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-muted italic">
                          لا توجد بيانات مسجلة للزوج أو الزوجة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Row 3: Children Data */}
        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: "#016A74" }}>
                <FaChild />
                بيانات الأبناء
              </h5>

              <div className="table-responsive">
                <Table hover className="text-center align-middle mb-0">
                  <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                      <th className="py-3 border-0">#</th>
                      <th className="py-3 border-0">اسم الابن</th>
                      <th className="py-3 border-0">العمر</th>
                      <th className="py-3 border-0">الحالة الدراسية / المهنية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children && children.length > 0 ? (
                      children.map((child, index) => (
                        <tr key={index}>
                          <td className="fw-bold text-muted">{index + 1}</td>
                          <td className="fw-bold text-dark">{child.full_name}</td>
                          <td className="text-muted">{child.age || "---"}</td>
                          <td>
                            <span className="badge bg-info-subtle text-info border border-info-subtle px-3 py-2 fw-normal" style={{ borderRadius: '8px' }}>
                              {child.study_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-muted italic">
                          لا يوجد بيانات أبناء مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Row 4: Dependents Data */}
        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold d-flex align-items-center gap-2" style={{ color: "#016A74" }}>
                <FaUsers />
                بيانات المعيلين
              </h5>

              <div className="table-responsive">
                <Table hover className="text-center align-middle mb-0">
                  <thead className="bg-light text-secondary small text-uppercase">
                    <tr>
                      <th className="py-3 border-0">#</th>
                      <th className="py-3 border-0">الاسم بالكامل</th>
                      <th className="py-3 border-0">صلة القرابة</th>
                      <th className="py-3 border-0">ملاحظات الإعالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependents && dependents.length > 0 ? (
                      dependents.map((dependent, index) => (
                        <tr key={index}>
                          <td className="fw-bold text-muted">{index + 1}</td>
                          <td className="fw-bold text-dark">{dependent.full_name}</td>
                          <td>
                            <span className="badge bg-teal-subtle text-teal border border-teal-subtle px-3 py-2 fw-normal" style={{ borderRadius: '8px', color: '#016A74', borderColor: '#016A7422', backgroundColor: '#016A7411' }}>
                              {dependent.relationship}
                            </span>
                          </td>
                          <td className="text-muted small">{dependent.dependency_reason || "---"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-muted italic">
                          لا يوجد بيانات معيلين مسجلة
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Footer Note */}
      <div className="mt-4 p-3 bg-light border-start border-4 border-warning shadow-sm" style={{ borderRadius: '12px' }}>
        <p className="mb-0 small text-muted text-end">
          <strong>ملاحظة هامة:</strong> عزيزي الموظف، هذه البيانات للعرض فقط. في حال وجود أي خطأ أو الحاجة لتحديث البيانات، يرجى تقديم طلب تحديث بيانات عبر النوافذ المخصصة لذلك في قسم الخدمات السريعة.
        </p>
      </div>
    </div>
  );
}

export default MaritalStatus;
