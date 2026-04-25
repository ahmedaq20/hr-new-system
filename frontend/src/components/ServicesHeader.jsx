import React, { useState } from "react";
import { Card, Row, Col, Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ServicesHeader = () => {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);

  const cardsData = [
    {
      title: "تعديل البيانات",
      number: "تحديث البيانات الشخصية والعائلية",
      icon: <img src="/images/edits.png" style={{ width: "50px", height: "50px" }} />,
      color: "#3b82f6",
      action: "edit",
      path: "/profile",
      state: { triggerEdit: true }
    },
    {
      title: "تحميل قسيمة الراتب",
      number: "الحصول على قسيمة راتب شهرية",
      icon: <img src="/images/salaryicon.png" style={{ width: "50px", height: "50px" }} />,
      color: "#f59e0b",
      path: "/salary"
    },
  ];

  return (
    <>
      <Row className="g-4" style={{ marginTop: "15px" }}>
        <div className="section-divider"></div>
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#016A74", marginBottom: "-10px", marginTop: "-10px" }}>
          خدمات سريعة
        </p>

        {cardsData.map((card, index) => (
          <Col xs={12} sm={6} md={4} key={index}>
            <Card
              className="h-100"
              style={{
                borderRadius: "12px",
                background: card.bgColor || "#f8f9fc",
                color: card.textColor || "#000",
                boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                border: "1px solid #e5e7eb",
                cursor: "pointer",
                transition: "transform 0.2s",

              }}
              onClick={() => {
                if (card.path) {
                  navigate(card.path, { state: card.state });
                }
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.03)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }

            >
              <Card.Body className="d-flex align-items-center">
                <div
                  style={{
                    backgroundColor: card.color,
                    borderRadius: "50%",
                    width: "55px",
                    height: "55px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "15px",
                  }}>
                  {card.icon}
                </div>

                <div>
                  <Card.Title className="mb-1 mx-2 mt-2 cardDashTitEmp"
                    style={{ color: card.textColor || "#111827" }}>{card.title}</Card.Title>
                  <small>{card.number}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/*  مودال التعديل   */}
      {/* <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تعديل بيانات الموظف</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>اسم الموظف</Form.Label>
              <Form.Control type="text" placeholder="أدخل اسم الموظف" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>الحالة الإجتماعية</Form.Label>
              <Form.Select
                required
                style={{ borderRadius: "10px" }}>
                <option value="">اختر الحالة</option>
                <option value="متزوجة">متزوجة</option>
                <option value="مطلقة">مطلقة</option>
                <option value="أرملة">أرملة</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>عدد الزوجات</Form.Label>
              <Form.Control type="text" placeholder="أدخل رقم " />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>عدد أفراد العائلة</Form.Label>
              <Form.Control type="number" placeholder="عدد الأفراد / أدخل رقم" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>مكان السكن</Form.Label>
              <Form.Control type="text" placeholder="المدينة / المنطقة" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>رقم الجوال</Form.Label>
              <Form.Control type="text" placeholder="رقم الجوال" />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            إلغاء
          </Button>
          <Button variant="success" className="saveEdits">
            حفظ التعديلات
          </Button>
        </Modal.Footer>
      </Modal> */}
    </>
  );
};

export default ServicesHeader;

