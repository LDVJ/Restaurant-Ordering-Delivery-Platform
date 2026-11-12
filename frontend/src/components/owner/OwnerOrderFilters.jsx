import { useState } from 'react';
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

export default function OwnerOrderFilters({ filters, onApply, onReset }) {
  const [staged, setStaged] = useState({
    status: filters.status || '',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  });
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setStaged({
      status: filters.status || '',
      date_from: filters.date_from || '',
      date_to: filters.date_to || '',
    });
  }
  const [dateError, setDateError] = useState('');

  const validateDates = (from, to) => {
    if (from && to && from > to) {
      setDateError('From date cannot be after To date.');
      return false;
    }
    setDateError('');
    return true;
  };

  const executeApply = () => {
    if (!validateDates(staged.date_from, staged.date_to)) return;
    onApply(staged);
  };

  const handleStagedChange = (field, val) => {
    const next = { ...staged, [field]: val };
    setStaged(next);
    if (field === 'date_from' || field === 'date_to') {
      validateDates(field === 'date_from' ? val : staged.date_from, field === 'date_to' ? val : staged.date_to);
    }
  };

  const handleReset = () => {
    setDateError('');
    setStaged({ status: '', date_from: '', date_to: '' });
    onReset();
  };

  const hasActiveFilters = Boolean(filters.status || filters.date_from || filters.date_to);

  return (
    <div className="bg-white rounded-2xl border border-border p-4 shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-main uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-brand" />
          <span>Filter Kitchen Orders</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} icon={RotateCcw} className="text-xs text-muted-text hover:text-brand h-8 py-0 px-2">
            Reset filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">Status</label>
          <Select
            value={staged.status}
            onChange={(e) => handleStagedChange('status', e.target.value)}
            options={STATUS_OPTIONS}
            placeholder=""
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">From Date</label>
          <input
            type="date"
            value={staged.date_from}
            onChange={(e) => handleStagedChange('date_from', e.target.value)}
            className="w-full px-3 py-1.5 h-10 text-sm bg-white border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">To Date</label>
          <input
            type="date"
            value={staged.date_to}
            onChange={(e) => handleStagedChange('date_to', e.target.value)}
            className="w-full px-3 py-1.5 h-10 text-sm bg-white border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div>
          <Button type="button" variant="primary" onClick={executeApply} className="w-full h-10 text-xs font-semibold">
            Apply filters
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
