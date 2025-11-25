import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';
import type { PaginationMeta } from './commonTypes';

// ============================================
// FABRIC INVENTORY TYPES
// ============================================

export interface FabricInventory {
  id: string;
  inventoryId: string;
  color: string;
  imageUrl: string;
  price: number | null;
  length: number;
}

export interface FabricInventoryItem {
  id: string;
  type: 'fabric';
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  fabric: FabricInventory | null;
}

export interface CreateFabricInventoryRequest {
  name: string;
  color: string;
  imageUrl?: string | null;
  price?: number | null;
  length: number;
}

export interface UpdateFabricInventoryRequest {
  name?: string;
  color?: string;
  imageUrl?: string | null;
  price?: number | null;
  length?: number;
}

export interface FabricInventoriesPaginatedResponse {
  inventories: FabricInventoryItem[];
  pagination: PaginationMeta;
}

// ============================================
// FABRIC INVENTORY SERVICES
// ============================================

/**
 * Get All Fabric Inventories Service with Pagination
 * GET /api/fabric-inventories?page=1&limit=10
 * 
 * @param page - Page number (default: 1)
 * @param limit - Number of items per page (default: 10)
 * @returns Promise with paginated fabric inventories data
 */
export const getFabricInventoriesService = async (
  page: number = 1,
  limit: number = 10
): Promise<ApiResponse<FabricInventoriesPaginatedResponse>> => {
  const response = await apiInstance.get<ApiResponse<FabricInventoriesPaginatedResponse>>(
    getApiUrl('getFabricInventories'),
    {
      params: { page, limit }
    }
  );
  return response.data;
};

/**
 * Get Fabric Inventory By ID Service
 * GET /api/fabric-inventories/:id
 * 
 * @param inventoryId - Fabric Inventory ID
 * @returns Promise with fabric inventory data
 */
export const getFabricInventoryByIdService = async (
  inventoryId: string
): Promise<ApiResponse<FabricInventoryItem>> => {
  const response = await apiInstance.get<ApiResponse<FabricInventoryItem>>(
    getApiUrl('getFabricInventoryById', { id: inventoryId })
  );
  return response.data;
};

/**
 * Create Fabric Inventory Service
 * POST /api/fabric-inventories
 * 
 * @param fabricData - Fabric inventory data to be created
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @returns Promise with created fabric inventory data
 */
export const createFabricInventoryService = async (
  fabricData: CreateFabricInventoryRequest,
  imageFiles?: File[] | null
): Promise<ApiResponse<FabricInventoryItem>> => {
  const formData = new FormData();
  formData.append('name', fabricData.name);
  formData.append('color', fabricData.color);
  if (fabricData.imageUrl) {
    formData.append('imageUrl', fabricData.imageUrl);
  }
  if (fabricData.price !== undefined && fabricData.price !== null) {
    formData.append('price', fabricData.price.toString());
  }
  if (fabricData.length !== undefined && fabricData.length !== null) {
    formData.append('length', fabricData.length.toString());
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }

  const response = await apiInstance.post<ApiResponse<FabricInventoryItem>>(
    getApiUrl('createFabricInventory'),
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
 * Update Fabric Inventory Service
 * PUT /api/fabric-inventories/:id
 * 
 * @param inventoryId - Fabric Inventory ID
 * @param fabricData - Fabric inventory data to update
 * @param imageFiles - Optional array of image files to upload (max 5)
 * @param deletedImageUrls - Optional array of image URLs to delete
 * @returns Promise with updated fabric inventory data
 */
export const updateFabricInventoryService = async (
  inventoryId: string,
  fabricData: UpdateFabricInventoryRequest,
  imageFiles?: File[] | null,
  deletedImageUrls?: string[] | null
): Promise<ApiResponse<FabricInventoryItem>> => {
  const formData = new FormData();
  if (fabricData.name !== undefined) {
    formData.append('name', fabricData.name);
  }
  if (fabricData.color !== undefined) {
    formData.append('color', fabricData.color);
  }
  if (fabricData.imageUrl !== undefined) {
    formData.append('imageUrl', fabricData.imageUrl || '');
  }
  if (fabricData.price !== undefined) {
    formData.append('price', fabricData.price !== null ? fabricData.price.toString() : '');
  }
  if (fabricData.length !== undefined) {
    formData.append('length', fabricData.length !== null ? fabricData.length.toString() : '');
  }

  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach(file => {
      formData.append('images', file);
    });
  }
  if (deletedImageUrls && deletedImageUrls.length > 0) {
    formData.append('deletedImageUrls', JSON.stringify(deletedImageUrls));
  }

  const response = await apiInstance.put<ApiResponse<FabricInventoryItem>>(
    getApiUrl('updateFabricInventory', { id: inventoryId }),
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
 * Delete Fabric Inventory Service
 * DELETE /api/fabric-inventories/:id
 * 
 * @param inventoryId - Fabric Inventory ID
 * @returns Promise with success message
 */
export const deleteFabricInventoryService = async (
  inventoryId: string
): Promise<ApiResponse<null>> => {
  const response = await apiInstance.delete<ApiResponse<null>>(
    getApiUrl('deleteFabricInventory', { id: inventoryId })
  );
  return response.data;
};

