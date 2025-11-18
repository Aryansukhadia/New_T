import type { LoginResponse } from '.';

// ============================================
// AUTHENTICATION HELPER FUNCTIONS
// ============================================

/**
 * Store authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
    localStorage.setItem('token', token);
};

/**
 * Store user info in localStorage
 */
export const setUserInfo = (userInfo: LoginResponse): void => {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
    return localStorage.getItem('token');
};

/**
 * Get user info from localStorage
 */
export const getUserInfo = (): LoginResponse | null => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
};

/**
 * Remove authentication token and user info from localStorage
 */
export const removeAuthToken = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getAuthToken();
};

/**
 * Get current user role
 */
export const getCurrentUserRole = (): string | null => {
    const userInfo = getUserInfo();
    return userInfo?.role || null;
};

/**
 * Check if user is SuperAdmin
 */
export const isSuperAdmin = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'superadmin';
};

/**
 * Check if user is Admin
 */
export const isAdmin = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'admin';
};

/**
 * Check if user is SubAdmin
 */
export const isSubAdmin = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'subadmin';
};

/**
 * Check if user is Staff Member
 */
export const isStaff = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'staff';
};

/**
 * Check if user is Accountant
 */
export const isAccountant = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'accountant';
};

