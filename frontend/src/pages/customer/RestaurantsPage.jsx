import { useState, useEffect } from 'react';
import { Search, X, UtensilsCrossed } from 'lucide-react';
import * as restaurantApi from '../../api/restaurantApi';
import { getErrorMessage } from '../../utils/errors';
import useDebounce from '../../hooks/useDebounce';

import RestaurantCard from '../../components/restaurant/RestaurantCard';
import CuisineChips from '../../components/restaurant/CuisineChips';
import StickyCartBar from '../../components/restaurant/StickyCartBar';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [cuisines, setCuisines] = useState([]);
  const [isCuisinesLoading, setIsCuisinesLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch dynamic cuisines on mount (GET /restaurants/cuisines)
  useEffect(() => {
    let ignore = false;

    restaurantApi
      .getCuisines()
      .then((data) => {
        if (!ignore) {
          setCuisines(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCuisines([]); // Fallback to "All" only without blocking page
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsCuisinesLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch active restaurants with filters
  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const data = await restaurantApi.getRestaurants({
          search: debouncedSearch,
          cuisine,
          page,
          page_size: 9,
        });
        if (!ignore) {
          setRestaurants(data.items || []);
          setTotalPages(data.total_pages || 1);
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
  }, [debouncedSearch, cuisine, page, reloadTrigger]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleCuisineChange = (val) => {
    setCuisine(val);
    setPage(1);
    setIsLoading(true);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCuisine('All');
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
    <div className="space-y-6 pb-20 text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          Campus Restaurants
        </h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1">
          Explore delicious meals from verified campus canteens & kitchens
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search restaurants by name..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-tint focus:border-brand transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-text-main p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dynamic Cuisine Filter Chips */}
      <CuisineChips
        cuisines={cuisines}
        selected={cuisine}
        onSelect={handleCuisineChange}
        isLoading={isCuisinesLoading}
      />

      {/* Content States: Loading, Error, Empty, Data */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border bg-white space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-12 h-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-3/4 h-4" />
                  <Skeleton variant="text" className="w-1/2 h-3" />
                </div>
              </div>
              <Skeleton variant="rectangular" className="h-10 mt-3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load restaurants"
          message={error}
          onRetry={handleRetry}
        />
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="No restaurants found"
          description="We couldn't find any campus restaurants matching your search criteria."
          icon={UtensilsCrossed}
          actionText="Reset filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Sticky Cart Bar */}
      <StickyCartBar />
    </div>
  );
}
