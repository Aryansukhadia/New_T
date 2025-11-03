import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';

// ============================================
// MEASUREMENT TYPES
// ============================================

export interface TopMeasurement {
  topMeasurementId: string;
  length: number;
  shoulder: number;
  sleeveLength: number;
  sleeveBottom: number;
  chest: number;
  waist: number;
  hip: number;
  neck: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BottomMeasurement {
  bottomMeasurementId: string;
  length: number;
  waist: number;
  hip: number;
  thigh: number;
  knee: number;
  calf: number;
  bottom: number;
  langot: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MeasurementResponse {
  topMeasurement?: TopMeasurement | null;
  bottomMeasurement?: BottomMeasurement | null;
}

export interface CustomerMeasurementResponse {
  customerId: string;
  fullName: string;
  topMeasurement: TopMeasurement | null;
  bottomMeasurement: BottomMeasurement | null;
}

export interface EditMeasurementRequest {
  topMeasurementId?: string;
  bottomMeasurementId?: string;
  top?: {
    length?: number;
    shoulder?: number;
    sleeveLength?: number;
    sleeveBottom?: number;
    chest?: number;
    waist?: number;
    hip?: number;
    neck?: number;
  };
  bottom?: {
    length?: number;
    waist?: number;
    hip?: number;
    thigh?: number;
    knee?: number;
    calf?: number;
    bottom?: number;
    langot?: number;
  };
}

export interface AddMeasurementRequest {
  customerId: string;
  top?: {
    length: number;
    shoulder: number;
    sleeveLength: number;
    sleeveBottom: number;
    chest: number;
    waist: number;
    hip: number;
    neck: number;
  };
  bottom?: {
    length: number;
    waist: number;
    hip: number;
    thigh: number;
    knee: number;
    calf: number;
    bottom: number;
    langot: number;
  };
}

// ============================================
// MEASUREMENT SERVICES
// ============================================

/**
 * Add Measurements Service
 * POST /api/measurements
 * 
 * @param measurementData - Measurement data including customerId and top/bottom measurements
 * @returns Promise with created measurements
 */
export const addMeasurementService = async (
  measurementData: AddMeasurementRequest
): Promise<ApiResponse<MeasurementResponse>> => {
  const response = await apiInstance.post<ApiResponse<MeasurementResponse>>(
    getApiUrl('addMeasurement'),
    measurementData
  );
  return response.data;
};

/**
 * Get Customer Measurements Service
 * GET /api/measurements/:customerId
 * 
 * @param customerId - Customer ID to get measurements for
 * @returns Promise with customer measurements
 */
export const getCustomerMeasurementsService = async (
  customerId: string
): Promise<ApiResponse<CustomerMeasurementResponse>> => {
  const response = await apiInstance.get<ApiResponse<CustomerMeasurementResponse>>(
    getApiUrl('getCustomerMeasurements', { customerId })
  );
  return response.data;
};

/**
 * Edit Measurement Service
 * PUT /api/measurements
 * 
 * @param measurementData - Measurement data with IDs and fields to update
 * @returns Promise with updated measurements
 */
export const editMeasurementService = async (
  measurementData: EditMeasurementRequest
): Promise<ApiResponse<MeasurementResponse>> => {
  const response = await apiInstance.put<ApiResponse<MeasurementResponse>>(
    getApiUrl('editMeasurement'),
    measurementData
  );
  return response.data;
};

