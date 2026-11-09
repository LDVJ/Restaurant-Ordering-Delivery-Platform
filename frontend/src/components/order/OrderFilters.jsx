import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ORDER_STATUSES, ORDER_STATUS_CONFIG } from '../../utils/constants';
import Button from '../ui/Button';

/**
 * OrderFilters Component
 * Allows filtering customer order list by status and date range.
 * Rule: If from date is after to date, show inline error and do not call API.
 */
export default function OrderFilters({ filters, onChange, onReset }) {
  const [dateError, setDateError] = useState('');

  const status = filters.status || '';
  const dateFrom = filters.date_from || '';
  const dateTo = filters.date_to || '';

  const handleStatusChange = (e) => {
    const nextStatus = e.target.value;
    if (!dateError) {
      onChange({ ...filters, status: nextStatus });
    }
  };

  const handleDateFromChange = (e) => {
    const nextFrom = e.target.value;
    if (nextFrom && dateTo && nextFrom > dateTo) {
      setDateError('From date cannot be after To date');
      return;
    }

    setDateError('');
    onChange({ ...filters, date_from: nextFrom });
  };

  const handleDateToChange = (e) => {
    const nextTo = e.target.value;
    if (dateFrom && nextTo && dateFrom > nextTo) {
      setDateError('From date cannot be after To date');
      return;
    }

    setDateError('');
    onChange({ ...filters, date_to: nextTo });
  };

  const handleReset = () => {
    setDateError('');
    onReset();
  };

  const hasActiveFilters = Boolean(status || dateFrom || dateTo);

  return (
    <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-main uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-brand" />
          <span>Filter Orders</span>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={RotateCcw}
            className="text-xs text-muted-text hover:text-brand h-8 py-0 px-2"
          >
            Reset filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Status Dropdown */}
        <div>
          <label htmlFor="order-status-filter" className="block text-xs font-medium text-muted-text mb-1">
            Status
          </label>
          <select
            id="order-status-filter"
            value={status}
            onChange={handleStatusChange}
            className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          >
            <option value="">All statuses</option>
            {Object.values(ORDER_STATUSES).map((st) => (
              <option key={st} value={st}>
                {ORDER_STATUS_CONFIG[st]?.label || st}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="order-date-from" className="block text-xs font-medium text-muted-text mb-1">
            From date
          </label>
          <input
            id="order-date-from"
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
              dateError ? 'border-danger' : 'border-border'
            }`}
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="order-date-to" className="block text-xs font-medium text-muted-text mb-1">
            To date
          </label>
          <input
            id="order-date-to"
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            className={`w-full h-10 px-3 rounded-lg border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors ${
              dateError ? 'border-danger' : 'border-border'
            }`}
          />
        </div>
      </div>

      {/* Inline Date Validation Error */}
      {dateError && (
        <p className="text-xs text-danger font-medium flex items-center gap-1.5 pt-1">
          <span>•</span> {dateError}
        </p>
      )}
    </div>
  );
}
