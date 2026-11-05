/**
 * Badge Component
 * Generic pill badge for labels, counts, and tags
 */
export default function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}) {
  const variantClasses = {
    brand: 'bg-brand-tint text-brand border-brand/20',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-danger border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        variantClasses[variant] || variantClasses.gray
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {children}
    </span>
  );
}
