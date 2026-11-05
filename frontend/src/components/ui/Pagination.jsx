import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

/**
 * Pagination Component
 * Sourced from API_CONTRACT.md (?page=1&page_size=10) & Section 2/4 of Frontend Guide
 */
export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  // Generate a small range of page numbers
  const pages = [];
  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex items-center justify-between gap-4 py-4 ${className}`}
    >
      <div className="text-xs text-muted-text">
        Page <span className="font-semibold text-text-main">{page}</span> of{' '}
        <span className="font-semibold text-text-main">{totalPages}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          disabled={page <= 1}
          aria-label="Previous page"
          icon={ChevronLeft}
        >
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1 mx-1">
          {start > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="w-8 h-8 rounded-lg text-xs font-medium text-text-main hover:bg-gray-100 transition-colors"
              >
                1
              </button>
              {start > 2 && <span className="text-xs text-gray-400 px-1">…</span>}
            </>
          )}

          {pages.map((p) => {
            const isCurrent = p === page;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-text-main hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            );
          })}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="text-xs text-gray-400 px-1">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 rounded-lg text-xs font-medium text-text-main hover:bg-gray-100 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleNext}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </nav>
  );
}
