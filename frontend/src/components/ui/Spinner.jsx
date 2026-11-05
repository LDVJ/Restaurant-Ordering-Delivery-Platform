/**
 * Spinner Component
 * Accessible loading indicator
 */
export default function Spinner({ size = 'md', className = '', label = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-solid border-current border-t-transparent ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
