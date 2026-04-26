import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees";
import { Card, Button, Spinner, Breadcrumb } from "react-bootstrap";
import EditEmpWizard from "../components/EditEmpWizard";
import EditEmployeesForm from "../components/EditEmployeesForm";
import { usePermissions } from "../hooks/usePermissions";

function EmployeeDetails() {
    const { can } = usePermissions();
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const { data: employeeData, isLoading, error, refetch } = useEmployee(id);
    const rawEmployee = employeeData?.data || null;

    // Flatten work_detail if it exists to maintain compatibility with flat components
    const employee = rawEmployee ? {
        ...rawEmployee,
        ...(rawEmployee.work_detail || {})
    } : null;

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-secondary">جارٍ تحميل بيانات الموظف...</p>
                </div>
            </div>
        );
    }

    if (error || !employee) {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">حدث خطأ أثناء تحميل بيانات الموظف أو الموظف غير موجود.</div>
                <Button variant="primary" onClick={() => navigate("/employees")}>العودة لقائمة الموظفين</Button>
            </div>
        );
    }

    const handleSaveSuccess = () => {
        setIsEditing(false);
        refetch(); // Refresh data to show updated values
    };

    return (
        <div className="container-fluid py-4 min-vh-100 bg-light-subtle">
            {isEditing ? (
                <div className="bg-white rounded-4 shadow-sm p-4 animate-fade-in border-top border-5" style={{ borderTopColor: '#002F6C !important' }}>
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h4 className="fw-bold mb-0 text-dark">
                            <i className="bi bi-pencil-square ms-2" style={{ color: '#002F6C' }}></i>
                            تعديل بيانات {employee.full_name}
                        </h4>
                        <Button variant="light" className="rounded-pill px-3 shadow-sm border" onClick={() => setIsEditing(false)}>
                            إلغاء التعديل
                        </Button>
                    </div>
                    <EditEmployeesForm
                        employee={rawEmployee}
                        onSave={handleSaveSuccess}
                        onCancel={() => setIsEditing(false)}
                    />
                </div>
            ) : (
                <>
                    {/* Header Area - Glassmorphism Aesthetic */}
                    <div className="employee-header mb-4 p-4 rounded-4 shadow-sm border bg-white position-relative overflow-hidden">
                        <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

                        <div className="row align-items-center position-relative" style={{ zIndex: 1 }}>
                            <div className="col-lg-8">
                                <div className="d-flex align-items-center flex-wrap gap-4">
                                    {/* Avatar / Profile Initial */}
                                    <div className="profile-avatar-large shadow-sm d-flex align-items-center justify-content-center rounded-circle text-white fs-2 fw-bold"
                                        style={{ width: '80px', height: '80px', border: '4px solid #fff', background: 'linear-gradient(135deg, #002F6C 0%, #1c3d5a 100%)' }}>
                                        {employee.full_name?.charAt(0) || "م"}
                                    </div>

                                    <div>

                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <h2 className="mb-0 fw-bold text-dark-emphasis tracking-tight">{employee.full_name}</h2>
                                            <div className="d-flex gap-2">
                                                <span className="badge-modern badge-id">
                                                    <i className="bi bi-hash"></i>{employee.employee_number}
                                                </span>
                                                <span className={`badge-modern ${employee.is_active !== false ? 'badge-active' : 'badge-inactive'}`}>
                                                    <span className="pulse-dot ms-2"></span>
                                                    {employee.is_active !== false ? "حساب نشط" : "غير نشط"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-flex align-items-center gap-4 mt-2 flex-wrap text-secondary">
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-briefcase" style={{ color: '#002F6C' }}></i>
                                                <span className="small fw-medium">
                                                    {employee.job_title_name || (typeof employee.work_detail?.job_title === 'object' ? employee.work_detail?.job_title?.value : employee.work_detail?.job_title) || "---"}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-geo-alt text-danger"></i>
                                                <span className="small fw-medium">
                                                    {employee.governorate?.name || "---"} - {employee.city?.name || "---"}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-card-text text-success"></i>
                                                <span className="small fw-medium">{employee.national_id || "---"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-4 mt-4 mt-lg-0">
                                <div className="d-flex gap-3 justify-content-lg-end">
                                    <Button
                                        variant="light"
                                        className="action-button secondary rounded-pill px-4 py-2 border shadow-sm transition-all"
                                        onClick={() => navigate(-1)}
                                    >
                                        <span>رجوع</span>
                                    </Button>
                                    {can.editEmployees && (
                                      <Button
                                          variant="primary"
                                          className="action-button primary rounded-pill px-4 py-2 shadow transition-all d-flex align-items-center gap-2"
                                          style={{ background: '#002F6C', border: 'none' }}
                                          onClick={() => setIsEditing(true)}
                                      >
                                          <i className="bi bi-pencil-square"></i>
                                          <span>تعديل البيانات</span>
                                      </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-white rounded-4 shadow-sm border-0 overflow-hidden main-content-shield">
                        <div className="p-0">
                            <EditEmpWizard employee={employee} />
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
                
                .tracking-tight { letter-spacing: -0.02em; }
                
                .employee-header {
                    background: rgba(255, 255, 255, 0.9) !important;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 47, 108, 0.1) !important;
                }

                .custom-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
                    content: "«";
                    color: #adb5bd;
                    font-size: 0.8rem;
                }

                .badge-modern {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.45rem 0.95rem;
                    border-radius: 50px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                }

                .badge-id {
                    background-color: #f1f3f5;
                    color: #002F6C;
                    border: 1px solid #dee2e6;
                }

                .badge-active {
                    background-color: #e6fcf5;
                    color: #087f5b;
                    border: 1px solid #c3fae8;
                }

                .badge-inactive {
                    background-color: #fff5f5;
                    color: #c92a2a;
                    border: 1px solid #ffe3e3;
                }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background-color: currentColor;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(0,0,0, 0.1); }
                    70% { box-shadow: 0 0 0 8px rgba(0,0,0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(0,0,0, 0); }
                }

                .action-button:hover {
                    transform: translateY(-2.5px);
                    box-shadow: 0 6px 12px rgba(0, 47, 108, 0.15) !important;
                }

                .action-button.primary:active {
                    transform: translateY(0);
                }

                .main-content-shield {
                    border-top: 5px solid #002F6C !important;
                }

                .employeeName, .employeeRole { display: none; }
            `}</style>
        </div>
    );
}

export default EmployeeDetails;
