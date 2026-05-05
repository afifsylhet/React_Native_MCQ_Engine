import { useAuth } from './useAuth';
import { User } from '../types/api.types';

interface RolePermissions {
    canManageUsers: boolean;
    canManageQuestions: boolean;
    canViewReports: boolean;
    canAccessAdmin: boolean;
    isAdmin: boolean;
    isStudent: boolean;
    isInstructor: boolean;
}

/**
 * Hook for role-based access control
 * Provides methods to check user permissions based on their role
 */
export const useRole = () => {
    const { user } = useAuth();

    /**
     * Get all permissions for the current user
     */
    const getPermissions = (): RolePermissions => {
        const role = user?.role || 'student';

        return {
            isAdmin: role === 'admin',
            isStudent: role === 'student',
            isInstructor: role === 'instructor',
            canAccessAdmin: role === 'admin',
            canManageUsers: role === 'admin',
            canManageQuestions: role === 'admin' || role === 'instructor',
            canViewReports: role === 'admin',
        };
    };

    /**
     * Check if user has admin role
     */
    const isAdmin = (): boolean => user?.role === 'admin';

    /**
     * Check if user is a student
     */
    const isStudent = (): boolean => user?.role === 'student';

    /**
     * Check if user is an instructor
     */
    const isInstructor = (): boolean => user?.role === 'instructor';

    /**
     * Check if user can access admin features
     */
    const canAccessAdmin = (): boolean => user?.role === 'admin';

    /**
     * Check if user can manage other users
     */
    const canManageUsers = (): boolean => user?.role === 'admin';

    /**
     * Check if user can manage questions
     */
    const canManageQuestions = (): boolean =>
        user?.role === 'admin' || user?.role === 'instructor';

    /**
     * Check if user can view reported questions
     */
    const canViewReports = (): boolean => user?.role === 'admin';

    /**
     * Check if user has multiple of the provided roles
     */
    const hasRole = (...roles: Array<'admin' | 'student' | 'instructor'>): boolean => {
        return roles.includes(user?.role as any);
    };

    /**
     * Get current user role
     */
    const getRole = (): User['role'] => {
        return user?.role || 'student';
    };

    return {
        user,
        getPermissions,
        isAdmin,
        isStudent,
        isInstructor,
        canAccessAdmin,
        canManageUsers,
        canManageQuestions,
        canViewReports,
        hasRole,
        getRole,
    };
};
