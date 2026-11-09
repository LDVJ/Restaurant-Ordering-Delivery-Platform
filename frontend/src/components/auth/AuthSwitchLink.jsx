import { Link } from 'react-router-dom';

/**
 * AuthSwitchLink Component
 * Standardized footer link to switch between Login and Register pages.
 */
export default function AuthSwitchLink({ text, linkText, to, type }) {
  let displayText = text;
  let displayLinkText = linkText;
  let displayTo = to;

  if (type === 'register' || (!displayText && !displayLinkText && !displayTo)) {
    displayText = displayText || 'Already have an account?';
    displayLinkText = displayLinkText || 'Sign in';
    displayTo = displayTo || '/login';
  } else if (type === 'login') {
    displayText = displayText || "Don't have an account?";
    displayLinkText = displayLinkText || 'Create an account';
    displayTo = displayTo || '/register';
  }

  return (
    <div className="mt-4 pt-3 border-t border-border text-center">
      <p className="text-xs sm:text-sm text-muted-text">
        {displayText}{' '}
        <Link
          to={displayTo}
          className="font-semibold text-brand hover:text-brand-dark transition-colors"
        >
          {displayLinkText}
        </Link>
      </p>
    </div>
  );
}
