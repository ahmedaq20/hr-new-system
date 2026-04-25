import React, { useState, useEffect } from "react";
import { Table, Button, Form, Badge, Card, Row, Col, Modal, Spinner } from "react-bootstrap";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaShieldAlt, FaUsers, FaKey, FaChartPie } from "react-icons/fa";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";
import { getPermissionLabel } from "../utils/permissionLabels";

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  created_at: string;
  permissions_count: number;
}

interface RoleDetails extends Role {
  permissions: Permission[];
}

interface Stats {
  total_roles: number;
  active_roles: number;
  distributed_permissions: number;
  avg_permissions_per_role: number;
}

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const permissionCategoryMap: Record<string, string> = {
    'employee': 'إدارة الموظفين والعقود',
    'contract': 'إدارة الموظفين والعقود',
    'program': 'إدارة الموظفين والعقود',
    'role': 'المستخدمين والصلاحيات',
    'permission': 'المستخدمين والصلاحيات',
    'user': 'المستخدمين والصلاحيات',
    'slip': 'الشؤون المالية',
    'salary': 'الشؤون المالية',
    'allowance': 'الشؤون المالية',
    'deduction': 'الشؤون المالية',
    'report': 'التقارير والإحصائيات',
    'log': 'سجلات النظام',
    'audit': 'سجلات النظام',
    'lookup': 'إعدادات النظام',
    'setting': 'إعدادات النظام',
    'training': 'التطوير والوثائق',
    'attendance': 'التطوير والوثائق',
    'dashboard': 'عام',
  };

  const categoryColors: Record<string, string> = {
    'إدارة الموظفين والعقود': '#00BCD4',
    'المستخدمين والصلاحيات': '#9C27B0',
    'الشؤون المالية': '#FF9800',
    'التقارير والإحصائيات': '#4CAF50',
    'سجلات النظام': '#607D8B',
    'إعدادات النظام': '#795548',
    'التطوير والوثائق': '#3F51B5',
    'عام': '#2196F3',
    'أخرى': '#9E9E9E',
  };

  const groupPermissions = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(perm => {
      let category = 'أخرى';
      for (const [keyword, cat] of Object.entries(permissionCategoryMap)) {
        if (perm.name.includes(keyword)) {
          category = cat;
          break;
        }
      }
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(perm);
    });
    return grouped;
  };

  const fetchRoleDetails = async (roleId: number) => {
    setLoadingDetails(true);
    setShowModal(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.ROLES.DETAILS(roleId));
      setSelectedRole(response.data);
    } catch (error) {
      console.error("Error fetching role details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteRoleClick = (roleId: number, roleName: string) => {
    setRoleToDelete({ id: roleId, name: roleName });
    setShowDeleteModal(true);
  };

  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(ENDPOINTS.ADMIN.ROLES.DELETE(roleToDelete.id));
      setShowDeleteModal(false);
      setRoleToDelete(null);
      toast.success("تم حذف الدور بنجاح.");
      fetchRoles();
    } catch (error: unknown) {
      let errorMessage = "فشل حذف الدور، يرجى المحاولة لاحقاً.";

      interface AxiosErrorResponse {
        response?: {
          data?: {
            message?: string;
          };
        };
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosErrorResponse;
        errorMessage = axiosError.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get(ENDPOINTS.ADMIN.ROLES.LIST);
      setRoles(response.data.roles);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="roles-page h-100 p-4">
      <div className="d-flex align-items-center mb-4 gap-2">
        <FaShieldAlt className="text-primary fs-3" />
        <h4 className="mb-0 fw-bold" style={{ color: "#014f56" }}>إدارة الأدوار الوظيفية</h4>
      </div>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="text-muted small mb-1">إجمالي الأدوار</div>
                <h3 className="mb-0 fw-bold">{stats?.total_roles || 0}</h3>
              </div>
              <div className="rounded-circle p-3 bg-primary bg-opacity-10 text-primary">
                <FaShieldAlt size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="text-muted small mb-1">صلاحيات موزعة</div>
                <h3 className="mb-0 fw-bold">{stats?.distributed_permissions || 0}%</h3>
              </div>
              <div className="rounded-circle p-3 bg-success bg-opacity-10 text-success">
                <FaKey size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="text-muted small mb-1">متوسط الصلاحيات</div>
                <h3 className="mb-0 fw-bold">{Math.round(stats?.avg_permissions_per_role || 0)}</h3>
              </div>
              <div className="rounded-circle p-3 bg-warning bg-opacity-10 text-warning">
                <FaChartPie size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <div className="text-muted small mb-1">أدوار نشطة</div>
                <h3 className="mb-0 fw-bold">{stats?.active_roles || 0}</h3>
              </div>
              <div className="rounded-circle p-3 bg-info bg-opacity-10 text-info">
                <FaUsers size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="bg-white rounded shadow-sm overflow-hidden mb-4">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
          <div className="d-flex align-items-center gap-3 w-50">
            <h5 className="mb-0 fw-bold text-nowrap" style={{ color: "#2c3e50" }}>قائمة الأدوار</h5>
            <div className="position-relative me-5 w-100">
              <FaSearch className="position-absolute top-50 translate-middle-y me-3 text-muted" />
              <Form.Control
                type="text"
                placeholder="بحث عن دور..."
                className="ps-5 bg-light border-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingRight: '40px' }}
              />
            </div>
          </div>
          <Button
            variant="info"
            className="text-white d-flex align-items-center gap-2 rounded-3 px-4"
            style={{ backgroundColor: "#002F6C", border: "none" }}
            onClick={() => navigate("/roles/add")}
          >
            <FaPlus /> إضافة دور جديد
          </Button>
        </div>

        <Table hover responsive className="mb-0 custom-table">
          <thead className="bg-light">
            <tr>
              <th className="text-center">اسم الدور</th>
              <th className="text-center">عدد الصلاحيات</th>
              <th className="text-center">تاريخ الإنشاء</th>
              <th className="text-center">اجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center p-5">جاري التحميل...</td></tr>
            ) : filteredRoles.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-5">لا يوجد أدوار</td></tr>
            ) : (
              [...filteredRoles].sort((a, b) => {
                if (a.name === 'super admin' && b.name !== 'super admin') return -1;
                if (a.name !== 'super admin' && b.name === 'super admin') return 1;
                return 0;
              }).map((role) => {
                const isSuperAdmin = role.name === 'super admin';
                return (
                  <tr key={role.id} className={`align-middle text-center ${isSuperAdmin ? 'super-admin-row' : ''}`}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="fw-bold">{role.name}</span>
                        <FaShieldAlt size={20} className={isSuperAdmin ? 'text-warning' : 'text-info opacity-50'} />
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" className={`px-3 py-2 rounded-pill ${isSuperAdmin ? 'text-warning border border-warning border-opacity-50 fw-bold' : 'text-info border border-info border-opacity-25'}`}>
                        {role.permissions_count} صلاحية
                      </Badge>
                    </td>
                    <td>{new Date(role.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div className="d-flex gap-2 justify-content-center">
                        <Button variant="link" className="p-0 text-info" onClick={() => fetchRoleDetails(role.id)}><FaEye /></Button>
                        <Button variant="link" className="p-0 text-success" onClick={() => navigate(`/roles/edit/${role.id}`)}><FaEdit /></Button>
                        {!isSuperAdmin && (
                          <Button variant="link" className="p-0 text-danger" onClick={() => handleDeleteRoleClick(role.id, role.name)}><FaTrash /></Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      {/* Role Details Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); setSelectedRole(null); }} size="lg" centered>
        <Modal.Header className="border-0" style={{ background: 'linear-gradient(135deg, #002F6C 0%, #00BCD4 100%)' }}>
          <Modal.Title className="text-white d-flex align-items-center gap-2">
            <FaShieldAlt /> تفاصيل الدور
          </Modal.Title>
          <button type="button" className="btn-close btn-close-white me-auto m-0" aria-label="Close" onClick={() => { setShowModal(false); setSelectedRole(null); }}></button>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingDetails ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="info" />
              <p className="mt-3 text-muted">جاري تحميل التفاصيل...</p>
            </div>
          ) : selectedRole ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
                <div>
                  <h5 className="mb-1 fw-bold" style={{ color: '#014f56' }}>{selectedRole.name}</h5>
                  <small className="text-muted">تاريخ الإنشاء: {new Date(selectedRole.created_at).toLocaleDateString('en-GB')}</small>
                </div>
                <Badge className="px-3 py-2 rounded-pill fs-6 text-white" style={{ backgroundColor: '#002F6C' }}>
                  {selectedRole.permissions?.length || 0} صلاحية
                </Badge>
              </div>

              {selectedRole.permissions && selectedRole.permissions.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {Object.entries(groupPermissions(selectedRole.permissions)).map(([category, perms]) => (
                    <div key={category} className="border rounded-4 p-3 bg-white shadow-sm" style={{ borderColor: `${categoryColors[category]}40 !important` }}>
                      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 4, height: 20, borderRadius: 4, backgroundColor: categoryColors[category] || '#9E9E9E' }} />
                          <span className="fw-bold" style={{ color: '#2c3e50', fontSize: '1.05rem' }}>{category}</span>
                        </div>
                        <span className="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm" style={{ fontSize: '0.8rem' }}>
                          {perms.length} صلاحيات
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {perms.map(perm => (
                          <div
                            key={perm.id}
                            className="px-3 py-2 rounded-pill fw-medium d-flex align-items-center justify-content-center shadow-sm"
                            style={{
                              backgroundColor: `${categoryColors[category] || '#9E9E9E'}12`,
                              color: categoryColors[category] || '#9E9E9E',
                              border: `1px solid ${categoryColors[category] || '#9E9E9E'}40`,
                              fontSize: '0.85rem'
                            }}
                          >
                            {getPermissionLabel(perm.name)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted p-4">لا توجد صلاحيات مرتبطة بهذا الدور</div>
              )}
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-3 px-4" onClick={() => { setShowModal(false); setSelectedRole(null); }}>إغلاق</Button>
          {selectedRole && (
            <Button
              variant="info"
              className="text-white rounded-3 px-4 d-flex align-items-center gap-2"
              style={{ backgroundColor: '#002F6C', border: 'none' }}
              onClick={() => { setShowModal(false); navigate(`/roles/edit/${selectedRole.id}`); }}
            >
              <FaEdit /> تعديل الدور
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="تأكيد الحذف"
        message={`هل أنت متأكد من أنك تريد حذف الدور "${roleToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        onConfirm={confirmDeleteRole}
        onClose={() => setShowDeleteModal(false)}
        isLoading={isDeleting}
        confirmText="نعم، احذف"
        cancelText="إلغاء المتابعة"
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
        .rounded-4 { border-radius: 1rem !important; }
        .bg-opacity-10 { --bs-bg-opacity: 0.1; }
      `}</style>
    </div>
  );
};

export default RolesPage;
