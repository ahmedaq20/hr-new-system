import React from 'react';
import EmpGateSideBar from '../components/EmpGateSideBar';
import { Outlet } from "react-router-dom";
import DashHeader from '../components/DashHeader';
import EmpDashCards from '../components/EmpDashCards';
import ServicesHeader from '../components/ServicesHeader';
import EmpDetailsCards from '../components/EmpDetailsCards';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import { Spinner, Alert } from 'react-bootstrap';

function EmpDashboard() {
  const { data, isLoading, error } = useEmployeeDashboard();

  if (isLoading) {
    return (
      <EmpGateSideBar>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <Spinner animation="border" variant="teal" style={{ color: '#016A74' }} />
        </div>
      </EmpGateSideBar>
    );
  }

  if (error) {
    return (
      <EmpGateSideBar>
        <Alert variant="danger" className="m-4">
          {error.message || 'فشل جلب بيانات لوحة التحكم'}
        </Alert>
      </EmpGateSideBar>
    );
  }

  return (
    <div>
      <EmpGateSideBar>
        <DashHeader name={data?.personal_info?.first_name + " " + data?.personal_info?.family_name || "الموظف"} />
        <EmpDashCards data={data} />
        <ServicesHeader />
        <EmpDetailsCards data={data} />
        <Outlet />
      </EmpGateSideBar>
    </div>
  );
}

export default EmpDashboard;
