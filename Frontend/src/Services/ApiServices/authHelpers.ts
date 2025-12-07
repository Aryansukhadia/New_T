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

/**
 * Auto login using existing token
 * Calls /api/users/me to validate token and fetch user data
 * Returns true if successful, false if token is invalid
 */
export const autoLogin = async (): Promise<boolean> => {
    try {
        const token = getAuthToken();
        
        // If no token exists, return false
        if (!token) {
            return false;
        }

        // Import the getMeService dynamically to avoid circular dependencies
        const { getMeService } = await import('./userServices');
        
        // Call the /me endpoint to validate token and get user data
        const response = await getMeService();
        
        if (response.success === 200 && response.data) {
            // Update user info in localStorage with the fresh data
            const userInfoToStore = {
                userId: response.data.userId,
                fullName: response.data.fullName,
                emailId: response.data.emailId,
                role: response.data.role,
                token: token // Keep the existing token
            };
            
            setUserInfo(userInfoToStore);
            return true;
        } else {
            // Token is invalid, clear auth data
            removeAuthToken();
            return false;
        }
    } catch (error) {
        console.error('Auto login failed:', error);
        // If request fails (e.g., 401), clear auth data
        removeAuthToken();
        return false;
    }
};

