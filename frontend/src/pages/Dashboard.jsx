import React from 'react'
import DashboardCards from '../components/DashboardCards'
import AttendanceChartDonut from '../components/AttendanceChartDonut'
import AttendanceChart from '../components/AttendanceChart'

import EmployeesByOfficeChart from '../components/EmployeesByOfficeChart'

function Dashboard() {
  return (
    <div>
        <DashboardCards/>
        {/* <DonutChart/> */}
       <div className='d-flex mt-3'>
         <div className="col-md-6">
            {/* <AttendanceChart /> */}
            <AttendanceChartDonut/>
          </div>
          <div className="col-md-6">
            <EmployeesByOfficeChart />
          </div>
       </div>
    </div>
  )
}

export default Dashboard