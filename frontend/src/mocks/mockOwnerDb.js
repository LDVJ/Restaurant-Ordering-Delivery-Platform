import { MOCK_DELIVERY_PARTNERS } from './mockOwnerData';
import {
  sleep,
  loadOrders,
  saveOrders,
  loadReminders,
  saveReminders,
  createError,
  toOwnerOrderSummary,
} from './mockOwnerStorage';

export const mockOwnerDb = {
  async listOrders({ status, date_from, date_to, page = 1, page_size = 10 } = {}) {
    await sleep();
    const orders = loadOrders();
    let filtered = [...orders];
    if (status) filtered = filtered.filter((o) => o.status === status);
    if (date_from) filtered = filtered.filter((o) => new Date(o.created_at).getTime() >= new Date(`${date_from}T00:00:00.000Z`).getTime());
    if (date_to) filtered = filtered.filter((o) => new Date(o.created_at).getTime() <= new Date(`${date_to}T23:59:59.999Z`).getTime());
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const safePage = Math.max(1, Number(page) || 1);
    const safeSize = Math.max(1, Number(page_size) || 10);
    const start = (safePage - 1) * safeSize;
    return {
      items: filtered.slice(start, start + safeSize).map(toOwnerOrderSummary),
      total: filtered.length,
      page: safePage,
      page_size: safeSize,
      total_pages: Math.ceil(filtered.length / safeSize) || 1,
    };
  },

  async getOrder(id) {
    await sleep();
    const order = loadOrders().find((o) => o.id === id);
    if (!order) throw createError(404, 'Order not found');
    return JSON.parse(JSON.stringify(order));
  },

  async updateStatus(id, newStatus) {
    await sleep();
    const orders = loadOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) throw createError(404, 'Order not found');
    const validMoves = { PLACED: 'ACCEPTED', ACCEPTED: 'PREPARING', PREPARING: 'READY' };
    if (validMoves[order.status] !== newStatus) throw createError(400, `Cannot move order from ${order.status} to ${newStatus}`);

    order.status = newStatus;
    order.status_updated_at = new Date().toISOString();
    saveOrders(orders);
    return JSON.parse(JSON.stringify(order));
  },

  async assignPartner(id, partnerId) {
    await sleep();
    const orders = loadOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) throw createError(404, 'Order not found');
    if (order.status !== 'READY') throw createError(400, 'Can only assign a delivery partner when order is READY');
    const partner = MOCK_DELIVERY_PARTNERS.find((p) => p.id === partnerId);
    if (!partner) throw createError(404, 'Delivery partner not found');

    order.status = 'ASSIGNED';
    order.delivery_partner = partner;
    order.status_updated_at = new Date().toISOString();
    saveOrders(orders);
    return JSON.parse(JSON.stringify(order));
  },

  async listDeliveryPartners() {
    await sleep(150);
    return JSON.parse(JSON.stringify(MOCK_DELIVERY_PARTNERS));
  },

  async getStats() {
    await sleep(200);
    const orders = loadOrders();
    const counts = { PLACED: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, ASSIGNED: 0, OUT_FOR_DELIVERY: 0, DELIVERED: 0, CANCELLED: 0, REFUNDED: 0 };
    let revSum = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    const itemMap = {};
    const todayStr = new Date().toISOString().split('T')[0];
    let todayOrders = 0;

    for (const o of orders) {
      if (counts[o.status] !== undefined) counts[o.status]++;
      if (o.created_at.startsWith(todayStr)) todayOrders++;
      if (o.status === 'DELIVERED') revSum += Number(o.bill_amount) || 0;
      if (o.review?.rating) { ratingSum += o.review.rating; ratingCount++; }
      for (const it of o.items) itemMap[it.item_name] = (itemMap[it.item_name] || 0) + it.quantity;
    }

    const topItems = Object.entries(itemMap)
      .map(([name, qty]) => ({ item_name: name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    return {
      total_orders: orders.length,
      today_orders: todayOrders,
      orders_by_status: counts,
      revenue: revSum.toFixed(2),
      avg_rating: ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : null,
      review_count: ratingCount,
      pending_returns: orders.filter((o) => o.return_status === 'REQUESTED').length,
      top_items: topItems,
    };
  },

  async listReturns({ status, page = 1, page_size = 10 } = {}) {
    await sleep();
    const orders = loadOrders();
    let returns = [];
    for (const o of orders) {
      if (o.return_request) {
        returns.push({
          id: o.return_request.id,
          order_id: o.id,
          customer_name: o.customer_name || 'Customer',
          reason: o.return_request.reason,
          status: o.return_request.status,
          created_at: o.return_request.created_at,
          resolved_at: o.return_request.resolved_at,
          bill_amount: o.bill_amount,
        });
      }
    }
    if (status) returns = returns.filter((r) => r.status === status);
    returns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const safePage = Math.max(1, Number(page) || 1);
    const safeSize = Math.max(1, Number(page_size) || 10);
    const start = (safePage - 1) * safeSize;
    return {
      items: returns.slice(start, start + safeSize),
      total: returns.length,
      page: safePage,
      page_size: safeSize,
      total_pages: Math.ceil(returns.length / safeSize) || 1,
    };
  },

  async approveReturn(returnId) {
    await sleep();
    const orders = loadOrders();
    const order = orders.find((o) => o.return_request?.id === returnId);
    if (!order || order.return_request?.status !== 'REQUESTED') throw createError(400, 'Only REQUESTED return requests can be approved');
    const nowIso = new Date().toISOString();
    order.return_request.status = 'APPROVED';
    order.return_request.resolved_at = nowIso;
    order.return_status = 'APPROVED';
    order.status = 'REFUNDED';
    order.payment_status = 'REFUNDED';
    order.status_updated_at = nowIso;
    saveOrders(orders);
    return { id: returnId, status: 'APPROVED' };
  },

  async rejectReturn(returnId) {
    await sleep();
    const orders = loadOrders();
    const order = orders.find((o) => o.return_request?.id === returnId);
    if (!order || order.return_request?.status !== 'REQUESTED') throw createError(400, 'Only REQUESTED return requests can be rejected');
    const nowIso = new Date().toISOString();
    order.return_request.status = 'REJECTED';
    order.return_request.resolved_at = nowIso;
    order.return_status = 'REJECTED';
    order.status_updated_at = nowIso;
    saveOrders(orders);
    return { id: returnId, status: 'REJECTED' };
  },

  async listReminders({ unread_only, page = 1, page_size = 10 } = {}) {
    await sleep(150);
    let rems = loadReminders();
    if (unread_only === true || unread_only === 'true') rems = rems.filter((r) => !r.is_read);
    rems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const safePage = Math.max(1, Number(page) || 1);
    const safeSize = Math.max(1, Number(page_size) || 10);
    const start = (safePage - 1) * safeSize;
    return {
      items: rems.slice(start, start + safeSize),
      total: rems.length,
      page: safePage,
      page_size: safeSize,
      total_pages: Math.ceil(rems.length / safeSize) || 1,
    };
  },

  async markReminderRead(id) {
    await sleep(150);
    const rems = loadReminders();
    const rem = rems.find((r) => r.id === id);
    if (!rem) throw createError(404, 'Reminder not found');
    rem.is_read = true;
    saveReminders(rems);
    return JSON.parse(JSON.stringify(rem));
  },
};
