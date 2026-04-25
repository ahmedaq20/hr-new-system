import { createBrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeesPage from './pages/Employess.jsx';
import OfficialEmployees from './pages/OfficialEmployees.jsx';
import OfficialsOfAnotherGovernment from './pages/OfficialsOfAnotherGovernment.jsx';
import OlderEmployees from './pages/OlderEmployees';
import DismissedEmployees from './pages/DismissedEmployees';
import PermanentEmploymentContracts from './pages/PermanentEmploymentContracts';
import TemporaryEmploymentContracts from './pages/TemporaryEmploymentContracts';
import SuspendedEmploymentContracts from './pages/SuspendedEmploymentContracts';
import TemporaryContrastEmployees from './pages/TemporaryContrastEmployees';
import Programs from './pages/Programs';
import Goverments from './pages/Goverments';
import EmpType from './pages/EmpType';
import EmpClassifications from './pages/EmpClassifications';
import Categories from './pages/Categories';
import JobScale from "./pages/JobScale";
import Degree from "./pages/Degree";
import Programs2 from "./pages/Programs2";
import Certificates from "./pages/Certificates";
import GovernmentDepartment from "./pages/GovernmentDepartment";
import JobTitle from "./pages/JobTitle";
import Division from "./pages/Division";
import Section from "./pages/Section";
import Dashboard from "./pages/Dashboard";
import Unit from "./pages/Unit";
import GeneralAdminstration from "./pages/GeneralAdminstration";
import BranchOffices from "./pages/BranchOffices";
import Crossing from "./pages/Crossing";
import ProfileUpdateRequests from "./components/ProfileUpdateRequests";
import EmploymentStatus from "./pages/EmploymentStatus";
import Bank from "./pages/Bank";
import WorkContracts from "./pages/WorkContracts";
import EmployeeDocuments from "./pages/EmployeeDocuments";
import CourseTypes from "./pages/CourseTypes";
import CourseClassifications from "./pages/CourseClassifications";
import AcademicCertifcates from "./pages/AcademicCertifcates";
import AdministrativeAttachments from "./pages/AdministrativeAttachments";
import AddCertificate from "./components/AddCertificate";
import AddAttachment from "./components/AddAttachment";
import AddEmployeesforms from "./components/AddEmployeesforms";
import TrainingPage from "./pages/TrainingPage";
import TrainingCoursesDocuments from "./pages/TrainingCoursesDocuments";
import SpousesDocuments from "./pages/SpousesDocuments";
import ChildrenDocuments from "./pages/ChildrenDocuments";
import DependentsDocuments from "./pages/DependentsDocuments";
import EmpGate from "./pages/EmpGate";
import EmpDashboard from "./pages/EmpDashboard";
import AddWifePage from "./pages/AddWifePage";
import AddChildrenPage from "./pages/AddChildrenPage";
import AddHeartPage from "./pages/AddHeartPage";
import AddEduCertificatePage from "./pages/AddEduCertificatePage";
import ProfilePage from "./pages/ProfilePage";
import MaritalStatusPage from "./pages/MaritalStatusPage";
import ResetPasswordEmpPages from "./pages/ResetPasswordEmpPages";
import EmployeeDetails from "./pages/EmployeeDetails";
import SalaryPage from "./pages/SalaryPage";
import SpousePage from "./pages/SpousePage";
import ContractEmployeeDetails from "./pages/ContractEmployeeDetails";
import CourseAttendance from "./pages/CourseAttendance";
import CourseDetails from "./pages/CourseDetails";
import ChildrenPage from "./pages/ChildrenPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";
import RoleFormPage from "./pages/RoleFormPage";
import UserFormPage from "./pages/UserFormPage";



import DependentPage from "./pages/DependentPage";
import EmpCertificatesPage from "./pages/EmpCertificatesPage";
import EmpCoursesPage from "./pages/EmpCoursesPage";

const router = createBrowserRouter([
  {
    path: "auth",
    children: [
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "gate2",
    children: [
      { path: "emp-gate", element: <EmpGate /> },
    ],
  },
  {
    // Admin Protected Routes
    element: <ProtectedRoute requiredRole="Admin" redirectTo="/auth/login" />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "temporary-contrast", element: <TemporaryEmploymentContracts /> },
          { path: "employees", element: <EmployeesPage /> },
          { path: "official-employees", element: <OfficialEmployees /> },
          { path: "other-government", element: <OfficialsOfAnotherGovernment /> },
          { path: "dismissd-employees", element: <DismissedEmployees /> },
          { path: "older-employees", element: <OlderEmployees /> },
          { path: "permenant-contrast", element: <PermanentEmploymentContracts /> },
          { path: "suspended-contrast", element: <SuspendedEmploymentContracts /> },
          { path: "programs", element: <Programs /> },
          { path: "temporary-contrast-employees", element: <TemporaryContrastEmployees /> },
          { path: "goverments", element: <Goverments /> },
          { path: "emp-type", element: <EmpType /> },
          { path: "emp-classifications", element: <EmpClassifications /> },
          { path: "categories", element: <Categories /> },
          { path: "job-scale", element: <JobScale /> },
          { path: "degrees", element: <Degree /> },
          { path: "programs2", element: <Programs2 /> },
          { path: "certificates", element: <Certificates /> },
          { path: "departments", element: <GovernmentDepartment /> },
          { path: "job-title", element: <JobTitle /> },
          { path: "divisions", element: <Division /> },
          { path: "section", element: <Section /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "unit", element: <Unit /> },
          { path: "general-administration", element: <GeneralAdminstration /> },
          { path: "branch-offices", element: <BranchOffices /> },
          { path: "crossing", element: <Crossing /> },
          { path: "profile-requests", element: <ProfileUpdateRequests /> },
          { path: "employment-status", element: <EmploymentStatus /> },
          { path: "bank", element: <Bank /> },
          { path: "work-contracts", element: <WorkContracts /> },
          { path: "employee-documents", element: <EmployeeDocuments /> },
          { path: "course-types", element: <CourseTypes /> },
          { path: "course-classifications", element: <CourseClassifications /> },
          { path: "academic-certifcates", element: <AcademicCertifcates /> },
          { path: "administrative-attachments", element: <AdministrativeAttachments /> },
          { path: "add-certificate", element: <AddCertificate /> },
          { path: "add-attach", element: <AddAttachment /> },
          { path: "/add-employee", element: <AddEmployeesforms /> },
          { path: "/employees/:id", element: <EmployeeDetails /> },
          { path: "/contract-employees/:id", element: <ContractEmployeeDetails /> },
          { path: "/training", element: <TrainingPage /> },
          { path: "training-courses", element: <TrainingCoursesDocuments /> },
          { path: "/training/:id", element: <CourseDetails /> },
          { path: "/course-attendance", element: <CourseAttendance /> },
          { path: "/Emp-spouses", element: <SpousesDocuments /> },
          { path: "/Emp-children", element: <ChildrenDocuments /> },
          { path: "/Emp-dependents", element: <DependentsDocuments /> },
          // User Management — requires manage-users permission
          {
            element: <ProtectedRoute requiredPermission="manage-users" />,
            children: [
              { path: "/users", element: <UsersPage /> },
              { path: "/users/add", element: <UserFormPage /> },
              { path: "/users/edit/:id", element: <UserFormPage /> },
            ]
          },
          // Role & Permission Management — requires manage-roles permission
          {
            element: <ProtectedRoute requiredPermission="manage-roles" />,
            children: [
              { path: "/permissions", element: <RolesPage /> },
              { path: "/roles", element: <RolesPage /> },
              { path: "/roles/add", element: <RoleFormPage /> },
              { path: "/roles/edit/:id", element: <RoleFormPage /> },
            ]
          },
        ],
      },
    ],
  },
  {
    // Employee Protected Routes
    element: <ProtectedRoute requiredRole="Employee" redirectTo="/gate2/emp-gate" />,
    children: [
      {
        path: "/emp-dashboard",
        element: <EmpDashboard />,
      },
      {
        path: "/add-wife",
        element: <AddWifePage />,
      },
      {
        path: "/add-children",
        element: <AddChildrenPage />,
      },
      {
        path: "/add-heart",
        element: <AddHeartPage />,
      },
      {
        path: "/add-edu-certificate",
        element: <AddEduCertificatePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      {
        path: "/martial-status",
        element: <MaritalStatusPage />,
      },
      {
        path: "/spouses",
        element: <SpousePage />,
      },
      {
        path: "/children",
        element: <ChildrenPage />,
      },
      {
        path: "/dependents",
        element: <DependentPage />,
      },
      {
        path: "/salary",
        element: <SalaryPage />,
      },
      {
        path: "/emp-qualifications",
        element: <EmpCertificatesPage />,
      },
      {
        path: "/emp-courses",
        element: <EmpCoursesPage />,
      },
    ]
  },
  {
    path: "/reset-pass",
    element: <ResetPasswordEmpPages />,
  }
]);
export default router;