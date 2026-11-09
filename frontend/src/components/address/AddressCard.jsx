import { MapPin, Phone, Star, Edit2, Trash2, Check } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * AddressCard Component
 * Displays address details with actions for profile management or picker selection.
 */
export default function AddressCard({
  address,
  selectable = false,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onMakeDefault,
  isActionLoading = false,
}) {
  const phoneDisplay = address.phone_e164 || `${address.country_code} ${address.phone_number}`;

  return (
    <div
      onClick={selectable && onSelect ? () => onSelect(address) : undefined}
      className={`rounded-xl border p-4 transition-all text-left relative ${
        selectable ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-brand bg-brand-tint/20 ring-1 ring-brand'
          : 'border-border bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-gray-100 text-muted-text shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-brand" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-text-main leading-tight truncate">
                {address.house}
              </p>
              {address.is_default && (
                <Badge variant="brand" size="sm">
                  Default
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-text leading-relaxed">
              {address.city}, {address.state}, {address.country}
            </p>

            <p className="text-xs text-text-main font-medium flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5 text-muted-text" />
              <span>{phoneDisplay}</span>
            </p>
          </div>
        </div>

        {/* Selection Radio / Check indicator */}
        {selectable && (
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
              isSelected ? 'bg-brand border-brand text-white' : 'border-border bg-white'
            }`}
          >
            {isSelected && <Check className="w-3 h-3 stroke-3" />}
          </div>
        )}
      </div>

      {/* Profile Management Actions */}
      {!selectable && (
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-border/60">
          {!address.is_default && onMakeDefault && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onMakeDefault(address)}
              disabled={isActionLoading}
              icon={Star}
              className="text-xs text-muted-text hover:text-brand"
            >
              Make default
            </Button>
          )}

          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              disabled={isActionLoading}
              icon={Edit2}
              className="text-xs"
            >
              Edit
            </Button>
          )}

          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDelete(address)}
              disabled={isActionLoading}
              icon={Trash2}
              className="text-xs text-muted-text hover:text-danger hover:bg-red-50"
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
