import { Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

/**
 * AddToCartButton Component
 * Swiggy-style button that transitions from 'ADD +' into an active quantity stepper.
 */
export default function AddToCartButton({ dish, restaurant, className = '' }) {
  const { getItemQuantity, addItem, increase, decrease } = useCart();
  const quantity = getItemQuantity(dish?.id);

  if (!dish?.is_available) {
    return (
      <span
        className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed select-none ${className}`}
      >
        Unavailable
      </span>
    );
  }

  // Active stepper when item is already in cart
  if (quantity > 0) {
    return (
      <div
        className={`inline-flex items-center rounded-lg border border-brand bg-brand text-white shadow-2xs select-none ${className}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            decrease(dish.id);
          }}
          aria-label={`Decrease quantity of ${dish.name}`}
          className="p-1 px-2.5 hover:bg-brand-dark transition-colors cursor-pointer text-white flex items-center justify-center focus:outline-none"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <span
          className="px-2 font-bold text-xs min-w-[20px] text-center"
          aria-label={`${quantity} in cart`}
        >
          {quantity}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            increase(dish.id);
          }}
          aria-label={`Increase quantity of ${dish.name}`}
          className="p-1 px-2.5 hover:bg-brand-dark transition-colors cursor-pointer text-white flex items-center justify-center focus:outline-none"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    );
  }

  // Initial ADD button
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        addItem(dish, restaurant);
      }}
      className={`inline-flex items-center justify-center gap-1 text-xs font-bold px-4 py-1.5 rounded-lg border border-brand text-brand bg-white hover:bg-brand-tint/60 shadow-2xs transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`}
    >
      <span>ADD</span>
      <Plus className="w-3 h-3 stroke-[2.5]" />
    </button>
  );
}
