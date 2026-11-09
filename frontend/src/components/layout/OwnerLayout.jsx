import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, Package, RotateCcw, Store } from 'lucide-react';
import * as ownerApi from '../../api/ownerApi';
import { getErrorMessage } from '../../utils/errors';
import Skeleton from '../ui/Skeleton';
import ErrorState from '../ui/ErrorState';

export default function OwnerLayout() {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const [badges, setBadges] = useState({
    placedCount: 0,
    pendingReturnsCount: 0,
    hasUnreadReminders: false,
  });

  const fetchBadges = useCallback(async () => {
    try {
      const [stats, rems] = await Promise.all([
        ownerApi.getOwnerStats().catch(() => null),
        ownerApi.getOwnerReminders({ unread_only: true, page_size: 1 }).catch(() => null),
      ]);
      setBadges({
        placedCount: stats?.orders_by_status?.PLACED || 0,
        pendingReturnsCount: stats?.pending_returns || 0,
        hasUnreadReminders: Boolean((rems?.total || 0) > 0),
      });
    } catch { /* silent background refresh */ }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function fetchOwnerRestaurant() {
      try {
        const data = await ownerApi.getRestaurant();
        if (!ignore) {
          setRestaurant(data);
          setError(null);
          fetchBadges();
        }
      } catch (err) {
        if (ignore) return;
        if (err.response?.status === 404) {
          navigate('/owner/setup', { replace: true });
        } else {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchOwnerRestaurant();
    return () => { ignore = true; };
  }, [navigate, reloadTrigger, fetchBadges]);

  // Silent polling of badges every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') fetchBadges();
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchBadges]);

  const reloadRestaurant = () => {
    setIsLoading(true);
    setReloadTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto text-left py-4">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <ErrorState title="Could not load restaurant" message={error} onRetry={reloadRestaurant} />
      </div>
    );
  }

  const tabs = [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true, dot: badges.hasUnreadReminders },
    { to: '/owner/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/owner/orders', label: 'Orders', icon: Package, badge: badges.placedCount },
    { to: '/owner/returns', label: 'Returns', icon: RotateCcw, badge: badges.pendingReturnsCount },
    { to: '/owner/restaurant', label: 'Restaurant', icon: Store },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left pb-16">
      <nav
        aria-label="Restaurant Owner Navigation"
        className="flex items-center gap-1 sm:gap-2 border-b border-border overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 py-1"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-b-none border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-brand text-brand bg-brand-tint/50 sm:bg-transparent font-bold'
                    : 'border-transparent text-muted-text hover:text-text-main hover:bg-gray-100 sm:hover:bg-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>

              {/* Live Badges per Correction 2 */}
              {tab.dot && (
                <span className="w-2 h-2 rounded-full bg-brand ring-2 ring-white animate-pulse shrink-0" title="Unread reminders" />
              )}
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-brand-tint text-brand text-[10px] font-bold shrink-0">
                  {tab.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Outlet context={{ restaurant, setRestaurant, reloadRestaurant, badges, refreshBadges: fetchBadges }} />
    </div>
  );
}
