import { useState } from 'react';
import Skeleton from '../ui/Skeleton';

/**
 * CuisineChips Component
 * Sourced from Section 12 of Frontend Guide.
 * Displays "All" first, then dynamic cuisines with a "More +N" / "Show less" toggle.
 */
export default function CuisineChips({
  cuisines = [],
  selected = 'All',
  onSelect,
  isLoading = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Loading skeleton chips
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Skeleton variant="rectangular" className="w-12 h-7 rounded-full shrink-0" />
        <Skeleton variant="rectangular" className="w-20 h-7 rounded-full shrink-0" />
        <Skeleton variant="rectangular" className="w-16 h-7 rounded-full shrink-0" />
        <Skeleton variant="rectangular" className="w-24 h-7 rounded-full shrink-0" />
        <Skeleton variant="rectangular" className="w-18 h-7 rounded-full shrink-0" />
      </div>
    );
  }

  // Calculate visible cuisines and hidden count
  let visibleCuisines = cuisines;
  let hiddenCount = 0;

  if (cuisines.length > 6) {
    if (isExpanded) {
      visibleCuisines = cuisines;
    } else {
      const first6 = cuisines.slice(0, 6);
      if (selected !== 'All' && !first6.includes(selected) && cuisines.includes(selected)) {
        visibleCuisines = [...first6, selected];
      } else {
        visibleCuisines = first6;
      }
      hiddenCount = cuisines.length - visibleCuisines.length;
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {/* 'All' Chip is always first */}
      <button
        type="button"
        onClick={() => onSelect('All')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
          selected === 'All'
            ? 'bg-brand text-white border-brand shadow-xs'
            : 'bg-white text-muted-text border-border hover:border-gray-300 hover:text-text-main'
        }`}
      >
        All
      </button>

      {/* Visible Cuisines */}
      {visibleCuisines.map((item) => {
        const isSelected = selected === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border shrink-0 ${
              isSelected
                ? 'bg-brand text-white border-brand shadow-xs'
                : 'bg-white text-muted-text border-border hover:border-gray-300 hover:text-text-main'
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Expand / Collapse Toggle Button */}
      {cuisines.length > 6 && (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border border-dashed border-border bg-white text-muted-text hover:text-brand hover:border-brand/40 shrink-0"
        >
          {isExpanded ? 'Show less' : `More +${hiddenCount}`}
        </button>
      )}
    </div>
  );
}
