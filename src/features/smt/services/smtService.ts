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

// ─── Fetch Orders with status=submitted ────────────────────────────────────

export const fetchSubmittedOrders = async (): Promise<OrderSummary[]> => {
  return fetchOrders({ status: 'SMT_REGISTER' });
};

// ─── Fetch Order by ID ────────────────────────────────────────────────────

export { fetchOrderById } from '../../../services/orderService';

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
