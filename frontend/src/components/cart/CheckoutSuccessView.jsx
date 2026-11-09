import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatOrderNumber } from '../../utils/format';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

/**
 * CheckoutSuccessView Component
 * Renders confirmed order details and action buttons after checkout.
 */
export default function CheckoutSuccessView({ order }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto py-10 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          Order placed successfully!
        </h1>
        <p className="text-sm text-muted-text">
          Your order has been sent to{' '}
          <span className="font-semibold text-text-main">{order.restaurant?.name}</span>.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white rounded-2xl border border-border p-5 text-left space-y-3 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-border/70">
          <div>
            <span className="text-xs text-muted-text block">Order number</span>
            <span className="text-base font-bold text-brand">
              {formatOrderNumber(order.id)}
            </span>
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>

        <div className="text-xs text-muted-text space-y-1">
          <p>
            <strong className="text-text-main">Deliver to:</strong> {order.delivery_address}
          </p>
          <p>
            <strong className="text-text-main">Total paid:</strong>{' '}
            {formatCurrency(order.bill_amount)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant="primary"
          onClick={() => navigate(`/orders/${order.id}`)}
          className="w-full"
        >
          Track order
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/restaurants')}
          className="w-full"
        >
          Back to restaurants
        </Button>
      </div>
    </div>
  );
}
