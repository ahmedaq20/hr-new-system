import React, { useState, useEffect } from "react";
import { Table, Button, Form, Badge, Modal, Spinner, Tabs, Tab } from "react-bootstrap";
import { FaUserPlus, FaSearch, FaEye, FaEdit, FaTrash, FaUserCircle, FaShieldAlt } from "react-icons/fa";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import Pagination from "../components/Pagination";
import { toast } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  national_id: string;
  email: string;
  created_at: string;
  roles: { id: number; name: string }[];
  employee?: {
    full_name: string;
    is_active: boolean;
    work_detail?: {
      job_title?: {
        value: string;
      }
    }
  };
}

interface UserDetails extends User {
  created_at: string;
  employee?: {
    full_name: string;
    is_active: boolean;
    work_detail?: {
      job_title?: {
        value: string;
      }
    }
  };
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("admin");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.USERS.LIST, {
        params: {
          page,
          search: searchTerm,
          type: activeTab
        }
      });
      setUsers(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, activeTab]);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const fetchUserDetails = async (userId: number) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.USERS.DETAILS(userId));
      setSelectedUser(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete({ id: user.id, name: user.name });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(ENDPOINTS.ADMIN.USERS.DELETE(userToDelete.id));
      toast.success('تم حذف المستخدم بنجاح');
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      // Refresh the list
      fetchUsers();
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="users-page h-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm">
        <div className="d-flex align-items-center gap-3 w-50">
          <h4 className="mb-0 fw-bold" style={{ color: "#2c3e50", whiteSpace: "nowrap" }}>قائمة المستخدمين</h4>
          <div className="position-relative me-5 w-100">
            <FaSearch className="position-absolute top-50 translate-middle-y me-3 text-muted" />
            <Form.Control
              type="text"
              placeholder="بحث عن مستخدم..."
              className="ps-5 bg-light border-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingRight: '40px' }}
            />
          </div>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="info"
            className="text-white d-flex align-items-center gap-2"
            style={{ backgroundColor: "#002F6C", border: "none" }}
            onClick={() => navigate("/users/add")}
          >
            <FaUserPlus /> إضافة مستخدم جديد
          </Button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden p-3">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || "admin")}
          className="mb-4 p-0 custom-tabs"
        >
          <Tab eventKey="admin" title={<span><FaShieldAlt className="ms-2" /> مستخدمي لوحة الإدارة</span>}>
            {/* Table for Admin */}
          </Tab>
          <Tab eventKey="employee" title={<span><FaUserCircle className="ms-2" /> مستخدمي بوابة الموظف</span>}>
            {/* Table for Employee */}
          </Tab>
        </Tabs>

        <Table hover responsive className="mb-0 custom-table">
          <thead className="bg-light">
            <tr>
              <th className="text-center">اسم المستخدم</th>
              <th className="text-center">الاسم الكامل</th>
              {activeTab === "admin" && <th className="text-center">الأدوار</th>}
              <th className="text-center">الحالة</th>
              <th className="text-center">تاريخ الإنشاء</th>
              <th className="text-center">اجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-5">جاري التحميل...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-5">لا يوجد مستخدمين</td></tr>
            ) : (
              [...users].sort((a, b) => {
                const aIsSuperAdmin = a.roles.some(r => r.name === 'super admin');
                const bIsSuperAdmin = b.roles.some(r => r.name === 'super admin');
                if (aIsSuperAdmin && !bIsSuperAdmin) return -1;
                if (!aIsSuperAdmin && bIsSuperAdmin) return 1;
                return 0;
              }).map((user) => {
                const isSuperAdmin = user.roles.some(r => r.name === 'super admin');
                return (
                  <tr key={user.id} className={`align-middle text-center ${isSuperAdmin ? 'super-admin-row' : ''}`}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="fw-bold">{user.national_id}</span>
                        {isSuperAdmin ? <FaShieldAlt size={20} className="text-warning" /> : <FaUserCircle size={24} className="text-info opacity-50" />}
                      </div>
                    </td>
                    <td>{user.employee?.full_name || user.name}</td>
                    {activeTab === "admin" && (
                      <td>
                        <div className="flex-wrap justify-content-center d-flex gap-1">
                          {user.roles
                            .filter(role => role.name !== 'employee')
                            .map(role => (
                              <Badge key={role.id} bg="light" className={`px-2 py-1 ${role.name === 'super admin' ? 'text-warning border border-warning border-opacity-50 fw-bold' : 'text-success border border-success border-opacity-25'}`}>
                                {role.name}
                              </Badge>
                            ))}
                        </div>
                      </td>
                    )}
                    <td>
                      <Badge
                        bg={user.employee?.is_active !== false ? 'success' : 'danger'}
                        className={`px-3 py-2 rounded-pill ${user.employee?.is_active !== false ? 'bg-opacity-10 text-success' : 'bg-opacity-10 text-danger'}`}
                      >
                        {user.employee?.is_active !== false ? '● نشط' : '● معطل'}
                      </Badge>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button variant="link" className="p-0 text-info" onClick={() => fetchUserDetails(user.id)}><FaEye /></Button>
                        <Button
                          variant="link"
                          className="p-0 text-success"
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                        >
                          <FaEdit />
                        </Button>
                        {!isSuperAdmin && (
                          <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteClick(user)}><FaTrash /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>

        <div className="p-3 border-top d-flex justify-content-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* User Details Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedUser(null); }} size="lg" centered>
        <Modal.Header className="border-0" style={{ background: 'linear-gradient(135deg, #002F6C 0%, #00BCD4 100%)' }}>
          <Modal.Title className="text-white d-flex align-items-center gap-2">
            <FaUserCircle /> تفاصيل المستخدم
          </Modal.Title>
          <button type="button" className="btn-close btn-close-white me-auto m-0" aria-label="Close" onClick={() => { setShowModal(false); setSelectedUser(null); }}></button>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingDetails ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="info" />
              <p className="mt-3 text-muted">جاري تحميل التفاصيل...</p>
            </div>
          ) : selectedUser ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div>
                  <h5 className="mb-1 fw-bold" style={{ color: '#002F6C' }}>{selectedUser.name}</h5>
                  <small className="text-muted">الهوية: {selectedUser.national_id} | تاريخ الإنشاء: {new Date(selectedUser.created_at).toLocaleDateString('en-GB')}</small>
                </div>
                <Badge
                  bg={selectedUser.employee?.is_active !== false ? 'success' : 'danger'}
                  className={`px-3 py-2 rounded-pill fs-6 ${selectedUser.employee?.is_active !== false ? 'bg-opacity-10 text-success' : 'bg-opacity-10 text-danger'}`}
                >
                  {selectedUser.employee?.is_active !== false ? '● نشط' : '● معطل'}
                </Badge>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>البيانات الأساسية</h6>
                <div className="p-3 rounded-4 bg-white border shadow-sm">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">الاسم بالكامل</div>
                      <div className="fw-medium">{selectedUser.employee?.full_name || selectedUser.name}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="text-muted small mb-1">البريد الإلكتروني</div>
                      <div className="fw-medium">{selectedUser.email || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>الأدوار والصلاحيات</h6>
                  <Badge className="px-3 py-1 rounded-pill text-white" style={{ backgroundColor: '#002F6C' }}>
                    {selectedUser.roles?.length || 0} دور
                  </Badge>
                </div>

                {selectedUser.roles && selectedUser.roles.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 p-3 rounded-4 bg-white border shadow-sm">
                    {selectedUser.roles.map(role => (
                      <div
                        key={role.id}
                        className="px-3 py-2 rounded-pill fw-medium d-flex align-items-center justify-content-center shadow-sm"
                        style={{
                          backgroundColor: '#00BCD412',
                          color: '#002F6C',
                          border: '1px solid #00BCD440',
                          fontSize: '0.85rem'
                        }}
                      >
                        {role.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted p-4 border rounded-4 bg-light">لا يوجد أدوار مرتبطة بهذا المستخدم</div>
                )}
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-3 px-4" onClick={() => { setShowModal(false); setSelectedUser(null); }}>إغلاق</Button>
          {selectedUser && (
            <Button
              variant="info"
              className="text-white rounded-3 px-4 d-flex align-items-center gap-2"
              style={{ backgroundColor: '#002F6C', border: 'none' }}
              onClick={() => { setShowModal(false); navigate(`/users/edit/${selectedUser.id}`); }}
            >
              <FaEdit /> تعديل المستخدم
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteConfirm}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من رغبتك في حذف المستخدم "${userToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="نعم، احذف المستخدم"
        cancelText="إلغاء"
        onConfirm={confirmDeleteUser}
        onClose={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
        isLoading={isDeleting}
      />

      <style>{`
        .custom-table thead th {
          font-weight: 600;
          color: #7f8c8d;
          border-bottom: none;
          padding: 1.2rem 0.5rem;
          font-size: 0.9rem;
        }
        .custom-table tbody td {
          padding: 1rem 0.5rem;
          color: #2c3e50;
          font-size: 0.95rem;
          border-bottom: 1px solid #f8f9fa;
        }
        .custom-table tbody tr:hover {
          background-color: #fcfdfe;
        }
        .custom-table tbody tr.super-admin-row {
          background: linear-gradient(90deg, #fff8e1 0%, #fffde7 40%, #ffffff 100%);
          border-right: 4px solid #f0a500;
        }
        .custom-table tbody tr.super-admin-row:hover {
          background: linear-gradient(90deg, #fff3c4 0%, #fffde7 40%, #f8f9fa 100%);
        }
        .bg-info {
          background-color: #00BCD4 !important;
        }
        .translate-middle-y {
          transform: translateY(-50%) !important;
        }
        .custom-tabs {
          border-bottom: 1px solid #dee2e6;
        }
        .custom-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 10px 25px;
          border-radius: 0;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          background: transparent !important;
        }
        .custom-tabs .nav-link.active {
          color: #007bff !important;
          border-bottom: 3px solid #007bff !important;
          box-shadow: none;
        }
        .custom-tabs .nav-link:hover:not(.active) {
          color: #002F6C;
          border-bottom: 3px solid #dee2e6;
        }
      `}</style>
    </div>
  );
};

export default UsersPage;
