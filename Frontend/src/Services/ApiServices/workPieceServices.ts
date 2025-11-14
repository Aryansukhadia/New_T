import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';

export const convertWorkPiecePendingToCuttingService = async (
  workpieceId: string
): Promise<ApiResponse<unknown>> => {
  const url = getApiUrl('convertWorkPiecePendingToCutting', { workpieceId });
  const response = await apiInstance.patch<ApiResponse<unknown>>(url);
  return response.data;
};

export interface WorkPieceSummary {
  workPieceStage: {
    id: string;
    stage: string;
    startedAt: string | null;
    completedAt: string | null;
    remarks: string | null;
  } | null;
  orderDate: string | null;
  productItem: {
    id: string;
    name: string;
    imageUrl: string | null;
    createdAt: string;
  };
  lastUpdated: string | null;
}

export const getWorkPieceByIdService = async (
  workpieceId: string
): Promise<ApiResponse<WorkPieceSummary>> => {
  const url = getApiUrl('getWorkPieceById', { workpieceId });
  const response = await apiInstance.get<ApiResponse<WorkPieceSummary>>(url);
  return response.data;
};


