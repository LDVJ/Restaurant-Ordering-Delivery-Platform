import { Store, Phone, Bike, MapPin, Ban, Star, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import { ORDER_STATUSES } from '../../utils/constants';
import OrderReviewCard from './OrderReviewCard';
import OrderReturnCard from './OrderReturnCard';

/**
 * OrderPartyDetails Component
 * Renders restaurant contact, delivery partner, delivery address, review card,
 * return card, and lifecycle action buttons (Cancel, Rate, Return).
 */
export default function OrderPartyDetails({
  order,
  onCancel,
  onOpenReview,
  onOpenReturn,
  isCancelling = false,
}) {
  const isPlaced = order.status === ORDER_STATUSES.PLACED;
  const isDelivered = order.status === ORDER_STATUSES.DELIVERED;
  const canReview = isDelivered && !order.review;
  const canReturn = isDelivered && !order.return_request && order.status !== 'REFUNDED';

  return (
    <div className="space-y-4">
      {/* Restaurant Card */}
      <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-2">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Store className="w-4 h-4 text-brand" />
          <span>Restaurant Details</span>
        </h3>
        <p className="text-sm font-semibold text-text-main">{order.restaurant.name}</p>
        <p className="text-xs text-muted-text">{order.restaurant.address}</p>

        {order.restaurant.phone && (
          <div className="pt-2">
            <a
              href={`tel:${order.restaurant.phone}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call restaurant ({order.restaurant.phone})</span>
            </a>
          </div>
        )}
      </div>

      {/* Delivery Partner Card */}
      <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-2">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <Bike className="w-4 h-4 text-brand" />
          <span>Delivery Partner</span>
        </h3>
        {order.delivery_partner ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text-main">{order.delivery_partner.name}</p>
            <a
              href={`tel:${order.delivery_partner.phone}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-brand hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call partner ({order.delivery_partner.phone})</span>
            </a>
          </div>
        ) : (
          <p className="text-xs text-muted-text">
            A campus delivery partner will be assigned once the kitchen readies your order.
          </p>
        )}
      </div>

      {/* Delivery Address & Contact Card */}
      <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-2">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          <span>Delivery Address</span>
        </h3>
        <p className="text-xs text-text-main leading-relaxed">{order.delivery_address}</p>
        <p className="text-xs text-muted-text pt-1">
          Contact: <span className="font-semibold text-text-main">{order.contact_phone}</span>
        </p>
      </div>

      {/* Submitted Review Display */}
      {order.review && <OrderReviewCard review={order.review} />}

      {/* Return Request Display */}
      {order.return_request && <OrderReturnCard returnRequest={order.return_request} />}

      {/* Action Buttons: Cancel, Rate, Return */}
      {isPlaced && !isCancelling && (
        <div className="pt-2">
          <Button
            variant="danger"
            onClick={onCancel}
            isLoading={isCancelling}
            disabled={isCancelling}
            icon={Ban}
            className="w-full"
          >
            Cancel order
          </Button>
        </div>
      )}

      {(canReview || canReturn) && (
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          {canReview && (
            <Button
              variant="secondary"
              onClick={onOpenReview}
              icon={Star}
              className="w-full text-amber-700 bg-amber-50/80 border-amber-200 hover:bg-amber-100"
            >
              Rate your order
            </Button>
          )}

          {canReturn && (
            <Button
              variant="ghost"
              onClick={onOpenReturn}
              icon={RotateCcw}
              className="w-full text-xs text-muted-text hover:text-danger hover:bg-red-50 border border-border/80"
            >
              Request return
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
