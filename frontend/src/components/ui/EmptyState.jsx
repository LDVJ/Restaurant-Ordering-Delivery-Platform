import Button from './Button';
import { UtensilsCrossed } from 'lucide-react';

/**
 * EmptyState Component
 * Displays friendly illustration/icon, message, and primary next action
 */
export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  icon: Icon = UtensilsCrossed,
  actionText,
  onAction,
  children,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-white ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-brand-tint text-brand flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-semibold text-text-main mb-1.5">{title}</h3>

      {description && (
        <p className="text-sm text-muted-text max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}

      {children}
    </div>
  );
}
