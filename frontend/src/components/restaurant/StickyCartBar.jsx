import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/format';

/**
 * StickyCartBar Component
 * Floats at the bottom of the screen when items exist in the cart.
 * Sourced from Section 12 of Frontend Guide.
 */
export default function StickyCartBar() {
  const { totalItems, subtotal, restaurantName } = useCart();

  if (totalItems === 0) return null;

  return (
    <aside
      aria-label="Current cart summary"
      className="fixed bottom-4 inset-x-3 sm:inset-x-6 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-text-main text-white rounded-2xl shadow-2xl p-3 sm:p-3.5 px-4 sm:px-5 flex items-center justify-between gap-3 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>

          <div className="flex flex-col text-left min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold truncate">
              <span>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
              <span>•</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
            {restaurantName && (
              <span className="text-[11px] text-gray-300 truncate">
                From {restaurantName}
              </span>
            )}
          </div>
        </div>

        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-brand text-white hover:bg-brand-dark transition-colors shrink-0 shadow-sm"
        >
          <span>View cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
