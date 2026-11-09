import { Check, X, User } from 'lucide-react';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { RETURN_STATUS_CONFIG } from '../../utils/constants';
import Button from '../ui/Button';

export default function OwnerReturnCard({ ret, isActionLoading, onApprove, onReject }) {
  const shortId = ret.order_id.slice(0, 8).toUpperCase();
  const badge = RETURN_STATUS_CONFIG[ret.status] || RETURN_STATUS_CONFIG.REQUESTED;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-3.5 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-text-main">#{shortId}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-muted-text mt-0.5">Requested {formatDateTime(ret.created_at)}</p>
        </div>
        <span className="font-extrabold text-base text-text-main">{formatCurrency(ret.bill_amount)}</span>
      </div>

      <div className="space-y-1.5 text-xs border-t border-border/70 pt-2.5">
        <p className="font-semibold text-text-main flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-muted-text" />
          <span>{ret.customer_name}</span>
        </p>
        <p className="text-muted-text bg-gray-50 p-2.5 rounded-xl border border-border/60 leading-relaxed">
          "{ret.reason}"
        </p>
      </div>

      {ret.status === 'REQUESTED' && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={X}
            disabled={isActionLoading}
            onClick={() => onReject(ret)}
            className="text-xs text-danger hover:bg-red-50 border-red-200"
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={Check}
            disabled={isActionLoading}
            isLoading={isActionLoading}
            onClick={() => onApprove(ret)}
            className="text-xs"
          >
            Approve & refund
          </Button>
        </div>
      )}
    </div>
  );
}
