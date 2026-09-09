import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { extractStkNumber } from '../../../utils/barcode';
import {
  Supplier,
  Maker,
  PartAcceptancePayload,
  PartAcceptanceResponse,
  StockInPayload,
  StockInResponse,
  Order,
  MaterialFeedingPayload,
  MaterialFeedingResponse,
  StkResponse,
  CheckStkLocationPayload,
  CheckStkLocationResponse,
} from '../types';

// ─── Location Check ────────────────────────────────────────────────────────

export const checkStkLocation = async (
  payload: CheckStkLocationPayload,
): Promise<CheckStkLocationResponse> => {
  const response = await httpClient.post<CheckStkLocationResponse>(
    API_ENDPOINTS.CHECK_STK_LOCATION,
    payload,
  );
  return response.data;
};

// ─── Suppliers ─────────────────────────────────────────────────────────────

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await httpClient.get(API_ENDPOINTS.SUPPLIERS);
  return response.data.data ?? response.data;
};

export const createSupplier = async (
  data: Omit<Supplier, 'id'>,
): Promise<Supplier> => {
  const response = await httpClient.post<Supplier>(
    API_ENDPOINTS.SUPPLIERS,
    data,
  );
  return response.data;
};

// ─── Makers ────────────────────────────────────────────────────────────────

export const fetchMakers = async (): Promise<Maker[]> => {
  const response = await httpClient.get(API_ENDPOINTS.MAKERS);
  return response.data.data ?? response.data;
};

export const createMaker = async (data: Omit<Maker, 'id'>): Promise<Maker> => {
  const response = await httpClient.post<Maker>(API_ENDPOINTS.MAKERS, data);
  return response.data;
};

// ─── Part Acceptance ───────────────────────────────────────────────────────

export const registerPartAcceptance = async (
  data: PartAcceptancePayload,
): Promise<PartAcceptanceResponse> => {
  const response = await httpClient.post<PartAcceptanceResponse>(
    API_ENDPOINTS.PART_ACCEPTANCES,
    data,
  );
  return response.data;
};

// ─── Stock In ─────────────────────────────────────────────────────────────

export const stockIn = async (
  data: StockInPayload,
): Promise<StockInResponse> => {
  const formData = new FormData();
  formData.append('StkNumber', data.stkNumber);
  if (data.rack) {
    formData.append('Rack', data.rack);
  }
  if (data.shelf) {
    formData.append('Shelf', data.shelf);
  }
  if (data.bin) {
    formData.append('Bin', data.bin);
  }
  if (data.evidencePhoto) {
    formData.append('EvidencePhoto', {
      uri: data.evidencePhoto.uri,
      type: data.evidencePhoto.type,
      name: data.evidencePhoto.name,
    } as any);
  }

  const response = await httpClient.post<StockInResponse>(
    API_ENDPOINTS.WH_STOCK_INS,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

// ─── STK Data ─────────────────────────────────────────────────────────────

export const fetchStkData = async (stkNumber: string): Promise<StkResponse> => {
  const cleanStk = extractStkNumber(stkNumber);
  const response = await httpClient.get<StkResponse>(
    `${API_ENDPOINTS.STKS}/${cleanStk}`,
  );
  return response.data;
};

// ─── Orders ──────────────────────────────────────────────────────────────

export { fetchOrders } from '../../../services/orderService';

// ─── Material Feedings (Stock Out) ──────────────────────────────────────

export const submitMaterialFeeding = async (
  data: MaterialFeedingPayload,
): Promise<MaterialFeedingResponse> => {
  const response = await httpClient.post<MaterialFeedingResponse>(
    API_ENDPOINTS.MATERIAL_FEEDINGS,
    data,
  );
  return response.data;
};

// ─── Utility ───────────────────────────────────────────────────────────────

/**
 * Calculate expired date = 2 weeks from now, returned as ISO 8601 string
 */
export const getExpiredDateTwoWeeks = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString();
};
