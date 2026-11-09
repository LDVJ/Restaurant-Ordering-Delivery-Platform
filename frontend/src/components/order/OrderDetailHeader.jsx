import { FastForward } from 'lucide-react';
import { isMocked } from '../../api/orderApi';
import { formatDateTime, formatOrderNumber } from '../../utils/format';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

/**
 * OrderDetailHeader Component
 * Displays DEV mock advance bar, short order ID, full ID, badges, and placed timestamp.
 */
export default function OrderDetailHeader({
  order,
  onDevAdvance,
  isAdvancing = false,
  isTerminal = false,
}) {
  return (
    <div className="space-y-4">
      {/* Dev helper: visible only in mock mode */}
      {isMocked('orders') && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <FastForward className="w-4 h-4 text-amber-600" />
            <span>DEV MOCK MODE: Live timeline & polling tester</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onDevAdvance}
            disabled={isAdvancing || isTerminal}
            className="text-xs font-bold py-1 h-8 bg-white border-amber-300 hover:bg-amber-100/60"
          >
            DEV: move to next status
          </Button>
        </div>
      )}

      {/* Main Order Details Header Card */}
      <div className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs text-muted-text block">Order number</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand tracking-tight">
              {formatOrderNumber(order.id)}
            </h1>
            <p className="text-[11px] font-mono text-muted-text mt-0.5">Full ID: {order.id}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} type="order" />
            <StatusBadge status={order.payment_status} type="payment" />
            {order.return_request && (
              <StatusBadge status={order.return_request.status} type="return" />
            )}
          </div>
        </div>

        <p className="text-xs text-muted-text pt-2 border-t border-border/70">
          Placed on <span className="font-medium text-text-main">{formatDateTime(order.created_at)}</span>
        </p>
      </div>
    </div>
  );
}
