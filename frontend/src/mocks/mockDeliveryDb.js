/**
 * Mock Database for Delivery Partner Portal
 * Sourced from API_CONTRACT.md Delivery Partner Endpoints
 */

import { INITIAL_DELIVERY_ORDERS } from './mockDeliveryData';

const STORAGE_KEY = 'campusbite_mock_delivery_orders';
const sleep = (ms = 400) => new Promise((r) => setTimeout(r, ms));

function loadOrders() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  const initial = JSON.parse(JSON.stringify(INITIAL_DELIVERY_ORDERS));
  saveOrders(initial);
  return initial;
}

function saveOrders(orders) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

function createError(status, detail) {
  const err = new Error(detail);
  err.response = { status, data: { detail } };
  return err;
}

function toDeliveryOrderSummary(o) {
  return {
    id: o.id,
    status: o.status,
    payment_status: o.payment_status,
    bill_amount: o.bill_amount,
    created_at: o.created_at,
    status_updated_at: o.status_updated_at,
    customer_name: o.customer_name || o.customer?.name || 'Customer',
    delivery_address: o.delivery_address,
    contact_phone: o.contact_phone,
    restaurant: {
      id: o.restaurant.id,
      name: o.restaurant.name,
      address: o.restaurant.address,
      phone: o.restaurant.phone,
    },
    items: o.items.map((i) => ({
      item_name: i.item_name,
      quantity: i.quantity,
    })),
    return_status: o.return_status || null,
    has_review: Boolean(o.has_review),
  };
}

export const mockDeliveryDb = {
  async listOrders({ status, page = 1, page_size = 10 } = {}) {
    await sleep();
    const orders = loadOrders();

    let filtered = [...orders];
    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    } else {
      // No status = active deliveries (ASSIGNED and OUT_FOR_DELIVERY)
      filtered = filtered.filter(
        (o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY'
      );
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const safePage = Math.max(1, Number(page) || 1);
    const safeSize = Math.max(1, Number(page_size) || 10);
    const start = (safePage - 1) * safeSize;

    return {
      items: filtered.slice(start, start + safeSize).map(toDeliveryOrderSummary),
      total: filtered.length,
      page: safePage,
      page_size: safeSize,
      total_pages: Math.ceil(filtered.length / safeSize) || 1,
    };
  },

  async getOrder(id) {
    await sleep();
    const orders = loadOrders();
    const found = orders.find((o) => o.id === id);
    if (!found) {
      throw createError(404, 'Order not found');
    }
    return JSON.parse(JSON.stringify(found));
  },

  async updateStatus(id, newStatus) {
    await sleep();
    const orders = loadOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw createError(404, 'Order not found');
    }

    const validMoves = {
      ASSIGNED: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'DELIVERED',
    };

    if (validMoves[order.status] !== newStatus) {
      throw createError(
        400,
        `Cannot move order from ${order.status} to ${newStatus}`
      );
    }

    const nowIso = new Date().toISOString();
    order.status = newStatus;
    order.status_updated_at = nowIso;
    if (newStatus === 'DELIVERED') {
      order.delivered_at = nowIso;
    }

    saveOrders(orders);
    return JSON.parse(JSON.stringify(order));
  },
};
