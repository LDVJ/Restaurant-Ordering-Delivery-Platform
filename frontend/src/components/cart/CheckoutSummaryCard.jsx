import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';

/**
 * CheckoutSummaryCard Component
 * Displays order items list, bill subtotal, and the place order submit button.
 */
export default function CheckoutSummaryCard({
  items,
  restaurantName,
  totalItems,
  subtotal,
  isSubmitting,
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-2xs sticky top-20">
      <div>
        <h2 className="text-base font-bold text-text-main">Order Summary</h2>
        {restaurantName && (
          <p className="text-xs text-muted-text mt-0.5">
            From <span className="font-semibold text-text-main">{restaurantName}</span>
          </p>
        )}
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 divide-y divide-border/60">
        {items.map((item) => (
          <div key={item.menu_item_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-text-main">{item.name}</span>
              <span className="text-muted-text block">Qty: {item.quantity}</span>
            </div>
            <span className="font-medium text-text-main">
              {formatCurrency(Number(item.price) * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2 text-xs">
        <div className="flex justify-between text-muted-text">
          <span>Items total ({totalItems})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-text">
          <span>Delivery & taxes</span>
          <span className="text-emerald-600 font-medium">No extra charges</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-text-main pt-2 border-t border-border/80">
          <span>To pay</span>
          <span className="text-brand">{formatCurrency(subtotal)}</span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="w-full mt-2 h-11"
      >
        Place order • {formatCurrency(subtotal)}
      </Button>
    </div>
  );
}
