import { INITIAL_OWNER_ORDERS, INITIAL_OWNER_REMINDERS } from './mockOwnerData';

export const ORDERS_KEY = 'campusbite_mock_owner_orders';
export const REMINDERS_KEY = 'campusbite_mock_owner_reminders';
export const sleep = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export function loadOrders() {
  try {
    const raw = sessionStorage.getItem(ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fallback */ }
  const initial = JSON.parse(JSON.stringify(INITIAL_OWNER_ORDERS));
  saveOrders(initial);
  return initial;
}

export function saveOrders(orders) {
  try { sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch { /* ignore */ }
}

export function loadReminders() {
  try {
    const raw = sessionStorage.getItem(REMINDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fallback */ }
  const initial = JSON.parse(JSON.stringify(INITIAL_OWNER_REMINDERS));
  saveReminders(initial);
  return initial;
}

export function saveReminders(rems) {
  try { sessionStorage.setItem(REMINDERS_KEY, JSON.stringify(rems)); } catch { /* ignore */ }
}

export function createError(status, detail) {
  const err = new Error(detail);
  err.response = { status, data: { detail } };
  return err;
}

export function toOwnerOrderSummary(o) {
  return {
    id: o.id, status: o.status, payment_status: o.payment_status, bill_amount: o.bill_amount,
    created_at: o.created_at, status_updated_at: o.status_updated_at,
    restaurant: { id: o.restaurant.id, name: o.restaurant.name },
    items: o.items.map((i) => ({ item_name: i.item_name, quantity: i.quantity })),
    return_status: o.return_status || null, has_review: Boolean(o.has_review),
    customer_name: o.customer_name || o.customer?.name || 'Customer',
  };
}
