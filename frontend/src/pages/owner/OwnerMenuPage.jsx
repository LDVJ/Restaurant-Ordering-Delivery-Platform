import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { useConfirm } from '../../context/ConfirmContext';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import useDebounce from '../../hooks/useDebounce';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import DishItem from '../../components/owner/DishItem';
import DishForm from '../../components/owner/DishForm';
import MenuFilters from '../../components/owner/MenuFilters';

export default function OwnerMenuPage() {
  const confirm = useConfirm();
  const [dishes, setDishes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [availFilter, setAvailFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [modalDish, setModalDish] = useState(null);
  const [isSubmittingDish, setIsSubmittingDish] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const debouncedSearch = useDebounce(search, 3000);

  useEffect(() => {
    let ignore = false;
    async function fetchMenu() {
      setIsLoading(true);
      try {
        const params = { page, page_size: 10 };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (availFilter === 'true') params.is_available = true;
        if (availFilter === 'false') params.is_available = false;

        const data = await ownerApi.getMenu(params);
        if (!ignore) {
          setDishes(data.items || []);
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
    fetchMenu();
    return () => { ignore = true; };
  }, [debouncedSearch, availFilter, page, reloadTrigger]);

  const handleToggleAvailability = async (dish, newStatus) => {
    if (newStatus === false) {
      const ok = await confirm({
        title: 'Mark dish unavailable?',
        message: "Mark dish unavailable? Customers will still see it, but they won't be able to order it.",
        confirmText: 'Mark unavailable',
        cancelText: 'Keep available',
        variant: 'danger',
      });
      if (!ok) return;
    }

    setTogglingId(dish.id);
    try {
      const updated = await ownerApi.updateDish(dish.id, { is_available: newStatus });
      setDishes((prev) => prev.map((d) => (d.id === dish.id ? { ...d, is_available: updated.is_available } : d)));
      toast.success(newStatus ? 'Dish marked available' : 'Dish marked unavailable');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDishFormSubmit = async (payload) => {
    setIsSubmittingDish(true);
    try {
      if (modalDish?.id) {
        const updated = await ownerApi.updateDish(modalDish.id, payload);
        setDishes((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        toast.success('Dish updated successfully');
      } else {
        const created = await ownerApi.createDish(payload);
        setDishes((prev) => [created, ...prev]);
        setTotal((prev) => prev + 1);
        toast.success('Dish added to menu');
      }
      setModalDish(null);
    } finally {
      setIsSubmittingDish(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">Menu Management</h1>
          <p className="text-xs sm:text-sm text-muted-text mt-1">Configure your food offerings, pricing, and live availability.</p>
        </div>
        <Button type="button" variant="primary" size="sm" icon={Plus} onClick={() => setModalDish({})}>
          Add new dish
        </Button>
      </div>

      <MenuFilters
        search={search}
        onSearchChange={(e) => { setSearch(e.target.value); setPage(1); }}
        availFilter={availFilter}
        onFilterChange={(f) => { setAvailFilter(f); setPage(1); }}
      />

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full rounded-xl" /><Skeleton className="h-16 w-full rounded-xl" /></div>
      ) : error ? (
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
          <p className="text-xs font-semibold text-danger">{error}</p>
          <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); setReloadTrigger((k) => k + 1); }}>Try again</Button>
        </div>
      ) : dishes.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title={search || availFilter ? 'No matching dishes' : 'No dishes added yet'}
          description={search || availFilter ? 'Try clearing your search query or availability filter.' : 'Start adding delicious items to your kitchen menu.'}
          actionLabel={search || availFilter ? 'Reset filters' : 'Add your first dish'}
          onAction={() => { if (search || availFilter) { setSearch(''); setAvailFilter(''); setPage(1); } else { setModalDish({}); } }}
        />
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border shadow-2xs overflow-hidden">
            <table className="w-full text-left hidden md:table">
              <thead className="bg-gray-50/80 border-b border-border text-xs uppercase tracking-wider text-muted-text font-semibold">
                <tr>
                  <th className="py-3 px-4">Dish</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => (
                  <DishItem key={dish.id} dish={dish} onEdit={(d) => setModalDish(d)} onToggleAvailability={handleToggleAvailability} isToggling={togglingId === dish.id} />
                ))}
              </tbody>
            </table>

            <div className="md:hidden divide-y divide-border p-2 space-y-2">
              {dishes.map((dish) => (
                <DishItem key={dish.id} dish={dish} onEdit={(d) => setModalDish(d)} onToggleAvailability={handleToggleAvailability} isToggling={togglingId === dish.id} />
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} totalItems={total} pageSize={10} onPageChange={setPage} />
          )}
        </div>
      )}

      {modalDish && (
        <Modal isOpen={Boolean(modalDish)} onClose={() => setModalDish(null)} title={modalDish.id ? 'Edit Dish' : 'Add New Dish'} size="md">
          <DishForm key={modalDish.id || 'new-dish'} initialDish={modalDish.id ? modalDish : null} onSubmit={handleDishFormSubmit} onCancel={() => setModalDish(null)} isSubmitting={isSubmittingDish} />
        </Modal>
      )}
    </div>
  );
}
