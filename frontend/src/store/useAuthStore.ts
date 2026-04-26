import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setSessionMarker, hasSessionMarker, clearSessionMarker } from '../utils/authUtils';
import { queryClient } from '../lib/react-query';

interface User {
    id: string;
    name: string;
    email: string;
    Role?: 'Admin' | 'Employee';
    permissions: string[];
    roles: string[];
    is_admin: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    login: (user: User, token: string) => void;
    logout: (redirectPath?: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,
            login: (user, token) => {
                // Robustness: Ensure is_admin is boolean and has fallback to legacy Role
                const is_admin = !!(user.is_admin || (user.Role && user.Role.toLowerCase() === 'admin'));
                const enrichedUser = { ...user, is_admin };
                
                set({ user: enrichedUser, token, isAuthenticated: true });
                localStorage.setItem('token', token);
                setSessionMarker();
            },
            logout: (redirectPath = '/auth/login') => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
                clearSessionMarker();
                queryClient.clear();
                // Optional: redirect to login if not already there
                if (window.location.pathname !== redirectPath) {
                    window.location.href = redirectPath;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
            onRehydrateStorage: () => (state) => {
                if (state) state._hasHydrated = true;
                // When the store is loaded from localStorage (e.g. on refresh or new tab)
                // Check if the session marker cookie exists.
                // If not, it means the browser was closed and reopened.
                if (state && state.token && !hasSessionMarker()) {
                    state.logout();
                }
            },
        }
    )
);
