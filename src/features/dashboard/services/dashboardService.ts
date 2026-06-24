import httpClient from '../../../services/httpClient';
import { API_ENDPOINTS } from '../../../services/api';
import { ApiResponse } from '../../../types';

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'order' | 'shipment' | 'alert';
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await httpClient.get<ApiResponse<DashboardStats>>(
    API_ENDPOINTS.DASHBOARD_STATS,
  );
  return response.data.data;
};

export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  const response = await httpClient.get<ApiResponse<RecentActivity[]>>(
    API_ENDPOINTS.DASHBOARD,
  );
  return response.data.data;
};
