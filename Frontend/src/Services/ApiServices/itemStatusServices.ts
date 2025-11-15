import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrlWithParams } from '../../Utils/api';

// ============================================
// ITEM STATUS TYPES
// ============================================

export interface ItemStatus {
    id: string;
    orderItemId: string;
    productItemId: string;
    status: string;
    updatedById: string | null;
    updatedAt: string;
    remarks: string | null;
    orderItem?: any;
    productItem?: any;
    updatedBy?: any;
}

// ============================================
// ITEM STATUS SERVICES
// ============================================

/**
 * Convert Pending to Cutting Service
 * PATCH /api/itemStatuses/convert-pending-to-cutting?orderItemId=xxx&productItemId=xxx
 * 
 * @param orderItemId - Optional order item ID to filter
 * @param productItemId - Optional product item ID to filter
 * @returns Promise with updated item statuses
 */
export const convertPendingToCuttingService = async (
    orderItemId?: string,
    productItemId?: string
): Promise<ApiResponse<ItemStatus[]>> => {
    const queryParams: Record<string, string> = {};
    if (orderItemId) {
        queryParams.orderItemId = orderItemId;
    }
    if (productItemId) {
        queryParams.productItemId = productItemId;
    }

    const { url } = getApiUrlWithParams('convertPendingToCutting', {}, queryParams);
    const response = await apiInstance.patch<ApiResponse<ItemStatus[]>>(url);
    return response.data;
};

