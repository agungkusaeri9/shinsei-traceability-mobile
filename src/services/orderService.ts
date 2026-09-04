import httpClient from './httpClient';
import { API_ENDPOINTS } from './api';
import type { Order } from '../features/warehouse/types';

export type OrderStatus =
  | 'created'
  | 'submitted'
  | 'processing'
  | 'finished'
  | 'completed'
  | string;

export interface FetchOrdersParams {
  status?: OrderStatus;
  [key: string]: any;
}

/**
 * Fetch orders with optional filter parameters
 * @example fetchOrders({ status: 'created' })
 * @example fetchOrders({ status: 'submitted' })
 */
export const fetchOrders = async (
  params?: FetchOrdersParams,
): Promise<Order[]> => {
  const response = await httpClient.get(API_ENDPOINTS.ORDERS, { params });
  return response.data.data ?? response.data;
};
