import { Edit2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import Button from '../ui/Button';

export default function DishItem({
  dish,
  onEdit,
  onToggleAvailability,
  isToggling = false,
}) {
  const isAvailable = Boolean(dish.is_available);

  return (
    <>
      {/* Desktop Table Row (md and up) */}
      <tr className="hidden md:table-row border-b border-border hover:bg-gray-50/50 transition-colors">
        <td className="py-4 px-4 align-top">
          <p className="font-bold text-sm text-text-main">{dish.name}</p>
          <p className="text-xs text-muted-text mt-0.5 line-clamp-2 max-w-md">{dish.description}</p>
        </td>
        <td className="py-4 px-4 align-top whitespace-nowrap">
          <span className="font-semibold text-sm text-text-main">{formatCurrency(dish.price)}</span>
        </td>
        <td className="py-4 px-4 align-top">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              disabled={isToggling}
              onClick={() => onToggleAvailability(dish, !isAvailable)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAvailable ? 'bg-brand' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isAvailable ? 'text-emerald-700' : 'text-muted-text'}`}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </td>
        <td className="py-4 px-4 align-top text-right whitespace-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => onEdit(dish)}
            className="text-xs"
          >
            Edit
          </Button>
        </td>
      </tr>

      {/* Mobile Card (< md) */}
      <div className="md:hidden bg-white rounded-xl border border-border p-4 space-y-3 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="font-bold text-sm text-text-main truncate">{dish.name}</p>
            <p className="text-xs text-muted-text line-clamp-2">{dish.description}</p>
          </div>
          <span className="font-bold text-sm text-text-main shrink-0">{formatCurrency(dish.price)}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              disabled={isToggling}
              onClick={() => onToggleAvailability(dish, !isAvailable)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAvailable ? 'bg-brand' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAvailable ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold ${isAvailable ? 'text-emerald-700' : 'text-muted-text'}`}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => onEdit(dish)}
            className="text-xs"
          >
            Edit
          </Button>
        </div>
      </div>
    </>
  );
}
