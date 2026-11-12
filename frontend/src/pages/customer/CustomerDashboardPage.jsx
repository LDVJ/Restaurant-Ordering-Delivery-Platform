import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOrders, cancelOrder } from '../../api/orderApi';
import { useConfirm } from '../../context/ConfirmContext';
import { getErrorMessage } from '../../utils/errors';

import OrderCard from '../../components/order/OrderCard';
import OrderFilters from '../../components/order/OrderFilters';
import OrderListSkeleton from '../../components/order/OrderListSkeleton';
import ReviewModal from '../../components/order/ReviewModal';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [reviewingOrder, setReviewingOrder] = useState(null);

  const requestIdRef = useRef(0);

  useEffect(() => {
    let ignore = false;
    async function loadOrders() {
      const currentReqId = ++requestIdRef.current;
      setIsLoading(true);
      try {
        const params = {
          page,
          page_size: 10,
          ...(filters.status && { status: filters.status }),
          ...(filters.date_from && { date_from: filters.date_from }),
          ...(filters.date_to && { date_to: filters.date_to }),
        };
        const data = await getOrders(params);
        if (!ignore && currentReqId === requestIdRef.current) {
          let list = data.items || [];
          if (filters.search) {
            const q = filters.search.toLowerCase();
            list = list.filter((o) =>
              o.restaurant?.name?.toLowerCase().includes(q) ||
              o.items?.some((i) => i.item_name?.toLowerCase().includes(q)) ||
              o.id?.toLowerCase().includes(q)
            );
          }
          setOrders(list);
          setTotal(data.total || list.length);
          setTotalPages(data.total_pages || 1);
          setError(null);
        }
      } catch (err) {
        if (!ignore && currentReqId === requestIdRef.current) setError(getErrorMessage(err));
      } finally {
        if (!ignore && currentReqId === requestIdRef.current) setIsLoading(false);
      }
    }
    loadOrders();
    return () => { ignore = true; };
  }, [page, filters, reloadTrigger]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    setIsLoading(true);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', status: '', date_from: '', date_to: '' });
    setPage(1);
    setIsLoading(true);
  };

  const handleCancelOrder = async (orderId) => {
    const ok = await confirm({
      title: 'Cancel this order?',
      message: 'This order will be cancelled and your payment will be refunded.',
      confirmText: 'Yes, cancel order',
      cancelText: 'Keep order',
      variant: 'danger',
    });
    if (!ok) return;

    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success('Order cancelled');
      setReloadTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">My Orders</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">Track active deliveries, review past campus orders, or rate your meals.</p>
      </div>

      <OrderFilters filters={filters} onApply={handleApplyFilters} onReset={handleResetFilters} />

      {isLoading ? (
        <OrderListSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load orders"
          message={error}
          onRetry={() => { setIsLoading(true); setReloadTrigger((prev) => prev + 1); }}
        />
      ) : orders.length === 0 ? (
        <div className="py-10">
          <EmptyState
            title="No orders found"
            description={
              filters.status || filters.date_from || filters.date_to || filters.search
                ? 'No orders match your selected filters. Try clearing them.'
                : "You haven't placed any campus orders yet. Explore our kitchens!"
            }
            icon={ShoppingBag}
            actionText={
              filters.status || filters.date_from || filters.date_to || filters.search ? 'Reset filters' : 'Browse restaurants'
            }
            onAction={
              filters.status || filters.date_from || filters.date_to || filters.search ? handleResetFilters : () => navigate('/restaurants')
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-muted-text flex justify-between items-center px-1">
            <span>Showing {orders.length} of {total} orders</span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancelOrder}
                onReview={(ord) => setReviewingOrder(ord)}
                isCancelling={cancellingId === order.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-4 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(newPage) => { setIsLoading(true); setPage(newPage); }}
              />
            </div>
          )}
        </div>
      )}

      {reviewingOrder && (
        <ReviewModal
          isOpen={Boolean(reviewingOrder)}
          onClose={() => setReviewingOrder(null)}
          orderId={reviewingOrder.id}
          restaurantName={reviewingOrder.restaurant?.name}
          onSubmitSuccess={() => {
            setOrders((prev) => prev.map((o) => (o.id === reviewingOrder.id ? { ...o, has_review: true } : o)));
          }}
        />
      )}
    </div>
  );
}
