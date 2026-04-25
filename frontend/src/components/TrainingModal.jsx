import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import CSelect from "./CSelect";
import { useReferenceData } from "../hooks/useReferenceData";

function TrainingModal({ show, onClose, onSave, item = null, isMutating }) {
    const { items: trainingTypes = [] } = useReferenceData("TRAINING_TYPE");
    const { items: trainingClassifications = [] } = useReferenceData("TRAINING_CLASSIFICATION");

    const [form, setForm] = useState({
        training_type_id: "",
        training_classification_id: "",
        name: "",
        target_audience: "",
        funding_entity: "",
        duration: "",
        start_date: "",
        end_date: "",
        implementation_mechanism: "",
        location: "",
        content: "",
        other_details: "",
    });

    const typeOptions = trainingTypes.map(type => ({ value: type.id, label: type.value }));
    const classificationOptions = trainingClassifications.map(cls => ({ value: cls.id, label: cls.value }));

    useEffect(() => {
        if (item && show) {
            setForm({
                training_type_id: item.training_type_id || "",
                training_classification_id: item.training_classification_id || "",
                name: item.name || "",
                target_audience: item.target_audience || "",
                funding_entity: item.funding_entity || "",
                duration: item.duration || "",
                start_date: item.start_date ? item.start_date.split('T')[0] : "",
                end_date: item.end_date ? item.end_date.split('T')[0] : "",
                implementation_mechanism: item.implementation_mechanism || "",
                location: item.location || "",
                content: item.content || "",
                other_details: item.other_details || "",
            });
        } else if (show) {
            setForm({
                training_type_id: "",
                training_classification_id: "",
                name: "",
                target_audience: "",
                funding_entity: "",
                duration: "",
                start_date: "",
                end_date: "",
                implementation_mechanism: "",
                location: "",
                content: "",
                other_details: "",
            });
        }
    }, [item, show]);

    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta;
        setForm(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : "" }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const isEdit = !!item;

    const handleSave = () => {
        if (!form.name || !form.training_type_id || !form.training_classification_id) {
            // In a real app, you'd show a validation error here
            return;
        }
        onSave(form);
    };

    return (
        <Modal show={show} onHide={onClose} centered className="modal-modern" size="xl">
            <Modal.Header closeButton closeVariant="white" className="border-0 shadow-none d-flex justify-content-between align-items-center" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white m-0">
                    {isEdit ? "تعديل بيانات الدورة" : "إضافة دورة/ورشة جديدة"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 pt-1 text-end">
                <Form className="mt-3">
                    <div className="row">
                        <div className="col-md-4">
                            <CSelect
                                label={<span>نوع الدورة/الورشة <span className="text-danger">*</span></span>}
                                name="training_type_id"
                                options={typeOptions}
                                value={typeOptions.find(opt => opt.value === form.training_type_id)}
                                onChange={handleSelectChange}
                                placeholder="اختر النوع..."
                            />
                        </div>
                        <div className="col-md-4">
                            <CSelect
                                label={<span>تصنيف الدورة <span className="text-danger">*</span></span>}
                                name="training_classification_id"
                                options={classificationOptions}
                                value={classificationOptions.find(opt => opt.value === form.training_classification_id)}
                                onChange={handleSelectChange}
                                placeholder="اختر التصنيف..."
                            />
                        </div>
                        <Form.Group className="mb-3 col-md-4">
                            <Form.Label className="fw-bold text-secondary small">اسم الدورة/الورشة <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                placeholder="أدخل اسم الدورة..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </div>

                    <div className="row">
                        <Form.Group className="mb-3 col-md-4">
                            <Form.Label className="fw-bold text-secondary small">الفئة المستهدفة</Form.Label>
                            <Form.Control
                                type="text"
                                name="target_audience"
                                placeholder="أدخل الفئة المستهدفة..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.target_audience}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-4">
                            <Form.Label className="fw-bold text-secondary small">الجهة الممولة</Form.Label>
                            <Form.Control
                                type="text"
                                name="funding_entity"
                                placeholder="أدخل الجهة الممولة..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.funding_entity}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-4">
                            <Form.Label className="fw-bold text-secondary small">مدة الدورة</Form.Label>
                            <Form.Control
                                type="text"
                                name="duration"
                                placeholder="مثلاً: 5 أيام..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.duration}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </div>

                    <div className="row">
                        <Form.Group className="mb-3 col-md-3">
                            <Form.Label className="fw-bold text-secondary small">تاريخ البداية</Form.Label>
                            <Form.Control
                                type="date"
                                name="start_date"
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.start_date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-3">
                            <Form.Label className="fw-bold text-secondary small">تاريخ النهاية</Form.Label>
                            <Form.Control
                                type="date"
                                name="end_date"
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.end_date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-3">
                            <Form.Label className="fw-bold text-secondary small">آلية الانعقاد</Form.Label>
                            <Form.Control
                                type="text"
                                name="implementation_mechanism"
                                placeholder="مثلاً: وجاهي / عن بعد..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.implementation_mechanism}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-3">
                            <Form.Label className="fw-bold text-secondary small">مكان الانعقاد</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                placeholder="أدخل مكان الانعقاد..."
                                className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small">محتوى الدورة</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="content"
                            rows={3}
                            placeholder="أدخل محتوى الدورة هنا..."
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.content}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-secondary small">تفاصيل أخرى</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="other_details"
                            rows={2}
                            placeholder="أدخل أي تفاصيل أخرى..."
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light"
                            value={form.other_details}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                <div className="d-flex gap-2 w-100">
                    <Button variant="light" className="rounded-3 flex-grow-1 fw-bold border shadow-sm" onClick={onClose} disabled={isMutating}>
                        إلغاء
                    </Button>
                    <Button
                        className="rounded-3 flex-grow-1 fw-bold border-0 shadow d-flex align-items-center justify-content-center gap-2"
                        style={{ background: '#002F6C', color: 'white' }}
                        onClick={handleSave}
                        disabled={isMutating}
                    >
                        {isMutating ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                جاري الحفظ...
                            </>
                        ) : (
                            isEdit ? "حفظ التغييرات" : "حفظ الدورة"
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default TrainingModal;
