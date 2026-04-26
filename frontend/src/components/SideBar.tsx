import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {
  FaSignOutAlt, FaAngleDown, FaHome, FaUserTie, FaFileAlt, FaCogs, FaFolderOpen, FaClock,
  FaChalkboardTeacher, FaArchive, FaFileInvoiceDollar, FaMoneyCheckAlt, FaTools
} from "react-icons/fa";
// import { FaMessage } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { useAuthStore } from "../store/useAuthStore";
import { usePermissions } from "../hooks/usePermissions";
import Badge from "react-bootstrap/Badge";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./UserAvatar";
type SideBarProps = {
  children: React.ReactNode;
};

interface AdminRequest {
  id?: number | string;
  approval_status?: string;
}

function SidebarGroup({
  label,
  icon: Icon,
  isOpen,
  onToggle,
  children
}: {
  label: string;
  icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="sidebar-group">
      <div
        className={`sidebar-group-header ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
      >
        <div className="d-flex align-items-center">
          {Icon && <Icon className="sidebar-group-icon" />}
          <span className="sidebar-group-label">{label}</span>
        </div>
        <FaAngleDown className={`sidebar-chevron ${isOpen ? 'open' : ''}`} />
      </div>
      {isOpen && (
        <ul className="sidebar-sub-menu">
          {children}
        </ul>
      )}
    </div>
  );
}

function SidebarItem({ to, label, badgeCount }: { to: string; label: string; badgeCount?: number }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className={`sidebar-sub-item ${isActive ? 'has-active-child' : ''}`}>
      <NavLink
        to={to}
        className={({ isActive }) => isActive ? 'active d-flex align-items-center justify-content-between w-100' : 'd-flex align-items-center justify-content-between w-100'}
      >
        <span>{label}</span>
        {badgeCount !== undefined && badgeCount > 0 && (
          <Badge bg="danger" pill className="sidebar-badge animate-pulse" style={{ fontSize: '0.65rem' }}>
            {badgeCount}
          </Badge>
        )}
      </NavLink>
    </li>
  );
}

function SidebarHeaderItem({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <div className="sidebar-group">
      <NavLink
        to={to}
        className={({ isActive }) => `sidebar-group-header text-decoration-none ${isActive ? 'active' : ''}`}
        style={{ color: 'inherit' }}
      >
        <div className="d-flex align-items-center">
          {Icon && <Icon className="sidebar-group-icon" />}
          <span className="sidebar-group-label">{label}</span>
        </div>
      </NavLink>
    </div>
  );
}

function SideBar({ children }: SideBarProps) {
  const [open, setOpen] = useState(window.innerWidth > 992);
  const [openGroup, setOpenGroup] = useState<string | null>("main2");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change for mobile
  useEffect(() => {
    if (window.innerWidth <= 992) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [location.pathname]);

  const POLLING_INTERVAL = 30000; // 30 seconds

  // Fetching logic for all pending request types
  const fetchRequestsCount = async (type: string): Promise<AdminRequest[]> => {
    let endpoint = '';
    switch (type) {
      case 'profile': endpoint = ENDPOINTS.ADMIN.PROFILE_UPDATE_REQUESTS; break;
      case 'spouse': endpoint = ENDPOINTS.ADMIN.SPOUSES; break;
      case 'child': endpoint = ENDPOINTS.ADMIN.CHILDREN; break;
      case 'dependent': endpoint = ENDPOINTS.ADMIN.DEPENDENTS; break;
      case 'qualification': endpoint = `${ENDPOINTS.EMPLOYEE.DEGREES}/all`; break;
      case 'course': endpoint = `${ENDPOINTS.TRAINING_COURSES.LIST}/participants/all`; break;
      default: return [];
    }

    const params = (type === 'profile' || type === 'qualification' || type === 'course') ? {} : { approval_status: 'pending', length: 100 };
    const response = await api.get(endpoint, { params });

    const data = response.data?.data;
    if (!data) return [];

    if (type === 'profile') return (data.data as AdminRequest[]) || [];
    if (type === 'qualification' || type === 'course') {
      return Array.isArray(data) ? (data as AdminRequest[]).filter((item) => item.approval_status === 'pending') : [];
    }
    return Array.isArray(data) ? (data as AdminRequest[]) : [];
  };

  const { can } = usePermissions();
  const isAdmin = user?.is_admin;

  const { data: profileRequests } = useQuery({ queryKey: ['admin-profile-requests'], queryFn: () => fetchRequestsCount('profile'), refetchInterval: POLLING_INTERVAL, enabled: can.manageProfileRequests });
  const { data: spouseRequests } = useQuery({ queryKey: ['admin-spouse-requests'], queryFn: () => fetchRequestsCount('spouse'), refetchInterval: POLLING_INTERVAL, enabled: can.manageProfileRequests });
  const { data: childRequests } = useQuery({ queryKey: ['admin-child-requests'], queryFn: () => fetchRequestsCount('child'), refetchInterval: POLLING_INTERVAL, enabled: can.manageProfileRequests });
  const { data: dependentRequests } = useQuery({ queryKey: ['admin-dependent-requests'], queryFn: () => fetchRequestsCount('dependent'), refetchInterval: POLLING_INTERVAL, enabled: can.manageProfileRequests });
  const { data: qualificationRequests } = useQuery({ queryKey: ['admin-qualification-requests'], queryFn: () => fetchRequestsCount('qualification'), refetchInterval: POLLING_INTERVAL, enabled: can.manageProfileRequests });
  const { data: courseRequests } = useQuery({ queryKey: ['admin-course-requests'], queryFn: () => fetchRequestsCount('course'), refetchInterval: POLLING_INTERVAL, enabled: can.manageTraining });

  const totalPending = (profileRequests?.length || 0) +
    (spouseRequests?.length || 0) +
    (childRequests?.length || 0) +
    (dependentRequests?.length || 0) +
    (qualificationRequests?.length || 0) +
    (courseRequests?.length || 0);


  const toggleGroup = (groupName: string) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  return (
    <div className="main-layout">

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${open && window.innerWidth <= 992 ? "show" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : "closed"}`}>
        <Nav className="flex-column mt-4">

          <h5 className="text-center titleOfSide mb-4">
            وزارة الإقتصاد الوطني
          </h5>

          <div className="px-2">
            <SidebarHeaderItem
              to="/gate2/emp-gate"
              label="الدخول كموظف"
              icon={FaHome}
            />

            <hr className="m-0 mx-3 opacity-10" />

            <label className="LabelSide">الرئيسية</label>
            <SidebarHeaderItem
              to="/dashboard"
              label="لوحة التحكم"
              icon={FaHome}
            />

            {isAdmin && (
              <>
                {/* ===== إدارة شؤون الموظفين ===== */}
                {(can.viewEmployees || can.manageContracts || can.managePrograms || can.manageProfileRequests) && (
                  <>
                    <hr className="m-0 mx-3 opacity-10" />
                    <label className="LabelSide">إدارة شؤون الموظفين</label>
                  </>
                )}

                {can.viewEmployees && (
                  <SidebarGroup
                    label="شؤون الموظفين"
                    icon={FaUserTie}
                    isOpen={openGroup === "main2"}
                    onToggle={() => toggleGroup("main2")}
                  >
                    <SidebarItem to="/employees" label="جميع الموظفين" />
                    <SidebarItem to="/official-employees" label="الرسميين" />
                    <SidebarItem to="/other-government" label="رسميين في حكومة أخرى" />
                    <SidebarItem to="/dismissd-employees" label="المفصولين" />
                    <SidebarItem to="/older-employees" label="المتقاعدين" />
                    {can.manageProfileRequests && (
                      <SidebarItem to="/profile-requests" label="طلبات التعديل والمعالجات" badgeCount={totalPending} />
                    )}
                  </SidebarGroup>
                )}

                {can.manageContracts && (
                  <SidebarGroup
                    label="عقود التشغيل"
                    icon={FaFileAlt}
                    isOpen={openGroup === "main3"}
                    onToggle={() => toggleGroup("main3")}
                  >
                    <SidebarItem to="/permenant-contrast" label="عقود تشغيل دائمة" />
                    <SidebarItem to="/temporary-contrast" label="عقود تشغيل غير معلومة" />
                    <SidebarItem to="/suspended-contrast" label="عقود تشغيل متوقفة" />
                  </SidebarGroup>
                )}

                {(can.managePrograms || can.viewEmployees) && (
                  <SidebarGroup
                    label="برامج التشغيل المؤقتة"
                    icon={FaFileAlt}
                    isOpen={openGroup === "main4"}
                    onToggle={() => toggleGroup("main4")}
                  >
                    {can.managePrograms && <SidebarItem to="/programs" label="كافة البرامج" />}
                    {can.viewEmployees && <SidebarItem to="/temporary-contrast-employees" label="موظفي العقود المؤقتة" />}
                  </SidebarGroup>
                )}

                {can.manageLookups && (
                  <SidebarGroup
                    label="الثوابت والقوائم"
                    icon={FaCogs}
                    isOpen={openGroup === "main5"}
                    onToggle={() => toggleGroup("main5")}
                  >
                    <SidebarItem to="/goverments" label="الوزارات" />
                    <SidebarItem to="/emp-type" label="أنواع الموظفين" />
                    <SidebarItem to="/emp-classifications" label="تصنيفات الموظفين العامة" />
                    <SidebarItem to="/categories" label="الفئات" />
                    <SidebarItem to="/job-scale" label="السلم الوظيفي" />
                    <SidebarItem to="/degrees" label="الدرجات" />
                    <SidebarItem to="/programs2" label="البرامج" />
                    <SidebarItem to="/certificates" label="الشهادات" />
                    <SidebarItem to="/departments" label="الدائرة" />
                    <SidebarItem to="/job-title" label="المسمى الوظيفي" />
                    <SidebarItem to="/divisions" label="الشعبة" />
                    <SidebarItem to="/section" label="القسم" />
                    <SidebarItem to="/unit" label="الوحدة" />
                    <SidebarItem to="/general-administration" label="الإدارة العامة" />
                    <SidebarItem to="/branch-offices" label="المكاتب الفرعية" />
                    <SidebarItem to="/crossing" label="المعبر" />
                    <SidebarItem to="/employment-status" label="الحالة الوظيفية" />
                    <SidebarItem to="/bank" label="البنوك" />
                    <SidebarItem to="/work-contracts" label="عقود التشغيل" />
                    <SidebarItem to="/employee-documents" label="وثائق الموظفين" />
                    <SidebarItem to="/course-types" label="أنواع الدورات" />
                    <SidebarItem to="/course-classifications" label="تصنيفات الدورات" />
                  </SidebarGroup>
                )}

                {can.viewEmployees && (
                  <SidebarGroup
                    label="وثائق الموظفين"
                    icon={FaFolderOpen}
                    isOpen={openGroup === "main6"}
                    onToggle={() => toggleGroup("main6")}
                  >
                    <SidebarItem to="/academic-certifcates" label="الشهادات الأكاديمية" />
                    <SidebarItem to="/training-courses" label="الدورات التدريبية" />
                    <SidebarItem to="/administrative-attachments" label="مرفقات إدارية" />
                  </SidebarGroup>
                )}

                {can.viewEmployees && (
                  <SidebarGroup
                    label="بيانات العائلة"
                    icon={FaFolderOpen}
                    isOpen={openGroup === "main7a"}
                    onToggle={() => toggleGroup("main7a")}
                  >
                    <SidebarItem to="/Emp-spouses" label="الأزواج" />
                    <SidebarItem to="/Emp-children" label="الأبناء" />
                    <SidebarItem to="/Emp-dependents" label="المعيلون" />
                  </SidebarGroup>
                )}

                {can.manageTraining && (
                  <SidebarGroup
                    label="التدريب والتطوير"
                    icon={FaChalkboardTeacher}
                    isOpen={openGroup === "main12"}
                    onToggle={() => toggleGroup("main12")}
                  >
                    <SidebarItem to="/training" label="الدورات التدريبية" />
                  </SidebarGroup>
                )}

                {(can.manageTraining || can.viewAttendance) && (
                  <SidebarGroup
                    label="الحضور والإنصراف"
                    icon={FaClock}
                    isOpen={openGroup === "main11"}
                    onToggle={() => toggleGroup("main11")}
                  >
                    <SidebarItem to="/course-attendance" label="كشف الدورات التدريبية" />
                  </SidebarGroup>
                )}

                {can.viewEmployees && (
                  <SidebarHeaderItem
                    to="/"
                    label="أرشيف الموظفين"
                    icon={FaArchive}
                  />
                )}

                {/* ===== إدارة الشؤون المالية ===== */}
                {can.manageFinancials && (
                  <>
                    <hr className="m-0 mx-3 opacity-10" />

                    <label className="LabelSide">إدارة الشؤون المالية</label>

                    <SidebarGroup
                      label="المعلومات البنكية"
                      icon={FaFileInvoiceDollar}
                      isOpen={openGroup === "main10"}
                      onToggle={() => toggleGroup("main10")}
                    >
                      <SidebarItem to="/" label="العلاوات" />
                      <SidebarItem to="/" label="الخصومات" />
                    </SidebarGroup>

                    <SidebarGroup
                      label="العلاوات والخصومات"
                      icon={FaFileInvoiceDollar}
                      isOpen={openGroup === "main7b"}
                      onToggle={() => toggleGroup("main7b")}
                    >
                      <SidebarItem to="/" label="العلاوات" />
                      <SidebarItem to="/" label="الخصومات" />
                    </SidebarGroup>

                    <SidebarGroup
                      label="قسائم الرواتب"
                      icon={FaMoneyCheckAlt}
                      isOpen={openGroup === "main8"}
                      onToggle={() => toggleGroup("main8")}
                    >
                      <SidebarItem to="/" label="جميع القسائم" />
                      <SidebarItem to="/" label="المعتمدة" />
                    </SidebarGroup>
                  </>
                )}

                {/* ===== إدارة النظام ===== */}
                {(can.manageUsers || can.manageRoles || can.viewLogs) && (
                  <>
                    <hr className="m-0 mx-3 opacity-10" />

                    <label className="LabelSide">إدارة النظام</label>

                    <SidebarGroup
                      label="عمليات النظام"
                      icon={FaTools}
                      isOpen={openGroup === "main9"}
                      onToggle={() => toggleGroup("main9")}
                    >
                      {can.viewLogs && <SidebarItem to="/" label="السجلات" />}
                      {can.manageRoles && <SidebarItem to="/permissions" label="الصلاحيات" />}
                      {can.manageUsers && <SidebarItem to="/users" label="المستخدمين" />}
                    </SidebarGroup>
                  </>
                )}
              </>
            )}
          </div>

        </Nav>
      </div>

      {/* ===== Content ===== */}
      <div className={`content ${open ? "" : "full"}`}>
        <Navbar className=" navbar px-3 d-flex justify-content-between border-bottom" style={{ backgroundColor: "#f1f3f5" }}>

          <div className="d-flex align-items-center">
            <button className="toggleBtn" onClick={() => setOpen(!open)}>
              ☰
            </button>

            <img
              src="/images/logo.png"
              alt="logo"
              style={{ width: 75, height: 75 }}
              className="ms-3"
            />

            {can.viewEmployees && (
              <NavLink to="/add-employee">
                <button
                  className="btn addEmployee ms-3"
                  style={{ fontSize: "13px", padding: "6px 10px" }}>
                  أضف موظف جديد
                </button>
              </NavLink>
            )}
          </div>

          <div className="d-flex align-items-center">
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => setShowLogoutModal(true)}
              title="تسجيل الخروج"
            >
              <FaSignOutAlt className="icons me-3" />
            </div>
            {/* <FaBell className="icons me-3" />
            <FaMessage className="icons me-3" /> */}

            <UserAvatar
              src={"/images/employee-02.jpg"}
              name={user?.name}
              className="userImg"
            />

          </div>

        </Navbar>

        <div className="p-4">
          {children}
        </div>

      </div>

      <ConfirmModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logout();
          setShowLogoutModal(false);
        }}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        confirmButtonClass="btn-danger"
      />

      <style>{`
        .sidebar-badge {
          box-shadow: 0 0 8px rgba(220, 53, 69, 0.4);
        }
        .animate-pulse {
          animation: badge-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes badge-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default SideBar;
