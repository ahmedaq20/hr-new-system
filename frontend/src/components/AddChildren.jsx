// import React from 'react'

// function AddChildren() {
//   return (
//     <div>AddChildren</div>
//   )
// }

// export default AddChildren;
import { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";

const AddWife = ({ onSubmit, onCancel }) => {
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [marriageDate, setMarriageDate] = useState("");
  const [marriageStatus, setMarriageStatus] = useState("");
  const [phone, setPhone] = useState("");
  const [works, setWorks] = useState(false);
  const [marriageContract, setMarriageContract] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const spouseData = {
      fullName,
      nationalId,
      marriageDate,
      marriageStatus,
      phone,
      works,
      marriageContract,
    };
    if (onSubmit) onSubmit(spouseData);
  };

  return (
    <Card 
      className="p-4 shadow-sm"
      style={{ borderRadius: "15px", background: "#fff" }}
    >
      <h5 className="mb-4 text-center" style={{ fontWeight: 600, color: "#00695c" }}>
        إضافة بيانات الأبناء
      </h5>

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Form.Label>الاسم الكامل</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col>
            <Form.Label>الجنس </Form.Label>
            <Form.Select
              value={marriageStatus}
              onChange={(e) => setMarriageStatus(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            >
              <option value="">اختر الحالة</option>
              <option value="متزوجة">ذكر</option>
              <option value="مطلقة">أنثى</option>
            </Form.Select>
          </Col>
          <Col>
            <Form.Label>رقم الهوية</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل رقم الهوية"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Label>تاريخ الميلاد</Form.Label>
            <Form.Control
              type="date"
              value={marriageDate}
              onChange={(e) => setMarriageDate(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col>
            <Form.Label>الحالة الإجتماعية</Form.Label>
            <Form.Select
              value={marriageStatus}
              onChange={(e) => setMarriageStatus(e.target.value)}
              required
              style={{ borderRadius: "10px" }}
            >
              <option value="">اختر الحالة</option>
              <option value="متزوجة">أعزب/عزباء</option>
              <option value="مطلقة">مطلق/مطلقة</option>
              <option value="أرملة">أرمل/أرملة</option>
              <option value="أرملة">متزوج/متزوجة</option>
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3 align-items-center">
          <Col  md={3}>
            <Form.Label>إسم الأم الكامل</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل رقم الجوال"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col md={3}>
            <Form.Label>رقم هوية الأم</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل رقم الجوال"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col md={6}>
            <Form.Label>الملاحظات</Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل ملاحظاتك "
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ borderRadius: "10px" }}
            />
          </Col>
          <Col md={6} className="d-flex align-items-center mt-4">
            <Form.Check
              type="checkbox"
              label="يعمل"
              checked={works}
              onChange={(e) => setWorks(e.target.checked)}/>
            <Form.Check className="mx-2"
              type="checkbox"
              label="طالب جامعي"
              checked={works}
              onChange={(e) => setWorks(e.target.checked)} />
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>صورة بطاقة الهوية</Form.Label>
          <Form.Control
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setMarriageContract(e.target.files[0])}
          />
          {marriageContract && (
            <small className="text-muted mt-1 d-block">
              الملف المختار: {marriageContract.name}
            </small>
          )}
        </Form.Group>
         <Form.Group className="mb-4">
          <Form.Label>صورة شهادة الميلاد</Form.Label>
          <Form.Control
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) => setMarriageContract(e.target.files[0])}
          />
          {marriageContract && (
            <small className="text-muted mt-1 d-block">
              الملف المختار: {marriageContract.name}
            </small>
          )}
        </Form.Group>
         <div className="alertYellow">
            <p> البيانات المضافة ستكون في حالة "انتظار الموافقة" حتى يتم اعتمادها من قبل الإدارة.
            </p>
        </div>
        <div className="d-flex justify-content-between mt-4">
          <Button 
          className="sendData"
            variant="success" 
            type="submit"
            style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}>
            إرسال البيانات
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={onCancel}
            style={{ borderRadius: "10px", fontWeight: "500", padding: "8px 25px" }}>
            إلغاء
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AddWife;