import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function AddCategoryModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", empNum: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      show={true}
      onHide={onClose}
      centered
      className="modal-modern animate-fade-in"
    >
      <Modal.Header closeButton closeVariant="white" className="border-0" style={{ background: '#002F6C' }}>
        <Modal.Title className="fs-5 fw-bold text-white">إضافة قيمة جديدة</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4 bg-light">
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small">القيمة (مثلاً: اسم الوزارة)</Form.Label>
            <Form.Control
              type="text"
              name="name"
              className="rounded-3 py-2 border-light-subtle shadow-sm"
              value={form.name}
              onChange={handleChange}
              placeholder="أدخل القيمة هنا..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pb-4 px-4 bg-light rounded-bottom-4">
        <Button
          variant="light"
          className="rounded-pill px-4 fw-medium border shadow-sm"
          onClick={onClose}
        >
          إلغاء
        </Button>
        <Button
          className="rounded-pill px-4 fw-medium bg-custom border-0 shadow text-white"
          onClick={() => onSave(form)}
        >
          حفظ البيانات
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddCategoryModal;
