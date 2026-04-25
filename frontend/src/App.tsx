// import './App.css';
// import SideBar from './components/SideBar';
// import { Routes, Route } from "react-router-dom";
// import { BrowserRouter } from 'react-router-dom';
// import Login from './components/Login';
// import EmployeesPage from './pages/Employess.jsx';
// import OfficialEmployees from './pages/OfficialEmployees.jsx';
// import OfficialsOfAnotherGovernment from './pages/OfficialsOfAnotherGovernment.jsx';
// import EditEmpWizard from './components/EditEmpWizard';
// import OlderEmployees from './pages/OlderEmployees';
// import DismissedEmployees from './pages/DismissedEmployees';
// import PermanentEmploymentContracts from './pages/PermanentEmploymentContracts';
// import TemporaryEmploymentContracts from './pages/TemporaryEmploymentContracts';
// import SuspendedEmploymentContracts from './pages/SuspendedEmploymentContracts';
// import TemporaryContrastEmployees from './pages/TemporaryContrastEmployees';
// import Programs from './pages/Programs';
// import Goverments from './pages/Goverments';
// import TypeOfEmpTable from './components/TypeOfEmpTable';
// import EmpType from './pages/EmpType';
// import EmpClassifications from './pages/EmpClassifications';
// import Categories from './pages/Categories';
// function App() {

//   return (
//       <Routes>
//        <Route path='/' element={<Login />} />
//         <Route path='/login' element={<Login />} />
//         <Route 
//               path="/employees" 
//               element={
//                 <SideBar>
//                   <EmployeesPage />
//                 </SideBar>
//               } 
//             />
//        <Route 
//           path="/official-employees" 
//           element={
//             <SideBar>
//               <OfficialEmployees />
//            </SideBar>
//          } 
//         />
//         <Route 
//          path="/other-government" 
//           element={
//              <SideBar>
//              <OfficialsOfAnotherGovernment />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/dismissd-employees" 
//           element={
//              <SideBar>
//              <DismissedEmployees />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/older-employees" 
//           element={
//              <SideBar>
//              <OlderEmployees />
//              </SideBar>
//            } 
//         />
//          <Route 
//          path="/permenant-contrast" 
//           element={
//              <SideBar>
//              <PermanentEmploymentContracts />
//              </SideBar>
//            } 
//         />
//          <Route 
//          path="/temporary-contrast" 
//           element={
//              <SideBar>
//              <TemporaryEmploymentContracts />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/suspended-contrast" 
//           element={
//              <SideBar>
//              <SuspendedEmploymentContracts />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/programs" 
//           element={
//              <SideBar>
//              <Programs />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/temporary-contrast-employees" 
//           element={
//              <SideBar>
//              <TemporaryContrastEmployees />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/goverments" 
//           element={
//              <SideBar>
//              <Goverments />
//              </SideBar>
//            } 
//         />
//         <Route 
//          path="/emp-type" 
//           element={
//              <SideBar>
//              <EmpType />
//              </SideBar>
//            }
//         />
//         <Route 
//          path="/emp-classifications" 
//           element={
//              <SideBar>
//              <EmpClassifications />
//              </SideBar>
//            }
//         />
//         <Route 
//          path="/categories" 
//           element={
//              <SideBar>
//              <Categories />
//              </SideBar>
//            }
//         />
//       </Routes>
//   )
// }

// export default App;

// src/App.tsx
import { RouterProvider } from "react-router-dom";
import router from "./routes";

export default function App() {
  return <RouterProvider router={router} />;
}



