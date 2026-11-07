import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../ui/Input';

/**
 * PasswordInput Component
 * Self-contained password input with independent show/hide state and eye icon in trailing slot.
 */
export default function PasswordInput({
  label = 'Password',
  name = 'password',
  value,
  onChange,
  error,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  required = false,
  maxLength,
  id,
  helperText,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const trailingButton = (
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="text-muted-text hover:text-text-main transition-colors p-1 focus:outline-none cursor-pointer"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff className="w-4 h-4" />
      ) : (
        <Eye className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <Input
      label={label}
      type={showPassword ? 'text' : 'password'}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      error={error}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      maxLength={maxLength}
      helperText={helperText}
      className={className}
      icon={Lock}
      trailing={trailingButton}
      {...props}
    />
  );
}
