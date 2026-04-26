import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function DivisionModal({ show, onClose, onSave, item = null, isMutating }) {
    const [name, setName] = useState("");

    useEffect(() => {
        if (item) {
            setName(item.value || "");
        } else {
            setName("");
        }
    }, [item, show]);

    const isEdit = !!item;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ name });
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            className="modal-modern animate-fade-in"
        >
            <Modal.Header
                closeButton
                closeVariant="white"
                className="border-0"
                style={{ background: '#002F6C' }}
            >
                <Modal.Title className="fs-5 fw-bold text-white">
                    {isEdit ? "تعديل الشُعبة" : "إضافة شُعبة جديدة"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 bg-light">
                <Form className="text-end">
                    <Form.Group className="mb-0">
                        <Form.Label className="fw-bold text-secondary small">اسم الشُعبة</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="أدخل اسم الشُعبة..."
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pb-4 px-4 bg-light rounded-bottom-4">
                <Button
                    variant="light"
                    className="rounded-pill px-4 fw-medium border shadow-sm"
                    onClick={onClose}
                    disabled={isMutating}
                >
                    إلغاء
                </Button>
                <Button
                    className="rounded-pill px-4 fw-medium bg-custom border-0 shadow text-white"
                    onClick={handleSave}
                    disabled={isMutating}
                >
                    {isMutating ? (isEdit ? 'جاري الحفظ...' : 'جاري الإضافة...') : (isEdit ? "حفظ التغييرات" : "إضافة الشُعبة")}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default DivisionModal;
