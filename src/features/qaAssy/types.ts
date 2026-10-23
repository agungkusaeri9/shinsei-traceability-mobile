import type { ApiResponse } from '../../types';

export interface QaRegisterData {
  barcode: string;
  lotNumber: string;
  partName: string;
  model: string;
  customer: string;
  qty: number;
  status: string;
}

export interface QaRegisterPayload {
  lotNumber: string;
  stks?: string[];
}

export interface QaAddPartPayload {
  lotNumber: string;
  stks: string[];
}

export interface QaFinishPayload {
  lotNumber: string;
  boxName: string;
}

export interface QaAssyResultData {
  lotId: number;
  lotNumber: string;
  userId: number;
  parts: any[];
  createdAt: string;
  updatedAt: string;
}

export type QaAssyResponse = ApiResponse<QaAssyResultData>;

export interface QaAcceptancePayload {
  stkNumber: string;
}

export interface QaAcceptanceData {
  id: number;
  partBatchId: number;
  areaId: number;
  areaName: string | null;
  action: string;
  createdAt: string;
  updatedAt: string;
}

export type QaAcceptanceResponse = ApiResponse<QaAcceptanceData>;
