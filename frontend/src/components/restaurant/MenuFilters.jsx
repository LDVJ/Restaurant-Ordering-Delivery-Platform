import { Search, X, RotateCcw } from 'lucide-react';

/**
 * MenuFilters Component
 * Search dish input + min and max price filters with inline validation.
 */
export default function MenuFilters({
  search,
  onSearchChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  priceError,
  onReset,
}) {
  const hasActiveFilters = Boolean(search || minPrice || maxPrice);

  return (
    <div className="space-y-2 text-left">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Dishes Input */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dishes by name..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-white text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-tint focus:border-brand transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear dish search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-text-main p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Min & Max Price Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative w-28 sm:w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-text pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              className={`w-full pl-7 pr-2.5 py-2.5 rounded-xl border bg-white text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-tint transition-colors ${
                priceError ? 'border-danger focus:border-danger' : 'border-border focus:border-brand'
              }`}
            />
          </div>

          <span className="text-muted-text text-xs font-bold">—</span>

          <div className="relative w-28 sm:w-32">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-text pointer-events-none">
              ₹
            </span>
            <input
              type="number"
              min="0"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              className={`w-full pl-7 pr-2.5 py-2.5 rounded-xl border bg-white text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-tint transition-colors ${
                priceError ? 'border-danger focus:border-danger' : 'border-border focus:border-brand'
              }`}
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              title="Reset filters"
              className="px-3 py-2.5 rounded-xl border border-border bg-white text-muted-text hover:text-brand hover:border-brand/40 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Price Validation Error */}
      {priceError && (
        <p className="text-xs text-danger font-medium pl-1 animate-in fade-in duration-150">
          {priceError}
        </p>
      )}
    </div>
  );
}
