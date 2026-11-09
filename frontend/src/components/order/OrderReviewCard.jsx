import { Star } from 'lucide-react';
import { formatDateTime } from '../../utils/format';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

/**
 * OrderReviewCard Component
 * Displays customer's submitted rating and comment on the order detail page.
 */
export default function OrderReviewCard({ review }) {
  if (!review) return null;

  return (
    <div className="bg-white rounded-2xl border border-border p-5 text-left shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/70">
        <h3 className="text-sm font-bold text-text-main flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Your Rating & Review</span>
        </h3>
        {review.created_at && (
          <span className="text-[11px] text-muted-text">
            {formatDateTime(review.created_at)}
          </span>
        )}
      </div>

      {/* Stars row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= review.rating
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-text-main">
          {review.rating}/5 — {RATING_LABELS[review.rating] || 'Rated'}
        </span>
      </div>

      {/* Optional feedback comment */}
      {review.comment ? (
        <p className="text-xs text-text-main bg-gray-50/70 p-3 rounded-xl border border-border/60 italic">
          &ldquo;{review.comment}&rdquo;
        </p>
      ) : (
        <p className="text-xs text-muted-text italic">No comment provided.</p>
      )}
    </div>
  );
}
