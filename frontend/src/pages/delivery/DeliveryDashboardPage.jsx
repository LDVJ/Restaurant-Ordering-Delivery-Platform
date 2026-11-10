import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Bike } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { usePolling } from '../../hooks/usePolling';
import * as deliveryApi from '../../api/deliveryApi';
import { getErrorMessage } from '../../utils/errors';
import { formatOrderNumber } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import DeliveryHeader from '../../components/delivery/DeliveryHeader';
import DeliveryOrderCard from '../../components/delivery/DeliveryOrderCard';
import DeliveryOrderDetailModal from '../../components/delivery/DeliveryOrderDetailModal';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      const params = { page, page_size: 10 };
      if (activeTab === 'history') params.status = 'DELIVERED';
      const data = await deliveryApi.getDeliveryOrders(params);
      setOrders(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setError(null);
    } catch (err) {
      if (!isSilent) setError(getErrorMessage(err));
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = { page, page_size: 10 };
        if (activeTab === 'history') params.status = 'DELIVERED';
        const data = await deliveryApi.getDeliveryOrders(params);
        if (!ignore) {
          setOrders(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.total_pages || 1);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [activeTab, page]);

  usePolling(() => fetchOrders(true), 30000);

  const handleOpenDetail = async (orderSummary) => {
    try {
      const full = await deliveryApi.getDeliveryOrderById(orderSummary.id);
      setSelectedOrder(full);
    } catch {
      setSelectedOrder(orderSummary);
    }
    setIsDetailOpen(true);
  };

  const handleStartDelivery = async (order) => {
    const shortId = formatOrderNumber(order.id);
    const ok = await confirm({
      title: 'Start delivery?',
      message: `Confirm pickup for ${shortId} from ${order.restaurant?.name}? You will now be en route to the customer.`,
      confirmText: 'Start delivery',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setActionLoadingId(order.id);
    try {
      const updated = await deliveryApi.updateDeliveryStatus(order.id, 'OUT_FOR_DELIVERY');
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'OUT_FOR_DELIVERY' } : o)));
      if (selectedOrder?.id === order.id) setSelectedOrder(updated);
      toast.success('Delivery started! En route to customer');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleMarkDelivered = async (order) => {
    const shortId = formatOrderNumber(order.id);
    const ok = await confirm({
      title: 'Mark as delivered?',
      message: `Confirm ${shortId} has been successfully delivered to ${order.customer_name}?`,
      confirmText: 'Confirm delivery',
      cancelText: 'Keep active',
    });
    if (!ok) return;

    setActionLoadingId(order.id);
    try {
      const updated = await deliveryApi.updateDeliveryStatus(order.id, 'DELIVERED');
      if (activeTab === 'active') {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'DELIVERED' } : o)));
      }
      if (selectedOrder?.id === order.id) setSelectedOrder(updated);
      toast.success('Order marked delivered successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-16">
      <DeliveryHeader
        user={user}
        activeTab={activeTab}
        activeCount={total}
        onTabChange={(tab) => { setActiveTab(tab); setPage(1); setIsLoading(true); }}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-danger rounded-xl text-xs">{error}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Bike}
          title={activeTab === 'active' ? 'No active deliveries' : 'No delivery history'}
          description={
            activeTab === 'active'
              ? 'You have no assigned orders waiting for delivery right now.'
              : 'You have not completed any deliveries yet.'
          }
          actionLabel={activeTab === 'history' ? 'Check active queue' : undefined}
          onAction={activeTab === 'history' ? () => { setActiveTab('active'); setPage(1); setIsLoading(true); } : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <DeliveryOrderCard
                key={order.id}
                order={order}
                onOpenDetail={handleOpenDetail}
                onStartDelivery={handleStartDelivery}
                onMarkDelivered={handleMarkDelivered}
                isActionLoading={actionLoadingId === order.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={(p) => { setPage(p); setIsLoading(true); }} />
          )}
        </div>
      )}

      {isDetailOpen && selectedOrder && (
        <DeliveryOrderDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          order={selectedOrder}
          onStartDelivery={handleStartDelivery}
          onMarkDelivered={handleMarkDelivered}
          isActionLoading={actionLoadingId === selectedOrder.id}
        />
      )}
    </div>
  );
}
