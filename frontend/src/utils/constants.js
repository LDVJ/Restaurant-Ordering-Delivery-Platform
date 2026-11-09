/**
 * CampusBite Constants & Enums
 * Sourced from API_CONTRACT.md and FRONTEND_GUIDE.md
 */

export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
};

export const ROLE_HOME_PATHS = {
  [ROLES.CUSTOMER]: '/restaurants',
  [ROLES.RESTAURANT_OWNER]: '/owner',
  [ROLES.DELIVERY_PARTNER]: '/delivery',
};

export const STORAGE_KEYS = {
  TOKEN: 'campusbite_token',
  USER: 'campusbite_user',
  CART_PREFIX: 'campusbite_cart_',
};

export const ORDER_STATUSES = {
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  ASSIGNED: 'ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUSES.PLACED]: { label: 'Order placed', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-600' },
  [ORDER_STATUSES.ACCEPTED]: { label: 'Accepted', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', dot: 'bg-indigo-600' },
  [ORDER_STATUSES.PREPARING]: { label: 'Preparing', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' },
  [ORDER_STATUSES.READY]: { label: 'Ready for pickup', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', dot: 'bg-teal-600' },
  [ORDER_STATUSES.ASSIGNED]: { label: 'Partner assigned', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-600' },
  [ORDER_STATUSES.OUT_FOR_DELIVERY]: { label: 'Out for delivery', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-600' },
  [ORDER_STATUSES.DELIVERED]: { label: 'Delivered', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  [ORDER_STATUSES.CANCELLED]: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
  [ORDER_STATUSES.REFUNDED]: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
};

export const ORDER_TIMELINE_STEPS = [
  ORDER_STATUSES.PLACED,
  ORDER_STATUSES.ACCEPTED,
  ORDER_STATUSES.PREPARING,
  ORDER_STATUSES.READY,
  ORDER_STATUSES.ASSIGNED,
  ORDER_STATUSES.OUT_FOR_DELIVERY,
  ORDER_STATUSES.DELIVERED,
];

export const PAYMENT_STATUSES = {
  PENDING: 'PENDING',
  MOCK_PAID: 'MOCK_PAID',
  REFUNDED: 'REFUNDED',
};

export const PAYMENT_STATUS_CONFIG = {
  [PAYMENT_STATUSES.MOCK_PAID]: { label: 'Paid (demo)', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  [PAYMENT_STATUSES.PENDING]: { label: 'Payment pending', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' },
  [PAYMENT_STATUSES.REFUNDED]: { label: 'Refunded', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-500' },
};

export const RETURN_STATUSES = {
  REQUESTED: 'REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const RETURN_STATUS_CONFIG = {
  [RETURN_STATUSES.REQUESTED]: { label: 'Return requested', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-600' },
  [RETURN_STATUSES.APPROVED]: { label: 'Return approved', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  [RETURN_STATUSES.REJECTED]: { label: 'Return rejected', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-600' },
};

export const ORDER_ACTION_CONFIGS = {
  ACCEPTED: { title: 'Accept order?', confirmText: 'Accept order', msg: (id, name, amt) => `Accept order #${id} from ${name} for ${amt}?` },
  PREPARING: { title: 'Start preparing?', confirmText: 'Start preparing', msg: (id) => `Move order #${id} to Preparing? Kitchen will start cooking.` },
  READY: { title: 'Mark ready for pickup?', confirmText: 'Mark ready', msg: (id) => `Mark order #${id} as Ready for delivery partner pickup?` },
};

export const COUNTRY_CODES = [
  { value: '+91', label: '+91 (IN)' },
  { value: '+1', label: '+1 (US)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+61', label: '+61 (AU)' },
  { value: '+971', label: '+971 (AE)' },
];

export const FIELD_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  EMAIL_MAX: 200,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 72,
  COUNTRY_CODE: '+91',
  PHONE_MIN: 6,
  PHONE_MAX: 15,
  HOUSE_MAX: 100,
  CITY_MAX: 100,
  STATE_MAX: 100,
  COUNTRY_MAX: 100,
  MAX_SAVED_ADDRESSES: 10,
  RESTAURANT_DESC_MAX: 300,
  RESTAURANT_CUISINE_MAX: 100,
  DISH_NAME_MAX: 100,
  DISH_DESC_MAX: 200,
  DISH_PRICE_MAX: 99999.99,
  DISH_QUANTITY_MIN: 1,
  DISH_QUANTITY_MAX: 20,
  MAX_DISHES_PER_ORDER: 30,
  DELIVERY_ADDRESS_MAX: 500,
  CONTACT_PHONE_MAX: 20,
  RATING_MIN: 1,
  RATING_MAX: 5,
  REVIEW_COMMENT_MAX: 500,
  RETURN_REASON_MIN: 10,
  RETURN_REASON_MAX: 500,
  AI_QUESTION_MAX: 300,
};
