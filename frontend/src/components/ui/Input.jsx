import { useId } from 'react';

/**
 * Input Component
 * Controlled text/number/email/password input with accessible labels, error messages,
 * and support for leading icon and trailing interactive slot (e.g. eye toggle button).
 */
export default function Input({
  label,
  error,
  helperText,
  id: customId,
  required = false,
  className = '',
  icon: Icon,
  trailing,
  maxLength,
  value,
  ...props
}) {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const hasError = Boolean(error);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-main flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-danger">*</span>}
          </span>
          {maxLength && (
            <span className="text-xs font-normal text-muted-text">
              {String(value ?? '').length}/{maxLength}
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-muted-text pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`w-full rounded-lg border bg-white text-sm text-text-main placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed ${
            Icon ? 'pl-9' : 'pl-3.5'
          } ${
            trailing ? 'pr-10' : 'pr-3.5'
          } py-2 ${
            hasError
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-brand focus:ring-brand-tint'
          } ${className}`}
          {...props}
        />

        {trailing && (
          <div className="absolute right-3 inset-y-0 flex items-center">
            {trailing}
          </div>
        )}
      </div>

      {hasError ? (
        <p id={errorId} role="alert" className="text-xs text-danger font-medium mt-0.5">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-text mt-0.5">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
