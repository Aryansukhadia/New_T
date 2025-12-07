import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';
import type { PaginationMeta } from './commonTypes';

// ============================================
// READY-MADE INVENTORY TYPES
// ============================================

export interface ReadyMadeInventory {
  id: string;
  inventoryId: string;
  color: string;
  imageUrl: string;
  quantity: number;
  price: number;
  sizeLabel: string | null;
  sizeNumber: number | null;
}

export interface ReadyMadeInventoryItem {
  id: string;
  type: 'readyMade';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  readyMade: ReadyMadeInventory | null;
}

export interface CreateReadyMadeInventoryRequest {
  name: string;
  color: string;
  imageUrl?: string | null;
  price: number;
  quantity?: number;
  sizeLabel?: string | null;
  sizeNumber?: number | null;
}

export interface UpdateReadyMadeInventoryRequest {
  name?: string;
  color?: string;
  imageUrl?: string | null;
  price?: number;
  quantity?: number;
  sizeLabel?: string | null;
  sizeNumber?: number | null;
}

export interface ReadyMadeInventoriesPaginatedResponse {
  inventories: ReadyMadeInventoryItem[];
  pagination: PaginationMeta;
}

// ============================================
// READY-MADE INVENTORY SERVICES
// ============================================

/**
 * Get All Ready-Made Inventories Service with Pagination
 * GET /api/ready-made-inventories?page=1&limit=10
 * 
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with paginated ready-made inventories data
 */
export const getReadyMadeInventoriesService = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<ReadyMadeInventoriesPaginatedResponse>> => {
  const response = await apiInstance.get<ApiResponse<ReadyMadeInventoriesPaginatedResponse>>(
    getApiUrl('getReadyMadeInventories'),
    {
      params: { page, limit }
    }
  );
  return response.data;
};

/**
 * Get Ready-Made Inventory By ID Service
 * GET /api/ready-made-inventories/:id
 * 
 * @param inventoryId - Ready-Made Inventory ID
 * @returns Promise with ready-made inventory data
 */
export const getReadyMadeInventoryByIdService = async (
  inventoryId: string
): Promise<ApiResponse<ReadyMadeInventoryItem>> => {
  const response = await apiInstance.get<ApiResponse<ReadyMadeInventoryItem>>(
    getApiUrl('getReadyMadeInventoryById', { id: inventoryId })
  );
  return response.data;
};

/**
 * Create Ready-Made Inventory Service
 * POST /api/ready-made-inventories
 * 
 * @param readyMadeData - Ready-made inventory data to be created
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @returns Promise with created ready-made inventory data
 */
export const createReadyMadeInventoryService = async (
  readyMadeData: CreateReadyMadeInventoryRequest,
  imageFiles?: File[] | null
): Promise<ApiResponse<ReadyMadeInventoryItem>> => {
  const formData = new FormData();
  formData.append('name', readyMadeData.name);
  formData.append('color', readyMadeData.color);
  formData.append('price', readyMadeData.price.toString());
  if (readyMadeData.imageUrl) {
    formData.append('imageUrl', readyMadeData.imageUrl);
  }
  if (readyMadeData.quantity !== undefined && readyMadeData.quantity !== null) {
    formData.append('quantity', readyMadeData.quantity.toString());
  }
  if (readyMadeData.sizeLabel !== undefined && readyMadeData.sizeLabel !== null) {
    formData.append('sizeLabel', readyMadeData.sizeLabel);
  }
  if (readyMadeData.sizeNumber !== undefined && readyMadeData.sizeNumber !== null) {
    formData.append('sizeNumber', readyMadeData.sizeNumber.toString());
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }

  const response = await apiInstance.post<ApiResponse<ReadyMadeInventoryItem>>(
    getApiUrl('createReadyMadeInventory'),
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
 * Update Ready-Made Inventory Service
 * PUT /api/ready-made-inventories/:id
 * 
 * @param inventoryId - Ready-Made Inventory ID
 * @param readyMadeData - Ready-made inventory data to update
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @param deletedImageUrls - Optional array of image URLs to delete
 * @returns Promise with updated ready-made inventory data
 */
export const updateReadyMadeInventoryService = async (
  inventoryId: string,
  readyMadeData: UpdateReadyMadeInventoryRequest,
  imageFiles?: File[] | null,
  deletedImageUrls?: string[] | null
): Promise<ApiResponse<ReadyMadeInventoryItem>> => {
  const formData = new FormData();
  if (readyMadeData.name !== undefined) {
    formData.append('name', readyMadeData.name);
  }
  if (readyMadeData.color !== undefined) {
    formData.append('color', readyMadeData.color);
  }
  if (readyMadeData.price !== undefined) {
    formData.append('price', readyMadeData.price.toString());
  }
  if (readyMadeData.imageUrl !== undefined) {
    formData.append('imageUrl', readyMadeData.imageUrl || '');
  }
  if (readyMadeData.quantity !== undefined) {
    formData.append('quantity', readyMadeData.quantity !== null ? readyMadeData.quantity.toString() : '');
  }
  if (readyMadeData.sizeLabel !== undefined) {
    formData.append('sizeLabel', readyMadeData.sizeLabel || '');
  }
  if (readyMadeData.sizeNumber !== undefined) {
    formData.append('sizeNumber', readyMadeData.sizeNumber !== null ? readyMadeData.sizeNumber.toString() : '');
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }
  if (deletedImageUrls && deletedImageUrls.length > 0) {
    formData.append('deletedImageUrls', JSON.stringify(deletedImageUrls));
  }

  const response = await apiInstance.put<ApiResponse<ReadyMadeInventoryItem>>(
    getApiUrl('updateReadyMadeInventory', { id: inventoryId }),
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
 * Delete Ready-Made Inventory Service
 * DELETE /api/ready-made-inventories/:id
 * 
 * @param inventoryId - Ready-Made Inventory ID
 * @returns Promise with success message
 */
export const deleteReadyMadeInventoryService = async (
  inventoryId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteReadyMadeInventory', { id: inventoryId })
  );
  return response.data;
};

