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

// ============================================
// CUSTOMER SERVICES
// ============================================

/**
 * Get All Customers Service
 * GET /api/customers
 * 
 * @returns Promise with list of customers
 */
export const getCustomersService = async (): Promise<ApiResponse<Customer[]>> => {
  const response = await apiInstance.get<ApiResponse<Customer[]>>(
    getApiUrl('getCustomers')
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

