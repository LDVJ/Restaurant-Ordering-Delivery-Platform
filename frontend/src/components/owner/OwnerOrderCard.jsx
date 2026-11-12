import { AlertTriangle, Clock, User } from 'lucide-react';
import { formatCurrency, formatTimeSince, isOrderDelayed, canAssign } from '../../utils/format';
import { PAYMENT_STATUS_CONFIG, RETURN_STATUS_CONFIG } from '../../utils/constants';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

export default function OwnerOrderCard({
  order,
  onOpenDetail,
  onStatusAction,
  onOpenAssign,
  isActionLoading = false,
}) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const placedTimeAgo = formatTimeSince(order.created_at);

  // Correction 1: Highlight for PLACED or ACCEPTED not updated > 15m uses status_updated_at
  const isDelayed = isOrderDelayed(order.status, order.status_updated_at);

  const payConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.MOCK_PAID;
  const retStatus = order.return_status || (typeof order.return_request === 'string' ? order.return_request : order.return_request?.status);
  const retConfig = retStatus ? RETURN_STATUS_CONFIG[retStatus] : null;

  const renderActionButton = () => {
    if (order.status === 'PLACED') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          onClick={(e) => { e.stopPropagation(); onStatusAction(order, 'ACCEPTED'); }}
          className="text-xs"
        >
          Accept order
        </Button>
      );
    }
    if (order.status === 'ACCEPTED') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          onClick={(e) => { e.stopPropagation(); onStatusAction(order, 'PREPARING'); }}
          className="text-xs"
        >
          Start preparing
        </Button>
      );
    }
    if (order.status === 'PREPARING') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          onClick={(e) => { e.stopPropagation(); onStatusAction(order, 'READY'); }}
          className="text-xs"
        >
          Mark ready
        </Button>
      );
    }
    if (canAssign(order)) {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          onClick={(e) => { e.stopPropagation(); onOpenAssign(order); }}
          className="text-xs"
        >
          Assign delivery partner
        </Button>
      );
    }
    if (order.status === 'READY' && order.delivery_partner) {
      return (
        <span className="text-xs font-medium text-muted-text">
          Assigned to {order.delivery_partner.name} ({order.delivery_partner.phone})
        </span>
      );
    }
    return null;
  };

  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.item_name}`).join(', ');

  return (
    <div
      onClick={() => onOpenDetail(order)}
      className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs space-y-3.5 text-left transition-all cursor-pointer hover:border-brand/60 ${
        isDelayed ? 'border-amber-400 bg-amber-50/20 ring-1 ring-amber-400' : 'border-border'
      }`}
    >
      {/* 15m delay warning banner */}
      {isDelayed && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-100 text-amber-900 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Action needed: No status update for over 15 minutes</span>
        </div>
      )}

      {/* Header: Short ID, Time since placed, Badges */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-base text-text-main">#{shortId}</span>
            <StatusBadge status={order.status} size="sm" />
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${payConfig.bg} ${payConfig.text}`}>
              {payConfig.label}
            </span>
            {retConfig && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${retConfig.bg} ${retConfig.text}`}>
                {retConfig.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-text flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3" />
            <span>Placed {placedTimeAgo}</span>
          </p>
        </div>

        <span className="font-extrabold text-base text-text-main sm:text-right">
          {formatCurrency(order.bill_amount)}
        </span>
      </div>

      {/* Customer & Items Summary */}
      <div className="space-y-1.5 text-xs border-t border-border/70 pt-2.5">
        <div className="flex items-center gap-1.5 font-semibold text-text-main">
          <User className="w-3.5 h-3.5 text-muted-text" />
          <span>{order.customer?.name || order.customer_name || 'Customer'}</span>
        </div>
        <p className="text-muted-text line-clamp-1">{itemsSummary}</p>
      </div>

      {/* Footer & Action Button */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-[11px] text-muted-text font-medium">Click to view details</span>
        {renderActionButton()}
      </div>
    </div>
  );
}
