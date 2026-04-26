import { useState } from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";

function FiltersModalEmp({ onClose, onApply }) {
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      size="xl"
      className="modal-modern animate-fade-in"
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
    >
      <Modal.Header closeButton className="bg-custom text-white py-3 px-4">
        <Modal.Title className="fw-bold fs-5">الفلاتر المتقدمة</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-white" style={{ direction: "rtl" }}>
        <Row className="g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الإسم الكامل</Form.Label>
              <Form.Control
                type="text"
                className="rounded-3 border-light-subtle shadow-sm"
                placeholder="اكتب هنا"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">رقم الهوية</Form.Label>
              <Form.Control
                type="text"
                className="rounded-3 border-light-subtle shadow-sm"
                placeholder="اكتب هنا"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الرقم الوظيفي</Form.Label>
              <Form.Control
                type="text"
                className="rounded-3 border-light-subtle shadow-sm"
                placeholder="اكتب هنا"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الوزارة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">الكل</option>
                <option value="رسمي">رسمي</option>
                <option value="عقد">عقد</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">المكاتب الفرعية</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الإدارة العامة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الدائرة</Form.Label>
              <Form.Control
                className="rounded-3 border-light-subtle shadow-sm"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="اسم الدائرة"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">القسم</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الشعبة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الوحدة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">المعبر</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">المسمى الوظيفي</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الحالة الوظيفية</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">نوع الموظف</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">البرنامج</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">التصنيف</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الفئة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">الدرجة</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label className="fw-bold text-secondary small mb-1">المؤهل العلمي</Form.Label>
              <Form.Select className="rounded-3 border-light-subtle shadow-sm">
                <option value="">الكل</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 pb-4 px-4 bg-white justify-content-between">
        <Button
          variant="light"
          className="rounded-pill px-4 fw-medium border shadow-sm"
          onClick={onClose}
        >
          إلغاء
        </Button>

        <Button
          className="rounded-pill px-4 fw-medium bg-custom border-0 shadow text-white"
          onClick={() =>
            onApply({
              type,
              department,
            })
          }
        >
          تطبيق الفلاتر
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default FiltersModalEmp;
