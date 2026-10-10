import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type {
  BoxItem,
  BoxListResponse,
  DeliveryResponse,
  OrderPoItem,
  PoListResponse,
  SubmitDeliveryPayload,
} from '../types';

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
 * Submits delivery for a single box (payload: { boxName })
 */
export const submitDelivery = async (
  payload: SubmitDeliveryPayload,
): Promise<DeliveryResponse> => {
  const response = await httpClient.post<DeliveryResponse>(
    API_ENDPOINTS.ASSY_DELIVERED,
    payload,
  );
  return response.data;
};
