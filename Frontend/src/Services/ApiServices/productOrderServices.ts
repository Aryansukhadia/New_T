import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl, getApiUrlWithParams } from '../../Utils/api';

// ============================================
// PRODUCT ORDER TYPES
// ============================================

export interface ProductOrder {
    id: string;
    customerId: string;
    orderDate: string;
    deliveryDate: string | null;
    status: string;
    customerName: string | null;
    totalAmount: number | null;
}

export interface ProductOrderDetails {
    id: string;
    customerId: string;
    orderDate: string;
    deliveryDate: string | null;
    status: string;
    customerName: string | null;
    notes: string | null;
    totalAmount: number | null;
    workPieces: WorkPiece[];
}

export interface WorkPiece {
    id: string;
    productItem: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
    currentStatus: string;
    assignedTo: {
        userId: string;
        fullName: string;
        emailId: string;
    } | null;
    remarks: string | null;
    createdAt: string;
}

export interface BookOrderRequest {
    customerId: string;
    deliveryDate?: string | null;
    notes?: string | null;
    items: OrderItem[];
}

export interface OrderItem {
    productId: string;
    productVariantId: string;
    quantity: number;
}

export interface PaginatedOrdersResponse {
    orders: ProductOrder[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface WorkpieceMeasurements {
    workpiece: {
        id: string;
        currentStatus: string;
        remarks: string | null;
        createdAt: string;
        productItem: {
            id: string;
            name: string;
            imageUrl: string | null;
        };
    };
    customer: {
        customerId: string;
        fullName: string;
        emailId: string;
        mobileNo: string;
    };
    measurements: {
        top: {
            topMeasurementId: string;
            length: number | null;
            shoulder: number | null;
            sleeveLength: number | null;
            sleeveBottom: number | null;
            chest: number | null;
            waist: number | null;
            hip: number | null;
            neck: number | null;
            createdAt: string;
            updatedAt: string;
        } | null;
        bottom: {
            bottomMeasurementId: string;
            length: number | null;
            waist: number | null;
            hip: number | null;
            thigh: number | null;
            knee: number | null;
            calf: number | null;
            bottom: number | null;
            langot: number | null;
            createdAt: string;
            updatedAt: string;
        } | null;
    };
}

// ============================================
// PRODUCT ORDER SERVICES
// ============================================

/**
 * Get Booked Orders Service
 * GET /api/productOrders?page=1&limit=10
 * 
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Promise with paginated orders
 */
export const getBookedOrdersService = async (
    page: number = 1,
    limit: number = 10
): Promise<ApiResponse<PaginatedOrdersResponse>> => {
    const { url } = getApiUrlWithParams('getBookedOrders', {}, { page: page.toString(), limit: limit.toString() });
    const response = await apiInstance.get<ApiResponse<PaginatedOrdersResponse>>(url);
    return response.data;
};

/**
 * Get Order Details Service
 * GET /api/productOrders/:id
 * 
 * @param orderId - Order ID
 * @returns Promise with order details
 */
export const getOrderDetailsService = async (
    orderId: string
): Promise<ApiResponse<ProductOrderDetails>> => {
    const response = await apiInstance.get<ApiResponse<ProductOrderDetails>>(
        getApiUrl('getOrderDetails', { id: orderId })
    );
    return response.data;
};

/**
 * Book Order Service
 * POST /api/productOrders/book
 * 
 * @param orderData - Order data to be created
 * @returns Promise with created order data
 */
export const bookOrderService = async (
    orderData: BookOrderRequest
): Promise<ApiResponse<ProductOrderDetails>> => {
    const response = await apiInstance.post<ApiResponse<ProductOrderDetails>>(
        getApiUrl('bookOrder'),
        orderData
    );
    return response.data;
};

/**
 * Get Workpiece Measurements Service
 * GET /api/productOrders/workpiece/:workpieceId/measurements
 * 
 * @param workpieceId - Workpiece ID
 * @returns Promise with workpiece measurements
 */
export const getWorkpieceMeasurementsService = async (
    workpieceId: string
): Promise<ApiResponse<WorkpieceMeasurements>> => {
    const response = await apiInstance.get<ApiResponse<WorkpieceMeasurements>>(
        getApiUrl('getWorkpieceMeasurements', { workpieceId })
    );
    return response.data;
};

