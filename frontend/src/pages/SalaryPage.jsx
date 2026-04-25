import React from 'react'
import Salary from '../components/Salary'
import EmpGateSideBar from '../components/EmpGateSideBar'
import { useEmployeePayslips } from '../hooks/useEmployeePayslips'

function SalaryPage() {
  const { data: payslips, isLoading, error } = useEmployeePayslips();

  return (
    <div>
      <EmpGateSideBar>
        <Salary
          payslips={payslips}
          loading={isLoading}
          error={error}
        />
      </EmpGateSideBar>
    </div>
  )
}

export default SalaryPage;