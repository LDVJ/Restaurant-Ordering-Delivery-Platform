import { ShoppingBag, TrendingUp, Star, RotateCcw, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function OwnerStatCards({ stats }) {
  const cards = [
    {
      label: "Today's Orders",
      value: stats?.today_orders ?? 0,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders ?? 0,
      icon: ShoppingBag,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.revenue || 0),
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Average Rating',
      value: stats?.avg_rating ? `${stats.avg_rating} ★` : 'No reviews',
      subtext: stats?.review_count ? `${stats.review_count} reviews` : 'New kitchen',
      icon: Star,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Pending Returns',
      value: stats?.pending_returns ?? 0,
      icon: RotateCcw,
      color: 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-text">{c.label}</span>
              <div className={`p-1.5 rounded-lg ${c.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-tight">{c.value}</p>
              {c.subtext && <p className="text-[11px] text-muted-text mt-0.5">{c.subtext}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
