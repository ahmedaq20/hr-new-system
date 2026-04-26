import React, { useState, useEffect } from "react";
import { Collapse, Form, Row, Col, Button, Badge } from "react-bootstrap";
import { usePrograms } from "../hooks/usePrograms";
import { useLookups } from "../hooks/useLookups";
import CSelect from "./CSelect";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BsFilterLeft,
  BsXCircle,
  BsCheck2Circle,
  BsCalendar3,
  BsPersonBadge,
  BsBriefcase,
  BsMortarboard
} from "react-icons/bs";

const AdvancedFiltersTemp = ({ show, onCancel, onApply, onHide }) => {
  const initialFilters = {
    filter_temp_contract_project_id: "",
    filter_position_type: "",
    filter_certificate_id: "",
    filter_governorate_id: "",
    filter_gender: "",
    filter_marital_status: "",
    filter_national_id: "",
    filter_primary_phone: "",
    filter_birthdate_from: "",
    filter_birthdate_to: "",
    filter_start_contract_from: "",
    filter_start_contract_to: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  const { data: programs, isLoading: programsLoading } = usePrograms();
  const { data: lookups, isLoading: lookupsLoading } = useLookups();

  const handleSelectChange = (name, option) => {
    setFilters((prev) => ({ ...prev, [name]: option ? option.value : "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFilters((prev) => ({
      ...prev,
      [name]: date ? date.toISOString().split('T')[0] : ""
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onCancel(); // Use the standard behavior of clearing and closing
  };

  const getSelected = (options, value) => {
    if (!value && value !== 0) return null;
    return options.find(o => String(o.value) === String(value)) || null;
  };

  const activeCount = Object.values(filters).filter(value => value !== "").length;

  // Options Mapping
  const projectOptions = programs?.map(p => ({ value: p.id, label: p.name })) || [];
  const govOptions = lookups?.GOVERNORATE?.map(g => ({ value: g.id, label: g.value })) || [];
  const certOptions = lookups?.CERTIFICATE?.map(c => ({ value: c.id, label: c.value })) || [];

  const genderOptions = [
    { value: "male", label: "ذكر" },
    { value: "female", label: "أنثى" }
  ];
  const maritalOptions = [
    { value: "single", label: "أعزب/عزباء" },
    { value: "married", label: "متزوج/متزوجة" },
    { value: "divorced", label: "مطلق/مطلقة" },
    { value: "widowed", label: "أرمل/أرملة" }
  ];

  return (
    <Collapse in={show} mountOnEnter>
      <div className="advanced-filters-temp-wrapper pb-4">
        <div className="bg-white rounded-4 shadow-sm p-4 border border-light-subtle">

          <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
            <h6 className="fw-bold text-primary mb-0 d-flex align-items-center gap-2">
              <BsFilterLeft size={20} />
              فلاتر البحث المتقدم (عقود مؤقتة/مشاريع)
            </h6>
            {activeCount > 0 && (
              <div className="d-flex align-items-center gap-2">
                <button
                  className="rounded-3 px-3 py-1 fw-medium border shadow-sm d-flex align-items-center gap-2"
                  style={{ fontSize: "0.8rem", background: "#f8f9fa" }}
                  onClick={() => setFilters({ ...initialFilters })}
                >
                  مسح الكل
                </button>
                <Badge pill bg="primary" className="fs-7">
                  {activeCount} {activeCount === 1 ? 'فلتر نشط' : 'فلاتر نشطة'}
                </Badge>
              </div>
            )}
          </div>

          <Form>
            {/* Row 1: Project & Position */}
            <Row className="g-3 mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary d-flex align-items-center gap-2">
                    <BsBriefcase className="text-primary opacity-50" /> المشروع
                  </Form.Label>
                  <CSelect
                    options={projectOptions}
                    value={getSelected(projectOptions, filters.filter_temp_contract_project_id)}
                    onChange={(opt) => handleSelectChange("filter_temp_contract_project_id", opt)}
                    placeholder="اختر المشروع..."
                    isLoading={programsLoading}
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">طبيعة العمل</Form.Label>
                  <Form.Control
                    name="filter_position_type"
                    value={filters.filter_position_type}
                    onChange={handleInputChange}
                    placeholder="مثال: مهندس، تقني..."
                    className="rounded-3 shadow-none border-light-subtle py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary d-flex align-items-center gap-2">
                    <BsMortarboard className="text-primary opacity-50" /> المؤهل العلمي
                  </Form.Label>
                  <CSelect
                    options={certOptions}
                    value={getSelected(certOptions, filters.filter_certificate_id)}
                    onChange={(opt) => handleSelectChange("filter_certificate_id", opt)}
                    placeholder="اختر المؤهل..."
                    isLoading={lookupsLoading}
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: ID, Phone, Gov, Gender */}
            <Row className="g-3 mb-4">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary d-flex align-items-center gap-2">
                    <BsPersonBadge className="text-primary opacity-50" /> رقم الهوية
                  </Form.Label>
                  <Form.Control
                    name="filter_national_id"
                    value={filters.filter_national_id}
                    onChange={handleInputChange}
                    placeholder="000000000"
                    className="rounded-3 shadow-none border-light-subtle py-2 text-center"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">رقم الجوال</Form.Label>
                  <Form.Control
                    name="filter_primary_phone"
                    value={filters.filter_primary_phone}
                    onChange={handleInputChange}
                    placeholder="059..."
                    className="rounded-3 shadow-none border-light-subtle py-2 text-center"
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">المحافظة</Form.Label>
                  <CSelect
                    options={govOptions}
                    value={getSelected(govOptions, filters.filter_governorate_id)}
                    onChange={(opt) => handleSelectChange("filter_governorate_id", opt)}
                    placeholder="اختر..."
                    isLoading={lookupsLoading}
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">الجنس</Form.Label>
                  <CSelect
                    options={genderOptions}
                    value={getSelected(genderOptions, filters.filter_gender)}
                    onChange={(opt) => handleSelectChange("filter_gender", opt)}
                    placeholder="اختر..."
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary">الحالة الاجتماعية</Form.Label>
                  <CSelect
                    options={maritalOptions}
                    value={getSelected(maritalOptions, filters.filter_marital_status)}
                    onChange={(opt) => handleSelectChange("filter_marital_status", opt)}
                    placeholder="اختر..."
                    isClearable
                    isRtl
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Dates */}
            <Row className="g-3 mb-2">
              <Col md={6}>
                <Form.Group className="bg-light p-3 rounded-3 border border-light-subtle">
                  <Form.Label className="small fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <BsCalendar3 className="text-primary" /> تاريخ التوظيف (من - إلى)
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <DatePicker
                      selected={filters.filter_start_contract_from ? new Date(filters.filter_start_contract_from) : null}
                      onChange={(date) => handleDateChange("filter_start_contract_from", date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control rounded-3 shadow-none border-light-subtle py-2 text-center small w-100"
                      placeholderText="من تاريخ"
                    />
                    <DatePicker
                      selected={filters.filter_start_contract_to ? new Date(filters.filter_start_contract_to) : null}
                      onChange={(date) => handleDateChange("filter_start_contract_to", date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control rounded-3 shadow-none border-light-subtle py-2 text-center small w-100"
                      placeholderText="إلى تاريخ"
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="bg-light p-3 rounded-3 border border-light-subtle">
                  <Form.Label className="small fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <BsCalendar3 className="text-primary" /> تاريخ الميلاد (من - إلى)
                  </Form.Label>
                  <div className="d-flex gap-2">
                    <DatePicker
                      selected={filters.filter_birthdate_from ? new Date(filters.filter_birthdate_from) : null}
                      onChange={(date) => handleDateChange("filter_birthdate_from", date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control rounded-3 shadow-none border-light-subtle py-2 text-center small w-100"
                      placeholderText="من تاريخ"
                    />
                    <DatePicker
                      selected={filters.filter_birthdate_to ? new Date(filters.filter_birthdate_to) : null}
                      onChange={(date) => handleDateChange("filter_birthdate_to", date)}
                      dateFormat="yyyy-MM-dd"
                      className="form-control rounded-3 shadow-none border-light-subtle py-2 text-center small w-100"
                      placeholderText="إلى تاريخ"
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end align-items-center gap-2 mt-4 pt-4 border-top">
              <Button
                variant="light"
                className="rounded-3 px-3 py-2 fw-medium border shadow-sm d-flex align-items-center gap-2 text-secondary ms-auto"
                style={{ fontSize: '0.85rem' }}
                onClick={onHide}
              >
                <BsXCircle size={14} /> إخفاء
              </Button>

              <Button
                variant="primary"
                className="rounded-3 px-4 py-2 fw-bold shadow d-flex align-items-center gap-2 border-0"
                style={{ background: '#002F6C' }}
                onClick={() => onApply(filters)}
              >
                <BsCheck2Circle size={18} /> تطبيق الفلاتر
              </Button>

              <Button
                variant="light"
                className="rounded-3 px-4 py-2 fw-medium border shadow-sm d-flex align-items-center gap-2"
                onClick={onCancel}
              >
                إلغاء
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </Collapse>
  );
};

export default AdvancedFiltersTemp;
