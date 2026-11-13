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

  const status = typeof returnRequest === 'string' ? returnRequest : returnRequest.status;
  const reason = typeof returnRequest === 'object' ? returnRequest.reason : null;
  const createdAt = typeof returnRequest === 'object' ? returnRequest.created_at : null;
  const resolvedAt = typeof returnRequest === 'object' ? returnRequest.resolved_at : null;

  const explanation =
    RETURN_EXPLANATIONS[status] || RETURN_EXPLANATIONS[RETURN_STATUSES.REQUESTED];
  const IconComponent = explanation.icon;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/70">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-brand" />
          <span>Return Request</span>
        </h3>
        <StatusBadge status={status} type="return" />
      </div>

      {(reason || createdAt) && (
        <div className="text-xs space-y-1.5">
          {reason && (
            <p className="text-muted-text">
              <strong className="text-text-main">Reason:</strong> {reason}
            </p>
          )}
          {createdAt && (
            <p className="text-muted-text">
              Requested on <span className="text-text-main">{formatDateTime(createdAt)}</span>
              {resolvedAt && (
                <span> • Resolved on {formatDateTime(resolvedAt)}</span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Plain language explanation banner */}
      <div className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${explanation.color}`}>
        <IconComponent className="w-4 h-4 shrink-0" />
        <span>{explanation.text}</span>
      </div>
    </div>
  );
}
