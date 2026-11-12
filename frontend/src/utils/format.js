/**
 * CampusBite Formatting Utilities
 * Section 13 of Frontend Guide
 */

/**
 * Format a number or string amount as Indian Rupees (INR)
 * e.g., "249.00" -> "₹249.00"
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (value === null || value === undefined || isNaN(num)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format an ISO 8601 UTC date string into localized readable format
 * e.g., "2026-11-05T10:15:00Z" -> "5 Nov, 3:45 pm"
 */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  const dayMonth = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);

  const time = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date).toLowerCase();

  return `${dayMonth}, ${time}`;
}

/**
 * Get initials from a person or restaurant name
 * e.g. "Spice Hub" -> "SH", "Asha" -> "A"
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a deterministic color background and text pair from a name for avatars
 */
const AVATAR_PALETTE = [
  { bg: 'bg-orange-100', text: 'text-orange-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-purple-100', text: 'text-purple-700' },
  { bg: 'bg-pink-100', text: 'text-pink-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700' },
];

export function colorFromName(name) {
  if (!name || typeof name !== 'string') {
    return AVATAR_PALETTE[0];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

/**
 * Format order ID into a short readable order number (first 8 characters, uppercase)
 * e.g. "cb_ord_01" -> "#CB_ORD_0"
 */
export function formatOrderNumber(id) {
  if (!id || typeof id !== 'string') return '';
  return `#${id.slice(0, 8).toUpperCase()}`;
}

/**
 * Format relative time elapsed since date
 * e.g. "5m ago", "2h ago", "1d ago"
 */
export function formatTimeSince(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * Checks whether an order in PLACED or ACCEPTED status has not been updated for > 15 minutes
 */
export function isOrderDelayed(status, statusUpdatedAt) {
  if (status !== 'PLACED' && status !== 'ACCEPTED') return false;
  if (!statusUpdatedAt) return false;
  return Date.now() - new Date(statusUpdatedAt).getTime() > 15 * 60 * 1000;
}

export function canAssign(order) {
  return Boolean(order && order.status === 'READY' && !order.delivery_partner);
}


