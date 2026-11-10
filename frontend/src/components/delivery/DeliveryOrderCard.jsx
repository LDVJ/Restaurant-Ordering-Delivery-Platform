import { Phone, MapPin, Store, Navigation, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatCurrency, formatOrderNumber, formatDateTime } from '../../utils/format';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

export default function DeliveryOrderCard({
  order,
  onOpenDetail,
  onStartDelivery,
  onMarkDelivered,
  isActionLoading = false,
}) {
  const isAssigned = order.status === 'ASSIGNED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs hover:shadow-xs transition-shadow text-left flex flex-col justify-between h-full space-y-4">
      {/* Header: Order ID, Status, Amount */}
      <div className="flex items-start justify-between gap-3 flex-wrap border-b border-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-text-main">
              {formatOrderNumber(order.id)}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <span className="text-xs text-muted-text mt-0.5 block">
            Assigned {formatDateTime(order.status_updated_at || order.created_at)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-text block">Bill amount</span>
          <span className="font-extrabold text-base text-text-main">
            {formatCurrency(order.bill_amount)}
          </span>
        </div>
      </div>

      {/* Trip Route Details: Pickup & Dropoff */}
      <div className="space-y-3 flex-1 min-w-0">
        {/* Pickup: Restaurant */}
        <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-brand" />
              <span>1. Pickup from Restaurant</span>
            </span>
            {order.restaurant?.phone && (
              <a
                href={`tel:${order.restaurant.phone}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3 h-3" />
                <span>Call Restaurant</span>
              </a>
            )}
          </div>
          <p className="font-bold text-sm text-text-main">{order.restaurant?.name}</p>
          <p className="text-xs text-muted-text line-clamp-2" title={order.restaurant?.address}>
            {order.restaurant?.address}
          </p>
        </div>

        {/* Dropoff: Customer */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Deliver to Customer</span>
            </span>
            {order.contact_phone && (
              <a
                href={`tel:${order.contact_phone}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="w-3 h-3" />
                <span>Call Customer</span>
              </a>
            )}
          </div>
          <p className="font-bold text-sm text-text-main">{order.customer_name}</p>
          <p className="text-xs text-text-main line-clamp-2" title={order.delivery_address}>
            {order.delivery_address}
          </p>
        </div>

        {/* Order Items Summary */}
        <div className="text-xs text-muted-text px-1 py-1 flex items-center justify-between gap-2">
          <span className="truncate">
            <strong className="text-text-main font-medium">Items:</strong>{' '}
            {order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ')}
          </span>
          <button
            type="button"
            onClick={() => onOpenDetail(order)}
            className="text-brand hover:underline font-semibold shrink-0 cursor-pointer flex items-center gap-0.5"
          >
            <span>Details</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Prominent Action Button - Stuck to bottom */}
      <div className="mt-auto pt-3 border-t border-border/70">
        {isAssigned && (
          <Button
            type="button"
            variant="primary"
            size="lg"
            icon={Navigation}
            disabled={isActionLoading}
            isLoading={isActionLoading}
            onClick={() => onStartDelivery(order)}
            className="w-full text-sm font-bold shadow-xs py-3"
          >
            Start delivery
          </Button>
        )}

        {isOutForDelivery && (
          <Button
            type="button"
            variant="success"
            size="lg"
            icon={CheckCircle2}
            disabled={isActionLoading}
            isLoading={isActionLoading}
            onClick={() => onMarkDelivered(order)}
            className="w-full text-sm font-bold shadow-xs py-3 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Mark delivered
          </Button>
        )}

        {isDelivered && (
          <div className="flex items-center justify-between text-xs py-1">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Delivered successfully</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenDetail(order)}
              className="text-xs"
            >
              View receipt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
