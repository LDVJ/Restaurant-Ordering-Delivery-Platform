import Button from './Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

/**
 * ErrorState Component
 * Displays actionable error message with a 'Try again' button
 * Sourced from Section 5 & 12 of Frontend Guide
 */
export default function ErrorState({
  title = 'Unable to load content',
  message = 'An unexpected error occurred while fetching information. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-red-200 bg-red-50/50 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 text-danger flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-text-main mb-1.5">{title}</h3>

      {message && (
        <p className="text-sm text-muted-text max-w-md mb-6 leading-relaxed">
          {message}
        </p>
      )}

      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          icon={RotateCcw}
          className="border-red-200 hover:bg-white text-danger"
        >
          Try again
        </Button>
      )}
    </div>
  );
}
