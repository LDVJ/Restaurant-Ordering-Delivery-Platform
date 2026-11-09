import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = { page, page_size: 10 };
        if (statusFilter) params.status = statusFilter;
        const data = await ownerApi.getOwnerReturns(params);
        if (!ignore) {
          setReturns(data.items || []);
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
  }, [page, statusFilter]);

  const handleApprove = async (ret) => {
    const shortId = ret.order_id.slice(0, 8).toUpperCase();
    const ok = await confirm({
      title: 'Approve return request?',
      message: `Approve return request for order #${shortId}? The payment will be refunded and the order marked Refunded.`,
      confirmText: 'Approve & refund',
      cancelText: 'Keep pending',
      variant: 'danger',
    });
    if (!ok) return;

    setActionLoadingId(ret.id);
    try {
      await ownerApi.approveReturn(ret.id);
      setReturns((prev) => prev.map((r) => (r.id === ret.id ? { ...r, status: 'APPROVED' } : r)));
      toast.success('Return approved and refunded');
      if (refreshBadges) refreshBadges();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (ret) => {
    const shortId = ret.order_id.slice(0, 8).toUpperCase();
    const ok = await confirm({
      title: 'Reject return request?',
      message: `Reject return request for order #${shortId}? This cannot be undone.`,
      confirmText: 'Reject return',
      cancelText: 'Keep pending',
      variant: 'danger',
    });
    if (!ok) return;

    setActionLoadingId(ret.id);
    try {
      await ownerApi.rejectReturn(ret.id);
      setReturns((prev) => prev.map((r) => (r.id === ret.id ? { ...r, status: 'REJECTED' } : r)));
      toast.success('Return request rejected');
      if (refreshBadges) refreshBadges();
    } catch (err) {
      toast.error(getErrorMessage(err));
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
                onApprove={handleApprove}
                onReject={handleReject}
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
