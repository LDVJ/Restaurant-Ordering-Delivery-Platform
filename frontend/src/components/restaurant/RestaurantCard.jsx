import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { getInitials, colorFromName } from '../../utils/format';

/**
 * RestaurantCard Component
 * Sourced from Section 12 of Frontend Guide.
 * Displays colored initials avatar, cuisine, rating pill, city, and description.
 */
export default function RestaurantCard({ restaurant }) {
  const avatarColors = colorFromName(restaurant.name);
  const initials = getInitials(restaurant.name);

  const rating =
    restaurant.avg_rating !== null && restaurant.avg_rating !== undefined
      ? Number(restaurant.avg_rating).toFixed(1)
      : null;

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group block rounded-xl border border-border bg-white p-5 shadow-2xs hover:shadow-md hover:border-brand/30 transition-all text-left"
    >
      <div className="flex items-start gap-3.5">
        {/* Initials Avatar */}
        <div
          className={`w-12 h-12 rounded-xl ${avatarColors.bg} ${avatarColors.text} font-bold text-base flex items-center justify-center shrink-0 border border-black/5 group-hover:scale-105 transition-transform`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-base text-text-main group-hover:text-brand transition-colors truncate">
              {restaurant.name}
            </h3>

            {/* Rating Pill */}
            {rating ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                <span>{rating}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-muted-text border border-gray-200 shrink-0">
                New
              </span>
            )}
          </div>

          {/* Cuisine & Reviews */}
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-text">
            <span className="font-medium text-text-main truncate">
              {restaurant.cuisine}
            </span>
            {restaurant.review_count > 0 && (
              <>
                <span>•</span>
                <span>{restaurant.review_count} reviews</span>
              </>
            )}
          </div>

          {/* City */}
          {restaurant.city && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-text">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{restaurant.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {restaurant.description && (
        <p className="mt-3 pt-3 border-t border-border/60 text-xs text-muted-text line-clamp-2 leading-relaxed">
          {restaurant.description}
        </p>
      )}
    </Link>
  );
}
