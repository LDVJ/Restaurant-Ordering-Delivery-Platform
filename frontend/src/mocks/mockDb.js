/**
 * Mock Database for Orders
 * MOCK-ONLY CODE: Simulates backend persistence in sessionStorage, pagination,
 * filtering, lifecycle transitions, and Axios-like HTTP errors.
 */

import { INITIAL_MOCK_ORDERS } from './mockOrders';

const STORAGE_KEY = 'campusbite_mock_orders';
const SIMULATED_DELAY_MS = 400;

function sleep(ms = SIMULATED_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadOrders() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors and fallback
  }

  // Deep clone initial seed data
  const initial = JSON.parse(JSON.stringify(INITIAL_MOCK_ORDERS));
  saveOrders(initial);
  return initial;
}

function saveOrders(orders) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // SessionStorage may be full or disabled
  }
}

function createAxiosError(status, detail) {
  const error = new Error(detail);
  error.response = {
    status,
    data: { detail },
  };
  return error;
}

// Convert Order Detail to Order Summary for list endpoints (contract Section 10/11)
function toOrderSummary(order) {
  return {
    id: order.id,
    status: order.status,
    payment_status: order.payment_status,
    bill_amount: order.bill_amount,
    created_at: order.created_at,
    restaurant: {
      id: order.restaurant.id,
      name: order.restaurant.name,
    },
    items: order.items.map((i) => ({
      item_name: i.item_name,
      quantity: i.quantity,
    })),
    return_status: order.return_status || null,
    has_review: Boolean(order.has_review),
  };
}

