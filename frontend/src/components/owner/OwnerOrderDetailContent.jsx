import { Phone, MapPin, Bike, User, ShieldAlert } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function OwnerOrderDetailContent({ order }) {
  return (
    <div className="space-y-4 text-xs">
      {/* Customer & Delivery Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-gray-50 border border-border/70 space-y-1">
          <p className="font-semibold text-text-main flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted-text" />
            <span>Customer Details</span>
          </p>
          <p className="font-bold text-text-main">{order.customer?.name || order.customer_name}</p>
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="inline-flex items-center gap-1 text-brand hover:underline font-medium">
              <Phone className="w-3 h-3" />
              <span>{order.customer.phone}</span>
            </a>
          )}
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-border/70 space-y-1">
          <p className="font-semibold text-text-main flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-muted-text" />
            <span>Delivery Address</span>
          </p>
          <p className="text-text-main leading-relaxed">{order.delivery_address}</p>
        </div>
      </div>

      {/* Assigned Partner */}
      {order.delivery_partner && (
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-text-main">Assigned Partner: {order.delivery_partner.name}</p>
              <a href={`tel:${order.delivery_partner.phone}`} className="text-purple-700 hover:underline flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3" />
                <span>{order.delivery_partner.phone}</span>
              </a>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">Partner Assigned</span>
        </div>
      )}

      {/* Return Request details */}
      {order.return_request && (
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
          <p className="font-bold text-amber-900 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            <span>Return Request ({order.return_request.status})</span>
          </p>
          <p className="text-amber-800">Reason: {order.return_request.reason}</p>
        </div>
      )}

      {/* Itemized Order list */}
      <div className="border border-border rounded-xl p-3 space-y-2 bg-white">
        <p className="font-bold text-text-main">Order Items</p>
        <div className="divide-y divide-border/60">
          {order.items.map((it, idx) => (
            <div key={idx} className="flex justify-between py-1.5 text-xs">
              <span>{it.quantity}x {it.item_name}</span>
              <span className="font-medium text-text-main">{it.unit_price ? formatCurrency(Number(it.unit_price) * it.quantity) : '–'}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-2 flex justify-between font-bold text-sm text-text-main">
          <span>Total Bill Amount</span>
          <span>{formatCurrency(order.bill_amount)}</span>
        </div>
      </div>
    </div>
  );
}
