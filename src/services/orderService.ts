import httpClient from './httpClient';
import { API_ENDPOINTS } from './api';
import type { Order, OrderSummary } from '../features/warehouse/types';

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
 * Fetch orders with optional filter parameters (returns summary list)
 * @example fetchOrders({ status: 'created' })
 * @example fetchOrders({ status: 'submitted' })
 */
export const fetchOrders = async (
  params?: FetchOrdersParams,
): Promise<OrderSummary[]> => {
  const response = await httpClient.get(API_ENDPOINTS.ORDERS, { params });
  return response.data.data ?? response.data;
};

/**
 * Fetch a single order by ID (returns full order detail with orderItems)
 * @example fetchOrderById(21)
 */
export const fetchOrderById = async (id: number): Promise<Order> => {
  const response = await httpClient.get(`${API_ENDPOINTS.ORDERS}/${id}`);
  return response.data.data ?? response.data;
};
