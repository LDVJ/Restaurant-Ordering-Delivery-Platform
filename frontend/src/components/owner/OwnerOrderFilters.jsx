import { Filter, RotateCcw } from 'lucide-react';
import { ORDER_STATUSES, ORDER_STATUS_CONFIG } from '../../utils/constants';
import Select from '../ui/Select';
import Button from '../ui/Button';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.values(ORDER_STATUSES).map((st) => ({
    value: st,
    label: ORDER_STATUS_CONFIG[st].label,
  })),
];

export default function OwnerOrderFilters({ filters, onFilterChange, onReset }) {
  const dateError =
    filters.date_from && filters.date_to && filters.date_from > filters.date_to
      ? 'From date cannot be after To date.'
      : '';

  const handleDateChange = (field, val) => {
    onFilterChange({ ...filters, [field]: val });
  };

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Status</label>
          <Select
            value={filters.status || ''}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            options={STATUS_OPTIONS}
            placeholder=""
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">From Date</label>
          <input
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleDateChange('date_from', e.target.value)}
            className="w-full px-3 py-1.5 h-10 text-sm bg-white border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">To Date</label>
          <input
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleDateChange('date_to', e.target.value)}
            className="w-full px-3 py-1.5 h-10 text-sm bg-white border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={onReset}
            className="h-10 text-xs w-full sm:w-auto"
          >
            Reset
          </Button>
        </div>
      </div>

      {dateError && (
        <p className="text-xs font-semibold text-danger flex items-center gap-1.5 pt-1 border-t border-border/60">
          <Filter className="w-3.5 h-3.5" />
          <span>{dateError}</span>
        </p>
      )}
    </div>
  );
}
