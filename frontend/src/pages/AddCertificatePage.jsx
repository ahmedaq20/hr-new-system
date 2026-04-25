import React from 'react'
import AddCertificate from '../components/AddCertificate'
import AcademicCertifactesHeader from '../components/AcademicCertificatesHeader'
import AcademicCertifactesFilters from '../components/AcademicCertifcatesFilters'
function AddCertificatePage() {
  return (
    <div>
        <AcademicCertifactesHeader title="إضافة شهادة" desc="رفع شهادة أكاديمية جديد للموظف"/>
        <AcademicCertifactesFilters/>
        <AddCertificate/>
    </div>
  )
}
export default AddCertificatePage;