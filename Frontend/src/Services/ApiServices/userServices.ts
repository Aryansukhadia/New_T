import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';
import type { PaginationMeta } from './commonTypes';

// ============================================
// USER TYPES
// ============================================

export interface UserResponse {
  userId: string;
  fullName: string;
  emailId: string;
  role: string;
  createdAt: string;
}

export interface UsersPaginatedResponse {
  users: UserResponse[];
  pagination: PaginationMeta;
}

// ============================================
// USER SERVICES
// ============================================

/**
 * Get All Users Service with Pagination
 * GET /api/users?page=1&limit=10
 *
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with paginated users data
 */
export const getUsersService = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<UsersPaginatedResponse>> => {
  const response = await apiInstance.get<ApiResponse<UsersPaginatedResponse>>(
    getApiUrl('getUsers'),
    {
      params: { page, limit }
    }
  );
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
  const response = await apiInstance.get<ApiResponse<UserResponse>>(
    getApiUrl('getUserById', { id: userId })
  );
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
    getApiUrl('updateUser', { id: userId }),
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
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteUser', { id: userId })
  );
  return response.data;
};

