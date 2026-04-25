import React from 'react'
import EmpLogin from '../components/EmpLogin'
import { Outlet } from "react-router-dom";


function EmpGate() {
  return (
    <div>
        <EmpLogin/>
    </div>
  )
}

export default EmpGate;