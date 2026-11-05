/**
 * Skeleton Component
 * Animated loading placeholder with text, circular, and rectangular shapes
 */
export default function Skeleton({
  variant = 'text',
  className = '',
  width,
  height,
}) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full shrink-0',
    rectangular: 'rounded-xl w-full',
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`animate-pulse bg-gray-200/80 ${
        variantClasses[variant] || variantClasses.rectangular
      } ${className}`}
    />
  );
}
