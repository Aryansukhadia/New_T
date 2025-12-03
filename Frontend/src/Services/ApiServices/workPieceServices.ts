import apiInstance from '../../Utils/ApiUtils';
import type { ApiResponse } from '../../Utils/ApiUtils';
import { getApiUrl } from '../../Utils/api';
import type { PaginationMeta } from './commonTypes';

// WorkPiece list item interface
export interface WorkPieceListItem {
  id: string;
  currentStatus: string;
  remarks: string | null;
  createdAt: string;
  productItem: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  assignedTo: {
    userId: string;
    fullName: string;
  } | null;
}

// Response interface for paginated workpieces
export interface WorkPiecesResponse {
  workPieces: WorkPieceListItem[];
  pagination: PaginationMeta;
}

// Get all workpieces with pagination
export const getAllWorkPiecesService = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ApiResponse<WorkPiecesResponse>> => {
  const url = getApiUrl('getWorkPieces');
  const params: Record<string, string | number> = { page, limit };
  if (status) {
    params.status = status;
  }
  const response = await apiInstance.get<ApiResponse<WorkPiecesResponse>>(url, { params });
  return response.data;
};

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

// WorkPiece Status History interfaces
export interface WorkStageHistory {
  id: string;
  stage: string;
  startedAt: string | null;
  completedAt: string | null;
  remarks: string | null;
  updatedBy: {
    userId: string;
    fullName: string;
    emailId: string;
  } | null;
  duration: number | null; // Duration in hours
  isCompleted: boolean;
  isActive: boolean;
}

export interface WorkPieceStatusHistory {
  workPiece: {
    id: string;
    currentStatus: string;
    productItem: {
      id: string;
      name: string;
    };
  };
  statusHistory: WorkStageHistory[];
  totalStages: number;
  completedStages: number;
  activeStages: number;
}

// Get work piece status history
export const getWorkPieceStatusHistoryService = async (
  workpieceId: string
): Promise<ApiResponse<WorkPieceStatusHistory>> => {
  const url = getApiUrl('getWorkPieceStatusHistory', { workpieceId });
  const response = await apiInstance.get<ApiResponse<WorkPieceStatusHistory>>(url);
  return response.data;
};
