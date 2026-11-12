import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import OwnerReturnCard from '../../components/owner/OwnerReturnCard';

const RETURN_TABS = [
  { id: '', label: 'All' },
  { id: 'REQUESTED', label: 'Requested' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

export default function OwnerReturnsPage() {
  const { refreshBadges } = useOutletContext();
  const confirm = useConfirm();

  const [returns, setReturns] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadReturns = useCallback(async () => {
    try {
      const params = { page, page_size: 10 };
      if (statusFilter) params.status = statusFilter;
      const data = await ownerApi.getOwnerReturns(params);
      setReturns(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_page || data.total_pages || 1);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      try {
        const params = { page, page_size: 10 };
        if (statusFilter) params.status = statusFilter;
        const data = await ownerApi.getOwnerReturns(params);
        if (!ignore) {
          setReturns(data.items || []);
          setTotal(data.total || 0);
          setTotalPages(data.total_page || data.total_pages || 1);
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
  }, [page, statusFilter]);

  const handleUpdateStatus = async (ret, nextStatus) => {
    if (actionLoadingId) return;
    const shortId = ret.order_id.slice(0, 8).toUpperCase();
    const isApprove = nextStatus === 'APPROVED';
    const ok = await confirm({
      title: isApprove ? 'Approve return request?' : 'Reject return request?',
      message: isApprove
        ? `Approve return request for order #${shortId}? The payment will be refunded and the order marked Refunded.`
        : `Reject return request for order #${shortId}? This cannot be undone.`,
      confirmText: isApprove ? 'Approve & refund' : 'Reject return',
      cancelText: 'Keep pending',
      variant: 'danger',
    });
    if (!ok) return;

    setActionLoadingId(ret.id);
    try {
      const updatedReturn = await ownerApi.updateReturnStatus(ret.id, nextStatus);
      setReturns((prev) => prev.map((r) => (r.id === ret.id ? updatedReturn : r)));
      toast.success(isApprove ? 'Return approved and refunded' : 'Return request rejected');
      if (refreshBadges) refreshBadges();
    } catch (err) {
      if (err.response?.status === 400) {
        toast.error('This return was already resolved');
        loadReturns();
      } else if (err.response?.status === 404) {
        toast.error('Return not found');
        setReturns((prev) => prev.filter((r) => r.id !== ret.id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Returns & Refunds</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">Review customer return requests, reasons, and issue refunds.</p>
      </div>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start max-w-fit">
        {RETURN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setStatusFilter(tab.id); setPage(1); setIsLoading(true); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              statusFilter === tab.id ? 'bg-white text-brand shadow-xs' : 'text-muted-text hover:text-text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-28 w-full rounded-2xl" /><Skeleton className="h-28 w-full rounded-2xl" /></div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 text-danger rounded-xl text-xs">{error}</div>
      ) : returns.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="No return requests"
          description={statusFilter ? 'No returns match this filter.' : 'No return or refund requests have been submitted.'}
          actionLabel={statusFilter ? 'Show all returns' : undefined}
          onAction={statusFilter ? () => { setStatusFilter(''); setPage(1); setIsLoading(true); } : undefined}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {returns.map((ret) => (
              <OwnerReturnCard
                key={ret.id}
                ret={ret}
                isActionLoading={actionLoadingId === ret.id}
                onApprove={() => handleUpdateStatus(ret, 'APPROVED')}
                onReject={() => handleUpdateStatus(ret, 'REJECTED')}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={(p) => { setPage(p); setIsLoading(true); }} />
          )}
        </div>
      )}
    </div>
  );
}
