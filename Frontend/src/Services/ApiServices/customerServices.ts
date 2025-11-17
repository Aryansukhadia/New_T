import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';

// ============================================
// CUSTOMER TYPES
// ============================================

export interface Customer {
  customerId: string;
  fullName: string;
  emailId: string;
  mobileNo: string;
  address: string;
  reference: string | null;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  topMeasurementId: string | null;
  bottomMeasurementId: string | null;
}

export interface CreateCustomerRequest {
  fullName: string;
  emailId: string;
  mobileNo: string;
  address: string;
  reference?: string | null;
}

export interface UpdateCustomerRequest {
  fullName?: string;
  emailId?: string;
  mobileNo?: string;
  address?: string;
  reference?: string | null;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CustomersPaginatedResponse {
  customers: Customer[];
  pagination: PaginationMeta;
}

// ============================================
// CUSTOMER SERVICES
// ============================================

/**
 * Get All Customers Service with Pagination
 * GET /api/customers?page=1&limit=10
 *
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with paginated customers data
 */
export const getCustomersService = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<CustomersPaginatedResponse>> => {
  const response = await apiInstance.get<ApiResponse<CustomersPaginatedResponse>>(
    getApiUrl('getCustomers'),
    {
      params: { page, limit }
    }
  );
  return response.data;
};

/**
 * Get Customer By ID Service
 * GET /api/customers/:id
 * 
 * @param customerId - Customer ID
 * @returns Promise with customer data
 */
export const getCustomerByIdService = async (
  customerId: string
): Promise<ApiResponse<Customer>> => {
  const response = await apiInstance.get<ApiResponse<Customer>>(
    getApiUrl('getCustomerById', { id: customerId })
  );
  return response.data;
};

/**
 * Create Customer Service
 * POST /api/customers
 * 
 * @param customerData - Customer data to be created
 * @returns Promise with created customer data
 */
export const createCustomerService = async (
  customerData: CreateCustomerRequest
): Promise<ApiResponse<Customer>> => {
  const response = await apiInstance.post<ApiResponse<Customer>>(
    getApiUrl('createCustomer'),
    customerData
  );
  return response.data;
};

/**
 * Update Customer Service
 * PUT /api/customers/:id
 * 
 * @param customerId - Customer ID
 * @param customerData - Customer data to update
 * @returns Promise with updated customer data
 */
export const updateCustomerService = async (
  customerId: string,
  customerData: UpdateCustomerRequest
): Promise<ApiResponse<Customer>> => {
  const response = await apiInstance.put<ApiResponse<Customer>>(
    getApiUrl('updateCustomer', { id: customerId }),
    customerData
  );
  return response.data;
};

/**
 * Delete Customer Service (Soft Delete)
 * DELETE /api/customers/:id
 * 
 * @param customerId - Customer ID
 * @returns Promise with success message
 */
export const deleteCustomerService = async (
  customerId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteCustomer', { id: customerId })
  );
  return response.data;
};

