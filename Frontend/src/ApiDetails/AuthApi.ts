import apiInstance from '../Utils/ApiUtils';
import type { ApiResponse } from '../Utils/ApiUtils';

// ============================================
// AUTHENTICATION API ENDPOINTS
// ============================================

/**
 * API List Related to Authentication:
 * 
 * 1. POST /api/users/login
 *    - Login user with email and password
 *    - Returns: user data with token
 * 
 * 2. POST /api/users
 *    - Register/Add new user (self-registration)
 *    - Returns: created user data
 * 
 * 3. POST /api/users/admin/create
 *    - Create user by admin (requires admin authentication)
 *    - Returns: created user data
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface LoginRequest {
    emailId: string;
    password: string;
}

export interface LoginResponse {
    userId: string;
    fullName: string;
    emailId: string;
    roleName: string;
    token: string;
}

export interface RegisterRequest {
    fullName: string;
    emailId: string;
    password: string;
    roleId: string;
}

export interface UserResponse {
    userId: string;
    fullName: string;
    emailId: string;
    roleId: string;
    createdAt: string;
    role: {
        roleId: string;
        roleName: string;
    };
}

// ============================================
// AUTHENTICATION SERVICES
// ============================================

/**
 * Login Service
 * POST /api/users/login
 * 
 * @param credentials - Email and password
 * @returns Promise with user data and token
 */
export const loginService = async (
    credentials: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiInstance.post<ApiResponse<LoginResponse>>(
        '/users/login',
        credentials
    );
    return response.data;
};

/**
 * Register Service
 * POST /api/users
 * 
 * @param userData - User registration data
 * @returns Promise with created user data
 */
export const registerService = async (
    userData: RegisterRequest
): Promise<ApiResponse<UserResponse>> => {
    const response = await apiInstance.post<ApiResponse<UserResponse>>(
        '/users',
        userData
    );
    return response.data;
};

/**
 * Create User by Admin Service
 * POST /api/users/admin/create
 * 
 * Note: Requires admin authentication token in headers
 * 
 * @param userData - User data to be created
 * @returns Promise with created user data
 */
export const createUserByAdminService = async (
    userData: RegisterRequest
): Promise<ApiResponse<UserResponse>> => {
    const response = await apiInstance.post<ApiResponse<UserResponse>>(
        '/users/admin/create',
        userData
    );
    return response.data;
};

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
    return userInfo?.roleName || null;
};

/**
 * Check if user is Admin
 */
export const isAdmin = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'admin';
};

/**
 * Check if user is Staff Member
 */
export const isStaff = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'staff members' || role?.toLowerCase() === 'staff';
};

/**
 * Check if user is Accountant
 */
export const isAccountant = (): boolean => {
    const role = getCurrentUserRole();
    return role?.toLowerCase() === 'accountant';
};

