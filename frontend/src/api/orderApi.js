/**
 * Order API Module
 * Sourced from API_CONTRACT.md Customer Orders section.
 * Automatically delegates to mock layer when 'orders' is listed in VITE_MOCK_GROUPS.
 */

import axiosClient from './axiosClient';
import { mockDb } from '../mocks/mockDb';

const mockGroups = (import.meta.env.VITE_MOCK_GROUPS || '')
  .split(',')
  .map((g) => g.trim().toLowerCase());

export function isMocked(group) {
  return mockGroups.includes(group.toLowerCase());
}

const USE_MOCK_ORDERS = isMocked('orders');

/**
 * Place a new customer order
 * In mock mode: accepts cartSnapshot (mock-only) to derive prices and names.
 * In real API mode: cartSnapshot is safely ignored per API_CONTRACT.
 */
export async function createOrder(payload, cartSnapshot) {
  if (USE_MOCK_ORDERS) {
    return mockDb.createOrder(payload, cartSnapshot);
  }
  const response = await axiosClient.post('/orders', payload);
  return response.data;
}

/**
 * List customer orders with optional filters and pagination
 * Params: { status, date_from, date_to, page, page_size }
 */
export async function getOrders(params = {}) {
  if (USE_MOCK_ORDERS) {
    return mockDb.listOrders(params);
  }
  const response = await axiosClient.get('/orders', { params });
  return response.data;
}

/**
 * Get detailed view of an order
 */
export async function getOrderById(id) {
  if (USE_MOCK_ORDERS) {
    return mockDb.getOrder(id);
  }
  const response = await axiosClient.get(`/orders/${id}`);
  return response.data;
}

/**
 * Cancel an order (only valid when status is PLACED)
 */
export async function cancelOrder(id) {
  if (USE_MOCK_ORDERS) {
    return mockDb.cancelOrder(id);
  }
  const response = await axiosClient.post(`/orders/${id}/cancel`);
  return response.data;
}

/**
 * Submit rating and optional comment for a delivered order
 */
export async function submitReview(orderId, payload) {
  if (USE_MOCK_ORDERS) {
    return mockDb.submitReview(orderId, payload);
  }
  const response = await axiosClient.post(`/orders/${orderId}/review`, payload);
  return response.data;
}

/**
 * Submit a return request with reason for a delivered order
 */
export async function requestReturn(orderId, payload) {
  if (USE_MOCK_ORDERS) {
    return mockDb.requestReturn(orderId, payload);
  }
  const response = await axiosClient.post(`/orders/${orderId}/return`, payload);
  return response.data;
}

/**
 * DEV ONLY: Advance order status to test timeline and polling
 * Only executes in mock mode.
 */
export async function devAdvanceOrderStatus(id) {
  if (USE_MOCK_ORDERS) {
    return mockDb.devAdvanceOrderStatus(id);
  }
  throw new Error('DEV status advance is only available in mock mode');
}
