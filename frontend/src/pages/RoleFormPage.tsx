import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, Badge } from "react-bootstrap";
import { FaShieldAlt, FaSave, FaTimes, FaSearch } from "react-icons/fa";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPermissionLabel } from "../utils/permissionLabels";

interface Permission {
  id: number;
  name: string;
}

interface GroupedPermissions {
  [key: string]: Permission[];
}

interface RoleResponse {
  name: string;
  permissions: Permission[];
}

const RoleFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [roleName, setRoleName] = useState("");
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({});
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const permsRes = await api.get(ENDPOINTS.ADMIN.ROLES.PERMISSIONS_LIST);
        setGroupedPermissions(permsRes.data);

        if (isEdit) {
          const roleRes = await api.get(ENDPOINTS.ADMIN.ROLES.DETAILS(id));
          const roleData = roleRes.data as RoleResponse;
          setRoleName(roleData.name);
          setSelectedPermissions(roleData.permissions.map((p) => p.id));
        }
      } catch (error) {
        console.error("Error fetching role data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleTogglePermission = (permId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const handleToggleGroup = (groupPerms: Permission[]) => {
    const groupIds = groupPerms.map(p => p.id);
    const allSelected = groupIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: roleName,
        permissions: selectedPermissions
      };

      if (isEdit) {
        await api.put(ENDPOINTS.ADMIN.ROLES.UPDATE(id), data);
        toast.success("تم تحديث الدور بنجاح!");
      } else {
        await api.post(ENDPOINTS.ADMIN.ROLES.CREATE, data);
        toast.success("تم إضافة الدور بنجاح!");
      }
      navigate("/roles");
    } catch (error: unknown) {
      console.error("Error saving role:", error);
      let errorMessage = "حدث خطأ أثناء حفظ الدور. الرجاء المحاولة مرة أخرى.";
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">جاري التحميل...</div>;

  const totalPermsCount = Object.values(groupedPermissions).flat().length;

  return (
    <div className="role-form-page h-100 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaShieldAlt className="text-primary fs-3" />
          <h4 className="mb-0 fw-bold" style={{ color: "#014f56" }}>
            {isEdit ? "تعديل دور وظيفي" : "إضافة دور وظيفي جديد"}
          </h4>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="info"
            className="text-white d-flex align-items-center gap-2 px-4"
            disabled={saving}
            onClick={handleSubmit}
            style={{ backgroundColor: "#002F6C", border: "none" }}
          >
            <FaSave /> {saving ? "جاري الحفظ..." : "حفظ الدور"}
          </Button>
          <Button variant="light" onClick={() => navigate("/roles")} className="d-flex align-items-center gap-2">
            <FaTimes /> إلغاء
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="mb-4 fw-bold">تفاصيل الدور</h5>
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">اسم الدور الوظيفي *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="مثال: مدير مبيعات، مسؤول تقني..."
                  className="bg-light border-0 py-3 rounded-3"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="bg-light rounded-4 p-4 mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">إجمالي الصلاحيات المختارة</span>
                  <Badge bg="info" className="rounded-pill px-3 py-2">
                    {selectedPermissions.length} من {totalPermsCount}
                  </Badge>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div
                    className="progress-bar bg-info"
                    role="progressbar"
                    style={{ width: `${(selectedPermissions.length / totalPermsCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">توزيع الصلاحيات</h5>
                <div className="position-relative w-50">
                  <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="text"
                    placeholder="ابحث عن صلاحية محددة..."
                    className="ps-5 bg-light border-0 py-2 rounded-pill"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ paddingRight: '40px' }}
                  />
                </div>
              </div>

              <Row className="g-4">
                {Object.entries(groupedPermissions).map(([groupName, permissions]) => {
                  const filtered = permissions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
                  if (filtered.length === 0) return null;

                  const allSelected = filtered.every(p => selectedPermissions.includes(p.id));
                  const selectedInGroup = filtered.filter(p => selectedPermissions.includes(p.id)).length;

                  return (
                    <Col md={12} key={groupName}>
                      <div className="permission-group rounded-4 border overflow-hidden">
                        <div className="bg-light p-3 d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => handleToggleGroup(filtered)}
                              id={`group-${groupName}`}
                            />
                            <label htmlFor={`group-${groupName}`} className="fw-bold mb-0" style={{ cursor: 'pointer' }}>{groupName}</label>
                          </div>
                          <small className="text-muted">تم اختيار {selectedInGroup} من {filtered.length}</small>
                        </div>
                        <div className="p-3">
                          <Row>
                            {filtered.map(permission => (
                              <Col md={4} key={permission.id} className="mb-2">
                                <div
                                  className={`permission-item d-flex align-items-center gap-2 p-2 rounded-3 transition-all ${selectedPermissions.includes(permission.id) ? 'bg-info bg-opacity-10' : ''}`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => handleTogglePermission(permission.id)}
                                >
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => { }} // Controlled by parent div
                                    id={`perm-${permission.id}`}
                                  />
                                  <label
                                    htmlFor={`perm-${permission.id}`}
                                    className="mb-0 small"
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {getPermissionLabel(permission.name)}
                                  </label>
                                </div>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .rounded-4 { border-radius: 1rem !important; }
        .transition-all { transition: all 0.2s ease; }
        .permission-item:hover { background-color: #f8f9fa; }
        .bg-info.bg-opacity-10 { background-color: rgba(0, 188, 212, 0.1) !important; }
      `}</style>
    </div>
  );
};

export default RoleFormPage;
