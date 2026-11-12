import { useState, useRef, useEffect } from 'react';
import { Filter, RotateCcw, ChevronDown, Search } from 'lucide-react';
import { ORDER_STATUSES, ORDER_STATUS_CONFIG } from '../../utils/constants';
import Button from '../ui/Button';

export default function OrderFilters({ filters, onApply, onReset }) {
  const [staged, setStaged] = useState({
    search: filters.search || '',
    status: filters.status || '',
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  });
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setStaged({
      search: filters.search || '',
      status: filters.status || '',
      date_from: filters.date_from || '',
      date_to: filters.date_to || '',
    });
  }
  const [dateError, setDateError] = useState('');
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, []);

  const validateDates = (from, to) => {
    if (from && to && from > to) {
      setDateError('From date cannot be after To date');
      return false;
    }
    setDateError('');
    return true;
  };

  const executeApply = (candidateFilters) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!validateDates(candidateFilters.date_from, candidateFilters.date_to)) return;
    onApply(candidateFilters);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const next = { ...staged, search: val };
    setStaged(next);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      executeApply(next);
    }, 2000);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeApply(staged);
    }
  };

  const handleStagedChange = (field, val) => {
    const next = { ...staged, [field]: val };
    setStaged(next);
    if (field === 'date_from' || field === 'date_to') {
      validateDates(field === 'date_from' ? val : staged.date_from, field === 'date_to' ? val : staged.date_to);
    }
  };

  const handleReset = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setDateError('');
    setStaged({ search: '', status: '', date_from: '', date_to: '' });
    onReset();
  };

  const hasActiveFilters = Boolean(filters.status || filters.date_from || filters.date_to || filters.search);

  return (
    <div className="bg-white p-4 rounded-xl border border-border shadow-2xs space-y-3 text-left">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-main uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-brand" />
          <span>Filter Orders</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} icon={RotateCcw} className="text-xs text-muted-text hover:text-brand h-8 py-0 px-2">
            Reset filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
        <div>
          <label htmlFor="order-search" className="block text-xs font-medium text-muted-text mb-1">Search</label>
          <div className="relative flex items-center">
            <input
              id="order-search"
              type="text"
              placeholder="Search dish or restaurant..."
              value={staged.search}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              className="w-full h-10 pl-3 pr-9 rounded-lg border border-border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
            />
            <Search className="w-4 h-4 text-muted-text absolute right-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="order-status-filter" className="block text-xs font-medium text-muted-text mb-1">Status</label>
          <div className="relative flex items-center">
            <select
              id="order-status-filter"
              value={staged.status}
              onChange={(e) => handleStagedChange('status', e.target.value)}
              className="w-full h-10 pl-3 pr-10 appearance-none rounded-lg border border-border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors cursor-pointer"
            >
              <option value="">All statuses</option>
              {Object.values(ORDER_STATUSES).map((st) => (
                <option key={st} value={st}>{ORDER_STATUS_CONFIG[st]?.label || st}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-muted-text absolute right-3 pointer-events-none" />
          </div>
        </div>

        <div>
          <label htmlFor="order-date-from" className="block text-xs font-medium text-muted-text mb-1">From date</label>
          <input
            id="order-date-from"
            type="date"
            value={staged.date_from}
            onChange={(e) => handleStagedChange('date_from', e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>

        <div>
          <label htmlFor="order-date-to" className="block text-xs font-medium text-muted-text mb-1">To date</label>
          <input
            id="order-date-to"
            type="date"
            value={staged.date_to}
            onChange={(e) => handleStagedChange('date_to', e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-text-main focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
          />
        </div>

        <div>
          <Button type="button" variant="primary" onClick={() => executeApply(staged)} className="w-full h-10 text-xs font-semibold">
            Apply filters
          </Button>
        </div>
      </div>

      {dateError && (
        <p className="text-xs text-danger font-medium flex items-center gap-1.5 pt-1">
          <span>•</span> {dateError}
        </p>
      )}
    </div>
  );
}