export const mockDb = {
  /**
   * List orders with filtering and pagination
   */
  async listOrders({ status, date_from, date_to, page = 1, page_size = 10 } = {}) {
    await sleep();
    const orders = loadOrders();

    let filtered = [...orders];

    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (date_from) {
      const fromTimestamp = new Date(`${date_from}T00:00:00.000Z`).getTime();
      filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= fromTimestamp);
    }

    if (date_to) {
      const toTimestamp = new Date(`${date_to}T23:59:59.999Z`).getTime();
      filtered = filtered.filter((o) => new Date(o.created_at).getTime() <= toTimestamp);
    }

    // Newest first
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(50, Math.max(1, Number(page_size) || 10));
    const total = filtered.length;
    const total_pages = Math.ceil(total / safePageSize) || 0;
    const startIndex = (safePage - 1) * safePageSize;

    const paginatedItems = filtered
      .slice(startIndex, startIndex + safePageSize)
      .map(toOrderSummary);

    return {
      items: paginatedItems,
      total,
      page: safePage,
      page_size: safePageSize,
      total_pages,
    };
  },

  /**
   * Get single order detail
   */
  async getOrder(id) {
    await sleep();
    const orders = loadOrders();
    const found = orders.find((o) => o.id === id);

    if (!found) {
      throw createAxiosError(404, 'Order not found');
    }

    return JSON.parse(JSON.stringify(found));
  },

  /**
   * Create new order using cartSnapshot for price/name information (mock-only)
   */
  async createOrder(payload, cartSnapshot) {
    await sleep();
    const orders = loadOrders();

    if (!payload.delivery_address || !payload.delivery_address.trim()) {
      throw createAxiosError(400, 'Delivery address is required');
    }

    const cleanPhone = (payload.contact_phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 6) {
      throw createAxiosError(400, 'Contact phone must have at least 6 digits');
    }

    if (!payload.items || payload.items.length === 0) {
      throw createAxiosError(400, 'Order must contain at least one dish');
    }

    // Resolve restaurant details from seed orders or cart snapshot
    const matchedSeed = orders.find((o) => o.restaurant.id === payload.restaurant_id);
    const restaurant = matchedSeed
      ? matchedSeed.restaurant
      : {
          id: payload.restaurant_id,
          name: cartSnapshot?.restaurantName || 'Campus Eatery',
          address: 'Main Campus Dining Quad',
          phone: '+919123456780',
        };

    // Build items with names and unit prices from cartSnapshot
    let totalCents = 0;
    const orderItems = payload.items.map((it, idx) => {
      const snapItem = cartSnapshot?.items?.find((s) => s.menu_item_id === it.menu_item_id);
      const unitPriceNum = snapItem ? Number(snapItem.price) : 199.0;
      const itemName = snapItem ? snapItem.name : `Dish ${idx + 1}`;
      totalCents += Math.round(unitPriceNum * 100) * it.quantity;

      return {
        id: `oi_${Date.now()}_${idx}`,
        menu_item_id: it.menu_item_id,
        item_name: itemName,
        unit_price: unitPriceNum.toFixed(2),
        quantity: it.quantity,
      };
    });

    const billAmountStr = (totalCents / 100).toFixed(2);
    const nowIso = new Date().toISOString();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newOrderId = `cb_${randomHex}`;

    const newOrder = {
      id: newOrderId,
      status: 'PLACED',
      payment_status: 'MOCK_PAID',
      bill_amount: billAmountStr,
      created_at: nowIso,
      status_updated_at: nowIso,
      delivered_at: null,
      delivery_address: payload.delivery_address.trim(),
      contact_phone: payload.contact_phone.trim(),
      restaurant,
      items: orderItems,
      customer: null,
      delivery_partner: null,
      review: null,
      return_request: null,
      return_status: null,
      has_review: false,
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    return JSON.parse(JSON.stringify(newOrder));
  },

  /**
   * Cancel order (allowed ONLY in PLACED status)
   */
  async cancelOrder(id) {
    await sleep();
    const orders = loadOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      throw createAxiosError(404, 'Order not found');
    }

    const order = orders[orderIndex];
    if (order.status !== 'PLACED') {
      throw createAxiosError(400, 'Only orders in PLACED status can be cancelled');
    }

    order.status = 'CANCELLED';
    order.payment_status = 'REFUNDED';
    order.status_updated_at = new Date().toISOString();

    orders[orderIndex] = order;
    saveOrders(orders);

    return JSON.parse(JSON.stringify(order));
  },

  /**
   * Dev helper: Advance status one step in timeline sequence
   */
  async devAdvanceOrderStatus(id) {
    await sleep(200);
    const orders = loadOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      throw createAxiosError(404, 'Order not found');
    }

    const order = orders[orderIndex];
    const steps = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIndex = steps.indexOf(order.status);

    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      const nextStatus = steps[currentIndex + 1];
      order.status = nextStatus;
      order.status_updated_at = new Date().toISOString();

      if (nextStatus === 'ASSIGNED' && !order.delivery_partner) {
        order.delivery_partner = {
          id: 'dp_ramesh',
          name: 'Ramesh Kumar',
          phone: '+919876501234',
        };
      }

      if (nextStatus === 'DELIVERED') {
        order.delivered_at = new Date().toISOString();
      }

      orders[orderIndex] = order;
      saveOrders(orders);
    }

    return JSON.parse(JSON.stringify(order));
  },

  /**
   * Submit review for a delivered order
   */
  async submitReview(id, { rating, comment = '' }) {
    await sleep();
    const orders = loadOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      throw createAxiosError(404, 'Order not found');
    }

    const order = orders[orderIndex];
    if (order.status !== 'DELIVERED') {
      throw createAxiosError(400, 'Only delivered orders can be reviewed');
    }

    if (order.review || order.has_review) {
      throw createAxiosError(409, 'Review already exists for this order');
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw createAxiosError(400, 'Rating must be an integer between 1 and 5');
    }

    const cleanComment = (comment || '').trim();
    if (cleanComment.length > 500) {
      throw createAxiosError(400, 'Review comment cannot exceed 500 characters');
    }

    const newReview = {
      rating: ratingNum,
      comment: cleanComment,
      created_at: new Date().toISOString(),
    };

    order.review = newReview;
    order.has_review = true;

    orders[orderIndex] = order;
    saveOrders(orders);

    return JSON.parse(JSON.stringify(newReview));
  },

  /**
   * Submit return request for a delivered order
   */
  async requestReturn(id, { reason }) {
    await sleep();
    const orders = loadOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      throw createAxiosError(404, 'Order not found');
    }

    const order = orders[orderIndex];
    if (order.status !== 'DELIVERED') {
      throw createAxiosError(400, 'Only delivered orders can be returned');
    }

    if (order.status === 'REFUNDED') {
      throw createAxiosError(400, 'Cannot request return on a refunded order');
    }

    if (order.return_request || order.return_status) {
      throw createAxiosError(409, 'Return request already exists for this order');
    }

    const cleanReason = (reason || '').trim();
    if (cleanReason.length < 10 || cleanReason.length > 500) {
      throw createAxiosError(400, 'Return reason must be between 10 and 500 characters');
    }

    const newReturn = {
      id: `ret_${Date.now()}`,
      status: 'REQUESTED',
      reason: cleanReason,
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    order.return_request = newReturn;
    order.return_status = 'REQUESTED';

    orders[orderIndex] = order;
    saveOrders(orders);

    return JSON.parse(JSON.stringify(newReturn));
  },

  /**
   * Helper for mock AI to inspect current user orders
   */
  getRawOrders() {
    return loadOrders();
  },

  /**
   * Helper to sync real backend order into mock storage so it appears in mock lists
   */
  saveRealOrder(realOrder) {
    try {
      const orders = loadOrders();
      orders.unshift(realOrder);
      saveOrders(orders);
    } catch {
      // ignore
    }
  },
};
