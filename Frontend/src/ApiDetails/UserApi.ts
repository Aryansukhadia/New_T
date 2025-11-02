import apiInstance from '../Utils/ApiUtils';
import type { ApiResponse } from '../Utils/ApiUtils';
import type { UserResponse, RegisterRequest } from './AuthApi';

// ============================================
// USER API SERVICES
// ============================================

/**
 * Get All Users Service
 * GET /api/users
 * 
 * @returns Promise with list of users
 */
export const getUsersService = async (): Promise<ApiResponse<UserResponse[]>> => {
  const response = await apiInstance.get<ApiResponse<UserResponse[]>>('/users');
  return response.data;
};

/**
 * Get User By ID Service
 * GET /api/users/:id
 * 
 * @param userId - User ID
 * @returns Promise with user data
 */
export const getUserByIdService = async (userId: string): Promise<ApiResponse<UserResponse>> => {
  const response = await apiInstance.get<ApiResponse<UserResponse>>(`/users/${userId}`);
  return response.data;
};

/**
 * Update User Service
 * PUT /api/users/:id
 * 
 * @param userId - User ID
 * @param userData - User data to update (currently only fullName is supported)
 * @returns Promise with updated user data
 */
export const updateUserService = async (
  userId: string,
  userData: { fullName: string }
): Promise<ApiResponse<UserResponse>> => {
  const response = await apiInstance.put<ApiResponse<UserResponse>>(
    `/users/${userId}`,
    userData
  );
  return response.data;
};

/**
 * Delete User Service
 * DELETE /api/users/:id
 * 
 * @param userId - User ID
 * @returns Promise with success message
 */
export const deleteUserService = async (userId: string): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(`/users/${userId}`);
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
export { createUserByAdminService } from './AuthApi';

