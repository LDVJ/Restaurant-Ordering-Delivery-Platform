import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';

/**
 * CartSummaryCard Component
 * Displays the bill summary without invented fees, and the checkout action.
 */
export default function CartSummaryCard({ subtotal, totalItems, onCheckout }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xs text-left space-y-4">
      <h3 className="font-bold text-base sm:text-lg text-text-main">
        Bill details
      </h3>

      {/* Breakdown */}
      <div className="space-y-2.5 text-sm text-muted-text">
        <div className="flex items-center justify-between">
          <span>
            Item total ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
          <span className="font-semibold text-text-main">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-bold text-base text-text-main">To pay</span>
            <p className="text-[11px] text-muted-text">No extra charges</p>
          </div>
          <span className="font-extrabold text-xl text-brand">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onCheckout}
        icon={ArrowRight}
        className="w-full justify-center shadow-xs"
      >
        Proceed to checkout
      </Button>

      {/* Simulation Notice */}
      <p className="text-center text-[11px] text-muted-text pt-1">
        Payment is simulated. No real money is charged.
      </p>
    </div>
  );
}
