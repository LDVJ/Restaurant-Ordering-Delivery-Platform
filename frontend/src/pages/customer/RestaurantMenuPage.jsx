import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import * as restaurantApi from '../../api/restaurantApi';
import { getErrorMessage } from '../../utils/errors';
import useDebounce from '../../hooks/useDebounce';

import MenuHeader from '../../components/restaurant/MenuHeader';
import MenuFilters from '../../components/restaurant/MenuFilters';
import MenuItemRow from '../../components/restaurant/MenuItemRow';
import StickyCartBar from '../../components/restaurant/StickyCartBar';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function RestaurantMenuPage() {
  const { id } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const debouncedSearch = useDebounce(search, 300);
  const debouncedMin = useDebounce(minPrice, 300);
  const debouncedMax = useDebounce(maxPrice, 300);

  // Price filter inline validation
  const priceError = useMemo(() => {
    const min = debouncedMin ? Number(debouncedMin) : null;
    const max = debouncedMax ? Number(debouncedMax) : null;

    if (min !== null && min < 0) return 'Minimum price cannot be negative';
    if (max !== null && max < 0) return 'Maximum price cannot be negative';
    if (min !== null && max !== null && min > max) {
      return 'Minimum price cannot exceed maximum price';
    }
    return null;
  }, [debouncedMin, debouncedMax]);

  // Fetch restaurant details and dishes
  useEffect(() => {
    if (!id || priceError) return;

    let ignore = false;

    async function loadData() {
      try {
        const [restData, menuData] = await Promise.all([
          restaurantApi.getRestaurantById(id),
          restaurantApi.getRestaurantMenu(id, {
            search: debouncedSearch,
            min_price: debouncedMin || '',
            max_price: debouncedMax || '',
            page,
            page_size: 20,
          }),
        ]);

        if (!ignore) {
          setRestaurant(restData);
          setDishes(menuData.items || []);
          setTotalPages(menuData.total_pages || 1);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [id, debouncedSearch, debouncedMin, debouncedMax, page, priceError, reloadTrigger]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleMinPriceChange = (val) => {
    setMinPrice(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleMaxPriceChange = (val) => {
    setMaxPrice(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    setIsLoading(true);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setIsLoading(true);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 pb-24 text-left">
      {/* Restaurant Header */}
      {isLoading && !restaurant ? (
        <div className="p-6 rounded-2xl border border-border bg-white space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="w-16 h-16" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-1/3 h-6" />
              <Skeleton variant="text" className="w-1/4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <MenuHeader restaurant={restaurant} />
      )}

      {/* Filters: Search & Price Range */}
      <MenuFilters
        search={search}
        onSearchChange={handleSearchChange}
        minPrice={minPrice}
        onMinPriceChange={handleMinPriceChange}
        maxPrice={maxPrice}
        onMaxPriceChange={handleMaxPriceChange}
        priceError={priceError}
        onReset={handleResetFilters}
      />

      {/* Menu Section Title */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <h2 className="text-lg sm:text-xl font-bold text-text-main">
          Menu Items
        </h2>
        {dishes.length > 0 && !isLoading && (
          <span className="text-xs text-muted-text font-medium">
            Showing {dishes.length} items
          </span>
        )}
      </div>

      {/* Dishes List State */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-white flex items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-1/3 h-4" />
                <Skeleton variant="text" className="w-1/5 h-3" />
                <Skeleton variant="text" className="w-1/2 h-3" />
              </div>
              <Skeleton variant="rectangular" className="w-20 h-8 rounded-lg" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load menu"
          message={error}
          onRetry={handleRetry}
        />
      ) : dishes.length === 0 ? (
        <EmptyState
          title="No dishes found"
          description={
            priceError
              ? 'Please adjust your price range to view dishes.'
              : 'No menu items match your search filters.'
          }
          icon={UtensilsCrossed}
          actionText="Reset filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-3">
          {dishes.map((dish) => (
            <MenuItemRow
              key={dish.id}
              dish={dish}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Floating Sticky Cart Bar */}
      <StickyCartBar />
    </div>
  );
}
