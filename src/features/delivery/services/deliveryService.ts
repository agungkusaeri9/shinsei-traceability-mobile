import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type { ApiResponse } from '../../../types';
import type {
  BoxItem,
  DeliveryResponse,
  OrderPoItem,
  SubmitDeliveryPayload,
  DeliveryResponseData,
  BoxApiItem,
  LegacyBoxesData,
  OrderPoApiItem,
} from '../types';

const normalizePoItem = (item: OrderPoApiItem, index: number): OrderPoItem => {
  if (typeof item === 'string') {
    return { id: index, poNumber: item };
  }

  return {
    id: item.id ?? index,
    poNumber:
      item.poNumber ??
      item['po-Number'] ??
      item.po_number ??
      item.name ??
      '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const normalizeBoxItem = (item: BoxApiItem, index: number): BoxItem => {
  if (typeof item === 'string') {
    return { id: index, name: item };
  }

  return {
    id: item.id ?? index,
    name: item.name ?? item.boxName ?? '',
    used: item.used,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

/**
 * GET /api/orderpos
 * Returns list of PO numbers / Order PO items
 */
export const getPoNumbers = async (): Promise<OrderPoItem[]> => {
  try {
    const response = await httpClient.get<ApiResponse<OrderPoApiItem[]>>(
      API_ENDPOINTS.ORDER_POS,
    );
    const rawData = response.data.data;

    if (Array.isArray(rawData)) {
      return rawData
        .map(normalizePoItem)
        .filter(item => Boolean(item.poNumber));
    }
  } catch (error) {
    // Fallback to legacy endpoint if /orderpos fails
    try {
      const response = await httpClient.get<ApiResponse<OrderPoApiItem[]>>(
        API_ENDPOINTS.PO_NUMBER,
      );
      const rawData = response.data.data;
      if (Array.isArray(rawData)) {
        return rawData
          .map(normalizePoItem)
          .filter(item => Boolean(item.poNumber));
      }
    } catch {
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
    const response = await httpClient.get<ApiResponse<BoxApiItem[]>>(
      API_ENDPOINTS.BOXES_BY_PO,
      { params: { poNumber } },
    );
    const rawData = response.data.data;

    if (Array.isArray(rawData)) {
      return rawData.map(normalizeBoxItem).filter(item => Boolean(item.name));
    }
  } catch (error) {
    // Fallback to legacy endpoint GET /po-Number/{poNumber}
    try {
      const response = await httpClient.get<ApiResponse<LegacyBoxesData>>(
        `${API_ENDPOINTS.PO_NUMBER}/${encodeURIComponent(poNumber)}`
      );
      const boxes = response.data.data.box || response.data.data.boxes || [];
      if (Array.isArray(boxes)) {
        return boxes.map(normalizeBoxItem).filter(item => Boolean(item.name));
      }
    } catch {
      throw error;
    }
  }

  return [];
};

/**
 * POST /api/assy/delivered
 * Submits delivery for the scanned boxes.
 */
export const submitDelivery = async (
  payload: SubmitDeliveryPayload,
): Promise<DeliveryResponse> => {
  const response = await httpClient.post<ApiResponse<DeliveryResponseData>>(
    API_ENDPOINTS.ASSY_DELIVERED,
    payload,
  );
  return response.data;
};
