// ─── Delivery Feature Types ──────────────────────────────────────────────────

import type { ApiResponse } from '../../types';

export type DeliveryResponse = ApiResponse<DeliveryResponseData>;

export interface DeliveryResponseData {
  id: number,
  lotId: number,
  lotNumber: string,
  boxId: number,
  boxName: string,
  userId: number,
  createdAt: string,
  updatedAt: string,
  deliveredAt: string
}

export interface OrderPoItem {
  id: number;
  poNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoxItem {
  id: number;
  name: string;
  used?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PoListResponse extends ApiResponse<OrderPoItem[]> {
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export type BoxListResponse = ApiResponse<BoxItem[]>;

export interface SubmitDeliveryPayload {
  boxNames: string[];
}

export type DeliveryPoOption = {
  id: string;
  label: string;
};

export type LastDelivered = {
  poNumber: string;
  boxes: string[];
  timestamp: string;
};

export type OrderPoApiItem =
  | string
  | {
      id?: number;
      poNumber?: string;
      'po-Number'?: string;
      po_number?: string;
      name?: string;
      createdAt?: string;
      updatedAt?: string;
    };

export type BoxApiItem =
  | string
  | {
      id?: number;
      name?: string;
      boxName?: string;
      used?: boolean;
      createdAt?: string;
      updatedAt?: string;
    };

export type LegacyBoxesData = {
  box?: BoxApiItem[];
  boxes?: BoxApiItem[];
};
