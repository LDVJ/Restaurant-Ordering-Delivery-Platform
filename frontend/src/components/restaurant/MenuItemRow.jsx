import { formatCurrency } from '../../utils/format';
import AddToCartButton from './AddToCartButton';

/**
 * MenuItemRow Component
 * Displays dish name, price in INR, description, and Swiggy-style AddToCart stepper.
 */
export default function MenuItemRow({ dish, restaurant }) {
  const isAvailable = dish?.is_available !== false;

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border border-border bg-white transition-all text-left flex items-start justify-between gap-4 ${
        !isAvailable ? 'opacity-65 bg-gray-50/70' : 'hover:border-gray-300'
      }`}
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <h4
            className={`font-semibold text-sm sm:text-base ${
              isAvailable ? 'text-text-main' : 'text-muted-text line-through'
            }`}
          >
            {dish.name}
          </h4>

          {!isAvailable && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">
              Unavailable
            </span>
          )}
        </div>

        <div className="mt-1 font-bold text-sm text-text-main">
          {formatCurrency(dish.price)}
        </div>

        {dish.description && (
          <p className="mt-1.5 text-xs text-muted-text line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        )}
      </div>

      <div className="shrink-0 flex items-center justify-end pt-1">
        <AddToCartButton dish={dish} restaurant={restaurant} />
      </div>
    </div>
  );
}
