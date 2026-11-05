import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { getInitials, colorFromName } from '../../utils/format';
import { ROLE_HOME_PATHS, ROLES } from '../../utils/constants';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * Navbar Component
 * Sticky top navigation bar with user profile, role badge, and confirmed logout.
 * Sourced from Section 8 & 12 of Frontend Guide.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Log out of CampusBite?',
      message: 'You will need to sign in with your email and password to access your account again.',
      confirmText: 'Log out',
      cancelText: 'Stay logged in',
      variant: 'default',
    });

    if (!ok) return;

    logout();
    navigate('/login');
  };

  const homePath = user?.role ? ROLE_HOME_PATHS[user.role] : '/';
  const avatarColors = user ? colorFromName(user.name) : { bg: 'bg-brand-tint', text: 'text-brand' };

  const roleLabel = {
    [ROLES.CUSTOMER]: 'Customer',
    [ROLES.RESTAURANT_OWNER]: 'Restaurant Owner',
    [ROLES.DELIVERY_PARTNER]: 'Delivery Partner',
  }[user?.role] || user?.role;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-border shadow-2xs">
      <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          to={homePath}
          className="flex items-center gap-2 text-xl font-bold text-brand tracking-tight hover:opacity-90 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-base font-extrabold shadow-xs">
            CB
          </span>
          <span>CampusBite</span>
        </Link>

        {/* Right: User Info & Actions */}
        {user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role Badge */}
            <Badge variant="brand" size="sm" className="hidden sm:inline-flex">
              {roleLabel}
            </Badge>

            {/* User Avatar & Name */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full ${avatarColors.bg} ${avatarColors.text} font-bold text-xs flex items-center justify-center shrink-0 border border-black/5`}
                title={user.name}
              >
                {getInitials(user.name)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-text-main leading-tight">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-text truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              icon={LogOut}
              className="text-muted-text hover:text-danger hover:bg-red-50"
              title="Log out"
            >
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Register
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
