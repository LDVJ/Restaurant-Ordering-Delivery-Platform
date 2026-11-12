import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import Skeleton from '../ui/Skeleton';

export default function OwnerRemindersPanel({
  reminders = [],
  onMarkRead,
  isLoading = false,
}) {
  const unreadCount = reminders.filter((r) => !r.is_read).length;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-bold text-text-main">Order Escalations & Reminders</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
              {unreadCount} unread
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-text">Orders delayed &gt; 15 mins</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-text space-y-1">
          <p className="font-semibold text-emerald-700">All clear! No delayed orders.</p>
          <p>Orders delayed in acceptance or preparation will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {reminders.map((rem) => {
            const shortId = rem.order_id.slice(0, 8).toUpperCase();
            return (
              <div
                key={rem.id}
                className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                  rem.is_read
                    ? 'bg-gray-50/60 border-border/70 opacity-80'
                    : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-text-main">#{shortId}</span>
                    <StatusBadge status={rem.order_status} size="sm" />
                  </div>
                  <span className="text-[11px] text-muted-text">{formatDateTime(rem.created_at)}</span>
                </div>

                <p className="text-text-main leading-relaxed font-medium">{rem.message}</p>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <Link
                    to={`/owner/orders?order=${rem.order_id}`}
                    className="inline-flex items-center gap-1 font-semibold text-brand hover:text-brand-dark transition-colors"
                  >
                    <span>View order</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {!rem.is_read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      icon={Check}
                      disabled={isLoading}
                      onClick={() => onMarkRead(rem.id)}
                      className="text-[11px] text-muted-text hover:text-emerald-700 hover:bg-emerald-50 h-7 px-2"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
