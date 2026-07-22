import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import type { SmtOrderResponse, SmtPayload, SmtResponse } from '../types';

// ─── Fetch Order by Lot Number ──────────────────────────────────────────────

export const fetchOrderByLotNumber = async (
  lotNumber: string,
): Promise<SmtOrderResponse> => {
  const response = await httpClient.get<SmtOrderResponse>(
    `${API_ENDPOINTS.ORDER_LOT}/${lotNumber}`,
  );
  return response.data;
};

// ─── Submit SMT ─────────────────────────────────────────────────────────────

export const submitSmt = async (data: SmtPayload): Promise<SmtResponse> => {
  const response = await httpClient.post<SmtResponse>(API_ENDPOINTS.SMTS, data);
  return response.data;
};
