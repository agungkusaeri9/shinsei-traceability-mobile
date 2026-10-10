import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type {
  OrderLotItem,
  OrderLotSearchResponse,
  SmtFinishPayload,
  SmtFinishResponse,
  SmtOrderResponse,
  SmtPayload,
  SmtResponse,
} from '../types';

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

export const searchOrderLots = async (
  query: string = '',
  page: number = 1,
  limit: number = 20,
): Promise<OrderLotItem[]> => {
  const response = await httpClient.get<OrderLotSearchResponse | OrderLotItem[]>(
    API_ENDPOINTS.ORDER_LOTS_SEARCH,
    {
      params: { q: query, page, limit },
    },
  );
  const payload = response.data;
  if (Array.isArray(payload)) {
    return payload;
  }
  return Array.isArray(payload?.data) ? payload.data : [];
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

export const finishSmt = async (
  data: SmtFinishPayload,
): Promise<SmtFinishResponse> => {
  const response = await httpClient.post<SmtFinishResponse>(
    API_ENDPOINTS.SMTS_FINISH,
    data,
  );
  return response.data;
};
