import { Link } from 'react-router-dom';
import { ChevronRight, Ban, Star } from 'lucide-react';
import { ORDER_STATUSES } from '../../utils/constants';
import { formatCurrency, formatDateTime, formatOrderNumber } from '../../utils/format';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

/**
 * OrderCard Component
 * Displays summary card for customer dashboard order list.
 * Includes short order number, badges, item summary, cancel action, and rating action.
 */
export default function OrderCard({
  order,
  onCancel,
  onReview,
  isCancelling = false,
}) {
  const shortOrderNum = formatOrderNumber(order.id);

  const itemsSummary = order.items
    ?.map((item) => `${item.quantity}x ${item.item_name}`)
    .join(', ');

  const isPlaced = order.status === ORDER_STATUSES.PLACED;
  const canReview = order.status === ORDER_STATUSES.DELIVERED && !order.has_review;

  return (
    <div className="bg-white rounded-xl border border-border p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow text-left">
      {/* Header: Short Order ID, Restaurant & Badges */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-border/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-brand">
              {shortOrderNum}
            </span>
            <span className="text-xs text-muted-text">•</span>
            <span className="text-xs text-muted-text">
              {formatDateTime(order.created_at)}
            </span>
          </div>
          <h3 className="text-base font-bold text-text-main mt-0.5">
            {order.restaurant?.name || 'Restaurant'}
          </h3>
        </div>

        {/* Badges container */}
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={order.status} type="order" />
          <StatusBadge status={order.payment_status} type="payment" />
          {order.return_status && (
            <StatusBadge status={order.return_status} type="return" />
          )}
        </div>
      </div>

      {/* Body: Items Summary & Total */}
      <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-muted-text line-clamp-2 max-w-xl">
          {itemsSummary || 'Items ordered'}
        </p>
        <div className="shrink-0 text-left sm:text-right">
          <span className="text-[11px] text-muted-text block">Total bill</span>
          <span className="text-sm sm:text-base font-bold text-text-main">
            {formatCurrency(order.bill_amount)}
          </span>
        </div>
      </div>

      {/* Footer: Actions */}
      <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isPlaced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(order.id)}
              disabled={isCancelling}
              icon={Ban}
              className="text-xs text-muted-text hover:text-danger hover:bg-red-50 h-8 py-0 px-2.5"
            >
              Cancel order
            </Button>
          )}

          {canReview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReview?.(order)}
              icon={Star}
              className="text-xs text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100 h-8 py-0 px-2.5"
            >
              Rate your order
            </Button>
          )}

          {order.has_review && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Rated</span>
            </span>
          )}
        </div>

        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors py-1 px-2"
        >
          <span>View details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
