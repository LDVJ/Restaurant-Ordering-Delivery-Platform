import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { Bike, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { usePolling } from '../../hooks/usePolling';
import * as deliveryApi from '../../api/deliveryApi';
import { getErrorMessage } from '../../utils/errors';
import { formatOrderNumber } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import DeliveryHeader from '../../components/delivery/DeliveryHeader';
import DeliveryOrderCard from '../../components/delivery/DeliveryOrderCard';
import DeliveryOrderDetailModal from '../../components/delivery/DeliveryOrderDetailModal';

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('active');
  const [stagedStatus, setStagedStatus] = useState('');
  const [appliedStatus, setAppliedStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const reqIdRef = useRef(0);

  const filterItems = useCallback((items, tab, status) => {
    return (tab === 'active' && !status) ? items.filter((o) => o.status !== 'DELIVERED') : items;
  }, []);

  const refreshOrders = useCallback(async () => {
    try {
      const data = await deliveryApi.getDeliveryOrders({ page, page_size: 10, ...(appliedStatus && { order_status: appliedStatus }) });
      const items = filterItems(data.items || [], activeTab, appliedStatus);
      setOrders(items); setTotal(data.total || items.length); setTotalPages(data.total_pages || 1);
    } catch { /* silent */ }
  }, [appliedStatus, page, activeTab, filterItems]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const id = ++reqIdRef.current;
      setIsLoading(true);
      try {
        const data = await deliveryApi.getDeliveryOrders({ page, page_size: 10, ...(appliedStatus && { order_status: appliedStatus }) });
        if (!ignore && id === reqIdRef.current) {
          const items = filterItems(data.items || [], activeTab, appliedStatus);
          setOrders(items); setTotal(data.total || items.length); setTotalPages(data.total_pages || 1); setError(null);
        }
      } catch (err) {
        if (!ignore && id === reqIdRef.current) setError(getErrorMessage(err));
      } finally {
        if (!ignore && id === reqIdRef.current) setIsLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [appliedStatus, page, activeTab, filterItems]);

  usePolling(refreshOrders, 30000);

  const handleApply = () => { setAppliedStatus(stagedStatus); setPage(1); };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const s = tab === 'history' ? 'DELIVERED' : '';
    setStagedStatus(s); setAppliedStatus(s); setPage(1);
  };

  const handleOpenDetail = (order) => { setSelectedOrder(order); setIsDetailOpen(true); };

  const handleStartDelivery = async (order) => {
    const ok = await confirm({
      title: 'Start delivery?',
      message: `Confirm pickup for ${formatOrderNumber(order.id)} from ${order.restaurant?.name}?`,
      confirmText: 'Start delivery', cancelText: 'Cancel',
    });
    if (!ok) return;
    setActionLoadingId(order.id);
    try {
      const updated = await deliveryApi.updateDeliveryStatus(order.id, 'OUT_FOR_DELIVERY');
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'OUT_FOR_DELIVERY' } : o)));
      if (selectedOrder?.id === order.id) setSelectedOrder(updated);
      toast.success('Delivery started! En route to customer');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionLoadingId(null); }
  };

  const handleMarkDelivered = async (order) => {
    const ok = await confirm({
      title: 'Mark as delivered?',
      message: `Confirm ${formatOrderNumber(order.id)} delivered to ${order.customer?.name || order.customer_name}?`,
      confirmText: 'Confirm delivery', cancelText: 'Keep active',
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
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setActionLoadingId(null); }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-16">
      <DeliveryHeader user={user} activeTab={activeTab} activeCount={total} onTabChange={handleTabChange} />

      {activeTab === 'active' && (
        <div className="bg-white p-4 rounded-2xl border border-border flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <select
              value={stagedStatus}
              onChange={(e) => setStagedStatus(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-white pl-3 pr-10 py-2.5 text-xs font-medium text-text-main focus:border-brand focus:outline-none"
            >
              <option value="">All Active (Assigned & Out for delivery)</option>
              <option value="ASSIGNED">Assigned only</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery only</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-text" />
          </div>
          <Button size="sm" onClick={handleApply} className="w-full sm:w-auto text-xs font-semibold py-2.5">
            Apply Filters
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-56 w-full rounded-2xl" /><Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-danger rounded-xl text-xs">{error}</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Bike}
          title={activeTab === 'history' ? 'No delivery history' : 'No deliveries found'}
          description={activeTab === 'history' ? 'You have not completed any deliveries yet.' : 'No orders match the selected filter.'}
          actionLabel={activeTab === 'history' ? 'Check active queue' : undefined}
          onAction={activeTab === 'history' ? () => handleTabChange('active') : undefined}
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
