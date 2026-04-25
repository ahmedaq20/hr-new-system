import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {
  FaSignOutAlt, FaUser, FaHome, FaUserTie, FaChalkboardTeacher, FaMoneyCheckAlt, FaUserFriends, FaChild, FaHandsHelping, FaCertificate
} from "react-icons/fa";
// import { FaMessage } from "react-icons/fa6";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useEmployeeDashboard } from "../hooks/useEmployeeDashboard";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./UserAvatar";

type SideBarProps = {
  children: ReactNode;
};

function EmpGateSideBar({ children }: SideBarProps) {
  const [open, setOpen] = useState(window.innerWidth > 992);
  const logout = useAuthStore((state) => state.logout);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const { data } = useEmployeeDashboard();

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

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    logout('/gate2/emp-gate');
  };

  return (
    <div className="main-layout">

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${open && window.innerWidth <= 992 ? "show" : ""}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* Sidebar */}
      <div className={`sidebarEmp ${open ? "open" : "closed"}`}>
        <Nav className="flex-column mt-4">

          <h5 className="text-center titleOfSide">
            وزارة الإقتصاد الوطني
          </h5>
          <hr />

          {/* الرئيسية */}
          <label className="LabelSideEmp">الرئيسية</label>
          <NavLink
            to="/emp-dashboard"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الصفحة الرئيسية</span>
            <FaHome />
          </NavLink>

          <hr />

          {/* خدمات الموظف الذاتية  */}
          <label className="LabelSideEmp">الخدمات الذاتية</label>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>ملفي الشخصي</span>
            <FaUser />
          </NavLink>

          <NavLink
            to="/salary"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>قسيمة الراتب</span>
            <FaMoneyCheckAlt />
          </NavLink>

          <NavLink
            to="/martial-status"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الحالة الإجتماعية للموظف</span>
            <FaUserTie />
          </NavLink>

          <hr />

          {/* عائلة الموظف  */}
          <label className="LabelSideEmp">بيانات العائلة</label>
          <NavLink
            to="/spouses"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الأزواج</span>
            <FaUserFriends />
          </NavLink>

          <NavLink
            to="/children"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الأبناء</span>
            <FaChild />
          </NavLink>

          <NavLink
            to="/dependents"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>المعالون</span>
            <FaHandsHelping />
          </NavLink>

          <hr />

          {/* المؤهلات العلمية */}
          <label className="LabelSideEmp">المؤهلات العلمية</label>
          <NavLink
            to="/emp-qualifications"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الشهادات العلمية</span>
            <FaChalkboardTeacher />
          </NavLink>

          <NavLink
            to="/emp-courses"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active-link" : ""}`
            }>
            <span>الدورات التدريبية</span>
            <FaCertificate />
          </NavLink>

          <hr />

          {/* الحساب */}
          <label className="LabelSideEmp">الحساب</label>
          <NavLink
            to="#"
            onClick={handleLogout}
            className="sidebar-link">
            <span>تسجيل الخروج</span>
            <FaSignOutAlt />
          </NavLink>

        </Nav>
      </div>

      <ConfirmModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={executeLogout}
        title="تأكيد تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        confirmButtonClass="btn-danger"
      />

      {/* ===== Content ===== */}
      <div className={`content ${open && window.innerWidth > 992 ? "" : "full"}`}>
        <Navbar className=" navbar px-3 d-flex justify-content-between border-bottom" style={{ backgroundColor: "#f1f3f5" }}>

          <div className="d-flex align-items-center">
            <button className="toggleBtnEmp" onClick={() => setOpen(!open)}>
              ☰
            </button>

            <img
              src="/images/logo.png"
              alt="logo"
              style={{ width: 75, height: 75 }}
              className="ms-3"
            />
          </div>

          <div className="d-flex align-items-center">
            <NavLink to="#" onClick={handleLogout}>
              <FaSignOutAlt className="iconsEmp me-3" /></NavLink>
            {/* <FaBell className="iconsEmp me-3" />
            <FaMessage className="iconsEmp me-3" /> */}

            <NavLink to="/profile" className="text-decoration-none">
              <UserAvatar
                src={data?.personal_info?.photo_url || "/images/employee-02.jpg"}
                name={data?.personal_info?.full_name}
                className="userImg"
              />
            </NavLink>

          </div>

        </Navbar>

        <div className="p-4">
          {children}
        </div>
        {/* ===== Footer ===== */}
        <footer className="emp-footer mt-5">
          <div className="footer-links">
            <span>الخصوصية</span>
            <span className="divider">|</span>
            <span>الشروط والأحكام</span>
            <span className="divider">|</span>
            <span>التعليمات</span>
          </div>

          <div className="footer-copy">
            وزارة الاقتصاد الوطني الفلسطيني
          </div>
        </footer>


      </div>
    </div>
  );
}

export default EmpGateSideBar;
