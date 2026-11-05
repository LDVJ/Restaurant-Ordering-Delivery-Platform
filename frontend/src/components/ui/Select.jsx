import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * Controlled select dropdown with accessible label, options, and error states
 */
export default function Select({
  label,
  options = [],
  error,
  helperText,
  placeholder = 'Select an option',
  id: customId,
  required = false,
  className = '',
  value,
  ...props
}) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  const hasError = Boolean(error);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-text-main"
        >
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-text-main transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer ${
            hasError
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-brand focus:ring-brand-tint'
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const isObj = typeof opt === 'object' && opt !== null;
            const val = isObj ? opt.value : opt;
            const labelText = isObj ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 pointer-events-none text-muted-text">
          <ChevronDown className="w-4 h-4" />
        </div>
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
