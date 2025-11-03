import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';

// ============================================
// ROLE TYPES
// ============================================

export interface Role {
  roleId: string;
  roleName: string;
  createdAt: string;
}

// ============================================
// ROLE SERVICES
// ============================================

/**
 * Get All Roles Service
 * GET /api/roles
 * 
 * @returns Promise with list of roles
 */
export const getRolesService = async (): Promise<ApiResponse<Role[]>> => {
  const response = await apiInstance.get<ApiResponse<Role[]>>(getApiUrl('getRoles'));
  return response.data;
};

/**
 * Get Role By ID Service
 * GET /api/roles/:id
 * 
 * @param roleId - Role ID
 * @returns Promise with role data
 */
export const getRoleByIdService = async (roleId: string): Promise<ApiResponse<Role>> => {
  const response = await apiInstance.get<ApiResponse<Role>>(getApiUrl('getRoleById', { id: roleId }));
  return response.data;
};

/**
 * Create Role Service
 * POST /api/roles
 * 
 * @param roleData - Role data to be created
 * @returns Promise with created role data
 */
export const createRoleService = async (
  roleData: { roleName: string }
): Promise<ApiResponse<Role>> => {
  const response = await apiInstance.post<ApiResponse<Role>>(
    getApiUrl('createRole'),
    roleData
  );
  return response.data;
};

/**
 * Update Role Service
 * PUT /api/roles/:id
 * 
 * @param roleId - Role ID
 * @param roleData - Role data to update
 * @returns Promise with updated role data
 */
export const updateRoleService = async (
  roleId: string,
  roleData: { roleName: string }
): Promise<ApiResponse<Role>> => {
  const response = await apiInstance.put<ApiResponse<Role>>(
    getApiUrl('updateRole', { id: roleId }),
    roleData
  );
  return response.data;
};

/**
 * Delete Role Service
 * DELETE /api/roles/:id
 * 
 * @param roleId - Role ID
 * @returns Promise with success message
 */
export const deleteRoleService = async (roleId: string): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteRole', { id: roleId })
  );
  return response.data;
};

