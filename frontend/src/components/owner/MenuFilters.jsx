import { Search } from 'lucide-react';

const FILTER_TABS = [
  { id: '', label: 'All' },
  { id: 'true', label: 'Available' },
  { id: 'false', label: 'Unavailable' },
];

export default function MenuFilters({ search, onSearchChange, availFilter, onFilterChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-border shadow-2xs">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-muted-text absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search dishes by name..."
          value={search}
          onChange={onSearchChange}
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
        />
      </div>

      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              availFilter === tab.id ? 'bg-white text-brand shadow-xs' : 'text-muted-text hover:text-text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
