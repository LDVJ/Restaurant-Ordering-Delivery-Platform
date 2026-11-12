import { useState } from 'react';
import { PAYMENT_STATUS_CONFIG, RETURN_STATUS_CONFIG } from '../../utils/constants';
import { formatDateTime, canAssign } from '../../utils/format';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import OrderTimeline from '../order/OrderTimeline';
import OwnerOrderDetailContent from './OwnerOrderDetailContent';

export default function OwnerOrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusAction,
  onOpenAssign,
  isActionLoading = false,
}) {
  const [activeTab, setActiveTab] = useState('details');
  if (!order) return null;

  const shortId = order.id.slice(0, 8).toUpperCase();
  const payConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.MOCK_PAID;
  const retStatus = order.return_status || (typeof order.return_request === 'string' ? order.return_request : order.return_request?.status);
  const retConfig = retStatus ? RETURN_STATUS_CONFIG[retStatus] : null;

  const renderAction = () => {
    if (order.status === 'PLACED') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          isLoading={isActionLoading}
          onClick={() => onStatusAction(order, 'ACCEPTED')}
        >
          Accept order
        </Button>
      );
    }
    if (order.status === 'ACCEPTED') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          isLoading={isActionLoading}
          onClick={() => onStatusAction(order, 'PREPARING')}
        >
          Start preparing
        </Button>
      );
    }
    if (order.status === 'PREPARING') {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          isLoading={isActionLoading}
          onClick={() => onStatusAction(order, 'READY')}
        >
          Mark ready
        </Button>
      );
    }
    if (canAssign(order)) {
      return (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={isActionLoading}
          onClick={() => onOpenAssign(order)}
        >
          Assign delivery partner
        </Button>
      );
    }
    if (order.status === 'READY' && order.delivery_partner) {
      return (
        <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
          Assigned to {order.delivery_partner.name} ({order.delivery_partner.phone})
        </span>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Order #${shortId}`} size="lg">
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={order.status} />
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${payConfig.bg} ${payConfig.text}`}>
              {payConfig.label}
            </span>
            {retConfig && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${retConfig.bg} ${retConfig.text}`}>
                {retConfig.label}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-text">{formatDateTime(order.created_at)}</span>
        </div>

        <div className="flex border-b border-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'details' ? 'border-brand text-brand' : 'border-transparent text-muted-text hover:text-text-main'
            }`}
          >
            Order Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'timeline' ? 'border-brand text-brand' : 'border-transparent text-muted-text hover:text-text-main'
            }`}
          >
            Tracking Timeline
          </button>
        </div>

        {activeTab === 'timeline' ? (
          <div className="py-2">
            <OrderTimeline status={order.status} />
          </div>
        ) : (
          <OwnerOrderDetailContent order={order} />
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {renderAction()}
        </div>
      </div>
    </Modal>
  );
}
