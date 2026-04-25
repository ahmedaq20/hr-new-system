import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Spinner } from "react-bootstrap";

interface ProtectedRouteProps {
    redirectTo?: string;
    requiredRole?: 'Admin' | 'Employee';
    requiredPermission?: string;
}

const ProtectedRoute = ({ redirectTo = "/auth/login", requiredRole, requiredPermission }: ProtectedRouteProps) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const _hasHydrated = useAuthStore((state) => state._hasHydrated);

    if (!_hasHydrated) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-secondary fw-medium">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    if (requiredRole === 'Admin' && !user?.is_admin) {
        return <Navigate to="/emp-dashboard" replace />;
    }

    if (requiredRole === 'Employee' && user?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Permission-based route guard
    if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

