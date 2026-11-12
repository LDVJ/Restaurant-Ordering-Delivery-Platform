import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Package } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import { usePolling } from '../../hooks/usePolling';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import { formatCurrency } from '../../utils/format';
import { ORDER_ACTION_CONFIGS } from '../../utils/constants';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import OwnerOrderFilters from '../../components/owner/OwnerOrderFilters';
import OwnerOrderCard from '../../components/owner/OwnerOrderCard';
import OwnerOrderDetailModal from '../../components/owner/OwnerOrderDetailModal';
import AssignPartnerModal from '../../components/owner/AssignPartnerModal';

export default function OwnerOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshBadges } = useOutletContext();
  const confirm = useConfirm();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ status: searchParams.get('status') || '', date_from: '', date_to: '' });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (!orderId) return;
    let ignore = false;
    (async () => {
      const found = orders.find((o) => o.id === orderId);
      if (found) { setSelectedOrder(found); setIsDetailOpen(true); }
      else {
        try {
          const d = await ownerApi.getOwnerOrderById(orderId);
          if (!ignore && d) { setSelectedOrder(d); setIsDetailOpen(true); }
        } catch { /* ignore */ }
      }
    })();
    return () => { ignore = true; };
  }, [searchParams, orders]);

  const buildParams = (p, f) => ({
    page: p, page_size: 10,
    ...(f.status && { status: f.status }),
    ...(f.date_from && { date_from: f.date_from }),
    ...(f.date_to && { date_to: f.date_to }),
  });

  const refreshOrders = useCallback(async () => {
    try {
      const data = await ownerApi.getOwnerOrders(buildParams(page, filters));
      setOrders(data.items || []); setTotal(data.total || 0); setTotalPages(data.total_page || data.total_pages || 1);
    } catch { /* silent */ }
  }, [page, filters]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const reqId = ++requestIdRef.current;
      setIsLoading(true);
      try {
        const data = await ownerApi.getOwnerOrders(buildParams(page, filters));
        if (!ignore && reqId === requestIdRef.current) {
          setOrders(data.items || []); setTotal(data.total || 0); setTotalPages(data.total_page || data.total_pages || 1); setError(null);
        }
      } catch (err) {
        if (!ignore && reqId === requestIdRef.current) setError(getErrorMessage(err));
      } finally {
        if (!ignore && reqId === requestIdRef.current) setIsLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [page, filters]);

  usePolling(refreshOrders, 30000);

  const handleOpenDetail = (orderItem) => { setSelectedOrder(orderItem); setIsDetailOpen(true); };

  const handleApplyFilters = (newFilters) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newFilters.status) nextParams.set('status', newFilters.status); else nextParams.delete('status');
    setSearchParams(nextParams); setFilters(newFilters); setPage(1);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('status');
    setSearchParams(nextParams); setFilters({ status: '', date_from: '', date_to: '' }); setPage(1);
  };

  const handleStatusAction = async (order, nextStatus) => {
    const shortId = order.id.slice(0, 8).toUpperCase();
    const cfg = ORDER_ACTION_CONFIGS[nextStatus];
    if (!cfg) return;

    const ok = await confirm({
      title: cfg.title,
      message: cfg.msg(shortId, order.customer?.name || order.customer_name || 'customer', formatCurrency(order.bill_amount)),
      confirmText: cfg.confirmText, cancelText: 'Cancel',
    });
    if (!ok) return;

    setIsActionLoading(true);
    try {
      const res = await ownerApi.updateOrderStatus(order.id, nextStatus);
      const isOrderObj = res && typeof res === 'object' && res.id;
      const updated = isOrderObj ? res : await ownerApi.getOwnerOrderById(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      if (selectedOrder?.id === order.id) setSelectedOrder(updated);
      toast.success(`Order moved to ${nextStatus}`);
      if (refreshBadges) refreshBadges();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAssignSuccess = async (res) => {
    const updated = (res && typeof res === 'object' && res.id) ? res : await ownerApi.getOwnerOrderById(selectedOrder?.id || assigningOrder?.id);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
    toast.success('Delivery partner assigned');
    if (refreshBadges) refreshBadges();
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Orders Management</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">Live kitchen order progression, partner dispatching, and tracking.</p>
      </div>

      <OwnerOrderFilters filters={filters} onApply={handleApplyFilters} onReset={handleResetFilters} />

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-28 w-full rounded-2xl" /><Skeleton className="h-28 w-full rounded-2xl" /></div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-danger rounded-xl text-xs">{error}</div>
      ) : orders.length === 0 ? (
        <EmptyState icon={Package} title="No orders found" description="No orders match your filter criteria." actionLabel="Reset filters" onAction={handleResetFilters} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <OwnerOrderCard key={order.id} order={order} onOpenDetail={handleOpenDetail} onStatusAction={handleStatusAction} onOpenAssign={(o) => setAssigningOrder(o)} isActionLoading={isActionLoading} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={(p) => { setPage(p); setIsLoading(true); }} />
          )}
        </div>
      )}

      {isDetailOpen && selectedOrder && (
        <OwnerOrderDetailModal
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); if (searchParams.get('order')) setSearchParams(filters.status ? { status: filters.status } : {}); }}
          order={selectedOrder}
          onStatusAction={handleStatusAction}
          onOpenAssign={(o) => setAssigningOrder(o)}
          isActionLoading={isActionLoading}
        />
      )}
      {assigningOrder && (
        <AssignPartnerModal
          isOpen={Boolean(assigningOrder)}
          onClose={() => setAssigningOrder(null)}
          order={assigningOrder}
          onAssignSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}
