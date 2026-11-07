import { Link } from 'react-router-dom';

/**
 * AuthSwitchLink Component
 * Standardized footer link to switch between Login and Register pages.
 */
export default function AuthSwitchLink({ text, linkText, to }) {
  return (
    <div className="mt-4 pt-3 border-t border-border text-center">
      <p className="text-xs sm:text-sm text-muted-text">
        {text}{' '}
        <Link
          to={to}
          className="font-semibold text-brand hover:text-brand-dark transition-colors"
        >
          {linkText}
        </Link>
      </p>
    </div>
  );
}
