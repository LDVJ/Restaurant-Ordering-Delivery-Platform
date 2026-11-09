import { formatCurrency } from '../../utils/format';

/**
 * OrderDetailItems Component
 * Renders ordered items table with unit prices, quantities, and bill total.
 */
export default function OrderDetailItems({ items = [], billAmount }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-4">
      <h3 className="text-sm font-bold text-text-main uppercase tracking-wider">
        Ordered Items ({items.length})
      </h3>

      <div className="divide-y divide-border/60">
        {items.map((item) => (
          <div
            key={item.id || item.menu_item_id}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm"
          >
            <div>
              <p className="font-semibold text-text-main">{item.item_name}</p>
              <p className="text-muted-text text-[11px] sm:text-xs">
                {formatCurrency(item.unit_price)} × {item.quantity}
              </p>
            </div>
            <span className="font-bold text-text-main">
              {formatCurrency(Number(item.unit_price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-muted-text">
          <span>Items total</span>
          <span>{formatCurrency(billAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-text">
          <span>Delivery & taxes</span>
          <span className="text-emerald-600 font-medium">No extra charges</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base font-bold text-text-main pt-2 border-t border-border/80">
          <span>Total bill</span>
          <span className="text-brand">{formatCurrency(billAmount)}</span>
        </div>
      </div>
    </div>
  );
}
