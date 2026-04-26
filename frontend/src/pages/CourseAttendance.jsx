import React, { useState } from 'react';
import { FaDownload, FaFileExport, FaFileImport, FaSave, FaTimes, FaEdit, FaTrash, FaEye, FaAngleRight, FaAngleDoubleRight, FaAngleLeft, FaAngleDoubleLeft, FaPlus, FaSearch, FaChalkboardTeacher } from 'react-icons/fa';
import CSelect from '../components/CSelect';
import TrainingHeader from '../components/TrainingHeader';

const CourseAttendance = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [manualEntry, setManualEntry] = useState({
        employee: null,
        date: new Date().toISOString().split('T')[0],
        attendanceTime: "",
        departureTime: "",
        workLocation: "",
        notes: ""
    });

    const courses = [
        { value: 1, label: "فحص ومراقبة الجودة للحوم والدواجن (17-01-2026)" },
        { value: 2, label: "دورة البرمجة المتقدمة (01-02-2026)" },
    ];

    const employees = [
        { value: 1, label: "أحمد محمد علي" },
        { value: 2, label: "سارة محمود حسن" },
    ];

    const [attendanceData, setAttendanceData] = useState([
        {
            id: 1,
            employee: "أحمد محمد علي",
            employeeId: "12345",
            date: "2024-05-20",
            attendance: "08:00 AM",
            departure: "03:30 PM",
            workLocation: "المقر الرئيسي",
            notes: "لا يوجد",
            source: "بصمة",
        },
        // More dummy data can be added
    ]);

    const filteredData = attendanceData.filter(item =>
        item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeId.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const currentData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleManualEntryChange = (field, value) => {
        setManualEntry(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!manualEntry.employee || !manualEntry.date) {
            alert("يرجى اختيار الموظف والتاريخ على الأقل");
            return;
        }

        const newRecord = {
            id: Date.now(),
            employee: manualEntry.employee.label,
            employeeId: "N/A", // In a real app, this would come from the employee data
            date: manualEntry.date,
            attendance: manualEntry.attendanceTime || "--:--",
            departure: manualEntry.departureTime || "--:--",
            workLocation: manualEntry.workLocation || "غير محدد",
            notes: manualEntry.notes || "لا يوجد",
            source: "يدوي",
        };

        setAttendanceData(prev => [newRecord, ...prev]);
        handleClear();
    };

    const handleClear = () => {
        setManualEntry({
            employee: null,
            date: new Date().toISOString().split('T')[0],
            attendanceTime: "",
            departureTime: "",
            workLocation: "",
            notes: ""
        });
    };

    return (
        <div className="animate-fade-in p-1">
            {/* Premium Header Section */}
            <div className="mb-4 position-relative overflow-hidden rounded-4 border bg-white p-4 shadow-sm">
                {/* Glassmorphism Background Accent */}
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style={{ zIndex: 0, clipPath: 'circle(15% at 0 0)' }}></div>

                <div className="d-flex justify-content-between align-items-center position-relative" style={{ zIndex: 1 }}>
                    <div className="text-end">
                        <h4 className="fw-bold mb-1 text-dark" style={{ fontSize: "22px", letterSpacing: "-0.02em" }}>
                            كشف الحضور والانصراف
                        </h4>
                        <p className="text-secondary mb-0" style={{ fontSize: "14px" }}>اختر الدورة أولاً لعرض السجل وإدارته</p>
                    </div>
                    {/* <div>
                        <div className="stat-badge d-flex align-items-center gap-2 bg-light px-3 py-2 rounded-pill border">
                            <FaChalkboardTeacher className="text-primary" />
                            <span className="small fw-bold text-dark">دورة تدريبية</span>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Course Selection Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white hover-shadow-transition">
                <label className="form-label small fw-bold mb-2 text-secondary">اختيار الدورة التدريبية</label>
                <CSelect
                    options={courses}
                    value={selectedCourse}
                    onChange={setSelectedCourse}
                    placeholder="ابحث عن دورة أو اختر من القائمة..."
                    isSearchable
                    isClearable
                />
            </div>

            <div className="row g-4 mb-4">
                {/* Manual Entry Card */}
                <div className="col-lg-8">
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white hover-shadow-transition">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                                    <FaEdit size={18} />
                                </div>
                                <h5 className="fw-bold mb-0 text-dark">إدخال يدوي للسجل</h5>
                            </div>
                        </div>

                        <div className="row g-3">
                            <div className="col-md-6">
                                <CSelect
                                    label="بحث عن موظف"
                                    options={employees}
                                    value={manualEntry.employee}
                                    onChange={(val) => handleManualEntryChange('employee', val)}
                                    placeholder="اسم الموظف أو الرقم الوظيفي"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">تاريخ الحضور</label>
                                <input
                                    type="date"
                                    className="form-control premium-input"
                                    value={manualEntry.date}
                                    onChange={(e) => handleManualEntryChange('date', e.target.value)}
                                    placeholder="YYYY-MM-DD"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">ساعة الحضور</label>
                                <input
                                    type="time"
                                    className="form-control premium-input"
                                    value={manualEntry.attendanceTime}
                                    onChange={(e) => handleManualEntryChange('attendanceTime', e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">ساعة الانصراف</label>
                                <input
                                    type="time"
                                    className="form-control premium-input"
                                    value={manualEntry.departureTime}
                                    onChange={(e) => handleManualEntryChange('departureTime', e.target.value)}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">مكان التدريب / العمل</label>
                                <input
                                    type="text"
                                    className="form-control premium-input"
                                    value={manualEntry.workLocation}
                                    onChange={(e) => handleManualEntryChange('workLocation', e.target.value)}
                                    placeholder="مثال: القاعة الرئيسية"
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-secondary">ملاحظات إضافية</label>
                                <input
                                    type="text"
                                    className="form-control premium-input"
                                    value={manualEntry.notes}
                                    onChange={(e) => handleManualEntryChange('notes', e.target.value)}
                                    placeholder="أدخل أي ملاحظات هنا"
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                                className="btn btn-navy rounded-pill px-4 py-2 d-flex align-items-center gap-2 transition-all"
                                onClick={handleSave}
                            >
                                <FaSave size={14} />
                                <span>حفظ البيانات</span>
                            </button>
                            <button
                                className="btn btn-outline-light rounded-pill px-4 py-2 text-dark border"
                                onClick={handleClear}
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>

                {/* Templates and Export Card */}
                <div className="col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 p-4 bg-white hover-shadow-transition">
                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="p-2 rounded-3 bg-warning-subtle text-warning">
                                <FaFileImport size={18} />
                            </div>
                            <h5 className="fw-bold mb-0 text-dark">القوالب والتصدير</h5>
                        </div>

                        <button className="btn btn-outline-warning w-100 py-2 mb-3 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold small transition-all">
                            <FaDownload size={14} />
                            <span>تحميل قـالـب الـحضـور</span>
                        </button>

                        <button className="btn btn-light-blue w-100 py-2 mb-4 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold small border transition-all">
                            <FaFileExport size={14} />
                            <span>تـصـديـر إلـى إكـسـل</span>
                        </button>

                        <div className="divider-text mb-4 text-center small text-secondary position-relative">
                            <span className="bg-white px-2 position-relative" style={{ zIndex: 1 }}>استيراد من ملف</span>
                            <hr className="position-absolute w-100 top-50 start-0 m-0 opacity-10" />
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-secondary">تاريخ السجل المستورد</label>
                            <input type="date" className="form-control premium-input" />
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold text-secondary">اختر ملف الإكسل</label>
                            <div className="premium-file-input">
                                <input type="file" className="form-control" id="customFile" hidden />
                                <label htmlFor="customFile" className="btn btn-light border w-100 py-3 rounded-4 d-flex flex-column align-items-center justify-content-center gap-2 cursor-pointer border-dashed">
                                    <FaFileImport className="text-secondary" />
                                    <span className="small text-secondary">اضغط هنا لرفع الملف</span>
                                </label>
                            </div>
                        </div>

                        <button className="btn btn-navy-outline w-100 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-bold transition-all">
                            <FaFileImport size={14} />
                            <span>بـدء الاسـتـيـراد</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search and Table Section */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-4 hover-shadow-transition">
                <div className="p-3 d-flex justify-content-between align-items-center bg-light-subtle border-bottom">
                    <div className="d-flex align-items-center gap-3">
                        <div className="entries-control d-flex align-items-center gap-2 bg-white px-3 py-1 rounded-pill border">
                            <span className="small text-secondary">أظهر</span>
                            <select
                                className="form-select border-0 bg-transparent py-0 px-1"
                                style={{ width: '55px', fontSize: '13px' }}
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                        <span className="small text-secondary fw-medium">سجل حضور</span>
                    </div>

                    <div className="search-container position-relative" style={{ minWidth: '300px' }}>
                        <FaSearch className="position-absolute start-0 ms-3 text-secondary opacity-50" size={14} style={{ top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            className="form-control rounded-pill border py-2 ps-5 small"
                            placeholder="ابحث عن موظف أو رقم وظيفي..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ fontSize: '14px' }}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-end table-modern-container">
                        <thead className="table-header-modern-pill">
                            <tr>
                                <th style={{ width: "60px" }}>م</th>
                                <th>الموظف</th>
                                <th>الرقم الوظيفي</th>
                                <th>التاريخ</th>
                                <th>الحضور</th>
                                <th>الانصراف</th>
                                <th>مكان العمل</th>
                                <th>ملاحظات</th>
                                <th>المصدر</th>
                                <th style={{ width: "120px" }}>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.length > 0 ? (
                                currentData.map((record, index) => (
                                    <tr key={record.id} className="table-row-hover">
                                        <td className="fw-bold text-secondary">{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td className="fw-bold text-dark">{record.employee}</td>
                                        <td className="text-secondary small fw-medium">{record.employeeId}</td>
                                        <td className="text-secondary small">{record.date}</td>
                                        <td>
                                            <span className="badge bg-success-subtle text-success px-2 py-1 rounded-pill border border-success-subtle small fw-bold">
                                                {record.attendance}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge bg-danger-subtle text-danger px-2 py-1 rounded-pill border border-danger-subtle small fw-bold">
                                                {record.departure}
                                            </span>
                                        </td>
                                        <td className="text-secondary small">{record.workLocation}</td>
                                        <td className="text-secondary small" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.notes}</td>
                                        <td>
                                            <span className="text-secondary small bg-light px-2 py-1 rounded border">
                                                {record.source}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-1">
                                                <button className="btn-action-modern edit" title="تعديل">
                                                    <FaEdit />
                                                </button>
                                                <button className="btn-action-modern delete" title="حذف">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="py-5 text-center">
                                        <div className="text-secondary opacity-50 mb-2">
                                            <FaSearch size={40} />
                                        </div>
                                        <div className="text-secondary">لا يوجد بيانات متاحة في الجدول حالياً</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Part */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center p-3 border-top bg-light-subtle">
                        <nav aria-label="Page navigation">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(1)} aria-label="First">
                                        <FaAngleDoubleRight />
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} aria-label="Previous">
                                        <FaAngleRight />
                                    </button>
                                </li>

                                {(() => {
                                    const pages = [];
                                    const range = [];
                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) range.push(i);
                                    } else {
                                        if (currentPage <= 4) {
                                            range.push(1, 2, 3, 4, 5, '...', totalPages);
                                        } else if (currentPage >= totalPages - 3) {
                                            range.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                        } else {
                                            range.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                        }
                                    }

                                    return range.map((page, index) => (
                                        page === '...' ? (
                                            <li key={`ellipsis-${index}`} className="page-item disabled">
                                                <span className="page-link modern-pagination-btn border-0 bg-transparent">...</span>
                                            </li>
                                        ) : (
                                            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                                                <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(page)}>
                                                    {page}
                                                </button>
                                            </li>
                                        )
                                    ));
                                })()}

                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} aria-label="Next">
                                        <FaAngleLeft />
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link modern-pagination-btn" onClick={() => setCurrentPage(totalPages)} aria-label="Last">
                                        <FaAngleDoubleLeft />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>

            <style>{`
        .btn-navy {
          background-color: #002F6C;
          color: white;
          border: none;
        }
        
        .btn-navy:hover {
          background-color: #001f4d;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 47, 108, 0.2);
        }

        .btn-navy-outline {
          border: 1px solid #002F6C;
          color: #002F6C;
          background: white;
        }

        .btn-navy-outline:hover {
          background-color: #002F6C;
          color: white;
          transform: translateY(-2px);
        }

        .btn-light-blue {
          background-color: #f0f7ff;
          color: #002F6C;
          border-color: #d0e6ff;
        }

        .btn-light-blue:hover {
          background-color: #e0efff;
          border-color: #002F6C;
          transform: translateY(-2px);
        }

        .hover-shadow-transition {
          transition: all 0.3s ease;
        }

        .hover-shadow-transition:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
        }

        .table-row-hover {
          transition: background-color 0.2s ease;
        }

        .table-row-hover:hover {
          background-color: #f8fbff !important;
        }

        .border-dashed {
          border-style: dashed !important;
          border-width: 2px !important;
        }

        .transition-all {
          transition: all 0.3s ease !important;
        }

        .animate-fade-in {
          animation: premiumFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes premiumFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .divider-text span {
          z-index: 1;
        }
      `}</style>
        </div>
    );
};

export default CourseAttendance;
