import { useAuthStore } from '../store/useAuthStore';

export function usePermissions() {
    const user = useAuthStore((state) => state.user);
    const permissions = user?.permissions || [];
    const roles = user?.roles || [];

    const hasPermission = (permission: string): boolean => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (perms: string[]): boolean => {
        return perms.some(p => permissions.includes(p));
    };

    const hasRole = (role: string): boolean => {
        return roles.includes(role);
    };

    // Mapped capabilities for sidebar sections and route guards
    const can = {
        accessAdminDashboard: hasPermission('access-admin-dashboard'),
        viewEmployees: hasPermission('view-employees') || hasPermission('create-employees') || hasPermission('edit-employees'),
        createEmployees: hasPermission('create-employees'),
        editEmployees: hasPermission('edit-employees'),
        deleteEmployees: hasPermission('delete-employees'),
        manageContracts: hasPermission('manage-employment-contracts'),
        managePrograms: hasPermission('manage-work-programs'),
        manageLookups: hasPermission('manage-system-lookups'),
        manageProfileRequests: hasPermission('manage-profile-requests'),
        viewReports: hasPermission('view-reports') || hasPermission('export-reports'),
        manageFinancials: hasAnyPermission(['manage-allowances-deductions', 'manage-payslips']),
        manageTraining: hasPermission('manage-training-catalog'),
        viewAttendance: hasPermission('view-attendance-records'),
        manageUsers: hasPermission('manage-users'),
        manageRoles: hasPermission('manage-roles') || hasPermission('manage-permissions'),
        viewLogs: hasPermission('view-logs'),
        manageSettings: hasPermission('manage-settings'),
    };

    return { hasPermission, hasAnyPermission, hasRole, can };
}
