import React, { useState } from "react";
import { Row, Col, Form, Button, Collapse } from "react-bootstrap";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";

function AdvancedFilters({ show, onApply, onCancel, onHide }) {
    const lookups = useLookups();
    const L = lookups.data || {};
    const isLoading = lookups.isLoading;

    // Helper: convert lookup array to CSelect options format
    const toOptions = (lookupKey) =>
        (L[lookupKey] || []).map((opt) => ({ value: opt.id, label: opt.value }));

    const initialFilters = {
        filter_full_name: "",
        filter_national_id: "",
        filter_employee_number: "",
        filter_ministry: "",
        filter_sub_office: "",
        filter_management_department: "",
        filter_department: "",
        filter_section: "",
        filter_division: "",
        filter_unit: "",
        filter_crossing: "",
        filter_job_title: "",
        filter_employment_status: "",
        filter_employment_type: "",
        filter_program: "",
        filter_classification: "",
        filter_category: "",
        filter_degree: "",
        filter_certificate: "",
    };

    const [filters, setFilters] = useState({ ...initialFilters });

    const setFilter = (key, value) =>
        setFilters((prev) => ({ ...prev, [key]: value }));

    const handleReset = () => {
        setFilters({ ...initialFilters });
        // onCancel();
    };
    const handleClose = () => {
        onCancel();
    };

    const handleApply = () => {
        // Build clean object — skip empty values
        const activeFilters = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v !== "" && v !== null && v !== undefined)
        );
        onApply(activeFilters);
    };

    // Count active filters for badge
    const activeCount = Object.values(filters).filter(
        (v) => v !== "" && v !== null && v !== undefined
    ).length;

    // Helper: get the selected option object for CSelect
    const getSelected = (key, lookupKey) => {
        const val = filters[key];
        if (!val && val !== 0) return null;
        const opts = toOptions(lookupKey);
        return opts.find((o) => String(o.value) === String(val)) || null;
    };

    // Render a CSelect filter field
    const renderSelect = (label, filterKey, lookupKey) => (
        <Col md={3} key={filterKey}>
            <Form.Group>
                <Form.Label className="fw-bold text-secondary small mb-1">{label}</Form.Label>
                <CSelect
                    options={toOptions(lookupKey)}
                    value={getSelected(filterKey, lookupKey)}
                    onChange={(opt) => setFilter(filterKey, opt ? opt.value : "")}
                    placeholder="الكل"
                    isLoading={isLoading}
                    isClearable={true}
                    isRtl={true}
                    isSearchable={true}
                />
            </Form.Group>
        </Col>
    );

    return (
        <Collapse in={show} mountOnEnter>
            <div className="advanced-filters-collapse-container pb-4">
                <div
                    className="p-4 rounded-4 shadow-sm border bg-white animate-fade-in"
                    style={{ direction: "rtl", borderTop: "3px solid #002F6C" }}
                >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <h5
                            className="fw-bold mb-0 text-dark d-flex align-items-center gap-2"
                            style={{ fontSize: "1rem" }}
                        >
                            <i className="bi bi-funnel-fill" style={{ color: "#002F6C" }}></i>
                            الفلاتر المتقدمة
                            {activeCount > 0 && (
                                <span
                                    className="badge rounded-2 text-white"
                                    style={{ background: "#002F6C", fontSize: "0.7rem" }}
                                >
                                    {activeCount} نشط
                                </span>
                            )}
                        </h5>
                        {activeCount > 0 && (
                            <button
                                className="rounded-3 px-4 py-2 fw-medium border shadow-sm d-flex align-items-center gap-2"
                                style={{ fontSize: "0.8rem" }}
                                onClick={handleReset}
                            >
                                مسح الكل
                            </button>
                        )}
                    </div>

                    {/* --- البيانات الشخصية --- */}
                    <p className="text-muted small mb-3 border-bottom pb-2">البيانات الشخصية</p>
                    <Row className="g-3 mb-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الإسم الكامل</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                    value={filters.filter_full_name}
                                    onChange={(e) => setFilter("filter_full_name", e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">رقم الهوية</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                    value={filters.filter_national_id}
                                    onChange={(e) => setFilter("filter_national_id", e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-secondary small mb-1">الرقم الوظيفي</Form.Label>
                                <Form.Control
                                    type="text"
                                    className="rounded-3 border-light-subtle shadow-sm py-2"
                                    placeholder="اكتب هنا"
                                    value={filters.filter_employee_number}
                                    onChange={(e) => setFilter("filter_employee_number", e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* --- البيانات التنظيمية --- */}
                    <p className="text-muted small mb-3 border-bottom pb-2">البيانات التنظيمية</p>
                    <Row className="g-3 mb-3">
                        {renderSelect("الوزارة", "filter_ministry", "MINISTRY")}
                        {renderSelect("المكاتب الفرعية", "filter_sub_office", "SUB_OFFICE")}
                        {renderSelect("الإدارة العامة", "filter_management_department", "MANAGEMENT_DEPARTMENT")}
                        {renderSelect("الدائرة", "filter_department", "DEPARTMENT")}
                        {renderSelect("القسم", "filter_section", "SECTION")}
                        {renderSelect("الشعبة", "filter_division", "DIVISION")}
                        {renderSelect("الوحدة", "filter_unit", "UNIT")}
                        {renderSelect("المعبر", "filter_crossing", "CROSSING")}
                    </Row>

                    {/* --- البيانات الوظيفية والمهنية --- */}
                    <p className="text-muted small mb-3 border-bottom pb-2">البيانات الوظيفية والمهنية</p>
                    <Row className="g-3">
                        {renderSelect("المسمى الوظيفي", "filter_job_title", "JOB_TITLE")}
                        {renderSelect("الحالة الوظيفية", "filter_employment_status", "EMPLOYMENT_STATUS")}
                        {renderSelect("نوع الموظف", "filter_employment_type", "EMPLOYMENT_TYPE")}
                        {renderSelect("البرنامج", "filter_program", "PROGRAM")}
                        {renderSelect("التصنيف", "filter_classification", "CLASSIFICATION")}
                        {renderSelect("الفئة", "filter_category", "CATEGORY")}
                        {renderSelect("الدرجة", "filter_degree", "DEGREE")}
                        {renderSelect("المؤهل العلمي", "filter_certificate", "CERTIFICATE")}
                    </Row>

                    <div className="d-flex justify-content-end align-items-center gap-2 mt-4 pt-3 border-top">
                        <Button
                            variant="light"
                            className="rounded-3 px-3 py-2 fw-medium border shadow-sm d-flex align-items-center gap-2 text-secondary ms-auto"
                            style={{ fontSize: '0.85rem' }}
                            onClick={onHide}
                        >
                            إخفاء
                        </Button>

                        <Button
                            className="rounded-3 px-4 py-2 fw-bold shadow d-flex align-items-center gap-2 border-0 btn btn-primary"
                            style={{ background: "#002F6C" }}
                            onClick={handleApply}
                        >
                            تطبيق الفلاتر
                            {activeCount > 0 && (
                                <span
                                    className="badge bg-white text-dark rounded-pill me-2"
                                    style={{ fontSize: "0.75rem" }}
                                >
                                    {activeCount}
                                </span>
                            )}
                        </Button>

                        <Button
                            variant="light"
                            className="rounded-3 px-4 py-2 fw-medium border shadow-sm d-flex align-items-center gap-2"
                            onClick={handleClose}
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            </div>
        </Collapse>
    );
}

export default AdvancedFilters;
