/**
 * StatCard Component
 * Displays key business metrics with an icon, title, value, and subtitle
 * Used in Owner & Delivery dashboards
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  className = '',
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-white p-5 shadow-xs transition-shadow hover:shadow-sm flex items-center justify-between gap-4 text-left ${className}`}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
          {title}
        </span>
        <span className="text-2xl font-bold text-text-main tracking-tight">
          {value}
        </span>
        {subtitle && (
          <span className="text-xs text-muted-text">{subtitle}</span>
        )}
      </div>

      {Icon && (
        <div className="p-3 rounded-xl bg-brand-tint text-brand shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
