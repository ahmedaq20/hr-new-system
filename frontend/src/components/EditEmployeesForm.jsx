import React, { useState, useEffect } from "react";
import SearchableSelect from "./SearchableSelect";
import CSelect from "./CSelect";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { useUpdateEmployee } from "../hooks/useEmployees";
import { useLookups } from "../hooks/useLookups";

import { stepsDefinition, fieldsDefinition } from "../constants/employeeFields";

function EditEmployeesForm({ employee, onSave, onCancel }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const updateEmployee = useUpdateEmployee();
  const lookups = useLookups();

  useEffect(() => {
    if (employee) {
      const work = employee.work_detail || {};

      // Normalize all fields from constants
      const normalizedData = { ...employee };

      // Flatten work_detail into the main object for the form
      Object.keys(work).forEach(key => {
        if (key === 'is_supervisory') {
          normalizedData[key] = work[key] ? 1 : 0;
        } else {
          normalizedData[key] = work[key];
        }
      });

      const dateFields = ['birth_date', 'date_of_appointment', 'hiring_date'];
      dateFields.forEach(field => {
        if (normalizedData[field]) {
          normalizedData[field] = new Date(normalizedData[field]);
        }
      });

      setFormData(normalizedData);
    }
  }, [employee]);

  const handleChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };

      // If employment type changed, and it's NOT a contract, clear the contract_id
      if (key === 'employment_type_id') {
        const contractTypeId = lookups.data?.EMPLOYMENT_TYPE?.find(t => t.slug === 'employment_type.contract')?.id;
        if (String(value) !== String(contractTypeId)) {
          updated.contract_id = null;
        }
      }

      return updated;
    });
  };

  const handleSave = () => {
    if (!employee?.id) return;

    // Prepare sanitized payload (flat fields only)
    const payload = {};

    Object.keys(formData).forEach(key => {
      let value = formData[key];

      if (value instanceof Date) {
        // Convert dates to YYYY-MM-DD
        value = value.toISOString().split('T')[0];
      } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Skip redundant nested objects
        return;
      }

      if (key === 'is_supervisory') {
        payload[key] = Boolean(Number(value));
      } else if (value === "" && key === 'contract_id') {
        payload[key] = null; // Explicitly send null if cleared out
      } else {
        payload[key] = value;
      }
    });

    updateEmployee.mutate({ id: employee.id, data: payload }, {
      onSuccess: (data) => {
        toast.success("تم تحديث بيانات الموظف بنجاح");
        if (onSave) onSave(data);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ");
      }
    });
  };

  const renderFields = (stepKey) => (
    <div className="row g-4 text-end">
      {fieldsDefinition[stepKey]?.filter(field => !field.showIf || field.showIf(formData, lookups.data)).map((field) => (
        <div key={field.key} className="col-12 col-sm-6 col-md-4 col-lg-3">
          <div className="form-group mb-0">
            <label className="form-label fw-bold text-secondary mb-2 small">{field.label}</label>
            <div className="field-container">
              {field.type === "select" ? (() => {
                const options = (field.lookupKey ? lookups.data?.[field.lookupKey] : (field.options?.map(o => typeof o === 'string' ? { id: o, value: o } : o) || []))
                  ?.map(opt => ({ value: opt.id, label: opt.value })) || [];

                const selectedValue = options.find(opt => String(opt.value) === String(formData[field.key]));

                return (
                  <CSelect
                    options={options}
                    value={selectedValue}
                    onChange={opt => handleChange(field.key, opt ? opt.value : "")}
                    placeholder="اختر من القائمة"
                    isLoading={field.lookupKey && lookups.isLoading}
                    isRtl={true}
                    isSearchable={true}
                  />
                );
              })() : field.type === "date" ? (
                <DatePicker
                  selected={formData[field.key] || null}
                  onChange={date => handleChange(field.key, date)}
                  dateFormat="yyyy/MM/dd"
                  className="form-control shadow-none border-secondary-subtle"
                  placeholderText="yyyy / mm / dd"
                  wrapperClassName="w-100"
                  popperPlacement="bottom-end"
                />
              ) : (
                <input
                  type={field.type}
                  className="form-control shadow-none border-secondary-subtle"
                  value={formData[field.key] || ""}
                  onChange={e => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="edit-form-wrapper" style={{ direction: 'rtl' }}>
      <nav className="nav nav-pills nav-modern mb-4 bg-light p-1 rounded-3 overflow-auto flex-nowrap shadow-sm border">
        {stepsDefinition.map((step, index) => (
          <button
            key={index}
            className={`nav-link border-0 fw-bold py-2 px-3 white-space-nowrap transition-all ${activeStep === index ? "active shadow-sm" : "text-secondary"}`}
            onClick={() => setActiveStep(index)}
            style={{ fontSize: '13px', minWidth: 'fit-content' }}
          >
            {step.title}
          </button>
        ))}
      </nav>

      <div className="card main-edit-card border-0 shadow-sm mb-4">
        <div className="card-body p-4" style={{ minHeight: '450px', maxHeight: '450px', overflowY: 'auto' }}>
          {stepsDefinition[activeStep].contentKey === "review" ? (
            <div className="review-step text-end">
              <h5 className="mb-4 fw-bold text-dark d-flex align-items-center gap-2">
                <span className="section-dot"></span>
                مراجعة البيانات النهائية
              </h5>
              <div className="alert alert-info border-0 shadow-sm py-2 small mb-4 rounded-3 bg-opacity-10" style={{ backgroundColor: 'rgba(0, 47, 108, 0.05)', color: '#002F6C' }}>
                <i className="bi bi-info-circle ms-2"></i>
                يرجى التأكد من الحقول التالية قبل الحفظ النهائي
              </div>

              <div className="row g-3">
                {Object.keys(fieldsDefinition).map(stepKey => (
                  <div key={stepKey} className="col-12 mb-4">
                    <h6 className="fw-bold border-bottom pb-2 mb-3 mt-2 text-primary d-flex align-items-center gap-2">
                      <i className="bi bi-chevron-left small"></i>
                      {stepsDefinition.find(s => s.contentKey === stepKey)?.title}
                    </h6>
                    <div className="row g-2">
                      {fieldsDefinition[stepKey].filter(field => !field.showIf || field.showIf(formData, lookups.data)).map(field => {
                        const val = formData[field.key];
                        let displayVal = val;

                        if (field.type === "select") {
                          if (field.lookupKey) {
                            const opt = lookups.data?.[field.lookupKey]?.find(o => String(o.id) === String(val));
                            displayVal = opt ? opt.value : val;
                          }
                        } else if (val instanceof Date) {
                          displayVal = val.toLocaleDateString('ar-EG');
                        }

                        return (
                          <div key={field.key} className="col-md-4 col-sm-6 mb-2">
                            <span className="text-secondary small d-block mb-1">{field.label}:</span>
                            <span className="fw-bold small text-dark modern-value-tag">{displayVal || "---"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            renderFields(stepsDefinition[activeStep].contentKey)
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center border-top pt-4 mt-2">
        <div>
          {activeStep === 0 ? (
            <button
              onClick={onCancel}
              className="btn btn-outline-danger modern-btn px-4 fw-bold transition-all"
            >
              إلغاء التعديل
            </button>
          ) : (
            <button
              onClick={() => setActiveStep(prev => Math.max(prev - 1, 0))}
              disabled={updateEmployee.isPending}
              className="btn btn-light modern-btn px-4 fw-bold border transition-all"
            >
              <i className="bi bi-arrow-right ms-2"></i>
              السابق
            </button>
          )}
        </div>

        <div className="d-flex gap-2">
          {activeStep < stepsDefinition.length - 1 ? (
            <button
              onClick={() => setActiveStep(prev => Math.min(prev + 1, stepsDefinition.length - 1))}
              className="btn modern-btn next-btn px-4 fw-bold shadow-sm transition-all"
            >
              التالي
              <i className="bi bi-arrow-left me-2"></i>
            </button>
          ) : (
            <button
              className="btn modern-btn save-btn px-5 fw-bold shadow-sm transition-all"
              onClick={handleSave}
              disabled={updateEmployee.isPending}
            >
              {updateEmployee.isPending ? (
                <>
                  <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle ms-2"></i>
                  حفظ التغييرات النهائية
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .nav-modern .nav-link {
          border-radius: 6px;
          margin: 2px;
          color: #6c757d;
        }
        
        .nav-modern .nav-link.active {
          background-color: #002F6C !important;
          color: white !important;
        }

        .main-edit-card {
           border-top: 5px solid #002F6C !important;
           border-radius: 12px;
        }

        .form-label {
          color: #495057;
          font-size: 0.85rem;
        }

        .form-control, .form-select {
          border-radius: 8px;
          padding: 0.6rem 0.75rem;
          font-size: 13px;
          border: 1px solid #dee2e6;
          transition: all 0.2s;
        }

        .form-control:focus, .form-select:focus {
          border-color: #002F6C;
          box-shadow: 0 0 0 0.25rem rgba(0, 47, 108, 0.1);
        }

        .modern-btn {
          border-radius: 50px;
          font-size: 14px;
          padding: 10px 25px;
          display: flex;
          align-items: center;
        }

        .next-btn {
          background-color: #002F6C;
          color: white;
          border: none;
        }

        .next-btn:hover {
          background-color: #001f46;
          color: white;
          transform: translateY(-2px);
        }

        .save-btn {
          background-color: #087f5b;
          color: white;
          border: none;
        }

        .save-btn:hover {
          background-color: #066044;
          color: white;
          transform: translateY(-2px);
        }

        .section-dot {
          width: 10px;
          height: 10px;
          background-color: #002F6C;
          border-radius: 50%;
          display: inline-block;
        }

        .modern-value-tag {
          background-color: #f8f9fa;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
          border: 1px solid #eee;
        }

        .transition-all {
          transition: all 0.2s ease;
        }

        /* Searchable Select Custom Styles */
        .modern-select-toggle {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: left 0.75rem center !important; /* Move arrow to left */
          background-size: 16px 12px !important;
          padding-left: 2.5rem !important; /* Spacing for arrow on left */
          padding-right: 0.75rem !important;
          background-color: white !important;
          text-align: right !important;
        }

        .modern-select-toggle::after {
          display: none !important; /* Hide default bootstrap arrow */
        }

        .modern-dropdown-menu {
          border: 1px solid rgba(0, 47, 108, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
          margin-top: 5px !important;
          z-index: 1060 !important;
        }

        .dropdown-item.active {
          background-color: #002F6C !important;
        }

        .dropdown-item:hover:not(.active) {
          background-color: #f1f3f5 !important;
        }

        .search-select-container {
          position: relative;
        }

        .field-container {
          width: 100%;
        }
      `}</style>
    </div>
  );
}

export default EditEmployeesForm;