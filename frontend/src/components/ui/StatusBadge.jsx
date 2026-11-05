import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  RETURN_STATUS_CONFIG,
} from '../../utils/constants';

/**
 * StatusBadge Component
 * Displays order, payment, and return statuses with exact labels & colors
 * Sourced from Section 11 of Frontend Guide
 */
export default function StatusBadge({
  status,
  type = 'order',
  className = '',
}) {
  let config = null;

  if (type === 'order') {
    config = ORDER_STATUS_CONFIG[status];
  } else if (type === 'payment') {
    config = PAYMENT_STATUS_CONFIG[status];
  } else if (type === 'return') {
    config = RETURN_STATUS_CONFIG[status];
  }

  if (!config) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {status || 'Unknown'}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
