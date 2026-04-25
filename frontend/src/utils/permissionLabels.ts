/**
 * Arabic labels for permission names.
 * Maps English permission slugs to their Arabic display names.
 */
const permissionLabels: Record<string, string> = {
  'access-admin-dashboard': 'الوصول للوحة الإدارة',
  'view-own-salary-slip': 'عرض كشف الراتب',
  'download-salary-slip': 'تحميل كشف الراتب',
  'view-employees': 'عرض الموظفين',
  'create-employees': 'إضافة موظفين',
  'edit-employees': 'تعديل الموظفين',
  'delete-employees': 'حذف الموظفين',
  'view-employee-archive': 'عرض أرشيف الموظفين',
  'manage-profile-requests': 'إدارة طلبات تعديل الملف الشخصي',
  'manage-employment-contracts': 'إدارة عقود التوظيف',
  'manage-work-programs': 'إدارة برامج العمل',
  'manage-system-lookups': 'إدارة بيانات النظام المرجعية',
  'manage-employee-status': 'إدارة حالات الموظفين',
  'view-reports': 'عرض التقارير',
  'export-reports': 'تصدير التقارير',
  'manage-allowances-deductions': 'إدارة العلاوات والخصومات',
  'manage-payslips': 'إدارة كشوف الرواتب',
  'manage-training-catalog': 'إدارة الدورات التدريبية',
  'view-attendance-records': 'عرض سجلات الحضور',
  'manage-users': 'إدارة المستخدمين',
  'manage-roles': 'إدارة الأدوار',
  'manage-permissions': 'إدارة الصلاحيات',
  'manage-settings': 'إدارة إعدادات النظام',
  'view-logs': 'عرض السجلات',
  'delete-records': 'حذف السجلات',
};

/**
 * Returns the Arabic label for a permission name.
 * Falls back to the original English name if no translation exists.
 */
export function getPermissionLabel(name: string): string {
  return permissionLabels[name] || name;
}

export default permissionLabels;
