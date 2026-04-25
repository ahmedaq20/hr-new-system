import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import CSelect from "./CSelect";
import { useEmployees } from "../hooks/useEmployees";

function AdministrativeAttachmentsModal({ show, onClose, onSave, item = null, isMutating }) {
    const [form, setForm] = useState({
        employee_id: "",
        status: "pending",
        file: null,
        notes: "",
    });
    const [fileError, setFileError] = useState("");

    const { data: employeesData } = useEmployees(1, 1000, "", {}, { enabled: show && !item });

    const employeeOptions = employeesData?.data?.map(emp => ({
        value: emp.id,
        label: emp.full_name || emp.name
    })) || [];

    const statusOptions = [
        { value: "pending", label: "قيد الانتظار" },
        { value: "accepted", label: "مكتمل" },
        { value: "refused", label: "مرفوض" },
    ];

    useEffect(() => {
        if (item) {
            setForm({
                employee_id: item.employee_id || "",
                status: item.status || "pending",
                file: null,
                notes: item.notes || "",
            });
        } else {
            setForm({
                employee_id: "",
                status: "pending",
                file: null,
                notes: "",
            });
        }
        setFileError("");
    }, [item, show]);

    const handleSelectChange = (selectedOption, actionMeta) => {
        const { name } = actionMeta;
        setForm(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : "" }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFileError("");

        if (file) {
            const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                setFileError("عذراً، يجب أن يكون الملف بصيغة PDF أو صورة (PNG, JPG)");
                e.target.value = null;
                setForm(prev => ({ ...prev, file: null }));
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB
                setFileError("حجم الملف كبير جداً، الحد الأقصى المسموح به هو 10 ميجابايت");
                e.target.value = null;
                setForm(prev => ({ ...prev, file: null }));
                return;
            }

            setForm(prev => ({ ...prev, file }));
        }
    };

    const isEdit = !!item;

    const handleSave = () => {
        if (!isEdit && (!form.employee_id || !form.file)) return;
        onSave(form);
    };

    return (
        <Modal show={show} onHide={onClose} centered className="modal-modern" size="lg">
            <Modal.Header closeButton closeVariant="white" className="border-0 shadow-none d-flex justify-content-between align-items-center" style={{ background: '#002F6C' }}>
                <Modal.Title className="fs-5 fw-bold text-white m-0">
                    {isEdit ? "تعديل بيانات المرفق" : "إضافة مرفق إداري جديد"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4 pt-1">
                <Form className="text-end mt-3">
                    {!isEdit && (
                        <CSelect
                            label={<span>الموظف <span className="text-danger">*</span></span>}
                            name="employee_id"
                            options={employeeOptions}
                            value={employeeOptions.find(opt => opt.value === form.employee_id)}
                            onChange={handleSelectChange}
                            placeholder="اختر الموظف..."
                            isSearchable
                        />
                    )}

                    <div className="row">
                        <div className="col-md-12">
                            <CSelect
                                label={<span>الحالة</span>}
                                name="status"
                                options={statusOptions}
                                value={statusOptions.find(opt => opt.value === form.status)}
                                onChange={handleSelectChange}
                                placeholder="اختر الحالة..."
                            />
                        </div>
                    </div>

                    {!isEdit && (
                        <Form.Group className="mb-3 text-end">
                            <Form.Label className="fw-bold text-secondary small">الملف <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                                type="file"
                                name="file"
                                className={`rounded-3 py-2 border-light-subtle shadow-sm bg-light text-end ${fileError ? 'is-invalid' : ''}`}
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                            {fileError ? (
                                <div className="invalid-feedback d-block mt-1">{fileError}</div>
                            ) : (
                                <small className="text-muted d-block mt-1">يجب أن يكون الملف من نوع PDF أو صورة (JPG, PNG) ولا يتجاوز حجمه 10 ميجابايت</small>
                            )}

                            {isMutating && !isEdit && (
                                <div className="mt-3">
                                    <div className="progress rounded-pill" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                            role="progressbar"
                                            style={{ width: '100%' }}
                                        ></div>
                                    </div>
                                    <small className="text-primary d-block mt-1 fw-bold text-center animate-pulse">جاري رفع المرفق... يرجى الانتظار</small>
                                </div>
                            )}
                        </Form.Group>
                    )}

                    <Form.Group className="mb-3 text-end">
                        <Form.Label className="fw-bold text-secondary small">ملاحظات (اختياري)</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="notes"
                            rows={3}
                            placeholder="أدخل أي ملاحظات هنا..."
                            className="rounded-3 py-2 border-light-subtle shadow-sm bg-light text-end"
                            value={form.notes}
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
                        className="rounded-3 flex-grow-1 fw-bold border-0 shadow"
                        style={{ background: '#002F6C', color: 'white' }}
                        onClick={handleSave}
                        disabled={isMutating}
                    >
                        {isMutating ? "جاري الحفظ..." : (isEdit ? "حفظ التغييرات" : "إضافة المرفق")}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

export default AdministrativeAttachmentsModal;

