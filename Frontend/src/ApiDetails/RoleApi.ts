import apiInstance from '../Utils/ApiUtils';
import type { ApiResponse } from '../Utils/ApiUtils';

// ============================================
// TYPE DEFINITIONS
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
  const response = await apiInstance.get<ApiResponse<Role[]>>('/roles');
  return response.data;
};

