import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ShoppingBag, User, Package, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useCart } from '../../context/CartContext';
import { getInitials, colorFromName } from '../../utils/format';
import { ROLE_HOME_PATHS, ROLES } from '../../utils/constants';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const avatarButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setDropdownOpen(false);
  }

  const isCustomer = user?.role === ROLES.CUSTOMER;
  const homePath = user?.role ? ROLE_HOME_PATHS[user.role] : '/';
  const avatarColors = user ? colorFromName(user.name) : { bg: 'bg-brand-tint', text: 'text-brand' };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setDropdownOpen(false);
        avatarButtonRef.current?.focus();
      }
    };
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !avatarButtonRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
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

  const getMenuItemClasses = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
      isActive ? 'text-brand bg-brand-tint/60 font-bold' : 'text-text-main hover:bg-gray-100 hover:text-brand'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-border shadow-2xs">
      <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to={homePath} className="flex items-center gap-2 text-lg sm:text-xl font-bold text-brand tracking-tight hover:opacity-90 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-sm sm:text-base font-extrabold shadow-xs">CB</span>
            <span className="hidden xs:inline">CampusBite</span>
          </Link>
          {isCustomer && (
            <NavLink to="/restaurants" className={({ isActive }) =>
              `text-xs sm:text-sm font-semibold transition-colors px-2.5 py-1.5 rounded-lg ${
                isActive ? 'text-brand bg-brand-tint/60 font-bold' : 'text-muted-text hover:text-text-main hover:bg-gray-100'
              }`
            }>
              Restaurants
            </NavLink>
          )}
        </div>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {isCustomer && (
              <Link to="/cart" aria-label={`Cart with ${totalItems} items`} className="relative p-2 rounded-xl text-text-main hover:text-brand hover:bg-brand-tint/50 transition-colors flex items-center justify-center min-w-[36px] min-h-[36px]">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            <div className="relative">
              <button
                ref={avatarButtonRef}
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-label="User account menu"
                className={`w-9 h-9 rounded-full ${avatarColors.bg} ${avatarColors.text} font-bold text-xs flex items-center justify-center shrink-0 border border-black/10 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-transform active:scale-95`}
              >
                {getInitials(user.name)}
              </button>

              {dropdownOpen && (
                <div ref={dropdownRef} role="menu" aria-orientation="vertical" aria-label="User account menu" className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border shadow-lg p-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-border/70 mb-1">
                    <p className="text-sm font-bold text-text-main truncate">{user.name}</p>
                    <p className="text-xs text-muted-text truncate">{user.email}</p>
                    <div className="mt-1.5"><Badge variant="brand" size="sm">{user.role === ROLES.CUSTOMER ? 'Customer' : user.role === ROLES.RESTAURANT_OWNER ? 'Owner' : 'Delivery'}</Badge></div>
                  </div>
                  <div className="space-y-0.5">
                    <NavLink to="/profile" role="menuitem" className={getMenuItemClasses} onClick={() => setDropdownOpen(false)}>
                      <User className="w-4 h-4 text-muted-text" /><span>Profile</span>
                    </NavLink>
                    {isCustomer && (
                      <>
                        <NavLink to="/dashboard" role="menuitem" className={getMenuItemClasses} onClick={() => setDropdownOpen(false)}>
                          <Package className="w-4 h-4 text-muted-text" /><span>My orders</span>
                        </NavLink>
                        <NavLink to="/ai-insights" role="menuitem" className={getMenuItemClasses} onClick={() => setDropdownOpen(false)}>
                          <Sparkles className="w-4 h-4 text-brand" /><span>AI insights</span>
                        </NavLink>
                      </>
                    )}
                    <hr className="my-1 border-border/70" />
                    <button type="button" role="menuitem" onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-danger hover:bg-red-50 transition-colors cursor-pointer">
                      <LogOut className="w-4 h-4" /><span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link to="/register"><Button variant="primary" size="sm">Register</Button></Link>
          </div>
        )}
      </div>
    </header>
  );
}
