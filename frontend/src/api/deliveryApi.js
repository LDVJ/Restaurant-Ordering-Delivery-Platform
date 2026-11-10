/**
 * Delivery Partner API Service
 * Sourced from API_CONTRACT.md Delivery Partner Endpoints
 */

import axiosClient from './axiosClient';
import { mockDeliveryDb } from '../mocks/mockDeliveryDb';

const mockGroups = (import.meta.env.VITE_MOCK_GROUPS || '')
  .split(',')
  .map((g) => g.trim().toLowerCase());

export function isMocked(group) {
  return mockGroups.includes(group.toLowerCase());
}

const USE_MOCK_DELIVERY = isMocked('delivery');

/**
 * Get orders assigned to the delivery partner
 * @param {Object} params - { status, page, page_size }
 * Note: When status is omitted/empty, returns active orders (ASSIGNED, OUT_FOR_DELIVERY)
 */
export async function getDeliveryOrders(params = {}) {
  if (USE_MOCK_DELIVERY) {
    return mockDeliveryDb.listOrders(params);
  }
  const response = await axiosClient.get('/delivery/orders', { params });
  return response.data;
}

/**
 * Get detailed view of an assigned delivery order
 * @param {string} id - Order ID
 */
export async function getDeliveryOrderById(id) {
  if (USE_MOCK_DELIVERY) {
    return mockDeliveryDb.getOrder(id);
  }
  const response = await axiosClient.get(`/delivery/orders/${id}`);
  return response.data;
}

/**
 * Update delivery order status
 * Allowed moves:
 * - ASSIGNED -> OUT_FOR_DELIVERY
 * - OUT_FOR_DELIVERY -> DELIVERED
 * @param {string} id - Order ID
 * @param {string} status - Target status
 */
export async function updateDeliveryStatus(id, status) {
  if (USE_MOCK_DELIVERY) {
    return mockDeliveryDb.updateStatus(id, status);
  }
  const response = await axiosClient.post(`/delivery/orders/${id}/status`, { status });
  return response.data;
}
