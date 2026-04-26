import React from 'react'
import ProfileHeader from '../components/ProfileHeader'
import EmpGateSideBar from '../components/EmpGateSideBar';
import Profile from '../components/Profile';
import { useEmployeeDashboard } from '../hooks/useEmployeeDashboard';
import { Spinner, Alert } from 'react-bootstrap';

function ProfilePage() {
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
          {error.message || 'فشل جلب بيانات الملف الشخصي'}
        </Alert>
      </EmpGateSideBar>
    );
  }

  return (
    <div>
      <EmpGateSideBar>
        <ProfileHeader data={data} />
        <Profile data={data} />
      </EmpGateSideBar>
    </div>
  )
}

export default ProfilePage;