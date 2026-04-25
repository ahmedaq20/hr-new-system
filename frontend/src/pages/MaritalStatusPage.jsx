import React from 'react'
import EmpGateSideBar from '../components/EmpGateSideBar';
import MaritalStatus from '../components/MaritalStatus';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';

function MaritalStatusPage() {
  const { data, isLoading, error } = useEmployeeDashboard();

  return (
    <div>
      <EmpGateSideBar>
        <MaritalStatus
          personalInfo={data?.personal_info}
          spouses={data?.spouses}
          children={data?.children}
          dependents={data?.dependents}
          loading={isLoading}
          error={error}
        />
      </EmpGateSideBar>
    </div>
  )
}

export default MaritalStatusPage;