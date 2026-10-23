import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { ApiResponse, Area, UserDetail } from '../../../types';
import type {
  RecentAcceptanceItem,
  StkByAreaItem,
  StkTrackingItem,
  TrackingSummaryData,
  WarehouseSummaryData,
} from '../types';
import { OrderSummary, StkData } from '../../warehouse/types';

// ─── Service Functions ───────────────────────────────────────────────────────
export const getTrackingSummary = async (): Promise<TrackingSummaryData> => {
  const res = await httpClient.get<ApiResponse<TrackingSummaryData>>(
    API_ENDPOINTS.TRACKING_SUMMARY,
  );
  return res.data.data!;
};

export const getStkTrackingTable = async (): Promise<StkTrackingItem[]> => {
  const res = await httpClient.get<ApiResponse<StkTrackingItem[]>>(
    API_ENDPOINTS.STK_TRACKING_TABLE,
  );
  return res.data.data || [];
};

export const getWarehouseSummary = async (): Promise<WarehouseSummaryData> => {
  const res = await httpClient.get<ApiResponse<WarehouseSummaryData>>(
    API_ENDPOINTS.WAREHOUSE_SUMMARY,
  );
  return res.data.data!;
};

export const getRecentAcceptances = async (): Promise<
  RecentAcceptanceItem[]
> => {
  const res = await httpClient.get<ApiResponse<RecentAcceptanceItem[]>>(
    API_ENDPOINTS.RECENT_ACCEPTANCES,
  );
  return res.data.data || [];
};

export const getStkByArea = async (): Promise<StkByAreaItem[]> => {
  const res = await httpClient.get<ApiResponse<StkByAreaItem[]>>(
    API_ENDPOINTS.STK_BY_AREA,
  );
  return res.data.data || [];
};

// ─── Paginated Totals (for SuperAdmin Dashboard) ───────────────────────────

/**
 * Get total users count from /api/Users pagination
 */
export const getTotalUsers = async (): Promise<number> => {
  const res = await httpClient.get<ApiResponse<UserDetail[]>>(
    API_ENDPOINTS.USERS,
  );
  return res.data.pagination?.total || 0;
};

/**
 * Get total areas count from /api/Areas pagination
 */
export const getTotalAreas = async (): Promise<number> => {
  const res = await httpClient.get<ApiResponse<Area[]>>(API_ENDPOINTS.AREAS);
  return res.data.pagination?.total || 0;
};

/**
 * Get total orders count from /api/Orders pagination
 */
export const getTotalOrders = async (): Promise<number> => {
  const res = await httpClient.get<ApiResponse<OrderSummary[]>>(
    API_ENDPOINTS.ORDERS,
  );
  return res.data.pagination?.total || 0;
};

/**
 * Get total STK count from /api/stks pagination
 */
export const getTotalStks = async (): Promise<number> => {
  const res = await httpClient.get<ApiResponse<StkData[]>>(API_ENDPOINTS.STKS);
  return res.data.pagination?.total || 0;
};
