import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { extractStkNumber } from '../../../utils/barcode';
import type { ApiResponse } from '../../../types';
import type {
  OrderLotItem,
  OrderLotProduct,
  OrderLotsByLotResponse,
  SmtAcceptanceResponse,
  SmtFinishPayload,
  SmtFinishResponse,
  SmtOrderResponse,
  SmtPayload,
  SmtResponse,
  SmtOrderData,
  SmtFinishDataItem,
  SmtAcceptanceData,
} from '../types';

// ─── Fetch Products for Order Lot Number ────────────────────────────────────

export const fetchOrderLotsByLotNumber = async (
  lotNumber: string,
): Promise<OrderLotsByLotResponse> => {
  const response = await httpClient.get<ApiResponse<OrderLotProduct[]>>(
    `${API_ENDPOINTS.ORDER_LOTS}/${lotNumber}`,
  );
  return response.data;
};

// ─── Fetch Order Details by Lot Number & Product ID ─────────────────────────

export const fetchOrderByLotAndProduct = async (
  lotNumber: string,
  productId: number | string,
): Promise<SmtOrderResponse> => {
  const response = await httpClient.get<ApiResponse<SmtOrderData>>(
    API_ENDPOINTS.ORDER_LOT,
    {
      params: { lotNumber, productId },
    },
  );
  return response.data;
};

// ─── Search Order Lots ──────────────────────────────────────────────────────

export const searchOrderLots = async (
  query: string = '',
  page: number = 1,
  limit: number = 20,
): Promise<OrderLotItem[]> => {
  const response = await httpClient.get<ApiResponse<OrderLotItem[]>>(
    API_ENDPOINTS.ORDER_LOTS_SEARCH,
    {
      params: { q: query, page, limit },
    },
  );
  return response.data.data;
};

// ─── Submit SMT ─────────────────────────────────────────────────────────────

export const submitSmt = async (data: SmtPayload): Promise<SmtResponse> => {
  const response = await httpClient.post<ApiResponse<SmtResponse>>(
    API_ENDPOINTS.SMTS,
    data,
  );
  return response.data.data;
};

// ─── Finish SMT ────────────────────────────────────────────────────────────

export const finishSmt = async (
  data: SmtFinishPayload,
): Promise<SmtFinishResponse> => {
  const response = await httpClient.post<ApiResponse<SmtFinishDataItem[]>>(
    API_ENDPOINTS.SMTS_FINISH,
    data,
  );
  return response.data;
};

// ─── Acceptance SMT ────────────────────────────────────────────────────────

export const submitSmtAcceptance = async (
  stkNumber: string,
): Promise<SmtAcceptanceResponse> => {
  const response = await httpClient.post<ApiResponse<SmtAcceptanceData>>(
    API_ENDPOINTS.SMTS_ACCEPTANCE,
    {
      stkNumber: extractStkNumber(stkNumber),
    },
  );
  if (response.data && response.data.status === false) {
    throw new Error(response.data.message || 'Gagal melakukan SMT Acceptance');
  }
  return response.data;
};
