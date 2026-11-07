import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

/**
 * CartItemRow Component
 * Displays dish name, unit price, quantity stepper, line total, and remove button.
 */
export default function CartItemRow({ item, onIncrease, onDecrease, onRemove }) {
  const lineTotal = Number(item.price) * item.quantity;

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-border bg-white text-left flex items-center justify-between gap-3 sm:gap-4 transition-colors hover:border-gray-300">
      {/* Item Info */}
      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-semibold text-sm sm:text-base text-text-main truncate">
          {item.name}
        </h4>
        <p className="text-xs text-muted-text mt-0.5">
          {formatCurrency(item.price)} each
        </p>
      </div>

      {/* Stepper Controls */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="inline-flex items-center rounded-lg border border-brand bg-brand text-white shadow-2xs select-none">
          <button
            type="button"
            onClick={() => onDecrease(item.menu_item_id)}
            aria-label={`Decrease quantity of ${item.name}`}
            className="p-1 px-2 hover:bg-brand-dark transition-colors cursor-pointer text-white flex items-center justify-center focus:outline-none"
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          <span
            className="px-2 font-bold text-xs min-w-[20px] text-center"
            aria-label={`${item.quantity} items`}
          >
            {item.quantity}
          </span>

          <button
            type="button"
            disabled={item.quantity >= 20}
            onClick={() => onIncrease(item.menu_item_id)}
            aria-label={`Increase quantity of ${item.name}`}
            className="p-1 px-2 hover:bg-brand-dark transition-colors cursor-pointer text-white flex items-center justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Line Total */}
        <span className="font-bold text-sm text-text-main min-w-[65px] text-right">
          {formatCurrency(lineTotal)}
        </span>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.menu_item_id)}
          aria-label={`Remove ${item.name} from cart`}
          className="p-1.5 rounded-lg text-muted-text hover:text-danger hover:bg-red-50 transition-colors cursor-pointer"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
