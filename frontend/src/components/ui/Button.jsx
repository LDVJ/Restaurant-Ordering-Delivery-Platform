import Spinner from './Spinner';

/**
 * Button Component
 * Supports variants: primary, secondary, outline, danger, ghost
 * Supports loading state with inline spinner and focus ring styling
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  icon: Icon,
  onClick,
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.99] whitespace-nowrap';

  const variantClasses = {
    primary:
      'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand shadow-sm',
    secondary:
      'bg-white text-text-main border border-border hover:bg-gray-50 focus-visible:ring-gray-400 shadow-sm',
    outline:
      'bg-transparent text-brand border border-brand hover:bg-brand-tint focus-visible:ring-brand',
    danger:
      'bg-danger text-white hover:bg-red-700 focus-visible:ring-danger shadow-sm',
    ghost:
      'bg-transparent text-text-main hover:bg-gray-100 focus-visible:ring-gray-300',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const spinnerSize = size === 'lg' ? 'md' : 'sm';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={spinnerSize} className="text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
