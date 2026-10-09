import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';

export interface DeliveryResponse {
  status: boolean;
  message: string;
  data?: any;
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

export interface PoListResponse {
  status: boolean;
  message: string;
  data?: OrderPoItem[] | any;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export interface BoxListResponse {
  status: boolean;
  message: string;
  data?: BoxItem[];
}

export interface SubmitDeliveryPayload {
  poNumber?: string;
  boxes?: string[];
  boxName?: string;
}

/**
 * GET /api/orderpos
 * Returns list of PO numbers / Order PO items
 */
export const getPoNumbers = async (): Promise<OrderPoItem[]> => {
  try {
    const response = await httpClient.get<PoListResponse>(API_ENDPOINTS.ORDER_POS);
    const rawData = response.data?.data ?? response.data;

    if (Array.isArray(rawData)) {
      return rawData.map((item: any) => {
        if (typeof item === 'string') {
          return { id: 0, poNumber: item };
        }
        return {
          id: item.id ?? 0,
          poNumber: item.poNumber || item['po-Number'] || item.po_number || item.name || String(item),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }).filter((item) => Boolean(item.poNumber));
    }
  } catch (error) {
    // Fallback to legacy endpoint if /orderpos fails
    try {
      const response = await httpClient.get<any>(API_ENDPOINTS.PO_NUMBER);
      const rawData = response.data?.data ?? response.data;
      if (Array.isArray(rawData)) {
        return rawData.map((item: any, idx: number) => ({
          id: typeof item === 'object' ? item.id ?? idx : idx,
          poNumber: typeof item === 'string' ? item : item.poNumber || item['po-Number'] || String(item),
        }));
      }
    } catch (fallbackError) {
      throw error;
    }
  }

  return [];
};

/**
 * GET /api/boxes/by-po?poNumber={poNumber}
 * Returns list of boxes for a given PO number
 */
export const getBoxesByPo = async (poNumber: string): Promise<BoxItem[]> => {
  try {
    const response = await httpClient.get<BoxListResponse>(API_ENDPOINTS.BOXES_BY_PO, {
      params: { poNumber },
    });
    const rawData = response.data?.data ?? response.data;

    if (Array.isArray(rawData)) {
      return rawData.map((item: any) => {
        if (typeof item === 'string') {
          return { id: 0, name: item };
        }
        return {
          id: item.id ?? 0,
          name: item.name || item.boxName || String(item),
          used: item.used,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });
    }
  } catch (error) {
    // Fallback to legacy endpoint GET /po-Number/{poNumber}
    try {
      const response = await httpClient.get<any>(
        `${API_ENDPOINTS.PO_NUMBER}/${encodeURIComponent(poNumber)}`
      );
      const boxes = response.data?.data?.box || response.data?.data?.boxes || response.data?.box || [];
      if (Array.isArray(boxes)) {
        return boxes.map((b: any, idx: number) => ({
          id: idx,
          name: typeof b === 'string' ? b : b.name || String(b),
        }));
      }
    } catch (fallbackError) {
      throw error;
    }
  }

  return [];
};

/**
 * POST /api/assy/delivered
 * Submits delivery for box / boxes under a PO
 */
export const submitDelivery = async (
  payloadOrBoxName: string | SubmitDeliveryPayload,
): Promise<DeliveryResponse> => {
  let body: any;
  if (typeof payloadOrBoxName === 'string') {
    body = { boxName: payloadOrBoxName };
  } else {
    body = payloadOrBoxName;
  }

  const response = await httpClient.post<DeliveryResponse>(
    API_ENDPOINTS.ASSY_DELIVERED,
    body,
  );
  return response.data;
};
