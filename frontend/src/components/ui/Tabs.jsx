/**
 * Tabs Component
 * Navigational tab bar with active indicator and optional count badges
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`flex items-center gap-2 border-b border-border overflow-x-auto no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:text-brand ${
              isActive
                ? 'border-brand text-brand'
                : 'border-transparent text-muted-text hover:text-text-main hover:border-gray-300'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={`ml-1 px-1.5 py-0.5 text-[11px] rounded-full font-bold ${
                  isActive
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
