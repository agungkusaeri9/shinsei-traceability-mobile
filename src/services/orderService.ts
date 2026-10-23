import httpClient from './httpClient';
import { API_ENDPOINTS } from './api';
import type { ApiResponse } from '../types';
import type {
  FetchOrdersParams,
  Order,
  OrderSummary,
} from '../features/warehouse/types';

/**
 * Throw when the API reports a failure inside the response body
 * (e.g. { status: false, message: 'Order not found.' }) so callers can show
 * the server message from their catch block.
 */
const unwrapOrderResponse = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && payload.status === false) {
    throw new Error(payload.message || 'Order tidak ditemukan');
  }
  return payload as T;
};

/**
 * Fetch orders with optional filter parameters (returns summary list)
 * @example fetchOrders({ status: 'created' })
 * @example fetchOrders({ status: 'submitted' })
 */
export const fetchOrders = async (
  params?: FetchOrdersParams,
): Promise<OrderSummary[]> => {
  const response = await httpClient.get<ApiResponse<OrderSummary[]>>(
    API_ENDPOINTS.ORDERS,
    { params },
  );
  return unwrapOrderResponse<OrderSummary[]>(response.data.data);
};

/**
 * Fetch a single order by ID (returns full order detail with orderItems)
 * @example fetchOrderById(21)
 */
export const fetchOrderById = async (id: number): Promise<Order> => {
  const response = await httpClient.get<ApiResponse<Order>>(
    `${API_ENDPOINTS.ORDERS}/${id}`,
  );
  return unwrapOrderResponse<Order>(response.data.data);
};
