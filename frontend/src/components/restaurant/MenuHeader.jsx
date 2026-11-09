import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin } from 'lucide-react';
import { getInitials, colorFromName } from '../../utils/format';

/**
 * MenuHeader Component
 * Displays restaurant information, address, cuisine, ratings, and back navigation.
 * No phone number is displayed while browsing (API contract).
 */
export default function MenuHeader({ restaurant }) {
  if (!restaurant) return null;

  const avatarColors = colorFromName(restaurant.name || '');
  const initials = getInitials(restaurant.name || '');

  const rating =
    restaurant.avg_rating !== null && restaurant.avg_rating !== undefined
      ? Number(restaurant.avg_rating).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <div>
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-text hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to restaurants</span>
        </Link>
      </div>

      {/* Main Restaurant Info Card */}
      <div className="p-4 sm:p-6 rounded-2xl border border-border bg-white shadow-2xs text-left">
        <div className="flex items-start gap-3.5 sm:gap-5">
          {/* Avatar */}
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${avatarColors.bg} ${avatarColors.text} font-extrabold text-lg sm:text-2xl flex items-center justify-center shrink-0 border border-black/5 shadow-2xs`}
          >
            {initials}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
                {restaurant.name}
              </h1>

              {/* Rating */}
              {rating ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                  <span>{rating}</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-muted-text border border-gray-200 shrink-0">
                  New
                </span>
              )}
            </div>

            {/* Meta info: Cuisine, Reviews, City */}
            <div className="mt-2 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs sm:text-sm text-muted-text">
              <span className="font-semibold text-text-main">
                {restaurant.cuisine}
              </span>

              {restaurant.review_count > 0 && (
                <>
                  <span>•</span>
                  <span>{restaurant.review_count} reviews</span>
                </>
              )}

              {restaurant.city && (
                <>
                  <span>•</span>
                  <span>{restaurant.city}</span>
                </>
              )}
            </div>

            {/* Full address string */}
            {restaurant.address && (
              <div className="flex items-start gap-1.5 mt-2.5 text-xs text-muted-text">
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-text" />
                <span className="line-clamp-2 leading-relaxed">
                  {restaurant.address}
                </span>
              </div>
            )}

            {/* Description */}
            {restaurant.description && (
              <p className="mt-3 pt-3 border-t border-border/60 text-xs sm:text-sm text-muted-text leading-relaxed">
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
