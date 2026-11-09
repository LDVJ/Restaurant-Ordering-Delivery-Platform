import { UtensilsCrossed } from 'lucide-react';

export default function OwnerTopItems({ topItems = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-2xs space-y-3 text-left">
      <div className="flex items-center gap-2 border-b border-border/70 pb-3">
        <UtensilsCrossed className="w-4 h-4 text-brand" />
        <h2 className="text-sm font-bold text-text-main">Top Ordered Items</h2>
      </div>

      {topItems.length === 0 ? (
        <p className="text-xs text-muted-text py-4 text-center">No delivered orders yet.</p>
      ) : (
        <div className="space-y-2">
          {topItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 border border-border/60 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-5 h-5 rounded-md bg-brand-tint text-brand font-bold text-[10px] flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <span className="font-semibold text-text-main truncate">{item.item_name}</span>
              </div>
              <span className="font-bold text-muted-text shrink-0">{item.quantity} ordered</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
