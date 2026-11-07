import { AlertCircle } from 'lucide-react';

/**
 * FormAlert Component
 * Reusable form-level error message box
 */
export default function FormAlert({ message, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-danger ${className}`}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
