import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import { stepsDefinition, fieldsDefinition } from "../constants/employeeFields";
import { useLookups } from "../hooks/useLookups";

function EditEmpWizard({ employee }) {
  const [activeStep, setActiveStep] = useState(0);
  const lookups = useLookups();

  if (!employee) return <p className="text-center p-5 text-muted">لا توجد بيانات للعرض</p>;

  // Helper to safely render values (handle objects from API or resolve IDs from lookups)
  const renderValue = (val, fieldKey = null, lookupKey = null) => {
    // 1. If we have a lookupKey, try to resolve the label
    if (lookupKey && lookups.data?.[lookupKey]) {
      const option = lookups.data[lookupKey].find(opt => String(opt.id) === String(val));
      if (option) return option.value;
    }

    // 2. Handle boolean/special values
    if (typeof val === 'boolean') return val ? "نعم" : "لا";

    // 3. Handle dates (basic check for ISO strings)
    if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val))) {
      return val.split('T')[0];
    }

    // 4. Handle objects (already resolved or nested data)
    if (val && typeof val === 'object') {
      return val.value || val.name || val.label || JSON.stringify(val);
    }

    return (val !== null && val !== undefined && val !== "") ? val : "---";
  };

  // Helper to map form keys to actual data in the employee object
  const getValueByKey = (key) => {
    // Direct property access for the flat structure
    return employee[key];
  };

  const steps = stepsDefinition.map(step => ({
    title: <div className="d-flex align-items-center justify-content-center gap-2">
      <span className="step-icon-circle">{stepsDefinition.indexOf(step) + 1}</span>
      <span>{step.title}</span>
    </div>,
    content: step.contentKey === 'review' ? (
      <div className="review-summary-container animate-fade-in" style={{ textAlign: "right" }}>
        <h5 className="mb-4 fw-bold text-dark border-bottom pb-2 d-flex align-items-center gap-2">
          <i className="bi bi-file-earmark-person" style={{ color: '#002F6C' }}></i>
          ملخص بيانات الموظف النهائية
        </h5>
        <div className="row g-4 overflow-auto custom-scrollbar" style={{ maxHeight: "500px" }}>
          {Object.keys(fieldsDefinition).map(categoryKey => (
            <div key={categoryKey} className="col-12 mb-2">
              <div className="category-section p-3 rounded-4 bg-light-subtle border-start border-4 shadow-sm" style={{ borderLeftColor: '#002F6C !important' }}>
                <h6 className="fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: '#002F6C' }}>
                  <span className="small-dot" style={{ backgroundColor: '#002F6C' }}></span>
                  {stepsDefinition.find(s => s.contentKey === categoryKey)?.title}
                </h6>
                <div className="row g-3 px-2">
                  {fieldsDefinition[categoryKey].filter(field => !field.showIf || field.showIf(employee, lookups.data)).map((field, fIdx) => (
                    <div key={fIdx} className="col-md-4 col-sm-6">
                      <div className="info-item">
                        <span className="text-secondary extra-small d-block opacity-75">{field.label}</span>
                        <span className="fw-semibold text-dark-emphasis">{renderValue(getValueByKey(field.key), field.key, field.lookupKey)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="row g-3 cardValue animate-fade-in" style={{ textAlign: "right" }}>
        {fieldsDefinition[step.contentKey]?.filter(field => !field.showIf || field.showIf(employee, lookups.data)).map((field, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-4 col-xl-3">
            <div className="stat-card p-3 rounded-4 h-100 transition-all border">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-muted small fw-medium">{field.label}</span>
                <i className="bi bi-info-circle-fill opacity-25" style={{ color: '#002F6C' }}></i>
              </div>
              <div className="val-container">
                <span className="fw-bold text-dark fs-6 d-block mt-1">
                  {renderValue(getValueByKey(field.key), field.key, field.lookupKey)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }));

  return (
    <div className="wizard-container py-2">
      <div className="tabs-wrapper mb-4 p-2 bg-white rounded-pill shadow-sm d-flex flex-nowrap overflow-auto hide-scrollbar sticky-top mx-auto" style={{ width: 'fit-content', top: '20px', zIndex: 100, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(0, 47, 108, 0.08)' }}>
        {steps.map((step, index) => (
          <div
            key={index}
            onClick={() => setActiveStep(index)}
            className={`tab-item px-4 py-2 rounded-pill cursor-pointer transition-all white-space-nowrap ${activeStep === index
              ? "bg-white shadow-sm fw-bold scale-up"
              : "text-secondary opacity-75"
              }`}
            style={activeStep === index ? { color: '#002F6C', boxShadow: '0 4px 10px rgba(0, 47, 108, 0.1)' } : {}}
          >
            {step.title}
          </div>
        ))}
      </div>

      <div className="content-container p-4 bg-white rounded-4 border-0" style={{ minHeight: "500px" }}>
        {steps[activeStep].content}
      </div>

      <style>{`
        .white-space-nowrap { white-space: nowrap; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .extra-small { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        
        .tab-item {
            font-size: 0.88rem;
            min-width: 140px;
            text-align: center;
        }
        
        .tab-item:hover:not(.bg-white) {
            background-color: rgba(0, 47, 108, 0.05);
            opacity: 1;
        }

        .step-icon-circle {
            width: 20px;
            height: 20px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #f1f3f5;
            color: #adb5bd;
            border-radius: 50%;
            font-size: 0.7rem;
        }

        .active .step-icon-circle {
            background-color: #002F6C;
            color: white;
        }

        .scale-up {
            transform: scale(1.06);
        }

        .stat-card {
            background: #fff;
            border-color: #f1f3f5 !important;
            box-shadow: 0 4px 6px rgba(0, 47, 108, 0.02);
        }

        .stat-card:hover {
            box-shadow: 0 12px 24px rgba(0, 47, 108, 0.08);
            border-color: rgba(0, 47, 108, 0.1) !important;
            transform: translateY(-5px);
        }

        .category-section {
            background-color: #fcfdfe;
            border-left-color: #002F6C !important;
        }

        .small-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            display: inline-block;
        }

        .animate-fade-in {
            animation: fadeIn 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8f9fa; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #dee2e6; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default EditEmpWizard;
