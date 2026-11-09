import { RotateCcw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { RETURN_STATUSES } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';
import StatusBadge from '../ui/StatusBadge';

const RETURN_EXPLANATIONS = {
  [RETURN_STATUSES.REQUESTED]: {
    text: 'Waiting for the restaurant to review your request.',
    icon: Clock,
    color: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  [RETURN_STATUSES.APPROVED]: {
    text: 'Return approved. Refund has been issued and payment is refunded.',
    icon: CheckCircle2,
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
  },
  [RETURN_STATUSES.REJECTED]: {
    text: 'Return request was rejected by the restaurant.',
    icon: XCircle,
    color: 'text-red-800 bg-red-50 border-red-200',
  },
};

/**
 * OrderReturnCard Component
 * Displays return request status, reason, timestamps, and plain-language explanation.
 */
export default function OrderReturnCard({ returnRequest }) {
  if (!returnRequest) return null;

  const explanation =
    RETURN_EXPLANATIONS[returnRequest.status] || RETURN_EXPLANATIONS[RETURN_STATUSES.REQUESTED];
  const IconComponent = explanation.icon;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/70">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-brand" />
          <span>Return Request</span>
        </h3>
        <StatusBadge status={returnRequest.status} type="return" />
      </div>

      <div className="text-xs space-y-1.5">
        <p className="text-muted-text">
          <strong className="text-text-main">Reason:</strong> {returnRequest.reason}
        </p>
        <p className="text-muted-text">
          Requested on <span className="text-text-main">{formatDateTime(returnRequest.created_at)}</span>
          {returnRequest.resolved_at && (
            <span> • Resolved on {formatDateTime(returnRequest.resolved_at)}</span>
          )}
        </p>
      </div>

      {/* Plain language explanation banner */}
      <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${explanation.color}`}>
        <IconComponent className="w-4 h-4 shrink-0" />
        <span>{explanation.text}</span>
      </div>
    </div>
  );
}
