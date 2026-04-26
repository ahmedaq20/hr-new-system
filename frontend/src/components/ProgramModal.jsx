import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

function ProgramModal({ show, onClose, onSave, project = null }) {
    const [form, setForm] = useState({
        name: "",
        duration: "",
        start_date: "",
        end_date: "",
        funding_source: "",
        description: ""
    });

    useEffect(() => {
        if (project) {
            setForm({
                ...project,
                start_date: project.start_date ? project.start_date.split('T')[0] : "",
                end_date: project.end_date ? project.end_date.split('T')[0] : ""
            });
        } else {
            setForm({
                name: "",
                duration: "",
                start_date: "",
                end_date: "",
                funding_source: "",
                description: ""
            });
        }
    }, [project, show]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const isEdit = !!project;

    return (
        <Modal show={show} onHide={onClose} centered className="modal-modern">
            <Modal.Header closeButton closeVariant="white" className="border-0 shadow-none d-flex justify-content-between align-items-center" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white m-0">
                    {isEdit ? "تعديل بيانات المشروع" : "إضافة مشروع جديد"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 pt-1">
                <Form className="text-end mt-3">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small">اسم المشروع</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            placeholder="أدخل اسم المشروع"
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small">مدة المشروع</Form.Label>
                        <Form.Control
                            type="text"
                            name="duration"
                            placeholder="مثال: 6 أشهر"
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.duration}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-secondary small">بداية المشروع</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                    value={form.start_date || ""}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold text-secondary small">نهاية المشروع</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                    value={form.end_date || ""}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small">الجهة الممولة</Form.Label>
                        <Form.Control
                            type="text"
                            name="funding_source"
                            placeholder="اسم المؤسسة أو الشريك"
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.funding_source}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-0">
                        <Form.Label className="fw-bold text-secondary small">تفاصيل إضافية</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="description"
                            placeholder="اكتب وصفاً مختصراً للمشروع..."
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                <div className="d-flex gap-2 w-100">
                    <Button variant="light" className="rounded-3 flex-grow-1 fw-medium border shadow-sm" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button
                        className="rounded-3 flex-grow-1 fw-bold border-0 shadow"
                        style={{ background: '#002F6C', color: 'white' }}
                        onClick={() => onSave(form)}
                    >
                        {isEdit ? "حفظ التغييرات" : "إضافة المشروع"}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default ProgramModal;
