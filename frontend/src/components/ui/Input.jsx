import { useId } from 'react';

/**
 * Input Component
 * Controlled text/number/email/password input with accessible labels and error messages
 */
export default function Input({
  label,
  error,
  helperText,
  id: customId,
  required = false,
  className = '',
  icon: Icon,
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
          className="text-xs font-semibold uppercase tracking-wider text-muted-text flex items-center justify-between"
        >
          <span>
            {label} {required && <span className="text-danger">*</span>}
          </span>
          {maxLength && (
            <span className="text-[11px] font-normal normal-case text-gray-400">
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
            Icon ? 'pl-9 pr-3.5 py-2' : 'px-3.5 py-2'
          } ${
            hasError
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-brand focus:ring-brand-tint'
          } ${className}`}
          {...props}
        />
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
