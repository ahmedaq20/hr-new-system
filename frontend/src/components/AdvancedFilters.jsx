import { useState } from "react";
import { Row, Col, Form, Button, Collapse } from "react-bootstrap";

function AdvancedFilters({ show, onApply, onCancel }) {
    const [type, setType] = useState("");
    const [department, setDepartment] = useState("");

    return (
        <Collapse in={show}>
            <div className="mb-4">
                <div className="p-4 rounded-4 shadow-sm border bg-white animate-fade-in">
                    <h5 className="fw-bold mb-3 text-dark" style={{ fontSize: "1.1rem" }}>
                        الفلاتر المتقدمة
                    </h5>

                    <Row className="g-3">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الإسم الكامل</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">رقم الهوية</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الرقم الوظيفي</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الوزارة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="">الكل</option>
                                    <option value="رسمي">رسمي</option>
                                    <option value="عقد">عقد</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">المكاتب الفرعية</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الإدارة العامة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الدائرة</Form.Label>
                                <Form.Control
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    placeholder="اسم الدائرة"
                                />
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">القسم</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الشعبة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الوحدة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">المعبر</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">المسمى الوظيفي</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الحالة الوظيفية</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">نوع الموظف</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">البرنامج</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">التصنيف</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الفئة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الدرجة</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">المؤهل العلمي</Form.Label>
                                <Form.Select className="rounded-3 border-light-subtle shadow-sm py-2">
                                    <option value="">الكل</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                        <Button
                            variant="light"
                            className="rounded-pill px-4 fw-medium border shadow-sm"
                            onClick={onCancel}
                        >
                            إلغاء
                        </Button>

                        <Button
                            className="rounded-pill px-4 fw-medium bg-custom border-0 shadow text-white"
                            onClick={() => onApply({ type, department })}
                        >
                            تطبيق الفلاتر
                        </Button>
                    </div>
                </div>
            </div>
        </Collapse>
    );
}

export default AdvancedFilters;
