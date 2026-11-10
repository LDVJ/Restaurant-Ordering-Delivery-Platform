import { Phone, MapPin, Store, Navigation, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatOrderNumber, formatDateTime } from '../../utils/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import OrderTimeline from '../order/OrderTimeline';

export default function DeliveryOrderDetailModal({
  isOpen,
  onClose,
  order,
  onStartDelivery,
  onMarkDelivered,
  isActionLoading = false,
}) {
  if (!order) return null;

  const isAssigned = order.status === 'ASSIGNED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delivery Order ${formatOrderNumber(order.id)}`} size="lg">
      <div className="space-y-4 text-left">
        {/* Status Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted-text">
              Updated {formatDateTime(order.status_updated_at || order.created_at)}
            </span>
          </div>
          <span className="font-extrabold text-base text-text-main">
            {formatCurrency(order.bill_amount)}
          </span>
        </div>

        {/* Tracking Timeline */}
        <div className="py-1">
          <OrderTimeline status={order.status} />
        </div>

        {/* Pickup & Dropoff Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Pickup from Restaurant */}
          <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-brand" />
                <span>Pickup: Restaurant</span>
              </span>
              {order.restaurant?.phone && (
                <a
                  href={`tel:${order.restaurant.phone}`}
                  className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
            <p className="font-bold text-sm text-text-main">{order.restaurant?.name}</p>
            <p className="text-muted-text leading-relaxed">{order.restaurant?.address}</p>
          </div>

          {/* Deliver to Customer */}
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Dropoff: Customer</span>
              </span>
              {(order.contact_phone || order.customer?.phone) && (
                <a
                  href={`tel:${order.contact_phone || order.customer?.phone}`}
                  className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
            </div>
            <p className="font-bold text-sm text-text-main">
              {order.customer?.name || order.customer_name}
            </p>
            <p className="text-text-main leading-relaxed">{order.delivery_address}</p>
          </div>
        </div>

        {/* Itemized Order Dishes */}
        <div className="border border-border rounded-xl p-3.5 space-y-2 bg-gray-50/50 text-xs">
          <p className="font-bold text-text-main">Order Items</p>
          <div className="divide-y divide-border/60">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex justify-between py-1.5">
                <span>
                  {it.quantity}x {it.item_name}
                </span>
                <span className="font-medium text-text-main">
                  {it.unit_price ? formatCurrency(Number(it.unit_price) * it.quantity) : '–'}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-text-main">
            <span>Total Bill</span>
            <span>{formatCurrency(order.bill_amount)}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {isAssigned && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Navigation}
              disabled={isActionLoading}
              isLoading={isActionLoading}
              onClick={() => onStartDelivery(order)}
            >
              Start delivery
            </Button>
          )}

          {isOutForDelivery && (
            <Button
              type="button"
              variant="success"
              size="sm"
              icon={CheckCircle2}
              disabled={isActionLoading}
              isLoading={isActionLoading}
              onClick={() => onMarkDelivered(order)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Mark delivered
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
