import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';
import type { PaginationMeta } from './commonTypes';

// ============================================
// ACCESSORY INVENTORY TYPES
// ============================================

export interface AccessoryInventory {
  id: string;
  inventoryId: string;
  quantity: number;
  properties: Record<string, any>; // JSON object with dynamic fields
}

export interface AccessoryInventoryItem {
  id: string;
  type: 'accessory';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  accessory: AccessoryInventory | null;
}

export interface CreateAccessoryInventoryRequest {
  name: string;
  quantity: number;
  imageUrl?: string | null;
  properties: Record<string, any>; // JSON object with dynamic fields
}

export interface UpdateAccessoryInventoryRequest {
  name?: string;
  quantity?: number;
  imageUrl?: string | null;
  properties?: Record<string, any>; // JSON object with dynamic fields
}

export interface AccessoryInventoriesPaginatedResponse {
  inventories: AccessoryInventoryItem[];
  pagination: PaginationMeta;
}

// ============================================
// ACCESSORY INVENTORY SERVICES
// ============================================

/**
 * Get All Accessory Inventories Service with Pagination
 * GET /api/accessory-inventories?page=1&limit=10
 * 
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with paginated accessory inventories data
 */
export const getAccessoryInventoriesService = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<AccessoryInventoriesPaginatedResponse>> => {
  const response = await apiInstance.get<ApiResponse<AccessoryInventoriesPaginatedResponse>>(
    getApiUrl('getAccessoryInventories'),
    {
      params: { page, limit }
    }
  );
  return response.data;
};

/**
 * Get Accessory Inventory By ID Service
 * GET /api/accessory-inventories/:id
 * 
 * @param inventoryId - Accessory Inventory ID
 * @returns Promise with accessory inventory data
 */
export const getAccessoryInventoryByIdService = async (
  inventoryId: string
): Promise<ApiResponse<AccessoryInventoryItem>> => {
  const response = await apiInstance.get<ApiResponse<AccessoryInventoryItem>>(
    getApiUrl('getAccessoryInventoryById', { id: inventoryId })
  );
  return response.data;
};

/**
 * Create Accessory Inventory Service
 * POST /api/accessory-inventories
 * 
 * @param accessoryData - Accessory inventory data to be created
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @returns Promise with created accessory inventory data
 */
export const createAccessoryInventoryService = async (
  accessoryData: CreateAccessoryInventoryRequest,
  imageFiles?: File[] | null
): Promise<ApiResponse<AccessoryInventoryItem>> => {
  const formData = new FormData();
  formData.append('name', accessoryData.name);
  formData.append('quantity', String(accessoryData.quantity));
  formData.append('properties', JSON.stringify(accessoryData.properties));
  if (accessoryData.imageUrl) {
    formData.append('imageUrl', accessoryData.imageUrl);
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }

  const response = await apiInstance.post<ApiResponse<AccessoryInventoryItem>>(
    getApiUrl('createAccessoryInventory'),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Update Accessory Inventory Service
 * PUT /api/accessory-inventories/:id
 * 
 * @param inventoryId - Accessory Inventory ID
 * @param accessoryData - Accessory inventory data to update
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @param deletedImageUrls - Optional array of image URLs to delete
 * @returns Promise with updated accessory inventory data
 */
export const updateAccessoryInventoryService = async (
  inventoryId: string,
  accessoryData: UpdateAccessoryInventoryRequest,
  imageFiles?: File[] | null,
  deletedImageUrls?: string[] | null
): Promise<ApiResponse<AccessoryInventoryItem>> => {
  const formData = new FormData();
  if (accessoryData.name !== undefined) {
    formData.append('name', accessoryData.name);
  }
  if (accessoryData.quantity !== undefined) {
    formData.append('quantity', String(accessoryData.quantity));
  }
  if (accessoryData.properties !== undefined) {
    formData.append('properties', JSON.stringify(accessoryData.properties));
  }
  if (accessoryData.imageUrl !== undefined) {
    formData.append('imageUrl', accessoryData.imageUrl || '');
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }
  if (deletedImageUrls && deletedImageUrls.length > 0) {
    formData.append('deletedImageUrls', JSON.stringify(deletedImageUrls));
  }

  const response = await apiInstance.put<ApiResponse<AccessoryInventoryItem>>(
    getApiUrl('updateAccessoryInventory', { id: inventoryId }),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete Accessory Inventory Service
 * DELETE /api/accessory-inventories/:id
 * 
 * @param inventoryId - Accessory Inventory ID
 * @returns Promise with success message
 */
export const deleteAccessoryInventoryService = async (
  inventoryId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteAccessoryInventory', { id: inventoryId })
  );
  return response.data;
};

