import axiosClient from './axiosClient';
import { mockOwnerDb } from '../mocks/mockOwnerDb';

const mockGroups = (import.meta.env.VITE_MOCK_GROUPS || '')
  .split(',')
  .map((g) => g.trim().toLowerCase());

export function isMocked(group) {
  return mockGroups.includes(group.toLowerCase());
}

const USE_MOCK_ORDERS = isMocked('ownerOrders');
const USE_MOCK_RETURNS = isMocked('ownerReturns');
const USE_MOCK_STATS = isMocked('ownerStats');
const USE_MOCK_REMINDERS = isMocked('ownerReminders');

/* --- 1. Real Restaurant & Menu APIs (Part A) --- */
export async function getRestaurant() {
  const res = await axiosClient.get('/owner/restaurant');
  return res.data;
}

export async function createRestaurant(data) {
  const res = await axiosClient.post('/owner/restaurant', data);
  return res.data;
}

export async function updateRestaurant(data) {
  const res = await axiosClient.put('/owner/restaurant', data);
  return res.data;
}

export async function updateRestaurantAddress(data) {
  const res = await axiosClient.put('/owner/restaurant/address', data);
  return res.data;
}

export async function getMenu(params = {}) {
  const res = await axiosClient.get('/owner/menu', { params });
  return res.data;
}

export async function createDish(data) {
  const res = await axiosClient.post('/owner/menu', data);
  return res.data;
}

export async function updateDish(id, data) {
  const res = await axiosClient.patch(`/owner/menu/${id}`, data);
  return res.data;
}

/* --- 2. Orders Management APIs (Part B) --- */
export async function getOwnerOrders(params = {}) {
  if (USE_MOCK_ORDERS) return mockOwnerDb.listOrders(params);
  const res = await axiosClient.get('/owner/orders', { params });
  return res.data;
}

export async function getOwnerOrderById(id) {
  if (USE_MOCK_ORDERS) return mockOwnerDb.getOrder(id);
  const res = await axiosClient.get(`/owner/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(id, status) {
  if (USE_MOCK_ORDERS) return mockOwnerDb.updateStatus(id, status);
  const res = await axiosClient.post(`/owner/orders/${id}/status`, { status });
  return res.data;
}

export async function getDeliveryPartners() {
  if (USE_MOCK_ORDERS) return mockOwnerDb.listDeliveryPartners();
  const res = await axiosClient.get('/owner/delivery-partners');
  return res.data.items;
}

export async function assignDeliveryPartner(id, deliveryPartnerId) {
  if (USE_MOCK_ORDERS) return mockOwnerDb.assignPartner(id, deliveryPartnerId);
  const res = await axiosClient.post(`/owner/orders/${id}/assign`, { delivery_partner_id: deliveryPartnerId });
  return res.data;
}

/* --- 3. Returns & Refunds APIs (Part B) --- */
export async function getOwnerReturns(params = {}) {
  if (USE_MOCK_RETURNS) return mockOwnerDb.listReturns(params);
  const res = await axiosClient.get('/owner/returns', { params });
  return res.data;
}

export async function updateReturnStatus(id, status) {
  if (USE_MOCK_RETURNS) return mockOwnerDb.updateReturnStatus(id, status);
  const res = await axiosClient.post(`/owner/returns/${id}/status`, { status });
  return res.data;
}

/* --- 4. Analytics & Stats APIs (Part B) --- */
export async function getOwnerStats() {
  if (USE_MOCK_STATS) return mockOwnerDb.getStats();
  const res = await axiosClient.get('/owner/stats');
  return res.data;
}

/* --- 5. Live Reminders APIs (Part B) --- */
export async function getOwnerReminders(params = {}) {
  if (USE_MOCK_REMINDERS) return mockOwnerDb.listReminders(params);
  const res = await axiosClient.get('/owner/reminders', { params });
  return res.data;
}

export async function markReminderRead(id) {
  if (USE_MOCK_REMINDERS) return mockOwnerDb.markReminderRead(id);
  const res = await axiosClient.post(`/owner/reminders/${id}/read`);
  return res.data;
}
