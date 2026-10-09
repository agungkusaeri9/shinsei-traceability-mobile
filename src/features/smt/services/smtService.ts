import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { fetchOrders } from '../../../services/orderService';
import type {
  SmtFinishPayload,
  SmtOrderResponse,
  SmtPayload,
  SmtResponse,
} from '../types';
import type { Order, OrderSummary } from '../../warehouse/types';

// ─── Fetch Order by Lot Number ──────────────────────────────────────────────

export const fetchOrderByLotNumber = async (
  lotNumber: string,
): Promise<SmtOrderResponse> => {
  const response = await httpClient.get<SmtOrderResponse>(
    `${API_ENDPOINTS.ORDER_LOT}/${lotNumber}`,
  );
  return response.data;
};

// ─── Search Order Lots ──────────────────────────────────────────────────────

export interface OrderLotItem {
  id?: number;
  lotNumber: string;
  customerName?: string;
  productName?: string;
  [key: string]: any;
}

export const searchOrderLots = async (
  query: string = '',
  page: number = 1,
  limit: number = 20,
): Promise<OrderLotItem[]> => {
  const response = await httpClient.get<any>('/OrderLots/search', {
    params: { q: query, page, limit },
  });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }
  if (response.data && response.data.items && Array.isArray(response.data.items)) {
    return response.data.items;
  }
  return [];
};

// ─── Submit SMT ─────────────────────────────────────────────────────────────

export const submitSmt = async (data: SmtPayload): Promise<SmtResponse> => {
  const response = await httpClient.post<SmtResponse>(
    API_ENDPOINTS.SMTS,
    data,
  );
  return response.data;
};

// ─── Finish SMT ────────────────────────────────────────────────────────────

export const finishSmt = async (data: SmtFinishPayload): Promise<any> => {
  const response = await httpClient.post(API_ENDPOINTS.SMTS_FINISH, data);
  return response.data;
};
