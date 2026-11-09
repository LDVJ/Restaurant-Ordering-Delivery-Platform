import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import { getOrderById, cancelOrder, devAdvanceOrderStatus } from '../../api/orderApi';
import { useConfirm } from '../../context/ConfirmContext';
import { usePolling } from '../../hooks/usePolling';
import { getErrorMessage } from '../../utils/errors';

import Skeleton from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import OrderTimeline from '../../components/order/OrderTimeline';
import OrderDetailHeader from '../../components/order/OrderDetailHeader';
import OrderDetailItems from '../../components/order/OrderDetailItems';
import OrderPartyDetails from '../../components/order/OrderPartyDetails';
import ReviewModal from '../../components/order/ReviewModal';
import ReturnRequestModal from '../../components/order/ReturnRequestModal';

export default function OrderDetailPage() {
  const { id } = useParams();
  const confirm = useConfirm();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadOrder() {
      try {
        const data = await getOrderById(id);
        if (!ignore) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadOrder();
    return () => {
      ignore = true;
    };
  }, [id, reloadTrigger]);

  const isTerminal = ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order?.status);
  usePolling(async () => {
    if (!id || isTerminal) return;
    const latest = await getOrderById(id);
    setOrder(latest);
  }, 20000, !isTerminal && Boolean(order));

  const handleCancel = async () => {
    const ok = await confirm({
      title: 'Cancel this order?',
      message: 'This order will be cancelled and payment refunded.',
      confirmText: 'Yes, cancel order',
      cancelText: 'Keep order',
      variant: 'danger',
    });
    if (!ok) return;

    setIsCancelling(true);
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDevAdvance = async () => {
    setIsAdvancing(true);
    try {
      const advanced = await devAdvanceOrderStatus(id);
      setOrder(advanced);
      toast.success(`Advanced status to: ${advanced.status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsAdvancing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6 text-left">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-left">
        <ErrorState
          title="Order not found"
          message={error || 'Could not locate the requested order.'}
          actionText="Back to my orders"
          onAction={() => {
            setIsLoading(true);
            setReloadTrigger((prev) => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-left max-w-4xl mx-auto">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-text hover:text-brand transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to my orders</span>
      </Link>

      <OrderDetailHeader
        order={order}
        onDevAdvance={handleDevAdvance}
        isAdvancing={isAdvancing}
        isTerminal={isTerminal}
      />

      <OrderTimeline status={order.status} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <OrderPartyDetails
            order={order}
            onCancel={handleCancel}
            onOpenReview={() => setIsReviewModalOpen(true)}
            onOpenReturn={() => setIsReturnModalOpen(true)}
            isCancelling={isCancelling}
          />
        </div>

        <div className="lg:col-span-5 sticky top-20">
          <OrderDetailItems items={order.items} billAmount={order.bill_amount} />
        </div>
      </div>

      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          orderId={order.id}
          restaurantName={order.restaurant?.name}
          onSubmitSuccess={(reviewData) => {
            setOrder((prev) => ({ ...prev, review: reviewData, has_review: true }));
          }}
        />
      )}

      {isReturnModalOpen && (
        <ReturnRequestModal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          orderId={order.id}
          restaurantName={order.restaurant?.name}
          onSubmitSuccess={(returnData) => {
            setOrder((prev) => ({
              ...prev,
              return_request: returnData,
              return_status: returnData.status,
            }));
          }}
        />
      )}
    </div>
  );
}
