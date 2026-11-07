import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useConfirm } from '../../context/ConfirmContext';

import CartItemRow from '../../components/cart/CartItemRow';
import CartSummaryCard from '../../components/cart/CartSummaryCard';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

export default function CartPage() {
  const {
    items,
    restaurantId,
    restaurantName,
    totalItems,
    subtotal,
    increase,
    decrease,
    removeItem,
    clearCart,
  } = useCart();

  const confirm = useConfirm();
  const navigate = useNavigate();

  const handleClearCart = async () => {
    const ok = await confirm({
      title: 'Clear cart?',
      message: 'Are you sure you want to remove all items from your cart?',
      confirmText: 'Yes, clear cart',
      cancelText: 'Keep items',
      variant: 'danger',
    });

    if (ok) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    // Section 14: customer checkout / order placement is the next feature step
    toast('Checkout flow is coming in the next update!', {
      icon: '🚀',
    });
  };

  if (items.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          title="Your cart is empty"
          description="Explore delicious meals from campus restaurants and add dishes to get started."
          icon={ShoppingBag}
          actionText="Browse restaurants"
          onAction={() => navigate('/restaurants')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {restaurantId ? (
          <Link
            to={`/restaurants/${restaurantId}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-text hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Add more items</span>
          </Link>
        ) : (
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-text hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse restaurants</span>
          </Link>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearCart}
          icon={Trash2}
          className="text-muted-text hover:text-danger hover:bg-red-50 text-xs"
        >
          Clear cart
        </Button>
      </div>

      {/* Page Title & Restaurant Source */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          Your Cart
        </h1>
        {restaurantName && (
          <p className="text-xs sm:text-sm text-muted-text mt-1">
            Ordering from{' '}
            <span className="font-semibold text-text-main">{restaurantName}</span>
          </p>
        )}
      </div>

      {/* Cart Content: Items List + Bill Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Items List (Left Column) */}
        <div className="lg:col-span-7 space-y-3">
          {items.map((item) => (
            <CartItemRow
              key={item.menu_item_id}
              item={item}
              onIncrease={increase}
              onDecrease={decrease}
              onRemove={removeItem}
            />
          ))}

          {/* Add more dishes banner */}
          {restaurantId && (
            <Link
              to={`/restaurants/${restaurantId}`}
              className="block p-3.5 rounded-xl border border-dashed border-border hover:border-brand/40 bg-white/60 hover:bg-white text-center text-xs font-semibold text-brand transition-colors"
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add more dishes from {restaurantName}</span>
              </span>
            </Link>
          )}
        </div>

        {/* Bill Summary (Right Column) */}
        <div className="lg:col-span-5 sticky top-20">
          <CartSummaryCard
            subtotal={subtotal}
            totalItems={totalItems}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
