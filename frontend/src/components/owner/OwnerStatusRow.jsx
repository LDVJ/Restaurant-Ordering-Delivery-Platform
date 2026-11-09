import { Link } from 'react-router-dom';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

const STATUS_KEYS = [
  'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED',
];

export default function OwnerStatusRow({ statusCounts = {} }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-main">Orders by Lifecycle Status</h2>
        <span className="text-[11px] text-muted-text">Click a status to filter orders</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
        {STATUS_KEYS.map((key) => {
          const config = ORDER_STATUS_CONFIG[key];
          const count = statusCounts[key] ?? 0;
          return (
            <Link
              key={key}
              to={`/owner/orders?status=${key}`}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-border hover:border-brand hover:bg-brand-tint/20 transition-all text-center group cursor-pointer"
            >
              <span className={`text-base font-extrabold ${count > 0 ? 'text-text-main' : 'text-gray-400'}`}>
                {count}
              </span>
              <span className="text-[10px] font-semibold text-muted-text truncate w-full group-hover:text-brand mt-0.5">
                {config.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
